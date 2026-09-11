"""Model evaluation and comparative benchmarking against naive baselines."""

from typing import Dict

import numpy as np
import pandas as pd

from intelligence.forecasting.baselines import persistence_baseline, seasonal_naive_baseline
from intelligence.forecasting.metrics import calc_mae, calc_rmse, pinball_loss
from intelligence.forecasting.trainer import train_quantile_lgbm


def evaluate_all_models(
    features_X: pd.DataFrame,
    labels_y: pd.Series,
    alphas: tuple[float, ...] = (0.1, 0.5, 0.9),
) -> Dict[str, Dict[str, float]]:
    """Train quantile models and baseline benchmarks, returning comparative metrics.

    Args:
        features_X: Feature matrix.
        labels_y: Target values series.
        alphas: Tuple of quantile levels.

    Returns:
        Dictionary of metrics per model.
    """
    X = features_X
    y = labels_y
    metrics: Dict[str, Dict[str, float]] = {}

    for alpha in alphas:
        model, oof = train_quantile_lgbm(X, y, alpha=alpha)
        mask = ~np.isnan(oof)

        key = f"lgbm_p_{int(alpha * 100)}"
        metrics[key] = {}
        metrics[key][f"pinball_{int(alpha * 100)}"] = pinball_loss(
            alpha=alpha,
            predictions=oof[mask],
            actuals=y.values[mask],
        )
        if alpha == 0.5:
            metrics[key][f"mae_{int(alpha * 100)}"] = calc_mae(
                predictions=oof[mask],
                actuals=y.values[mask],
            )
            metrics[key][f"rmse_{int(alpha * 100)}"] = calc_rmse(
                predictions=oof[mask],
                actuals=y.values[mask],
            )

    # Compare with baselines
    for name, (baseline, actuals) in get_baseline_predictions(labels_y).items():
        metrics[name] = {
            f"pinball_{name}": pinball_loss(alpha=0.5, predictions=baseline, actuals=actuals),
            f"mae_{name}": calc_mae(predictions=baseline, actuals=actuals),
            f"rmse_{name}": calc_rmse(predictions=baseline, actuals=actuals),
        }

    return metrics


def get_baseline_predictions(labels_y: pd.Series) -> Dict[str, tuple[np.ndarray, np.ndarray]]:
    """Compute 24h persistence and 7-day seasonal naive baseline prediction pairs."""
    y_vals = labels_y.values
    per_baseline = persistence_baseline(y_vals, h=48)
    seas_baseline = seasonal_naive_baseline(y_vals, h=48, season=336)

    return {
        "persistence": (per_baseline, y_vals[48:]),
        "seasonal_naive": (seas_baseline, y_vals[336:]),
    }
