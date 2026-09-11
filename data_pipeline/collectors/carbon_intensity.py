"""Carbon intensity data collector for api.carbonintensity.org.uk."""

from datetime import datetime, timezone
from typing import Any, Dict, List

import httpx
import pandas as pd

from data_pipeline.logging_config import get_logger

logger = get_logger(__name__)

_BASE_URL = "https://api.carbonintensity.org.uk"


def _fmt(dt: datetime) -> str:
    """Format datetime as ISO 8601 UTC string for the API."""
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.strftime("%Y-%m-%dT%H:%MZ")


def fetch_carbon_intensity(from_dt: datetime, to_dt: datetime) -> pd.DataFrame:
    """Fetch national carbon intensity data for a date range.

    Args:
        from_dt: Start datetime (UTC).
        to_dt: End datetime (UTC).

    Returns:
        DataFrame with columns [settlement_period, intensity_actual, intensity_forecast].
        settlement_period is timezone-aware datetime (UTC).
    """
    from_str = _fmt(from_dt)
    to_str = _fmt(to_dt)
    url = f"{_BASE_URL}/intensity/{from_str}/{to_str}"

    logger.info("Fetching carbon intensity", extra={"from": from_str, "to": to_str})

    response = httpx.get(url, timeout=30)
    response.raise_for_status()
    payload = response.json()

    rows: List[Dict[str, Any]] = []
    for entry in payload.get("data", []):
        period = pd.Timestamp(entry["from"], tz="UTC")
        intensity = entry.get("intensity", {})
        rows.append(
            {
                "settlement_period": period,
                "intensity_actual": intensity.get("actual"),
                "intensity_forecast": intensity.get("forecast"),
            }
        )

    df = pd.DataFrame(rows, columns=["settlement_period", "intensity_actual", "intensity_forecast"])
    if not df.empty:
        df["intensity_actual"] = df["intensity_actual"].astype("Int64")
        df["intensity_forecast"] = df["intensity_forecast"].astype("Int64")

    logger.info(f"Fetched {len(df)} rows of carbon intensity data")
    return df


def fetch_regional_carbon_intensity(from_dt: datetime, to_dt: datetime) -> pd.DataFrame:
    """Fetch regional carbon intensity data for a date range."""
    from_str = _fmt(from_dt)
    to_str = _fmt(to_dt)
    url = f"{_BASE_URL}/regional/intensity/{from_str}/{to_str}"

    response = httpx.get(url, timeout=30)
    response.raise_for_status()
    payload = response.json()

    rows = _unpack_rows_from_data_dict(payload)
    return _rows_into_df(rows)


def _unpack_rows_from_data_dict(payload: Dict[str, Any]) -> List[Dict[str, Any]]:
    rows = []
    for entry in payload.get("data", []):
        period_from = pd.Timestamp(entry["from"], tz="UTC")
        period_to = pd.Timestamp(entry["to"], tz="UTC")
        for region in entry.get("regions", []):
            rows.append(
                {
                    "period_from": period_from,
                    "period_to": period_to,
                    "region_id": region.get("regionid"),
                    "dno_region_name": region.get("dnoregion"),
                    "region_name": region.get("shortname"),
                    "carbon_intensity": region.get("intensity", {}).get("forecast"),
                    "intensity_index": region.get("intensity", {}).get("index"),
                }
            )
    return rows


def _rows_into_df(rows: List[Dict[str, Any]]) -> pd.DataFrame:
    df = pd.DataFrame(
        rows,
        columns=[
            "period_from",
            "period_to",
            "region_id",
            "dno_region_name",
            "region_name",
            "carbon_intensity",
            "intensity_index",
        ],
    )
    if not df.empty:
        df["carbon_intensity"] = df["carbon_intensity"].astype("Int64")
    return df
