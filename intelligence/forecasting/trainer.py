"""Quantile LightGBM trainer supporting arbitrary forecast targets (P10/P50/P90)."""

from typing import Any, Dict, Optional, Tuple, Union

import numpy as np
import pandas as pd
from lightgbm import LGBMRegressor

from intelligence.forecasting.cv import time_series_cv_split
from intelligence.forecasting.metrics import pinball_loss
from intelligence.forecasting.monotonicity import check_quantile_monotonicity
from intelligence.forecasting.targets import ForecastTarget, TargetConfig, get_target_config


def train_quantile_lgbm(
    X: pd.DataFrame,
    y: Union[pd.Series, np.ndarray],
    alpha: float,
    n_splits: int = 5,
    gap: int = 48,
    params: Optional[Dict[str, Any]] = None,
) -> Tuple[LGBMRegressor, np.ndarray]:
    """Train a single LightGBM quantile regression model with temporal cross-validation.

    Args:
        X: Feature DataFrame.
        y: Target series or array.
        alpha: Quantile level to predict (e.g. 0.1 for P10, 0.5 for P50, 0.9 for P90).
        n_splits: Number of TimeSeriesSplit folds.
        gap: Lookahead gap between train and validation folds.
        params: Optional custom LightGBM parameters.

    Returns:
        Tuple of (fitted_final_model, out_of_fold_predictions).
    """
    y_series = pd.Series(y).reset_index(drop=True) if not isinstance(y, pd.Series) else y.reset_index(drop=True)
    X_df = X.reset_index(drop=True)

    default_params: Dict[str, Any] = {
        "objective": "quantile",
        "alpha": alpha,
        "metric": "quantile",
        "n_estimators": 300,
        "learning_rate": 0.05,
        "num_leaves": 31,
        "verbose": -1,
    }
    if params:
        default_params.update(params)

    cv_splits = time_series_cv_split(len(X_df), n_splits=n_splits, gap=gap)
    oof_preds = np.full(len(X_df), np.nan)

    # Cross-validation loop
    for train_idx, val_idx in cv_splits:
        X_train, y_train = X_df.iloc[train_idx], y_series.iloc[train_idx]
        X_val = X_df.iloc[val_idx]

        fold_model = LGBMRegressor(**default_params)
        fold_model.fit(X_train, y_train)
        oof_preds[val_idx] = fold_model.predict(X_val)

    # Train final production model on full dataset
    final_model = LGBMRegressor(**default_params)
    final_model.fit(X_df, y_series)

    return final_model, oof_preds


class MultiQuantileForecaster:
    """Multi-quantile probabilistic forecaster supporting any configured ForecastTarget."""

    def __init__(
        self,
        target: Union[ForecastTarget, str, TargetConfig] = ForecastTarget.CARBON_INTENSITY,
        quantiles: Tuple[float, ...] = (0.1, 0.5, 0.9),
    ) -> None:
        if isinstance(target, TargetConfig):
            self.target_config = target
        else:
            self.target_config = get_target_config(target)

        self.quantiles = quantiles
        self.models: Dict[str, LGBMRegressor] = {}
        self.oof_predictions: Dict[str, np.ndarray] = {}
        self.metrics: Dict[str, float] = {}

    def fit(
        self,
        X: pd.DataFrame,
        y: Union[pd.Series, np.ndarray],
        n_splits: int = 5,
        gap: int = 48,
    ) -> "MultiQuantileForecaster":
        """Fit quantile models for each configured quantile level."""
        y_series = pd.Series(y)

        for q in self.quantiles:
            q_name = f"p{int(q * 100)}"
            model, oof = train_quantile_lgbm(
                X=X,
                y=y_series,
                alpha=q,
                n_splits=n_splits,
                gap=gap,
            )
            self.models[q_name] = model
            self.oof_predictions[q_name] = oof

            valid_mask = ~np.isnan(oof)
            if np.any(valid_mask):
                self.metrics[f"pinball_loss_{q_name}"] = pinball_loss(
                    alpha=q,
                    predictions=oof[valid_mask],
                    actuals=y_series.iloc[valid_mask],
                )

        return self

    def predict(self, X: pd.DataFrame) -> Dict[str, np.ndarray]:
        """Generate P10/P50/P90 quantile predictions for feature matrix X."""
        if not self.models:
            raise RuntimeError("Forecaster has not been fitted yet. Call fit() first.")
        preds = {}
        for q_name, model in self.models.items():
            preds[q_name] = model.predict(X)
        return preds

    def check_monotonicity(self) -> Dict[str, Union[int, float]]:
        """Validate that out-of-fold predictions satisfy p10 <= p50 <= p90."""
        if not ("p10" in self.oof_predictions and "p50" in self.oof_predictions and "p90" in self.oof_predictions):
            return {"violation_count": 0, "violation_pct": 0.0}

        p10 = self.oof_predictions["p10"]
        p50 = self.oof_predictions["p50"]
        p90 = self.oof_predictions["p90"]

        # Only evaluate over indices where all three folds made predictions
        mask = ~(np.isnan(p10) | np.isnan(p50) | np.isnan(p90))
        return check_quantile_monotonicity(p10[mask], p50[mask], p90[mask])
