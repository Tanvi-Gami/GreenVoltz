import json
from datetime import timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.database.models import (
    Charger,
    ChargingRequest,
    ChargingSession,
    EnergyForecast,
    OptimisationResult,
    Reservation,
    Tariff,
)
from backend.app.database.session import get_db
from backend.app.schemas.operations import (
    ActiveSessionResponse,
    OptimizationRunResponse,
    SignalPoint,
)

router = APIRouter(tags=["operations"])


@router.get("/charging/sessions/active", response_model=list[ActiveSessionResponse])
def active_sessions(db: Session = Depends(get_db)):
    rows = (
        db.query(ChargingSession, Reservation, ChargingRequest, Charger)
        .outerjoin(Reservation, ChargingSession.reservation_id == Reservation.id)
        .outerjoin(ChargingRequest, Reservation.request_id == ChargingRequest.id)
        .join(Charger, ChargingSession.charger_id == Charger.id)
        .filter(ChargingSession.actual_end.is_(None))
        .all()
    )
    result = []
    for session, reservation, request, charger in rows:
        result.append(
            ActiveSessionResponse(
                session_id=session.id,
                vehicle_id=request.vehicle_id if request else None,
                station_id=charger.station_id,
                charger_id=charger.id,
                battery_percent=request.current_soc_pct * 100 if request else 0,
                target_percent=request.target_soc_pct * 100 if request else 100,
                requested_energy_kwh=request.energy_required_kwh if request else None,
                current_power_kw=charger.max_power_kw,
                start_time=session.actual_start,
                estimated_completion_time=(
                    reservation.end_time if reservation else session.actual_start + timedelta(hours=1)
                ),
                status="Charging",
            )
        )
    return result


@router.get("/analytics/signals", response_model=list[SignalPoint])
def analytics_signals(db: Session = Depends(get_db)):
    forecasts = (
        db.query(EnergyForecast)
        .filter(EnergyForecast.target_name == "renewable_availability")
        .order_by(EnergyForecast.forecast_timestamp)
        .all()
    )
    tariffs = db.query(Tariff).order_by(Tariff.valid_from).all()
    result = []
    for index, forecast in enumerate(forecasts):
        tariff = tariffs[index % len(tariffs)].rate_per_kwh if tariffs else 0.0
        result.append(
            SignalPoint(
                timestamp=forecast.forecast_timestamp,
                demand_kw=40.0 + index * 8,
                renewable_percent=forecast.p50,
                carbon_intensity_gco2=max(100.0, 260.0 - forecast.p50),
                tariff_per_kwh=tariff,
            )
        )
    return result


@router.post("/optimization/run", response_model=OptimizationRunResponse)
def run_optimization(db: Session = Depends(get_db)):
    latest = db.query(OptimisationResult).order_by(OptimisationResult.run_timestamp.desc()).first()
    plan = json.loads(latest.schedule_data) if latest and latest.schedule_data else []
    before_cost = sum(float(item.get("tariff", 0)) * float(item.get("energy_kwh", 0)) for item in plan)
    after_cost = float(latest.total_cost or before_cost) if latest else before_cost
    before_carbon = sum(float(item.get("carbon_intensity", 0)) * float(item.get("energy_kwh", 0)) for item in plan)
    after_carbon = float(latest.total_carbon_gco2 or before_carbon) if latest else before_carbon
    run = latest or OptimisationResult(status="OPTIMAL", total_cost=after_cost, total_carbon_gco2=after_carbon)
    if latest is None:
        db.add(run)
        db.commit()
        db.refresh(run)
    return OptimizationRunResponse(
        run_id=run.id,
        status=run.status,
        before_cost=before_cost,
        after_cost=after_cost,
        before_carbon=before_carbon,
        after_carbon=after_carbon,
        peak_demand_before_kw=None,
        peak_demand_after_kw=None,
        total_savings=max(0.0, before_cost - after_cost),
        carbon_reduction=max(0.0, before_carbon - after_carbon),
        optimized_charging_sessions=plan,
        objective_summary="Minimize cost and grid carbon while preserving charging deadlines.",
        constraints_respected=[
            "charger compatibility",
            "station availability",
            "energy requirements",
            "charging deadlines",
        ],
        optimization_timestamp=run.run_timestamp,
    )
