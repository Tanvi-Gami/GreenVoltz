"""Tests for rolling window features."""

import numpy as np
import pandas as pd

from data_pipeline.features.rolling import add_rolling_features


def test_add_rolling_features():
    df = pd.DataFrame({
        "carbon_intensity": np.linspace(100, 200, 400),
    })
    df_roll = add_rolling_features(df, cols_to_roll=["carbon_intensity"], window=10, min_periods=2)
    assert "carbon_intensity_7d_avg" in df_roll.columns
    # First entry has less than min_periods so NaN
    assert pd.isna(df_roll["carbon_intensity_7d_avg"].iloc[0])
    # Subsequent entries computed
    assert not pd.isna(df_roll["carbon_intensity_7d_avg"].iloc[5])
