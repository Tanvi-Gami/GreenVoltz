"""Quantile crossing and monotonicity verification for probabilistic forecasts."""

from typing import Dict, Union

import numpy as np
import pandas as pd


def check_quantile_monotonicity(
    p10: Union[np.ndarray, pd.Series],
    p50: Union[np.ndarray, pd.Series],
    p90: Union[np.ndarray, pd.Series],
) -> Dict[str, Union[int, float]]:
    """Checks monotonicity of predictions (P10 <= P50 <= P90).

    A violation occurs whenever p10 > p50 or p50 > p90 for any prediction step.

    Args:
        p10: Array/Series of 10th percentile forecasts.
        p50: Array/Series of 50th percentile (median) forecasts.
        p90: Array/Series of 90th percentile forecasts.

    Returns:
        Dictionary with violation_count and violation_pct.
    """
    arr_10 = np.asarray(p10, dtype=float)
    arr_50 = np.asarray(p50, dtype=float)
    arr_90 = np.asarray(p90, dtype=float)

    if not (len(arr_10) == len(arr_50) == len(arr_90)):
        raise ValueError(f"Length mismatch: p10={len(arr_10)}, p50={len(arr_50)}, p90={len(arr_90)}")

    if len(arr_10) == 0:
        return {"violation_count": 0, "violation_pct": 0.0}

    violations = (arr_10 > arr_50) | (arr_50 > arr_90)
    violation_count = int(np.sum(violations))
    violation_pct = float(violation_count / len(arr_10))

    return {
        "violation_count": violation_count,
        "violation_pct": violation_pct,
    }


def enforce_monotonicity(
    p10: np.ndarray,
    p50: np.ndarray,
    p90: np.ndarray,
) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Rearrange or clip quantiles monotonically so p10 <= p50 <= p90 unconditionally.

    Applies quantile sorting (rearrangement) per observation.
    """
    stacked = np.column_stack([p10, p50, p90])
    sorted_stacked = np.sort(stacked, axis=1)
    return sorted_stacked[:, 0], sorted_stacked[:, 1], sorted_stacked[:, 2]
