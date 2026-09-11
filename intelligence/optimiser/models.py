"""Data structures and representations for EV charging optimisation."""

from dataclasses import dataclass, field
from enum import Enum
from typing import Dict, List


class ScheduleStatus(str, Enum):
    """Status returned by the mathematical scheduler."""

    OPTIMAL = "OPTIMAL"
    FEASIBLE = "FEASIBLE"
    INFEASIBLE = "INFEASIBLE"
    MODEL_INVALID = "MODEL_INVALID"
    UNKNOWN = "UNKNOWN"


@dataclass
class EVRequirement:
    """EV charging session requirements for scheduling."""

    ev_id: str
    arrival_slot: int
    departure_slot: int
    energy_required_kwh: float
    max_charge_rate_kw: float = 22.0
    min_charge_rate_kw: float = 0.0
    priority_weight: float = 1.0


@dataclass
class ChargerSlotCapacity:
    """Physical charger power and grid constraint per time interval."""

    slot_index: int
    max_total_kw: float
    tariff_cost_per_kwh: float
    carbon_intensity_gco2: float


@dataclass
class ScheduleRequest:
    """Input payload to the charging optimisation engine."""

    horizon_slots: int
    slot_duration_minutes: int
    evs: List[EVRequirement]
    charger_capacities: List[ChargerSlotCapacity]
    objective: str = "cost_and_carbon"  # "cost", "carbon", "balanced"


@dataclass
class ScheduledSlot:
    """Allocated charging power for a specific EV and time interval."""

    ev_id: str
    slot_index: int
    power_kw: float
    energy_kwh: float
    cost: float
    carbon_emissions_g: float


@dataclass
class ScheduleResult:
    """Solution payload produced by the charging scheduler."""

    status: ScheduleStatus
    total_cost: float = 0.0
    total_carbon_g: float = 0.0
    total_energy_kwh: float = 0.0
    allocations: List[ScheduledSlot] = field(default_factory=list)
    solver_time_seconds: float = 0.0
    metadata: Dict[str, str] = field(default_factory=dict)
