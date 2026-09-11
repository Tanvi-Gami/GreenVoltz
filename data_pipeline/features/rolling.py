"""Rolling window statistics and moving averages."""

from __future__ import annotations

from typing import List, Optional

import pandas as pd

from data_pipeline.logging_config import get_logger

logger = get_logger(__name__)

_WINDOW = 336  # 7 days of 30-min periods (7 * 24 * 2)
_MIN_PERIODS = 48  # 1 day of 30-min periods


def add_rolling_features(
    df: pd.DataFrame,
    cols_to_roll: Optional[List[str]] = None,
    window: int = _WINDOW,
    min_periods: int = _MIN_PERIODS,
) -> pd.DataFrame:
    """Compute rolling mean for target columns.

    Args:
        df: DataFrame containing the target columns.
        cols_to_roll: List of column names to compute rolling averages for.
            Defaults to ["wind_pct", "solar_pct", "carbon_intensity"].
        window: Number of periods in the rolling window (default 336).
        min_periods: Minimum non-null periods required to produce a value (default 48).

    Returns:
        DataFrame with {col}_7d_avg columns added.
    """
    if cols_to_roll is None:
        cols_to_roll = ["wind_pct", "solar_pct", "carbon_intensity"]

    result = df.copy()

    for col in cols_to_roll:
        if col not in df.columns:
            logger.warning("Column '%s' not found for rolling average calculation", col)
            continue

        new_col = f"{col}_7d_avg"
        result[new_col] = df[col].rolling(window=window, min_periods=min_periods).mean()
        logger.debug("Computed rolling average for %s", col)

    return result
