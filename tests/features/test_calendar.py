"""Tests for calendar feature extraction."""

from data_pipeline.features.calendar_features import add_calendar_features


def test_add_calendar_features(carbon_intensity_df):
    df_cal = add_calendar_features(carbon_intensity_df)
    expected_cols = [
        "hour_of_day",
        "day_of_week",
        "month",
        "is_weekend",
        "is_bank_holiday_uk",
        "season_sin",
        "season_cos",
    ]
    for col in expected_cols:
        assert col in df_cal.columns

    assert df_cal["hour_of_day"].between(0, 23).all()
    assert df_cal["day_of_week"].between(0, 6).all()
