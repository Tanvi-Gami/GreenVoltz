from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class ActiveSessionResponse(BaseModel):
    session_id: int
    vehicle_id: Optional[int]
    station_id: int
    charger_id: int
    battery_percent: float
    target_percent: float
    requested_energy_kwh: Optional[float]
    current_power_kw: float
    start_time: datetime
    estimated_completion_time: Optional[datetime]
    status: str
    assigned_start_slot: Optional[int] = None
    assigned_end_slot: Optional[int] = None


class SignalPoint(BaseModel):
    timestamp: datetime
    demand_kw: float
    renewable_percent: float
    carbon_intensity_gco2: float
    tariff_per_kwh: float


class OptimizationRunResponse(BaseModel):
    run_id: int
    status: str
    before_cost: float
    after_cost: float
    before_carbon: float
    after_carbon: float
    peak_demand_before_kw: Optional[float]
    peak_demand_after_kw: Optional[float]
    total_savings: float
    carbon_reduction: float
    optimized_charging_sessions: List[dict]
    objective_summary: str
    constraints_respected: List[str]
    optimization_timestamp: datetime
