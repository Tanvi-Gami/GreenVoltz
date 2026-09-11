"""Tests for generation penetration calculations."""

from data_pipeline.features.penetration import add_penetration_features


def test_add_penetration_features(generation_mix_df):
    df_pen = add_penetration_features(generation_mix_df)
    assert "wind_pct" in df_pen.columns
    assert "solar_pct" in df_pen.columns
    assert "low_carbon_pct" in df_pen.columns

    assert df_pen["wind_pct"].between(0, 100).all()
    assert df_pen["low_carbon_pct"].between(0, 100).all()
