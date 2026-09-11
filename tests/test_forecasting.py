"""Tests for the forecasting framework and multi-target abstraction."""

import numpy as np
import pandas as pd

from intelligence.forecasting.cv import time_series_cv_split
from intelligence.forecasting.metrics import calc_mae, pinball_loss
from intelligence.forecasting.monotonicity import check_quantile_monotonicity, enforce_monotonicity
from intelligence.forecasting.targets import ForecastTarget, get_target_config
from intelligence.forecasting.trainer import MultiQuantileForecaster


def test_target_registry_configurations():
    """Verify all 4 core targets are configured with valid metadata."""
    targets = [
        ForecastTarget.CARBON_INTENSITY,
        ForecastTarget.RENEWABLE_AVAILABILITY,
        ForecastTarget.EV_CHARGING_DEMAND,
        ForecastTarget.STATION_CONGESTION,
    ]
    for target in targets:
        cfg = get_target_config(target)
        assert cfg.target == target
        assert cfg.target_column
        assert cfg.unit
        assert len(cfg.default_quantiles) == 3


def test_time_series_cv_split_temporal_ordering():
    """Verify strictly increasing temporal fold validation."""
    n = 200
    splits = time_series_cv_split(n, n_splits=4, gap=10)
    assert len(splits) == 4

    for train_idx, val_idx in splits:
        assert len(train_idx) > 0
        assert len(val_idx) > 0
        assert train_idx[-1] < val_idx[0]
        # Gap between end of train and start of val
        assert (val_idx[0] - train_idx[-1]) >= 10


def test_pinball_loss():
    """Verify pinball loss properties."""
    actuals = np.array([10.0, 20.0, 30.0])
    predictions = np.array([12.0, 20.0, 25.0])
    # alpha = 0.5 (median / symmetric)
    loss = pinball_loss(0.5, predictions, actuals)
    mae = calc_mae(predictions, actuals)
    # At alpha=0.5, pinball loss is exactly 0.5 * MAE
    assert np.isclose(loss, 0.5 * mae)


def test_monotonicity_checks():
    """Verify detection of quantile crossing violations."""
    p10 = np.array([10.0, 20.0, 50.0])
    p50 = np.array([20.0, 30.0, 40.0])
    p90 = np.array([30.0, 40.0, 30.0])

    result = check_quantile_monotonicity(p10, p50, p90)
    # At index 2: p10=50 > p50=40, and p50=40 > p90=30 -> 1 violation
    assert result["violation_count"] == 1
    assert np.isclose(result["violation_pct"], 1.0 / 3.0)

    # Monotonicity enforcement
    e10, e50, e90 = enforce_monotonicity(p10, p50, p90)
    enforced_result = check_quantile_monotonicity(e10, e50, e90)
    assert enforced_result["violation_count"] == 0


def test_multi_target_forecaster_fit_predict():
    """Verify that MultiQuantileForecaster fits and predicts with dummy data."""
    np.random.seed(42)
    n_samples = 150
    X = pd.DataFrame({
        "feat_1": np.random.randn(n_samples),
        "feat_2": np.random.randn(n_samples),
    })
    y = 50.0 + 2.0 * X["feat_1"] + np.random.randn(n_samples) * 5.0

    forecaster = MultiQuantileForecaster(target=ForecastTarget.EV_CHARGING_DEMAND)
    forecaster.fit(X, y, n_splits=3, gap=5)

    preds = forecaster.predict(X.iloc[:10])
    assert "p10" in preds
    assert "p50" in preds
    assert "p90" in preds
    assert len(preds["p50"]) == 10
