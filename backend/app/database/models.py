"""Foundational database models and declarative entities for GreenVoltz.

Represents the core domain entity foundation:
- User
- Vehicle
- ChargingStation
- Charger
- ChargingRequest
- Reservation
- ChargingSession
- Tariff
- EnergyForecast
- StationStatus
- OptimisationResult
"""

from datetime import datetime

from sqlalchemy import (
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column

from backend.app.database.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Vehicle(Base):
    __tablename__ = "vehicles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)
    make: Mapped[str] = mapped_column(String(100), nullable=False)
    model: Mapped[str] = mapped_column(String(100), nullable=False)
    battery_capacity_kwh: Mapped[float] = mapped_column(Float, nullable=False)
    max_charge_rate_kw: Mapped[float] = mapped_column(Float, nullable=False)


class ChargingStation(Base):
    __tablename__ = "charging_stations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    total_chargers: Mapped[int] = mapped_column(Integer, default=1)


class Charger(Base):
    __tablename__ = "chargers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    station_id: Mapped[int] = mapped_column(Integer, ForeignKey("charging_stations.id"), nullable=False)
    connector_type: Mapped[str] = mapped_column(String(50), nullable=False)
    max_power_kw: Mapped[float] = mapped_column(Float, nullable=False)


class ChargingRequest(Base):
    __tablename__ = "charging_requests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)
    vehicle_id: Mapped[int] = mapped_column(Integer, ForeignKey("vehicles.id"), nullable=True)
    arrival_time: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    departure_time: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    energy_required_kwh: Mapped[float] = mapped_column(Float, nullable=False)
    current_soc_pct: Mapped[float] = mapped_column(Float, nullable=False)
    target_soc_pct: Mapped[float] = mapped_column(Float, nullable=False)
    connector_type: Mapped[str] = mapped_column(String(50), nullable=True)
    max_power_kw: Mapped[float] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Reservation(Base):
    __tablename__ = "reservations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    request_id: Mapped[int] = mapped_column(Integer, ForeignKey("charging_requests.id"), nullable=True)
    charger_id: Mapped[int] = mapped_column(Integer, ForeignKey("chargers.id"), nullable=False)
    start_time: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    end_time: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="PENDING")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ChargingSession(Base):
    __tablename__ = "charging_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    reservation_id: Mapped[int] = mapped_column(Integer, ForeignKey("reservations.id"), nullable=True)
    charger_id: Mapped[int] = mapped_column(Integer, ForeignKey("chargers.id"), nullable=False)
    energy_delivered_kwh: Mapped[float] = mapped_column(Float, default=0.0)
    actual_start: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    actual_end: Mapped[datetime] = mapped_column(DateTime, nullable=True)


class Tariff(Base):
    __tablename__ = "tariffs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    station_id: Mapped[int] = mapped_column(Integer, ForeignKey("charging_stations.id"), nullable=True)
    rate_per_kwh: Mapped[float] = mapped_column(Float, nullable=False)
    valid_from: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    valid_to: Mapped[datetime] = mapped_column(DateTime, nullable=False)


class EnergyForecast(Base):
    __tablename__ = "energy_forecasts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    target_name: Mapped[str] = mapped_column(String(100), nullable=False)
    forecast_timestamp: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    p10: Mapped[float] = mapped_column(Float, nullable=False)
    p50: Mapped[float] = mapped_column(Float, nullable=False)
    p90: Mapped[float] = mapped_column(Float, nullable=False)


class StationStatus(Base):
    __tablename__ = "station_status"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    station_id: Mapped[int] = mapped_column(Integer, ForeignKey("charging_stations.id"), nullable=False)
    active_sessions: Mapped[int] = mapped_column(Integer, default=0)
    available_chargers: Mapped[int] = mapped_column(Integer, default=0)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class OptimisationResult(Base):
    __tablename__ = "optimisation_results"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    run_timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    status: Mapped[str] = mapped_column(String(50), nullable=False)
    total_cost: Mapped[float] = mapped_column(Float, nullable=True)
    total_carbon_gco2: Mapped[float] = mapped_column(Float, nullable=True)
    schedule_data: Mapped[str] = mapped_column(Text, nullable=True)
