"""TimeSeriesSplit cross-validation generator with temporal ordering preservation."""

from typing import List, Tuple

import numpy as np
from sklearn.model_selection import TimeSeriesSplit


def time_series_cv_split(
    n: int,
    n_splits: int = 5,
    gap: int = 48,
) -> List[Tuple[np.ndarray, np.ndarray]]:
    """Return list of (train_idx, val_idx) tuples with strict temporal ordering.

    Args:
        n: Total number of sequential observations.
        n_splits: Number of CV folds (default 5).
        gap: Number of periods to skip between train and validation folds (default 48 = 24 hours at 30-min).

    Returns:
        List of (train_indices, val_indices) tuples.
    """
    if n <= 0:
        raise ValueError(f"Dataset length n must be positive, got {n}")
    if n_splits < 2:
        raise ValueError(f"n_splits must be at least 2, got {n_splits}")

    splitter = TimeSeriesSplit(n_splits=n_splits, gap=gap)
    indices = np.arange(n)
    return list(splitter.split(indices))
