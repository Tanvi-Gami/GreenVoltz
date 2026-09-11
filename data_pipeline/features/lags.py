"""Lag features for multi-target sequential forecasting."""

from __future__ import annotations

from typing import List, Optional

import pandas as pd

from data_pipeline.logging_config import get_logger

logger = get_logger(__name__)

_DEFAULT_LAGS = [1, 2, 48, 336]


def add_lag_features(
    df: pd.DataFrame,
    target_cols: List[str],
    lags: Optional[List[int]] = None,
) -> pd.DataFrame:
    """Create lag columns for target series at specified intervals.

    Default lags: t-1, t-2, t-48 (24h), t-336 (7d).
    Column format: {target}_lag_{n}.

    Args:
        df: DataFrame containing the target columns.
        target_cols: List of column names to create lags for.
        lags: Optional custom list of lag integer offsets.

    Returns:
        DataFrame with new lag columns appended.
    """
    if lags is None:
        lags = _DEFAULT_LAGS

    result = df.copy()

    for col in target_cols:
        if col not in df.columns:
            logger.warning("Column '%s' not found for lag feature calculation", col)
            continue

        for lag in lags:
            new_col = f"{col}_lag_{lag}"
            result[new_col] = df[col].shift(lag)
            logger.debug("Computed lag %d for %s", lag, col)

    return result
