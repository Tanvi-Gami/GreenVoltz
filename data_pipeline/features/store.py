"""Feature store: write and read feature DataFrames from local parquet storage."""

from __future__ import annotations

from datetime import date
from pathlib import Path
from typing import Optional

import pandas as pd

from data_pipeline.logging_config import get_logger

logger = get_logger(__name__)

_DEFAULT_FEATURES_DIR = Path("data/features")


def write_features(
    df: pd.DataFrame,
    run_date: Optional[date] = None,
    features_dir: Optional[Path] = None,
) -> Path:
    """Save a feature DataFrame to data/features/features_{YYYY-MM-DD}.parquet."""
    if run_date is None:
        run_date = date.today()

    directory = features_dir if features_dir is not None else _DEFAULT_FEATURES_DIR
    directory.mkdir(parents=True, exist_ok=True)
    path = directory / f"features_{run_date.isoformat()}.parquet"
    df.to_parquet(path, engine="pyarrow", index=False)
    logger.info("Wrote %d rows to %s", len(df), path)
    return path


def load_features(features_dir: Optional[Path] = None) -> pd.DataFrame:
    """Read the most recent features_{YYYY-MM-DD}.parquet from storage directory."""
    directory = features_dir if features_dir is not None else _DEFAULT_FEATURES_DIR
    files = sorted(directory.glob("features_*.parquet"))
    if not files:
        raise FileNotFoundError(f"No feature files found in {directory}")

    path = files[-1]
    df = pd.read_parquet(path, engine="pyarrow")
    logger.info("Loaded %d rows from %s", len(df), path)
    return df
