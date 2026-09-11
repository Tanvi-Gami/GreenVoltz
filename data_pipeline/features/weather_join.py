"""Interpolate hourly weather onto the 30-min settlement period grid."""

from __future__ import annotations

import pandas as pd

from data_pipeline.logging_config import get_logger

logger = get_logger(__name__)

_WEATHER_COLS = ["temperature", "wind_speed", "radiation"]


def join_weather_to_grid(
    weather_df: pd.DataFrame,
    grid: pd.DatetimeIndex,
) -> pd.DataFrame:
    """Interpolate hourly weather onto a 30-min settlement period grid.

    For each city the hourly time series is linearly interpolated to the
    provided grid index. The cities are then pivoted to wide format so
    that each (city, variable) pair becomes {city_slug}_{variable}.

    Args:
        weather_df: Long-format DataFrame with columns
            [city, timestamp, temperature, wind_speed, radiation].
        grid: DatetimeIndex of 30-min settlement periods to interpolate onto.

    Returns:
        Wide-format DataFrame indexed by the settlement period grid.
    """
    _validate_inputs(weather_df, grid)

    cities = weather_df["city"].unique()
    city_frames: list[pd.DataFrame] = []

    for city in sorted(cities):
        city_slug = _city_slug(city)
        city_data = (
            weather_df[weather_df["city"] == city]
            .set_index("timestamp")[_WEATHER_COLS]
            .sort_index()
        )

        combined_index = city_data.index.union(grid)
        reindexed = city_data.reindex(combined_index)

        # Linear interpolation fills between observations
        interpolated = reindexed.interpolate(method="time")
        on_grid = interpolated.reindex(grid)
        on_grid.columns = [f"{city_slug}_{col}" for col in on_grid.columns]
        city_frames.append(on_grid)

    result = pd.concat(city_frames, axis=1)
    result.index.name = "settlement_period"

    logger.info(
        "Joined weather for %d city/cities onto %d settlement period(s)",
        len(cities),
        len(grid),
    )
    return result


def _city_slug(city: str) -> str:
    return city.lower().replace(" ", "_")


def _validate_inputs(weather_df: pd.DataFrame, grid: pd.DatetimeIndex) -> None:
    required_cols = {"city", "timestamp"} | set(_WEATHER_COLS)
    missing = required_cols - set(weather_df.columns)
    if missing:
        raise ValueError(f"weather_df is missing columns: {missing}")
    if not isinstance(grid, pd.DatetimeIndex):
        raise TypeError(f"grid must be a pd.DatetimeIndex, got {type(grid)}")
    if len(grid) == 0:
        raise ValueError("grid must not be empty")
