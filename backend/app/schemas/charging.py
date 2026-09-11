from typing import List

from pydantic import BaseModel


class ChargingRequestCreate(BaseModel):
    vehicle_id: int
    arrival_slot: int
    departure_slot: int
    energy_required_kwh: float
    connector_type: str
    max_power_kw: float


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


class ChargingRecommendation(BaseModel):
    solver_status: str
    objective_value: float
    charging_plan: List[ChargingPlanItem]
    total_energy_delivered: float
    total_cost: float
    total_carbon: float
    unscheduled_ev_ids: List[str]
