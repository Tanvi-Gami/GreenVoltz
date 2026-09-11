"""Domain data models for EV fleet simulation and synthetic request generation."""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Optional


class ConnectorType(str, Enum):
    """Standard physical connector types."""

    TYPE_2 = "type_2"
    CCS_2 = "ccs_2"
    CHADEMO = "chademo"


class VehicleType(str, Enum):
    """Vehicle classification category."""

    PASSENGER_CAR = "passenger_car"
    LIGHT_COMMERCIAL = "light_commercial"
    BUS = "bus"
    HEAVY_GOODS = "heavy_goods"


class OptimizationPreference(str, Enum):
    """User priority trade-off mode."""

    MINIMIZE_COST = "minimize_cost"
    MINIMIZE_CARBON = "minimize_carbon"
    FASTEST_CHARGE = "fastest_charge"
    BALANCED = "balanced"


@dataclass
class DriverPreferences:
    """Driver charging preferences and constraints."""

    optimization_preference: OptimizationPreference = OptimizationPreference.BALANCED
    max_budget: Optional[float] = None
    willing_to_delay: bool = True
    min_acceptable_departure_soc: float = 80.0


@dataclass
class BatteryState:
    """EV battery state of charge (SOC) and capacity parameters."""

    capacity_kwh: float
    current_soc_pct: float
    target_soc_pct: float = 80.0

    @property
    def energy_required_kwh(self) -> float:
        """Calculate kWh needed to reach target SOC."""
        deficit_pct = max(0.0, self.target_soc_pct - self.current_soc_pct)
        return float(self.capacity_kwh * (deficit_pct / 100.0))


@dataclass
class SimulatedEV:
    """Representation of an individual electric vehicle."""

    vehicle_id: str
    vehicle_type: VehicleType
    connector_type: ConnectorType
    battery: BatteryState
    max_charge_rate_kw: float = 50.0


@dataclass
class SimulatedChargingRequest:
    """A simulated charging session request submitted to GreenVoltz."""

    request_id: str
    ev: SimulatedEV
    arrival_time: datetime
    departure_deadline: datetime
    energy_required_kwh: float
    preferences: DriverPreferences = field(default_factory=DriverPreferences)
