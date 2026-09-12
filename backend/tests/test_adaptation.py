import json
from datetime import datetime, timedelta

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import backend.app.database.models as dbmodels
from backend.app.database.base import Base
from backend.app.main import create_app
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


def get_test_app_and_session():
    app = create_app()
    engine = create_engine("sqlite:///./test_api_adapt.db", connect_args={"check_same_thread": False})
    Base.metadata.create_all(engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    from backend.app.database.session import get_db

    app.dependency_overrides[get_db] = override_get_db
    return app, TestingSessionLocal


def seed_and_run_initial(db):
    # create stations, chargers, vehicles, requests
    s1 = dbmodels.ChargingStation(name="S1", latitude=0.0, longitude=0.0, total_chargers=2)
    s2 = dbmodels.ChargingStation(name="S2", latitude=1.0, longitude=1.0, total_chargers=1)
    db.add_all([s1, s2])
    db.commit()
    db.refresh(s1)
    db.refresh(s2)

    c1 = dbmodels.Charger(station_id=s1.id, connector_type="Type2", max_power_kw=11.0)
    c2 = dbmodels.Charger(station_id=s1.id, connector_type="Type2", max_power_kw=11.0)
    c3 = dbmodels.Charger(station_id=s2.id, connector_type="Type2", max_power_kw=11.0)
    db.add_all([c1, c2, c3])
    db.commit()
    db.refresh(c1)
    db.refresh(c2)
    db.refresh(c3)

    v1 = dbmodels.Vehicle(make="A", model="M", battery_capacity_kwh=50.0, max_charge_rate_kw=11.0)
    v2 = dbmodels.Vehicle(make="B", model="M2", battery_capacity_kwh=50.0, max_charge_rate_kw=11.0)
    db.add_all([v1, v2])
    db.commit()
    db.refresh(v1)
    db.refresh(v2)

    now = datetime.utcnow()
    req1 = dbmodels.ChargingRequest(
        vehicle_id=v1.id,
        arrival_time=now,
        departure_time=now + timedelta(hours=4),
        energy_required_kwh=20.0,
        current_soc_pct=0.2,
        target_soc_pct=0.8,
        connector_type="Type2",
        max_power_kw=11.0,
    )
    req2 = dbmodels.ChargingRequest(
        vehicle_id=v2.id,
        arrival_time=now,
        departure_time=now + timedelta(hours=4),
        energy_required_kwh=20.0,
        current_soc_pct=0.2,
        target_soc_pct=0.8,
        connector_type="Type2",
        max_power_kw=11.0,
    )
    db.add_all([req1, req2])
    db.commit()
    db.refresh(req1)
    db.refresh(req2)

    # Build a SimulationState to get an initial plan
    sim_stations = [
        Station(
            station_id=str(s1.id),
            name=s1.name,
            latitude=s1.latitude,
            longitude=s1.longitude,
            charger_ids=[str(c1.id), str(c2.id)],
            total_capacity=s1.total_chargers,
            reliability_score=0.9,
            base_tariff=0.2,
        ),
        Station(
            station_id=str(s2.id),
            name=s2.name,
            latitude=s2.latitude,
            longitude=s2.longitude,
            charger_ids=[str(c3.id)],
            total_capacity=s2.total_chargers,
            reliability_score=0.9,
            base_tariff=0.2,
        ),
    ]
    sim_chargers = [
        SimCharger(
            charger_id=str(c1.id),
            station_id=str(s1.id),
            connector_type=c1.connector_type,
            max_power_kw=c1.max_power_kw,
        ),
        SimCharger(
            charger_id=str(c2.id),
            station_id=str(s1.id),
            connector_type=c2.connector_type,
            max_power_kw=c2.max_power_kw,
        ),
        SimCharger(
            charger_id=str(c3.id),
            station_id=str(s2.id),
            connector_type=c3.connector_type,
            max_power_kw=c3.max_power_kw,
        ),
    ]

    evs = [
        EV(
            ev_id=str(v1.id),
            battery_capacity_kwh=v1.battery_capacity_kwh,
            current_soc=0.2,
            target_soc=0.8,
            max_charging_power_kw=11.0,
            connector_type="Type2",
            arrival_slot=0,
            departure_slot=4,
            preferred_station_ids=[],
        ),
        EV(
            ev_id=str(v2.id),
            battery_capacity_kwh=v2.battery_capacity_kwh,
            current_soc=0.2,
            target_soc=0.8,
            max_charging_power_kw=11.0,
            connector_type="Type2",
            arrival_slot=0,
            departure_slot=4,
            preferred_station_ids=[],
        ),
    ]

    reqs = [
        SimRequest(
            request_id=str(req1.id),
            ev_id=str(v1.id),
            arrival_slot=0,
            departure_slot=4,
            energy_required_kwh=req1.energy_required_kwh,
            current_soc=req1.current_soc_pct,
            target_soc=req1.target_soc_pct,
            connector_type=req1.connector_type,
            max_power_kw=req1.max_power_kw,
            budget=None,
            preferences={},
        ),
        SimRequest(
            request_id=str(req2.id),
            ev_id=str(v2.id),
            arrival_slot=0,
            departure_slot=4,
            energy_required_kwh=req2.energy_required_kwh,
            current_soc=req2.current_soc_pct,
            target_soc=req2.target_soc_pct,
            connector_type=req2.connector_type,
            max_power_kw=req2.max_power_kw,
            budget=None,
            preferences={},
        ),
    ]

    station_states = [
        StationState(
            station_id=str(s1.id),
            available_chargers=s1.total_chargers,
            occupied_chargers=0,
            queue_length=0,
            estimated_wait_minutes=0,
            current_tariff=0.2,
            renewable_availability=0.0,
            carbon_intensity_gco2=400.0,
            reliability=0.9,
            congestion=0.0,
        ),
        StationState(
            station_id=str(s2.id),
            available_chargers=s2.total_chargers,
            occupied_chargers=0,
            queue_length=0,
            estimated_wait_minutes=0,
            current_tariff=0.2,
            renewable_availability=0.0,
            carbon_intensity_gco2=400.0,
            reliability=0.9,
            congestion=0.0,
        ),
    ]

    sim = SimulationState(
        generated_at=datetime.utcnow(),
        horizon_slots=8,
        time_step_minutes=60,
        stations=sim_stations,
        chargers=sim_chargers,
        evs=evs,
        requests=reqs,
        station_states=station_states,
        tariffs=[[0.2] * 8, [0.2] * 8],
        renewable_profile=[0.0] * 8,
        carbon_profile=[400.0] * 8,
    )

    res = optimise(sim, time_limit_seconds=5, num_workers=1)

    # persist optimisation result
    rec = dbmodels.OptimisationResult(
        status=res.solver_status,
        total_cost=res.total_cost,
        total_carbon_gco2=res.total_carbon,
        schedule_data=json.dumps([p.model_dump() for p in res.charging_plan]),
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    ids = {"v1": v1.id, "v2": v2.id, "c1": c1.id, "c2": c2.id, "c3": c3.id, "req1": req1.id, "req2": req2.id}
    return res, rec, sim, ids


def test_scenario_charger_failure():
    app, SessionLocal = get_test_app_and_session()
    client = TestClient(app)
    db = SessionLocal()
    try:
        res, rec, sim, ids = seed_and_run_initial(db)
        before_plan = [p.model_dump() for p in res.charging_plan]

        # map assignments by ev
        by_ev = {}
        for it in before_plan:
            by_ev.setdefault(it["ev_id"], []).append(it)

        v1_id = str(ids["v1"])
        v2_id = str(ids["v2"])
        assert v1_id in by_ev and v2_id in by_ev

        # choose a charger assigned to v1
        v1_chargers = {it["charger_id"] for it in by_ev[v1_id]}
        assert v1_chargers, "v1 has no charger assignments"
        target_charger = next(iter(v1_chargers))

        payload = {"event_type": "charger_unavailable", "charger_id": target_charger}
        r = client.post("/api/v1/adaptation/events", json=payload)
        assert r.status_code == 200
        body = r.json()

        # examine adapted plan
        adapted_plan = body["new_charging_plan"]
        # assignments by ev after adaptation
        after_by_ev = {}
        for it in adapted_plan:
            after_by_ev.setdefault(str(it["ev_id"]), []).append(it)

        # 1) EV-1 identified as affected
        assert v1_id in body["affected_ev_ids"]

        # 2) EV-1's original allocation removed/changed: ensure none of v1's
        # adapted chargers equal the original target_charger
        after_v1_chargers = {it["charger_id"] for it in after_by_ev.get(v1_id, [])}
        assert target_charger not in after_v1_chargers

        # 3) EV-1 receives a feasible alternative when one exists
        assert after_v1_chargers, "v1 has no reassignment"

        # 4) EV-2's allocation remains unchanged
        before_v2 = sorted([(it["charger_id"], it["time_slot"]) for it in by_ev[v2_id]])
        after_v2 = sorted([(it["charger_id"], it["time_slot"]) for it in after_by_ev.get(v2_id, [])])
        assert before_v2 == after_v2, "v2 allocation changed unexpectedly"

        # 5) validation: adapted plan must pass independent validator
        from intelligence.optimiser.result import ChargingPlanItem, OptimisationResult
        from intelligence.optimiser.validation import validate_plan

        plan_items = [ChargingPlanItem(**p) for p in adapted_plan]
        opt_res = OptimisationResult(
            solver_status=body.get("status", "ADAPTED"),
            objective_value=0.0,
            charging_plan=plan_items,
            total_energy_delivered=0.0,
            total_cost=0.0,
            total_carbon=0.0,
            renewable_energy_used=0.0,
            congestion_score=0.0,
            reliability_score=0.0,
            unscheduled_ev_ids=body.get("unscheduled_ev_ids", []),
            solver_runtime_seconds=body.get("runtime_seconds", 0.0),
            metadata={},
        )
        v_errors = validate_plan(sim, opt_res)
        assert not v_errors, f"validation errors: {v_errors}"

        # 6) schedule_change_count reflects actual changes
        assert body["schedule_changes"] >= 1

    finally:
        db.close()


def test_scenario_infeasible():
    app, SessionLocal = get_test_app_and_session()
    client = TestClient(app)
    db = SessionLocal()
    try:
        # create one station and one charger and one EV with large requirement
        s = dbmodels.ChargingStation(name="Sx", latitude=0, longitude=0, total_chargers=1)
        db.add(s)
        db.commit()
        db.refresh(s)
        c = dbmodels.Charger(station_id=s.id, connector_type="Type2", max_power_kw=1.0)
        db.add(c)
        db.commit()
        db.refresh(c)
        v = dbmodels.Vehicle(make="Z", model="M", battery_capacity_kwh=50.0, max_charge_rate_kw=1.0)
        db.add(v)
        db.commit()
        db.refresh(v)
        now = datetime.utcnow()
        req = dbmodels.ChargingRequest(
            vehicle_id=v.id,
            arrival_time=now,
            departure_time=now + timedelta(hours=1),
            energy_required_kwh=100.0,
            current_soc_pct=0.0,
            target_soc_pct=1.0,
            connector_type="Type2",
            max_power_kw=1.0,
        )
        db.add(req)
        db.commit()
        db.refresh(req)

        # persist an empty optimisation result (simulating previous plan)
        rec = dbmodels.OptimisationResult(
            status="OPTIMAL",
            total_cost=0.0,
            total_carbon_gco2=0.0,
            schedule_data=json.dumps([]),
        )
        db.add(rec)
        db.commit()

        payload = {"event_type": "charger_unavailable", "charger_id": str(c.id)}
        r = client.post("/api/v1/adaptation/events", json=payload)
        assert r.status_code == 200
        body = r.json()
        assert body["status"] == "INFEASIBLE" or body["status"] == "NO_IMPACT"
    finally:
        db.close()


def test_congestion_adaptation():
    app, SessionLocal = get_test_app_and_session()
    client = TestClient(app)
    db = SessionLocal()
    try:
        res, rec, sim, ids = seed_and_run_initial(db)
        # pick station s1 to make congested
        station_to_congest = sim.stations[0].station_id
        payload = {"event_type": "congestion_spike", "station_id": station_to_congest}
        r = client.post("/api/v1/adaptation/events", json=payload)
        assert r.status_code == 200
        body = r.json()
        # if impacted, ensure at least one EV moved off the congested station
        adapted_plan = body["new_charging_plan"]
        moved = False
        for it in adapted_plan:
            if it["station_id"] != station_to_congest:
                moved = True
                break
        assert moved or body["status"] == "NO_IMPACT"
    finally:
        db.close()


def test_power_reduction_feasible_and_infeasible():
    app, SessionLocal = get_test_app_and_session()
    client = TestClient(app)
    db = SessionLocal()
    try:
        res, rec, sim, ids = seed_and_run_initial(db)
        before_plan = [p.model_dump() for p in res.charging_plan]
        # find charger assigned to v1
        v1_id = str(ids["v1"])
        v1_items = [it for it in before_plan if it["ev_id"] == v1_id]
        assert v1_items
        charger_id = v1_items[0]["charger_id"]

        # small reduction (still feasible)
        payload = {"event_type": "power_reduction", "charger_id": charger_id, "old_value": 11.0, "new_value": 5.0}
        r = client.post("/api/v1/adaptation/events", json=payload)
        assert r.status_code == 200
        body = r.json()
        assert body["status"] in ("ADAPTED", "PARTIALLY_ADAPTED", "NO_IMPACT")

        # severe reduction (infeasible)
        payload2 = {"event_type": "power_reduction", "charger_id": charger_id, "old_value": 11.0, "new_value": 0.01}
        r2 = client.post("/api/v1/adaptation/events", json=payload2)
        assert r2.status_code == 200
        body2 = r2.json()
        assert body2["status"] in ("INFEASIBLE", "NO_IMPACT", "ADAPTED")
    finally:
        db.close()


def test_reservation_consistency_and_api_endpoints():
    app, SessionLocal = get_test_app_and_session()
    client = TestClient(app)
    db = SessionLocal()
    try:
        res, rec, sim, ids = seed_and_run_initial(db)
        before_plan = [p.model_dump() for p in res.charging_plan]
        # choose a charger assigned to v1 and create a reservation
        v1_id = str(ids["v1"])
        v1_items = [it for it in before_plan if it["ev_id"] == v1_id]
        assert v1_items
        charger_id = v1_items[0]["charger_id"]

        # create reservation tied to that charger and request
        from backend.app.database.models import Reservation

        r_db = Reservation(
            request_id=ids["req1"],
            charger_id=int(charger_id),
            start_time=datetime.utcnow(),
            end_time=datetime.utcnow() + timedelta(minutes=30),
            status="PENDING",
        )
        db.add(r_db)
        db.commit()
        db.refresh(r_db)

        # trigger charger failure
        payload = {"event_type": "charger_unavailable", "charger_id": charger_id}
        r = client.post("/api/v1/adaptation/events", json=payload)
        assert r.status_code == 200

        # reservation should be cancelled
        db.refresh(r_db)
        assert r_db.status == "CANCELLED"

        # GET persisted adaptation via API
        # find latest adaptation id
        from backend.app.database.models import AdaptationResult as DBAdaptationResult

        latest = db.query(DBAdaptationResult).order_by(DBAdaptationResult.run_timestamp.desc()).first()
        assert latest is not None
        gid = latest.id
        rget = client.get(f"/api/v1/adaptation/{gid}")
        assert rget.status_code == 200
        data = rget.json()
        assert "status" in data

        # test /replan endpoint behaves similar to /events
        payload2 = {"event_type": "charger_unavailable", "charger_id": charger_id}
        r2 = client.post("/api/v1/adaptation/replan", json=payload2)
        assert r2.status_code == 200
    finally:
        db.close()
