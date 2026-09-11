"""Incremental data fetcher utilities."""

from datetime import datetime, timezone
from pathlib import Path
from typing import List, Tuple

import pandas as pd

from data_pipeline.logging_config import get_logger

logger = get_logger(__name__)


def get_missing_ranges(
    file_path: Path,
    target_start: datetime,
    target_end: datetime,
    column: str = "settlement_period",
) -> List[Tuple[datetime, datetime]]:
    """Identify missing date ranges between target_start and target_end.

    Compares the requested range against min/max values in the existing Parquet file.
    If the file does not exist or is empty, returns the full requested range.
    """
    if target_start.tzinfo is None:
        target_start = target_start.replace(tzinfo=timezone.utc)
    if target_end.tzinfo is None:
        target_end = target_end.replace(tzinfo=timezone.utc)

    if not file_path.exists():
        logger.info("File %s does not exist. Requesting full range.", file_path)
        return [(target_start, target_end)]

    try:
        df = pd.read_parquet(file_path, columns=[column], engine="pyarrow")
    except Exception as e:
        logger.warning("Failed to read %s: %s. Requesting full range.", file_path, e)
        return [(target_start, target_end)]

    if df.empty:
        logger.info("File %s is empty. Requesting full range.", file_path)
        return [(target_start, target_end)]

    dates = pd.to_datetime(df[column], utc=True)
    min_date = dates.min()
    max_date = dates.max()

    missing_ranges: List[Tuple[datetime, datetime]] = []

    if target_start < min_date:
        missing_ranges.append((target_start, min_date.to_pydatetime()))

    if target_end > max_date:
        missing_ranges.append((max_date.to_pydatetime(), target_end))

    valid_ranges = [(s, e) for s, e in missing_ranges if s < e]

    if valid_ranges:
        logger.info("Found %d missing ranges for %s", len(valid_ranges), file_path.name)
    else:
        logger.info("All requested data already present in %s", file_path.name)

    return valid_ranges
