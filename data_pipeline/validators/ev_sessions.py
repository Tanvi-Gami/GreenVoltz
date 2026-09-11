"""Validator for EV charging session DataFrames."""

import pandas as pd

from data_pipeline.logging_config import get_logger
from data_pipeline.validators.exceptions import ValidationError

logger = get_logger(__name__)


def validate_ev_sessions(df: pd.DataFrame) -> None:
    """Validate an EV charging sessions DataFrame."""
    if df.empty:
        logger.info("Empty DataFrame passed to validate_ev_sessions — skipping")
        return

    # 1. energy_kwh > 0
    if "energy_kwh" in df.columns:
        series = df["energy_kwh"].dropna()
        invalid = series[series <= 0]
        if not invalid.empty:
            raise ValidationError(
                field="energy_kwh",
                message=(
                    f"Values must be > 0; found {invalid.tolist()} at indices {invalid.index.tolist()}"
                ),
            )

    # 2. departure_time > arrival_time
    if "departure_time" in df.columns and "arrival_time" in df.columns:
        mask = df["departure_time"] <= df["arrival_time"]
        invalid_rows = df[mask]
        if not invalid_rows.empty:
            raise ValidationError(
                field="departure_time",
                message=(
                    f"departure_time must be after arrival_time; found {len(invalid_rows)} invalid row(s) at indices "
                    f"{invalid_rows.index.tolist()}"
                ),
            )

    # 3. duration > 0
    if "duration" in df.columns:
        series = df["duration"].dropna()
        invalid = series[series <= 0]
        if not invalid.empty:
            raise ValidationError(
                field="duration",
                message=(
                    f"Values must be > 0; found {invalid.tolist()} at indices {invalid.index.tolist()}"
                ),
            )

    # 4. No null station_ids
    if "station_id" in df.columns:
        null_mask = df["station_id"].isna()
        if null_mask.any():
            raise ValidationError(
                field="station_id",
                message=(
                    f"station_id must not be null; found nulls at indices {df[null_mask].index.tolist()}"
                ),
            )

    logger.info("EV sessions validation passed (%d rows)", len(df))
