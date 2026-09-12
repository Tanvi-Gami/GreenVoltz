import time
from typing import List

from intelligence.adaptation.models import DisruptionType
from intelligence.optimiser.scheduler import optimise
from intelligence.simulation.models import (
    EV,
    SimulationState,
    Station,
    StationState,
)
from intelligence.simulation.models import (
    Charger as SimCharger,
)
from intelligence.simulation.models import (
    ChargingRequest as SimRequest,
)


def build_sim_for_replan(
    db, affected_ev_ids: List[str], preserved_plan_items: List[dict], event=None, horizon_slots: int = 24
):
    """Construct a SimulationState focused on affected EVs.

    Chargers occupied by preserved_plan_items will be marked unavailable
    to prevent reassigning their slots.
    """
    # load stations and chargers
    from backend.app.database.models import Charger, ChargingRequest, ChargingStation, Vehicle

    sim_stations = []
    sim_chargers = []
    station_states = []

    chargers = db.query(Charger).all()
    stations_db = db.query(ChargingStation).all()

    preserved_charger_ids = {str(p.get("charger_id")) for p in preserved_plan_items}

    for s in stations_db:
        charger_objs = [c for c in chargers if c.station_id == s.id]
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
            status = "available"
            max_power = c.max_power_kw
            # if this charger has preserved allocations, mark it unavailable so
            # replanner won't reassign it
            if str(c.id) in preserved_charger_ids:
                status = "unavailable"
            # if event marks this charger unavailable, enforce it
            if event is not None:
                ev_type = getattr(event, "event_type", None)
                charger_unavailable = (
                    getattr(ev_type, "value", None) == DisruptionType.CHARGER_UNAVAILABLE.value
                    and str(event.charger_id) == str(c.id)
                )
                if charger_unavailable:
                    status = "unavailable"
            # apply power reduction event
            if event:
                ev_type = getattr(event, "event_type", None)
                if ev_type == event.event_type.POWER_REDUCTION and str(event.charger_id) == str(c.id):
                    if event.new_value is not None:
                        max_power = float(event.new_value)
            sim_chargers.append(
                SimCharger(
                    charger_id=str(c.id),
                    station_id=str(c.station_id),
                    connector_type=c.connector_type,
                    max_power_kw=max_power,
                    status=status,
                )
            )
        # apply congestion spike to station state if event targets this station
        st_congestion = 0.0
        if event:
            ev_type = getattr(event, "event_type", None)
            if ev_type == event.event_type.CONGESTION_SPIKE and str(event.station_id) == str(s.id):
                st_congestion = 1.0
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
                congestion=st_congestion,
            )
        )

    evs = []
    requests = []
    for ev_id in affected_ev_ids:
        # find request in db
        req = db.query(ChargingRequest).filter(ChargingRequest.vehicle_id == int(ev_id)).first()
        if not req:
            continue
        vehicle = db.get(Vehicle, req.vehicle_id)
        ev = EV(
            ev_id=str(req.vehicle_id),
            battery_capacity_kwh=vehicle.battery_capacity_kwh,
            current_soc=req.current_soc_pct,
            target_soc=req.target_soc_pct,
            max_charging_power_kw=req.max_power_kw or vehicle.max_charge_rate_kw,
            connector_type=req.connector_type or vehicle.model,
            arrival_slot=0,
            departure_slot=horizon_slots,
            preferred_station_ids=[],
        )
        sim_req = SimRequest(
            request_id=str(req.id),
            ev_id=str(req.vehicle_id),
            arrival_slot=0,
            departure_slot=horizon_slots,
            energy_required_kwh=req.energy_required_kwh,
            current_soc=req.current_soc_pct,
            target_soc=req.target_soc_pct,
            connector_type=req.connector_type,
            max_power_kw=req.max_power_kw or vehicle.max_charge_rate_kw,
            budget=None,
            preferences={},
        )
        evs.append(ev)
        requests.append(sim_req)

    sim = SimulationState(
        generated_at=__import__("datetime").datetime.utcnow(),
        horizon_slots=horizon_slots,
        time_step_minutes=60,
        stations=sim_stations,
        chargers=sim_chargers,
        evs=evs,
        requests=requests,
        station_states=station_states,
        tariffs=[[0.2] * horizon_slots],
        renewable_profile=[0.0] * horizon_slots,
        carbon_profile=[400.0] * horizon_slots,
    )
    return sim


def replan_for_event(
    db,
    affected_ev_ids: List[str],
    preserved_plan_items: List[dict],
    event=None,
    horizon_slots: int = 24,
    time_limit_seconds: int = 10,
):
    start = time.time()
    sim = build_sim_for_replan(db, affected_ev_ids, preserved_plan_items, event=event, horizon_slots=horizon_slots)
    res = optimise(sim, time_limit_seconds=time_limit_seconds, num_workers=1)
    return res, time.time() - start
