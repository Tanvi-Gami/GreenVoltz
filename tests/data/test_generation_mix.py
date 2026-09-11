"""Tests for the generation mix collector."""

from datetime import datetime, timezone
from unittest.mock import MagicMock, patch

import pandas as pd
import pytest

from data_pipeline.collectors.generation_mix import _FUEL_COLUMNS, fetch_generation_mix

_MOCK_RESPONSE = {
    "data": [
        {
            "from": "2024-01-01T00:00Z",
            "to": "2024-01-01T00:30Z",
            "generationmix": [
                {"fuel": "gas", "perc": 35.2},
                {"fuel": "coal", "perc": 1.5},
                {"fuel": "nuclear", "perc": 15.0},
                {"fuel": "wind", "perc": 30.0},
                {"fuel": "hydro", "perc": 2.1},
                {"fuel": "imports", "perc": 8.2},
                {"fuel": "biomass", "perc": 5.0},
                {"fuel": "other", "perc": 0.0},
                {"fuel": "solar", "perc": 3.0},
            ],
        }
    ]
}


@pytest.fixture()
def mock_httpx_get():
    mock_resp = MagicMock()
    mock_resp.json.return_value = _MOCK_RESPONSE
    mock_resp.raise_for_status.return_value = None
    with patch("data_pipeline.collectors.generation_mix.httpx.get", return_value=mock_resp) as m:
        yield m


def test_returns_dataframe(mock_httpx_get):
    from_dt = datetime(2024, 1, 1, 0, 0, tzinfo=timezone.utc)
    to_dt = datetime(2024, 1, 1, 1, 0, tzinfo=timezone.utc)
    df = fetch_generation_mix(from_dt, to_dt)
    assert isinstance(df, pd.DataFrame)
    assert list(df.columns) == ["settlement_period"] + _FUEL_COLUMNS
    assert len(df) == 1
    assert df["wind"].iloc[0] == 30.0
