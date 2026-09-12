"""Create a deterministic, isolated GreenVoltz demo database.

Usage:
    DATABASE_URL=sqlite:///./data/greenvoltz_demo.db python scripts/seed_demo.py --reset
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from backend.app.database import models
from backend.app.database.base import Base

STATIONS = [
    ("GreenVolt Central Hub", 12.9716, 77.5946, 8),
    ("GreenVolt Riverside", 12.9750, 77.6080, 6),
    ("EcoCharge West", 12.9680, 77.5700, 8),
    ("CityCharge North", 13.0100, 77.5900, 10),
    ("GreenVolt Airport", 12.9520, 77.6650, 12),
    ("EcoCharge South", 12.9250, 77.6000, 8),
    ("CityCharge Metro", 12.9850, 77.6200, 10),
    ("GreenVolt Harbor", 12.9450, 77.5850, 6),
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--reset", action="store_true", help="Clear existing tables before seeding")
    parser.add_argument(
        "--database-url",
        default=os.getenv("DATABASE_URL", "sqlite:///./data/greenvoltz_demo.db"),
        help="SQLAlchemy URL (defaults to DATABASE_URL or the isolated SQLite demo database)",
    )
    return parser.parse_args()


def clear_database(db: Session) -> None:
    for model in (
        models.AdaptationResult,
        models.OptimisationResult,
        models.StationStatus,
        models.EnergyForecast,
        models.Tariff,
        models.ChargingSession,
        models.Reservation,
        models.ChargingRequest,
        models.Charger,
        models.ChargingStation,
        models.Vehicle,
        models.User,
    ):
        db.query(model).delete()
    db.commit()


def seed(database_url: str, reset: bool) -> None:
    if database_url.startswith("sqlite:///"):
        os.makedirs("data", exist_ok=True)
    engine = create_engine(database_url, pool_pre_ping=True)
    Base.metadata.create_all(engine)

    with Session(engine) as db:
        if db.execute(select(models.User).limit(1)).first() and not reset:
            raise RuntimeError("Database is not empty; use --reset only for an isolated demo database.")
        if reset:
            clear_database(db)

        now = datetime(2026, 9, 12, 14, 30)
        user = models.User(email="demo.driver@greenvoltz.local", name="Demo Driver")
        db.add(user)
        db.flush()

        vehicles = [
            models.Vehicle(
                user_id=user.id,
                make="Tesla",
                model="Model 3",
                battery_capacity_kwh=60,
                max_charge_rate_kw=150,
            ),
            models.Vehicle(
                user_id=user.id,
                make="Hyundai",
                model="Ioniq 5",
                battery_capacity_kwh=72,
                max_charge_rate_kw=150,
            ),
            models.Vehicle(user_id=user.id, make="Kia", model="EV6", battery_capacity_kwh=77, max_charge_rate_kw=175),
        ]
        db.add_all(vehicles)
        db.flush()

        stations = [
            models.ChargingStation(name=name, latitude=latitude, longitude=longitude, total_chargers=count)
            for name, latitude, longitude, count in STATIONS
        ]
        db.add_all(stations)
        db.flush()

        chargers = []
        for station in stations:
            for index in range(station.total_chargers):
                chargers.append(
                    models.Charger(
                        station_id=station.id,
                        connector_type="CCS" if index % 3 else "Type2",
                        max_power_kw=150.0 if index % 3 == 0 else 60.0 if index % 3 == 1 else 22.0,
                    )
                )
        db.add_all(chargers)
        db.flush()

        requests = []
        for index, vehicle in enumerate(vehicles):
            request = models.ChargingRequest(
                user_id=user.id,
                vehicle_id=vehicle.id,
                arrival_time=now + timedelta(minutes=index * 15),
                departure_time=now + timedelta(hours=2, minutes=index * 15),
                energy_required_kwh=28.0 + index * 4,
                current_soc_pct=0.27 + index * 0.12,
                target_soc_pct=0.80,
                connector_type="CCS",
                max_power_kw=vehicle.max_charge_rate_kw,
            )
            requests.append(request)
        db.add_all(requests)
        db.flush()

        primary_chargers = chargers[:3]
        reservations = []
        for request, charger in zip(requests, primary_chargers):
            reservation = models.Reservation(
                request_id=request.id,
                charger_id=charger.id,
                start_time=request.arrival_time,
                end_time=request.arrival_time + timedelta(minutes=45),
                status="CONFIRMED",
            )
            reservations.append(reservation)
        db.add_all(reservations)
        db.flush()

        db.add_all(
            [
                models.ChargingSession(
                    reservation_id=reservation.id,
                    charger_id=reservation.charger_id,
                    energy_delivered_kwh=7.5 + index * 2,
                    actual_start=reservation.start_time,
                )
                for index, reservation in enumerate(reservations)
            ]
        )
        db.add_all(
            [
                models.Tariff(
                    station_id=station.id,
                    rate_per_kwh=7.5 + (index % 4) * 0.8,
                    valid_from=now,
                    valid_to=now + timedelta(hours=24),
                )
                for index, station in enumerate(stations)
            ]
        )
        db.add_all(
            [
                models.EnergyForecast(
                    target_name="renewable_availability",
                    forecast_timestamp=now + timedelta(hours=index),
                    p10=35 + index,
                    p50=55 + index * 3,
                    p90=72 + index * 2,
                )
                for index in range(6)
            ]
        )
        db.add_all(
            [
                models.StationStatus(
                    station_id=station.id,
                    active_sessions=index % 5,
                    available_chargers=max(1, station.total_chargers - index % 4),
                    timestamp=now,
                )
                for index, station in enumerate(stations)
            ]
        )

        plan = [
            {
                "ev_id": str(vehicle.id),
                "station_id": str(stations[0].id),
                "charger_id": str(primary_chargers[index].id),
                "time_slot": 1 + index,
                "power_kw": 11.0,
                "energy_kwh": request.energy_required_kwh,
                "tariff": 7.5,
                "carbon_intensity": 154.0,
                "renewable_availability": 78.0,
            }
            for index, (vehicle, request) in enumerate(zip(vehicles, requests))
        ]
        db.add(
            models.OptimisationResult(
                run_timestamp=now,
                status="OPTIMAL",
                total_cost=186.0,
                total_carbon_gco2=4800.0,
                schedule_data=json.dumps(plan),
            )
        )
        db.add(
            models.AdaptationResult(
                run_timestamp=now,
                status="ADAPTED",
                event_data=json.dumps({"event_type": "charger_unavailable", "charger_id": str(primary_chargers[0].id)}),
                result_data=json.dumps({"status": "ADAPTED", "affected_ev_ids": [str(vehicles[0].id)]}),
            )
        )
        db.commit()
        print(f"Seeded {len(stations)} stations, {len(chargers)} chargers, 3 vehicles, 3 reservations.")
        print(f"Database: {database_url}")


if __name__ == "__main__":
    arguments = parse_args()
    seed(arguments.database_url, arguments.reset)
