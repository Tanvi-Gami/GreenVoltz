"""Predefined scenario modifiers."""
from typing import Dict

SCENARIOS: Dict[str, Dict] = {
    "NORMAL_DAY": {
        "demand_multiplier": 1.0,
        "renewable_scale": 1.0,
        "carbon_scale": 1.0,
    },
    "HIGH_DEMAND": {
        "demand_multiplier": 1.6,
        "renewable_scale": 0.9,
        "carbon_scale": 1.1,
    },
    "RENEWABLE_RICH": {
        "demand_multiplier": 1.0,
        "renewable_scale": 1.4,
        "carbon_scale": 0.8,
    },
    "GRID_CONSTRAINED": {
        "demand_multiplier": 0.9,
        "renewable_scale": 0.6,
        "carbon_scale": 1.4,
    },
    "STATION_FAILURE": {
        "demand_multiplier": 1.0,
        "renewable_scale": 1.0,
        "carbon_scale": 1.0,
        "fail_one_station": True,
    },
}
