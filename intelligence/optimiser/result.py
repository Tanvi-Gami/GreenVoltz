"""Result models for optimisation outputs."""
from typing import List

from pydantic import BaseModel


class ChargingPlanItem(BaseModel):
    ev_id: str
    station_id: str
    charger_id: str
    time_slot: int
    power_kw: float
    energy_kwh: float
    tariff: float
    carbon_intensity: float
    renewable_availability: float


class OptimisationResult(BaseModel):
    solver_status: str
    objective_value: float
    charging_plan: List[ChargingPlanItem]
    total_energy_delivered: float
    total_cost: float
    total_carbon: float
    renewable_energy_used: float
    congestion_score: float
    reliability_score: float
    unscheduled_ev_ids: List[str]
    solver_runtime_seconds: float
    metadata: dict = {}
