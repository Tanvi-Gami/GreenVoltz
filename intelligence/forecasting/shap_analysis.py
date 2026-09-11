"""SHAP feature importance and explainability analysis for tree-based forecasting models."""

from typing import Any, Optional

import numpy as np
import pandas as pd
import shap


def compute_shap_values(
    model: Any,
    features_df: pd.DataFrame,
    sample_size: Optional[int] = 500,
) -> tuple[shap.Explanation, np.ndarray]:
    """Compute SHAP values using TreeExplainer for a trained LightGBM regressor.

    Args:
        model: Trained tree-based model (e.g. LGBMRegressor).
        features_df: Feature DataFrame used for computing explanations.
        sample_size: Optional row sample limit to accelerate explanation calculation.

    Returns:
        Tuple of (SHAP Explanation object, raw SHAP values matrix).
    """
    if sample_size and len(features_df) > sample_size:
        data_sample = features_df.sample(n=sample_size, random_state=42)
    else:
        data_sample = features_df

    explainer = shap.TreeExplainer(model)
    shap_values = explainer(data_sample)
    return shap_values, explainer.shap_values(data_sample)
