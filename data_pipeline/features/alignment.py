"""Align carbon intensity and generation mix DataFrames to 30-min settlement periods."""

from __future__ import annotations

import pandas as pd

from data_pipeline.logging_config import get_logger

logger = get_logger(__name__)

_MAX_FILL_GAP = 3  # consecutive missing periods that may be forward-filled


def align_to_settlement_periods(
    carbon_df: pd.DataFrame,
    generation_df: pd.DataFrame,
) -> pd.DataFrame:
    """Join carbon intensity and generation mix DataFrames on settlement_period.

    Steps:
    1. Build a complete 30-min settlement period index spanning both inputs.
    2. Reindex both DataFrames to the full grid (missing rows become NaN).
    3. Forward-fill runs of NaN that are at most 3 periods long.
    4. Drop any remaining NaN rows (gap was > 3 periods).
    """
    if "settlement_period" not in carbon_df.columns:
        raise ValueError("carbon_df must contain a 'settlement_period' column")
    if "settlement_period" not in generation_df.columns:
        raise ValueError("generation_df must contain a 'settlement_period' column")

    carbon = carbon_df.set_index("settlement_period")
    generation = generation_df.set_index("settlement_period")

    all_periods = carbon.index.union(generation.index)
    full_index = pd.date_range(
        start=all_periods.min(),
        end=all_periods.max(),
        freq="30min",
        name="settlement_period",
    )

    merged = pd.concat(
        [carbon.reindex(full_index), generation.reindex(full_index)],
        axis=1,
    )

    merged = _forward_fill_short_gaps(merged, max_gap=_MAX_FILL_GAP)

    rows_before = len(merged)
    merged = merged.dropna()
    rows_dropped = rows_before - len(merged)
    if rows_dropped:
        logger.info(
            "Dropped %d row(s) with gaps longer than %d period(s)",
            rows_dropped,
            _MAX_FILL_GAP,
        )

    merged = merged.reset_index()
    logger.info(f"Aligned {len(merged)} settlement periods")
    return merged


def _forward_fill_short_gaps(df: pd.DataFrame, max_gap: int) -> pd.DataFrame:
    """Forward-fill NaN runs of length <= max_gap; leave longer runs as NaN."""
    result = df.copy()
    for col in df.columns:
        series = df[col]
        is_nan = series.isna()
        if not is_nan.any():
            continue

        run_id = (~is_nan).cumsum()
        nan_run_length = is_nan.groupby(run_id).transform("sum")

        filled = series.ffill()
        long_gap_mask = is_nan & (nan_run_length > max_gap)
        filled[long_gap_mask] = float("nan")

        result[col] = filled

    return result
