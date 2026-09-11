"""Target abstraction for multi-target probabilistic forecasting in GreenVoltz.

Decouples the forecasting framework from a single UK carbon intensity metric to support:
- Carbon intensity (gCO2/kWh)
- Renewable availability (%)
- EV charging demand (kWh)
- Station congestion (occupied chargers count / ratio)
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import Dict, List, Tuple


class ForecastTarget(str, Enum):
    """Supported forecasting targets across the GreenVoltz intelligence platform."""

    CARBON_INTENSITY = "carbon_intensity"
    RENEWABLE_AVAILABILITY = "renewable_availability"
    EV_CHARGING_DEMAND = "ev_charging_demand"
    STATION_CONGESTION = "station_congestion"


@dataclass(frozen=True)
class TargetConfig:
    """Configuration schema for a specific forecasting target."""

    target: ForecastTarget
    display_name: str
    target_column: str
    unit: str
    horizon_periods: int = 48  # Default 48 periods = 24 hours at 30-min resolution
    default_quantiles: Tuple[float, ...] = (0.1, 0.5, 0.9)
    description: str = ""
    feature_columns: List[str] = field(default_factory=list)


# Predefined configurations for supported forecasting targets
TARGET_REGISTRY: Dict[ForecastTarget, TargetConfig] = {
    ForecastTarget.CARBON_INTENSITY: TargetConfig(
        target=ForecastTarget.CARBON_INTENSITY,
        display_name="Grid Carbon Intensity",
        target_column="carbon_intensity",
        unit="gCO2/kWh",
        description="Forecast of electricity grid carbon emissions per kWh.",
    ),
    ForecastTarget.RENEWABLE_AVAILABILITY: TargetConfig(
        target=ForecastTarget.RENEWABLE_AVAILABILITY,
        display_name="Renewable Generation Penetration",
        target_column="low_carbon_pct",
        unit="%",
        description="Forecast of combined wind, solar, nuclear, and hydro generation share.",
    ),
    ForecastTarget.EV_CHARGING_DEMAND: TargetConfig(
        target=ForecastTarget.EV_CHARGING_DEMAND,
        display_name="EV Fleet Charging Demand",
        target_column="demand_kwh",
        unit="kWh",
        description="Forecast of aggregated EV charging energy demand.",
    ),
    ForecastTarget.STATION_CONGESTION: TargetConfig(
        target=ForecastTarget.STATION_CONGESTION,
        display_name="Charging Station Congestion",
        target_column="congestion_ratio",
        unit="ratio",
        description="Forecast of charger occupancy ratio [0.0 - 1.0].",
    ),
}


def get_target_config(target: ForecastTarget | str) -> TargetConfig:
    """Retrieve target configuration by enum or string identifier."""
    if isinstance(target, str):
        try:
            target = ForecastTarget(target)
        except ValueError:
            raise ValueError(
                f"Unknown forecast target '{target}'. Supported targets: {[t.value for t in ForecastTarget]}"
            )
    return TARGET_REGISTRY[target]


def register_target(config: TargetConfig) -> None:
    """Register or override a custom forecasting target configuration."""
    TARGET_REGISTRY[config.target] = config
