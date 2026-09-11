from sqlalchemy.orm import Session

from backend.app.database.models import Charger, ChargingStation, Vehicle
from backend.app.schemas.charging import (
    ChargingPlanItem,
    ChargingRecommendation,
    ChargingRequestCreate,
)
from intelligence.optimiser.scheduler import optimise
from intelligence.simulation.models import (
    EV,
    SimulationState,
    Station,
    StationState,
)
from intelligence.simulation.models import Charger as SimCharger
from intelligence.simulation.models import ChargingRequest as SimRequest


def recommend_charging(
    payload: ChargingRequestCreate,
    db: Session,
    time_limit_seconds: int = 10,
    num_workers: int = 1,
) -> ChargingRecommendation:
    """Build a minimal SimulationState from DB and call the optimiser.

    This keeps CP-SAT integration out of the router and encapsulates simulation
    construction here.
    """
    # Validate vehicle exists
    vehicle = db.get(Vehicle, payload.vehicle_id)
    if not vehicle:
        raise ValueError("vehicle_not_found")

    # load a small set of stations to consider
    stations = db.query(ChargingStation).limit(10).all()
    if not stations:
        # fallback minimal simulation generator (deterministic)
        from intelligence.simulation.generator import generate_simulation

        sim = generate_simulation(seed=42, num_evs=1, num_stations=1, horizon_hours=24, time_step_minutes=60)
    else:
        sim_stations = []
        sim_chargers = []
        station_states = []
        for s in stations:
            charger_objs = db.query(Charger).filter(Charger.station_id == s.id).all()
            charger_ids = [str(c.id) for c in charger_objs]
            sim_stations.append(
                Station(
                    station_id=str(s.id),
                    name=s.name,
                    latitude=s.latitude,
                    longitude=s.longitude,
                    charger_ids=charger_ids,
                    total_capacity=s.total_chargers,
                    reliability_score=0.9,
                    base_tariff=0.2,
                )
            )
            for c in charger_objs:
                sim_chargers.append(
                    SimCharger(
                        charger_id=str(c.id),
                        station_id=str(s.id),
                        connector_type=c.connector_type,
                        max_power_kw=c.max_power_kw,
                    )
                )
            station_states.append(
                StationState(
                    station_id=str(s.id),
                    available_chargers=s.total_chargers,
                    occupied_chargers=0,
                    queue_length=0,
                    estimated_wait_minutes=0,
                    current_tariff=0.2,
                    renewable_availability=0.0,
                    carbon_intensity_gco2=400.0,
                    reliability=0.9,
                    congestion=0.0,
                )
            )

        ev = EV(
            ev_id=str(payload.vehicle_id),
            battery_capacity_kwh=vehicle.battery_capacity_kwh,
            current_soc=0.0,
            target_soc=0.8,
            max_charging_power_kw=payload.max_power_kw,
            connector_type=payload.connector_type,
            arrival_slot=payload.arrival_slot,
            departure_slot=payload.departure_slot,
            preferred_station_ids=[],
        )
        req = SimRequest(
            request_id="r1",
            ev_id=str(payload.vehicle_id),
            arrival_slot=payload.arrival_slot,
            departure_slot=payload.departure_slot,
            energy_required_kwh=payload.energy_required_kwh,
            current_soc=0.0,
            target_soc=0.8,
            connector_type=payload.connector_type,
            max_power_kw=payload.max_power_kw,
            budget=None,
            preferences={},
        )
        sim = SimulationState(
            generated_at=__import__("datetime").datetime.utcnow(),
            horizon_slots=max(1, payload.departure_slot - payload.arrival_slot),
            time_step_minutes=60,
            stations=sim_stations,
            chargers=sim_chargers,
            evs=[ev],
            requests=[req],
            station_states=station_states,
            tariffs=[[0.2, 0.2]],
            renewable_profile=[0.0],
            carbon_profile=[400.0],
        )

    # call optimiser (Phase 4 CP-SAT)
    res = optimise(sim, time_limit_seconds=time_limit_seconds, num_workers=num_workers)

    plan = [ChargingPlanItem(**item.model_dump()) for item in res.charging_plan]
    return ChargingRecommendation(
        solver_status=res.solver_status,
        objective_value=res.objective_value,
        charging_plan=plan,
        total_energy_delivered=res.total_energy_delivered,
        total_cost=res.total_cost,
        total_carbon=res.total_carbon,
        unscheduled_ev_ids=res.unscheduled_ev_ids,
    )
