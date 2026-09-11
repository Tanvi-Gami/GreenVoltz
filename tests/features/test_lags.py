"""Tests for lag feature creation."""

import pandas as pd

from data_pipeline.features.lags import add_lag_features


def test_add_lag_features():
    df = pd.DataFrame({
        "demand": [10.0, 20.0, 30.0, 40.0, 50.0],
    })
    df_lags = add_lag_features(df, target_cols=["demand"], lags=[1, 2])
    assert "demand_lag_1" in df_lags.columns
    assert "demand_lag_2" in df_lags.columns

    assert pd.isna(df_lags["demand_lag_1"].iloc[0])
    assert df_lags["demand_lag_1"].iloc[1] == 10.0
    assert df_lags["demand_lag_2"].iloc[2] == 10.0
