"""Baseline benchmark models for time-series forecasting."""

import numpy as np


def persistence_baseline(series: np.ndarray, h: int = 48) -> np.ndarray:
    """Persistence (naive) baseline: predict that the value h periods ahead equals the current value.

    Args:
        series: Array of observed values in chronological order.
        h: Forecast horizon in settlement periods (default 48 = 24 hours at 30-min).

    Returns:
        Array of predictions aligned to series[h:].
    """
    arr = np.asarray(series)
    if len(arr) <= h:
        return np.array([])
    return arr[:-h]


def seasonal_naive_baseline(series: np.ndarray, h: int = 48, season: int = 336) -> np.ndarray:
    """Seasonal naive baseline: predict value from the same point in the previous seasonal cycle.

    Default season of 336 corresponds to one week of 30-minute periods (48 * 7 = 336).

    Args:
        series: Array of observed values in chronological order.
        h: Forecast horizon in settlement periods.
        season: Season length in periods (default 336).

    Returns:
        Array of predictions aligned to series[season:].
    """
    arr = np.asarray(series)
    if len(arr) <= season:
        return np.array([])
    return arr[: len(arr) - season]
