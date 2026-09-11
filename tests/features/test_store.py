"""Tests for feature store persistence."""

from pathlib import Path

import pandas as pd

from data_pipeline.features.store import load_features, write_features


def test_write_and_load_features(tmp_path: Path):
    df = pd.DataFrame({"a": [1, 2, 3], "b": [4, 5, 6]})
    saved_path = write_features(df, features_dir=tmp_path)
    assert saved_path.exists()

    loaded_df = load_features(features_dir=tmp_path)
    assert len(loaded_df) == 3
    assert list(loaded_df.columns) == ["a", "b"]
