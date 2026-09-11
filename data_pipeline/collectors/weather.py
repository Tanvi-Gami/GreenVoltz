"""Weather data collector using Open-Meteo archive API."""

from datetime import datetime, timezone
from typing import Any, Dict, List, Union

import httpx
import pandas as pd

from data_pipeline.logging_config import get_logger

logger = get_logger(__name__)

_BASE_URL = "https://archive-api.open-meteo.com/v1/archive"

_CITIES = {
    "London": {"latitude": 51.5, "longitude": -0.1},
    "Manchester": {"latitude": 53.5, "longitude": -2.2},
    "Edinburgh": {"latitude": 55.9, "longitude": -3.2},
}

_DNO_REGIONS: Dict[int, Dict[str, Union[float, str]]] = {
    1: {"name": "North Scotland", "latitude": 57.4778, "longitude": -4.2247},
    2: {"name": "South Scotland", "latitude": 55.9533, "longitude": -3.1883},
    3: {"name": "North West England", "latitude": 53.4808, "longitude": -2.2426},
    4: {"name": "North East England", "latitude": 54.9783, "longitude": -1.6178},
    5: {"name": "Yorkshire", "latitude": 53.8008, "longitude": -1.5491},
    6: {"name": "North Wales & Merseyside", "latitude": 53.4084, "longitude": -2.9916},
    7: {"name": "South Wales", "latitude": 51.4816, "longitude": -3.1791},
    8: {"name": "West Midlands", "latitude": 52.4862, "longitude": -1.8904},
    9: {"name": "East Midlands", "latitude": 52.9548, "longitude": -1.1581},
    10: {"name": "East England", "latitude": 52.6309, "longitude": 1.2974},
    11: {"name": "South West England", "latitude": 51.4545, "longitude": -2.5879},
    12: {"name": "South England", "latitude": 50.9097, "longitude": -1.4044},
    13: {"name": "London", "latitude": 51.5074, "longitude": -0.1278},
    14: {"name": "South East England", "latitude": 50.8229, "longitude": -0.1363},
}


def _fmt_date(dt: datetime) -> str:
    """Format datetime as YYYY-MM-DD string for the API."""
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.strftime("%Y-%m-%d")


def fetch_weather(from_dt: datetime, to_dt: datetime) -> pd.DataFrame:
    """Fetch hourly historical weather for London, Manchester, Edinburgh."""
    start_date = _fmt_date(from_dt)
    end_date = _fmt_date(to_dt)

    all_rows: List[Dict[str, Any]] = []

    for city_name, coords in _CITIES.items():
        params = {
            "latitude": coords["latitude"],
            "longitude": coords["longitude"],
            "start_date": start_date,
            "end_date": end_date,
            "hourly": "temperature_2m,wind_speed_10m,shortwave_radiation",
            "timezone": "UTC",
        }

        logger.info("Fetching weather for %s", city_name, extra={"city": city_name})

        response = httpx.get(_BASE_URL, params=params, timeout=30)
        response.raise_for_status()
        payload = response.json()

        hourly = payload.get("hourly", {})
        times = hourly.get("time", [])
        temperatures = hourly.get("temperature_2m", [])
        wind_speeds = hourly.get("wind_speed_10m", [])
        radiations = hourly.get("shortwave_radiation", [])

        for i, time_str in enumerate(times):
            all_rows.append(
                {
                    "city": city_name,
                    "timestamp": pd.Timestamp(time_str, tz="UTC"),
                    "temperature": temperatures[i] if i < len(temperatures) else None,
                    "wind_speed": wind_speeds[i] if i < len(wind_speeds) else None,
                    "radiation": radiations[i] if i < len(radiations) else None,
                }
            )

    columns = ["city", "timestamp", "temperature", "wind_speed", "radiation"]
    df = pd.DataFrame(all_rows, columns=columns)
    if not df.empty:
        df["temperature"] = pd.to_numeric(df["temperature"], errors="coerce")
        df["wind_speed"] = pd.to_numeric(df["wind_speed"], errors="coerce")
        df["radiation"] = pd.to_numeric(df["radiation"], errors="coerce")

    logger.info("Fetched %d weather rows across %d cities", len(df), len(_CITIES))
    return df


def fetch_regional_weather(from_dt: datetime, to_dt: datetime) -> pd.DataFrame:
    """Fetch hourly historical weather for all 14 UK DNO regions."""
    start_date = _fmt_date(from_dt)
    end_date = _fmt_date(to_dt)

    all_rows: List[Dict[str, Any]] = []

    for region_id, region in _DNO_REGIONS.items():
        params = {
            "latitude": region["latitude"],
            "longitude": region["longitude"],
            "start_date": start_date,
            "end_date": end_date,
            "hourly": "temperature_2m,wind_speed_10m,shortwave_radiation",
            "timezone": "UTC",
        }

        logger.info(
            "Fetching weather for region %d (%s)",
            region_id,
            region["name"],
            extra={"region_id": region_id, "region_name": region["name"]},
        )

        response = httpx.get(_BASE_URL, params=params, timeout=30)
        response.raise_for_status()
        payload = response.json()

        hourly = payload.get("hourly", {})
        times = hourly.get("time", [])
        temperatures = hourly.get("temperature_2m", [])
        wind_speeds = hourly.get("wind_speed_10m", [])
        radiations = hourly.get("shortwave_radiation", [])

        for i, time_str in enumerate(times):
            all_rows.append(
                {
                    "region_id": region_id,
                    "region_name": region["name"],
                    "timestamp": pd.Timestamp(time_str, tz="UTC"),
                    "temperature": temperatures[i] if i < len(temperatures) else None,
                    "wind_speed": wind_speeds[i] if i < len(wind_speeds) else None,
                    "radiation": radiations[i] if i < len(radiations) else None,
                }
            )

    columns = ["region_id", "region_name", "timestamp", "temperature", "wind_speed", "radiation"]
    df = pd.DataFrame(all_rows, columns=columns)
    if not df.empty:
        df["temperature"] = pd.to_numeric(df["temperature"], errors="coerce")
        df["wind_speed"] = pd.to_numeric(df["wind_speed"], errors="coerce")
        df["radiation"] = pd.to_numeric(df["radiation"], errors="coerce")

    logger.info("Fetched %d weather rows across %d DNO regions", len(df), len(_DNO_REGIONS))
    return df
