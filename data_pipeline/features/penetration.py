"""Generation penetration and renewable mix features."""

from __future__ import annotations

import pandas as pd

from data_pipeline.logging_config import get_logger

logger = get_logger(__name__)

_FUEL_COLS = ["gas", "coal", "nuclear", "wind", "hydro", "imports", "biomass", "other", "solar"]
_LOW_CARBON_COLS = ["nuclear", "wind", "hydro", "solar", "biomass"]


def add_penetration_features(df: pd.DataFrame) -> pd.DataFrame:
    """Derive generation penetration percentages.

    Computes:
    - wind_pct: wind / total_generation * 100
    - solar_pct: solar / total_generation * 100
    - low_carbon_pct: (nuclear + wind + hydro + solar + biomass) / total_generation * 100
    """
    result = df.copy()

    present_fuel_cols = [c for c in _FUEL_COLS if c in df.columns]
    if not present_fuel_cols:
        logger.warning("No fuel columns found for penetration feature calculation")
        return result

    total = df[present_fuel_cols].sum(axis=1)

    if "wind" in df.columns:
        result["wind_pct"] = df["wind"] / total * 100
    if "solar" in df.columns:
        result["solar_pct"] = df["solar"] / total * 100

    present_low_carbon = [c for c in _LOW_CARBON_COLS if c in df.columns]
    result["low_carbon_pct"] = df[present_low_carbon].sum(axis=1) / total * 100

    return result
