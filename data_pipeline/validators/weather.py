"""Validator for weather DataFrames."""

import pandas as pd

from data_pipeline.logging_config import get_logger
from data_pipeline.validators.exceptions import ValidationError

logger = get_logger(__name__)

_TEMPERATURE_MIN = -30.0
_TEMPERATURE_MAX = 50.0
_WIND_SPEED_MIN = 0.0
_WIND_SPEED_MAX = 150.0
_RADIATION_MIN = 0.0
_EXPECTED_CITIES = {"London", "Manchester", "Edinburgh"}


def validate_weather(df: pd.DataFrame) -> None:
    """Validate a weather DataFrame."""
    if df.empty:
        logger.info("Empty DataFrame passed to validate_weather — skipping")
        return

    # 1. Temperature in range [-30, 50]
    if "temperature" in df.columns:
        series = df["temperature"].dropna()
        out_of_range = series[(series < _TEMPERATURE_MIN) | (series > _TEMPERATURE_MAX)]
        if not out_of_range.empty:
            raise ValidationError(
                field="temperature",
                message=(
                    f"Values must be in [{_TEMPERATURE_MIN}, {_TEMPERATURE_MAX}] °C; "
                    f"found {out_of_range.tolist()} at indices {out_of_range.index.tolist()}"
                ),
            )

    # 2. Wind speed in range [0, 150]
    if "wind_speed" in df.columns:
        series = df["wind_speed"].dropna()
        out_of_range = series[(series < _WIND_SPEED_MIN) | (series > _WIND_SPEED_MAX)]
        if not out_of_range.empty:
            raise ValidationError(
                field="wind_speed",
                message=(
                    f"Values must be in [{_WIND_SPEED_MIN}, {_WIND_SPEED_MAX}] km/h; "
                    f"found {out_of_range.tolist()} at indices {out_of_range.index.tolist()}"
                ),
            )

    # 3. Radiation >= 0
    if "radiation" in df.columns:
        series = df["radiation"].dropna()
        negative = series[series < _RADIATION_MIN]
        if not negative.empty:
            raise ValidationError(
                field="radiation",
                message=(
                    f"Values must be >= {_RADIATION_MIN}; "
                    f"found {negative.tolist()} at indices {negative.index.tolist()}"
                ),
            )

    # 4. All three cities present per timestamp — only checked when the df
    #    represents a full multi-city batch (i.e. all expected cities are
    #    present somewhere in the data).  Partial slices (single-city or
    #    row-by-row validation calls) are silently skipped.
    if "city" in df.columns and "timestamp" in df.columns:
        cities_in_df = set(df["city"].unique())
        if _EXPECTED_CITIES.issubset(cities_in_df):
            for ts, group in df.groupby("timestamp"):
                present = set(group["city"].unique())
                missing = _EXPECTED_CITIES - present
                if missing:
                    raise ValidationError(
                        field="city",
                        message=(
                            f"Missing cities {sorted(missing)} for timestamp {ts}; "
                            f"expected {sorted(_EXPECTED_CITIES)}"
                        ),
                    )

    logger.info("Weather validation passed (%d rows)", len(df))
