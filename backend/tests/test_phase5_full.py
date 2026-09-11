from datetime import datetime, timedelta

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.app.database import models
from backend.app.database.base import Base
from backend.app.database.session import get_db
from backend.app.main import create_app


def get_test_app_and_session():
    app = create_app()
    engine = create_engine("sqlite:///./test_api_phase5.db", connect_args={"check_same_thread": False})
    # ensure models imported and tables created
    import backend.app.database.models  # noqa: F401

    Base.metadata.create_all(engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    return app, TestingSessionLocal


def test_health_and_stations_and_charging_recommendation():
    app, SessionLocal = get_test_app_and_session()
    client = TestClient(app)
    # health
    r = client.get("/health")
    assert r.status_code == 200
    # prefer the API-prefixed readiness endpoint
    r = client.get("/api/v1/health/ready")
    assert r.status_code == 200

    # seed station, charger, vehicle, request
    db = SessionLocal()
    try:
        v = models.Vehicle(make="Test", model="EV", battery_capacity_kwh=50.0, max_charge_rate_kw=11.0)
        db.add(v)
        db.commit()
        db.refresh(v)

        s = models.ChargingStation(name="S1", latitude=0.0, longitude=0.0, total_chargers=1)
        db.add(s)
        db.commit()
        db.refresh(s)

        c = models.Charger(station_id=s.id, connector_type="Type2", max_power_kw=11.0)
        db.add(c)
        db.commit()
        db.refresh(c)

        # charging request linked to vehicle
        now = datetime.utcnow()
        req = models.ChargingRequest(
            vehicle_id=v.id,
            arrival_time=now,
            departure_time=now + timedelta(hours=2),
            energy_required_kwh=20.0,
            current_soc_pct=0.2,
            target_soc_pct=0.8,
            connector_type="Type2",
            max_power_kw=11.0,
        )
        db.add(req)
        db.commit()
        db.refresh(req)
        v_id = v.id
        s_id = s.id
    finally:
        db.close()

    # stations listing
    r = client.get("/api/v1/stations/")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert any(st["id"] == s_id for st in data)

    # charging recommendation
    payload = {
        "vehicle_id": v_id,
        "arrival_slot": 0,
        "departure_slot": 2,
        "energy_required_kwh": 20.0,
        "connector_type": "Type2",
        "max_power_kw": 11.0,
    }
    r = client.post("/api/v1/charging/recommend", json=payload)
    assert r.status_code == 200
    rec = r.json()
    assert "solver_status" in rec


def test_reservations_create_conflict_and_cancel():
    app, SessionLocal = get_test_app_and_session()
    client = TestClient(app)
    db = SessionLocal()
    try:
        # seed vehicle, station, charger, request
        v = models.Vehicle(
            make="T2",
            model="EV2",
            battery_capacity_kwh=40.0,
            max_charge_rate_kw=7.0,
        )
        db.add(v)
        db.commit()
        db.refresh(v)

        s = models.ChargingStation(
            name="S2", latitude=1.0, longitude=1.0, total_chargers=1
        )
        db.add(s)
        db.commit()
        db.refresh(s)

        c = models.Charger(station_id=s.id, connector_type="Type2", max_power_kw=7.0)
        db.add(c)
        db.commit()
        db.refresh(c)

        now = datetime.utcnow()
        req = models.ChargingRequest(
            vehicle_id=v.id,
            arrival_time=now,
            departure_time=now + timedelta(hours=1),
            energy_required_kwh=10.0,
            current_soc_pct=0.1,
            target_soc_pct=0.8,
            connector_type="Type2",
            max_power_kw=7.0,
        )
        db.add(req)
        db.commit()
        db.refresh(req)
        c_id = c.id
        req_id = req.id
    finally:
        db.close()

    # create reservation
    payload = {
        "request_id": req_id,
        "charger_id": c_id,
        "start_time": now.isoformat(),
        "end_time": (now + timedelta(minutes=30)).isoformat(),
    }
    r = client.post("/api/v1/reservations/", json=payload)
    assert r.status_code == 200
    res_data = r.json()
    assert res_data["status"] == "PENDING"

    # overlapping reservation should conflict
    payload2 = {
        "request_id": req_id,
        "charger_id": c_id,
        "start_time": (now + timedelta(minutes=10)).isoformat(),
        "end_time": (now + timedelta(minutes=40)).isoformat(),
    }
    r = client.post("/api/v1/reservations/", json=payload2)
    assert r.status_code == 409

    # cancel first reservation
    res_id = res_data["id"]
    r = client.post(f"/api/v1/reservations/{res_id}/cancel")
    assert r.status_code == 200
    assert r.json()["status"] == "CANCELLED"


def test_health_ready_unavailable():
    # create app with broken DB override
    app = create_app()

    def broken_db():
        raise Exception("db_broken")

    def broken_get_db_gen():
        class BrokenDB:
            def execute(self, *args, **kwargs):
                raise Exception("db_broken")

        def _gen():
            yield BrokenDB()

        return _gen()

    app.dependency_overrides[get_db] = broken_get_db_gen
    client = TestClient(app)
    r = client.get("/api/v1/health/ready")
    assert r.status_code == 503
