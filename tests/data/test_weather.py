"""Tests for the weather collector."""

from datetime import datetime, timezone
from unittest.mock import MagicMock, patch

import pandas as pd
import pytest

from data_pipeline.collectors.weather import fetch_weather

_MOCK_HOURLY = {
    "hourly": {
        "time": ["2024-01-01T00:00", "2024-01-01T01:00"],
        "temperature_2m": [5.2, 4.8],
        "wind_speed_10m": [15.3, 16.1],
        "shortwave_radiation": [0.0, 0.0],
    }
}


@pytest.fixture()
def mock_httpx_get():
    mock_resp = MagicMock()
    mock_resp.json.return_value = _MOCK_HOURLY
    mock_resp.raise_for_status.return_value = None
    with patch("data_pipeline.collectors.weather.httpx.get", return_value=mock_resp) as m:
        yield m


def test_weather_collector_returns_dataframe(mock_httpx_get):
    from_dt = datetime(2024, 1, 1, tzinfo=timezone.utc)
    to_dt = datetime(2024, 1, 1, 2, tzinfo=timezone.utc)
    df = fetch_weather(from_dt, to_dt)
    assert isinstance(df, pd.DataFrame)
    assert "city" in df.columns
    assert "temperature" in df.columns
    assert "wind_speed" in df.columns
    assert "radiation" in df.columns
    # 3 cities * 2 hours = 6 rows
    assert len(df) == 6
