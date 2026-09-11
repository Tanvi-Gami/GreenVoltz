"""Model persistence and artifact serialization for GreenVoltz forecasting models."""

from datetime import date
from pathlib import Path
from typing import Dict, Optional, Union

import joblib
from lightgbm import LGBMRegressor


def save_artefacts(
    model_dict: Dict[str, LGBMRegressor],
    target_name: str = "carbon_intensity",
    date_of_model: Optional[str] = None,
    base_path: Union[str, Path] = Path("saved_models"),
) -> Path:
    """Save P10/P50/P90 models to base_path/target_name/YYYY-MM-DD/.

    Args:
        model_dict: Dictionary of {"p10": model, "p50": model, "p90": model}.
        target_name: Identifier for the forecast target.
        date_of_model: Date string (default: today's ISO date).
        base_path: Root storage path.

    Returns:
        Path to the written model directory.
    """
    if date_of_model is None:
        date_of_model = date.today().isoformat()

    model_root = Path(base_path) / target_name / date_of_model
    model_root.mkdir(parents=True, exist_ok=True)

    for q_name, model in model_dict.items():
        output_path = model_root / f"{q_name}.joblib"
        joblib.dump(model, output_path)

    return model_root


def load_latest_artefacts(
    target_name: str = "carbon_intensity",
    base_path: Union[str, Path] = Path("saved_models"),
) -> Dict[str, LGBMRegressor]:
    """Load the most recently saved quantile models for a given target.

    Args:
        target_name: Identifier for the forecast target.
        base_path: Root directory where models are saved.

    Returns:
        Dict of {"p10": model, "p50": model, "p90": model}.
    """
    target_dir = Path(base_path) / target_name
    if not target_dir.exists():
        # Fallback to direct date dirs under base_path if no target subdirectory
        if any(p.is_dir() for p in Path(base_path).glob("*")):
            target_dir = Path(base_path)
        else:
            raise FileNotFoundError(f"No saved models found in {target_dir}")

    date_dirs = sorted([d for d in target_dir.iterdir() if d.is_dir()])
    if not date_dirs:
        raise FileNotFoundError(f"No dated model directories found in {target_dir}")

    latest_dir = date_dirs[-1]
    loaded = {}
    for q in ["p10", "p50", "p90"]:
        model_file = latest_dir / f"{q}.joblib"
        if model_file.exists():
            loaded[q] = joblib.load(model_file)
        else:
            raise FileNotFoundError(f"Expected model artifact missing: {model_file}")

    return loaded
