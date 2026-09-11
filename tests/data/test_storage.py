"""Tests for raw parquet storage and deduplication."""

from pathlib import Path

import pandas as pd

from data_pipeline.collectors.storage import save_raw_parquet


def test_save_raw_parquet(tmp_path: Path):
    df = pd.DataFrame({
        "settlement_period": pd.date_range("2024-01-01", periods=3, freq="30min", tz="UTC"),
        "value": [1, 2, 3],
    })
    saved = save_raw_parquet(df, source="test_source", date="2024-01-01", base_path=tmp_path)
    assert saved.exists()

    loaded = pd.read_parquet(saved)
    assert len(loaded) == 3


def test_save_raw_parquet_deduplication(tmp_path: Path):
    # df1: 00:00, 00:30, 01:00
    df1 = pd.DataFrame({
        "settlement_period": pd.date_range("2024-01-01", periods=3, freq="30min", tz="UTC"),
        "value": [1, 2, 3],
    })
    # df2 overlaps last TWO periods of df1 (00:30 and 01:00), overwriting them
    df2 = pd.DataFrame({
        "settlement_period": pd.date_range("2024-01-01 00:30", periods=2, freq="30min", tz="UTC"),
        "value": [20, 30],
    })
    save_raw_parquet(df1, source="test_source", date="2024-01-01", base_path=tmp_path)
    saved = save_raw_parquet(df2, source="test_source", date="2024-01-01", base_path=tmp_path)

    loaded = pd.read_parquet(saved)
    # 00:00 (original=1), 00:30 (overwritten=20), 01:00 (overwritten=30)
    assert len(loaded) == 3
    assert loaded["value"].iloc[1] == 20
    assert loaded["value"].iloc[2] == 30
