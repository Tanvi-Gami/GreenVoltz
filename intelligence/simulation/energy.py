"""Energy calculation utilities for charging."""
from math import ceil


def energy_required_kwh(battery_kwh: float, current_soc: float, target_soc: float) -> float:
    return max(0.0, battery_kwh * (target_soc - current_soc))


def charging_duration_slots(
    energy_kwh: float,
    effective_power_kw: float,
    time_step_minutes: int,
    efficiency: float = 0.95,
) -> int:
    if effective_power_kw <= 0 or energy_kwh <= 0:
        return 0
    hours = energy_kwh / (effective_power_kw * efficiency)
    slots = ceil((hours * 60) / time_step_minutes)
    return max(1, slots)


def effective_power(charger_power_kw: float, ev_max_kw: float) -> float:
    return min(charger_power_kw, ev_max_kw)
