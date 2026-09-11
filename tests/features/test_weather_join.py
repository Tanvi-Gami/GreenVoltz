"""Tests for spatial weather interpolation onto the settlement period grid."""

import pandas as pd

from data_pipeline.features.weather_join import join_weather_to_grid


def test_join_weather_to_grid(weather_df):
    grid = pd.date_range("2024-01-01", periods=10, freq="30min", tz="UTC")
    weather_joined = join_weather_to_grid(weather_df, grid)
    assert isinstance(weather_joined, pd.DataFrame)
    assert len(weather_joined) == 10
    assert "london_temperature" in weather_joined.columns
    assert "manchester_wind_speed" in weather_joined.columns
