"""Loader for Caltech ACN-Data CSV session records."""

from pathlib import Path
from typing import Union

import pandas as pd

from data_pipeline.logging_config import get_logger

logger = get_logger(__name__)


def load_acn_data(file_path: Union[str, Path]) -> pd.DataFrame:
    """Load Caltech ACN-Data CSV from local path.

    Returns:
        DataFrame with normalized columns:
        [session_id, station_id, arrival_time, departure_time, energy_kwh]
    """
    logger.info(f"Loading ACN-Data from {file_path}")

    column_mapping = {
        "sessionID": "session_id",
        "stationID": "station_id",
        "connectionTime": "arrival_time",
        "disconnectTime": "departure_time",
        "kWhDelivered": "energy_kwh",
    }

    df = pd.read_csv(file_path)
    cols_to_keep = [col for col in column_mapping.keys() if col in df.columns]
    df = df[cols_to_keep].rename(columns=column_mapping)

    required_cols = ["session_id", "station_id", "arrival_time", "departure_time", "energy_kwh"]
    missing_cols = [col for col in required_cols if col not in df.columns]
    if missing_cols:
        logger.error(f"Missing required columns in CSV: {missing_cols}")
        raise ValueError(f"CSV missing required columns: {missing_cols}")

    df["arrival_time"] = pd.to_datetime(df["arrival_time"], utc=True)
    df["departure_time"] = pd.to_datetime(df["departure_time"], utc=True)

    invalid_rows = df[df["arrival_time"] >= df["departure_time"]]
    if not invalid_rows.empty:
        logger.warning(
            f"Found {len(invalid_rows)} rows where arrival_time >= departure_time. Filtering out."
        )
        df = df[df["arrival_time"] < df["departure_time"]]

    df = df[required_cols]
    logger.info(f"Successfully loaded {len(df)} sessions.")
    return df
