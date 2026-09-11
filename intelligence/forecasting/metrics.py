"""Evaluation metrics for deterministic and quantile probabilistic forecasting."""

from typing import Union

import numpy as np
import pandas as pd


def pinball_loss(
    alpha: float,
    predictions: Union[np.ndarray, pd.Series],
    actuals: Union[np.ndarray, pd.Series],
) -> float:
    """Compute the pinball loss (quantile loss) for evaluating quantile forecasts.

    L_alpha(y, y_hat) = max(alpha * (y - y_hat), (alpha - 1) * (y - y_hat))

    Args:
        alpha: Target quantile level in (0, 1) (e.g. 0.1, 0.5, 0.9).
        predictions: Predicted quantile values.
        actuals: True ground truth values.

    Returns:
        Mean pinball loss across all observations.
    """
    preds = np.asarray(predictions, dtype=float)
    acts = np.asarray(actuals, dtype=float)

    if len(preds) != len(acts):
        raise ValueError(f"Length mismatch: {len(preds)} predictions vs {len(acts)} actuals")

    errors = acts - preds
    losses = np.where(errors >= 0, alpha * errors, (alpha - 1) * errors)
    return float(np.mean(losses))


def calc_mae(
    predictions: Union[np.ndarray, pd.Series],
    actuals: Union[np.ndarray, pd.Series],
) -> float:
    """Mean Absolute Error (MAE)."""
    preds = np.asarray(predictions, dtype=float)
    acts = np.asarray(actuals, dtype=float)
    return float(np.mean(np.abs(preds - acts)))


def calc_mse(
    predictions: Union[np.ndarray, pd.Series],
    actuals: Union[np.ndarray, pd.Series],
) -> float:
    """Mean Squared Error (MSE)."""
    preds = np.asarray(predictions, dtype=float)
    acts = np.asarray(actuals, dtype=float)
    return float(np.mean((preds - acts) ** 2))


def calc_rmse(
    predictions: Union[np.ndarray, pd.Series],
    actuals: Union[np.ndarray, pd.Series],
) -> float:
    """Root Mean Squared Error (RMSE)."""
    return float(np.sqrt(calc_mse(predictions, actuals)))


def calc_mape(
    predictions: Union[np.ndarray, pd.Series],
    actuals: Union[np.ndarray, pd.Series],
    epsilon: float = 1e-6,
) -> float:
    """Mean Absolute Percentage Error (MAPE) with epsilon protection against zero division."""
    preds = np.asarray(predictions, dtype=float)
    acts = np.asarray(actuals, dtype=float)
    safe_actuals = np.where(acts == 0, epsilon, acts)
    return float(np.mean(np.abs((acts - preds) / safe_actuals)) * 100.0)


# Backwards compatibility alias for source tests
calc_MAPE = calc_mape
calc_RMSE = calc_rmse
calc_MSE = calc_mse
