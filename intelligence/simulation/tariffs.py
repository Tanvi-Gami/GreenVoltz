"""Simple deterministic tariff profile generator."""
from typing import List


def generate_tariff_profile(horizon_slots: int, seed: int = 0) -> List[float]:
    """Return a per-slot tariff (GBP/kWh) varying over the horizon."""
    # deterministic pattern: low at night, peak day
    profile = []
    for s in range(horizon_slots):
        # convert slot to fraction of day
        frac = (s / horizon_slots) * 24
        if 0 <= frac < 6:
            profile.append(0.10)
        elif 6 <= frac < 9:
            profile.append(0.20)
        elif 9 <= frac < 17:
            profile.append(0.25)
        elif 17 <= frac < 20:
            profile.append(0.30)
        else:
            profile.append(0.15)
    return profile
