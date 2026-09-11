"""Deterministic renewable availability profile generator."""
import math
from typing import List


def generate_renewable_profile(horizon_slots: int) -> List[float]:
    """Return a normalized 0.0-1.0 solar-like curve over the horizon."""
    profile = []
    for s in range(horizon_slots):
        # map slot -> hour fraction 0..24
        frac = (s / horizon_slots) * 24
        # simple solar bell curve centered at midday (12h)
        val = math.exp(-((frac - 12) ** 2) / (2 * 4 ** 2))
        profile.append(val)
    # normalize
    mx = max(profile) or 1.0
    return [v / mx for v in profile]
