from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from backend.app.database.models import (
    ChargingRequest,
    ChargingSession,
    OptimisationResult,
    Reservation,
)
from backend.app.database.session import get_db

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/overview")
def overview(db: Session = Depends(get_db)):
    total_requests = int(db.query(func.count(ChargingRequest.id)).scalar() or 0)
    total_res = db.query(Reservation).count()
    scheduled = db.query(Reservation).filter(Reservation.status == "CONFIRMED").count()
    unscheduled = max(0, total_requests - total_res)
    energy_delivered = float(
        db.query(func.coalesce(func.sum(ChargingSession.energy_delivered_kwh), 0.0)).scalar() or 0.0
    )
    est_cost = float(
        db.query(func.coalesce(func.sum(OptimisationResult.total_cost), 0.0)).scalar() or 0.0
    )
    est_carbon = float(
        db.query(func.coalesce(func.sum(OptimisationResult.total_carbon_gco2), 0.0)).scalar() or 0.0
    )
    renewable_used = 0.0
    return {
        "total_requests": total_requests,
        "total_reservations": total_res,
        "scheduled_reservations": scheduled,
        "unscheduled_requests": unscheduled,
        "energy_delivered_kwh": energy_delivered,
        "estimated_cost": est_cost,
        "estimated_carbon_gco2": est_carbon,
        "renewable_energy_kwh": renewable_used,
    }
