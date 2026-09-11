"""Domain models for the simulation."""
from __future__ import annotations

from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field


class Charger(BaseModel):
    charger_id: str
    station_id: str
    connector_type: str
    max_power_kw: float
    status: str = "available"
    current_ev_id: Optional[str] = None
    efficiency: float = 0.95


class Station(BaseModel):
    station_id: str
    name: str
    latitude: float
    longitude: float
    charger_ids: List[str]
    total_capacity: int
    reliability_score: float
    base_tariff: float
    renewable_capability: float = 0.0
    operational_status: str = "operational"


class EV(BaseModel):
    ev_id: str
    battery_capacity_kwh: float
    current_soc: float
    target_soc: float
    max_charging_power_kw: float
    connector_type: str
    arrival_slot: int
    departure_slot: int
    preferred_station_ids: List[str]
    maximum_budget: Optional[float] = None
    minimum_required_soc: Optional[float] = None
    profile: Optional[str] = None


class ChargingRequest(BaseModel):
    request_id: str
    ev_id: str
    arrival_slot: int
    departure_slot: int
    energy_required_kwh: float
    current_soc: float
    target_soc: float
    connector_type: str
    max_power_kw: float
    budget: Optional[float]
    preferences: Dict = Field(default_factory=dict)


class StationState(BaseModel):
    station_id: str
    available_chargers: int
    occupied_chargers: int
    queue_length: int
    estimated_wait_minutes: int
    current_tariff: float
    renewable_availability: float
    carbon_intensity_gco2: float
    reliability: float
    congestion: float


class SimulationState(BaseModel):
    generated_at: datetime
    horizon_slots: int
    time_step_minutes: int
    stations: List[Station]
    chargers: List[Charger]
    evs: List[EV]
    requests: List[ChargingRequest]
    station_states: List[StationState]
    tariffs: List[List[float]]
    renewable_profile: List[float]
    carbon_profile: List[float]

    model_config = ConfigDict(arbitrary_types_allowed=True)


# Compatibility shims removed: use canonical `EV` and `ChargingRequest` models.


