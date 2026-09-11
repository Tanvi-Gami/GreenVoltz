"""Tests for settlement period alignment."""

import pandas as pd

from data_pipeline.features.alignment import align_to_settlement_periods


def test_align_to_settlement_periods(carbon_intensity_df, generation_mix_df):
    aligned = align_to_settlement_periods(carbon_intensity_df, generation_mix_df)
    assert isinstance(aligned, pd.DataFrame)
    assert "settlement_period" in aligned.columns
    assert len(aligned) > 0
    # Both sets of columns present
    assert "intensity_actual" in aligned.columns
    assert "wind" in aligned.columns
