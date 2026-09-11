"""Tests for data validation rules and validation report."""

import pandas as pd
import pytest

from data_pipeline.validators import (
    ValidationError,
    validate_all,
    validate_carbon_intensity,
    validate_ev_sessions,
    validate_generation_mix,
    validate_weather,
)


def test_validate_carbon_intensity_success(carbon_intensity_df):
    validate_carbon_intensity(carbon_intensity_df)


def test_validate_carbon_intensity_negative():
    bad_df = pd.DataFrame({
        "settlement_period": pd.date_range("2024-01-01", periods=2, freq="30min", tz="UTC"),
        "intensity_actual": [-5, 100],
    })
    with pytest.raises(ValidationError, match="intensity_actual"):
        validate_carbon_intensity(bad_df)


def test_validate_generation_mix_success(generation_mix_df):
    validate_generation_mix(generation_mix_df)


def test_validate_weather_success(weather_df):
    validate_weather(weather_df)


def test_validate_ev_sessions_success(ev_sessions_df):
    validate_ev_sessions(ev_sessions_df)


def test_validate_all_report(carbon_intensity_df, weather_df):
    report = validate_all({
        "carbon_intensity": carbon_intensity_df,
        "weather": weather_df,
    })
    # Valid data should produce an empty error report
    assert len(report) == 0
