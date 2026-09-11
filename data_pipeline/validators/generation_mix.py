"""Validator for generation mix DataFrames."""

import pandas as pd

from data_pipeline.logging_config import get_logger
from data_pipeline.validators.exceptions import ValidationError

logger = get_logger(__name__)

_FUEL_COLUMNS = [
    "gas",
    "coal",
    "nuclear",
    "wind",
    "hydro",
    "imports",
    "biomass",
    "other",
    "solar",
]
_EXPECTED_INTERVAL_MINUTES = 30


def validate_generation_mix(df: pd.DataFrame) -> None:
    """Validate a generation mix DataFrame."""
    if df.empty:
        logger.info("Empty DataFrame passed to validate_generation_mix — skipping")
        return

    # 1. No null settlement_periods
    if df["settlement_period"].isna().any():
        raise ValidationError(
            field="settlement_period",
            message="DataFrame contains null settlement_period values",
        )

    # 2. No duplicate timestamps
    if df["settlement_period"].duplicated().any():
        raise ValidationError(
            field="settlement_period",
            message="DataFrame contains duplicate settlement_period timestamps",
        )

    # 3. 30-min intervals between consecutive rows
    if len(df) > 1:
        sorted_periods = df["settlement_period"].sort_values()
        diffs = sorted_periods.diff().dropna()
        expected = pd.Timedelta(minutes=_EXPECTED_INTERVAL_MINUTES)
        bad = diffs[diffs != expected]
        if not bad.empty:
            raise ValidationError(
                field="settlement_period",
                message=(
                    f"Expected {_EXPECTED_INTERVAL_MINUTES}-minute intervals between rows; "
                    f"found irregular gaps at indices {bad.index.tolist()}"
                ),
            )

    # 4. All fuel columns are non-negative
    for col in _FUEL_COLUMNS:
        if col not in df.columns:
            continue
        series = df[col].dropna()
        negative = series[series < 0]
        if not negative.empty:
            raise ValidationError(
                field=col,
                message=(
                    f"Fuel generation values must be >= 0; "
                    f"found {negative.tolist()} at indices {negative.index.tolist()}"
                ),
            )

    # 5. Row sum consistency: only validate against a declared 'total' column
    #    (row_sum vs single-fuel max is not meaningful for multi-source MW data)
    present_fuels = [c for c in _FUEL_COLUMNS if c in df.columns]
    if present_fuels and "total" in df.columns:
        row_sums = df[present_fuels].sum(axis=1)
        totals = df["total"]
        lower_bound = totals * 0.95
        upper_bound = totals * 1.05
        out_of_sync = (row_sums < lower_bound) | (row_sums > upper_bound)
        if out_of_sync.any():
            idx = out_of_sync.idxmax()
            raise ValidationError(
                field="total",
                message=(
                    f"Row sum {row_sums[idx]:.2f} not within 95-105% of stated total {totals[idx]:.2f} at index {idx}"
                ),
            )

    logger.info("Generation mix validation passed (%d rows)", len(df))
