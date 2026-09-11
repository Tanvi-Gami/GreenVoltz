"""Validation report: run all validators row-by-row and collect errors."""

from collections.abc import Callable
from typing import Dict, List

import pandas as pd

from data_pipeline.logging_config import get_logger
from data_pipeline.validators.carbon_intensity import validate_carbon_intensity
from data_pipeline.validators.ev_sessions import validate_ev_sessions
from data_pipeline.validators.exceptions import ValidationError
from data_pipeline.validators.generation_mix import validate_generation_mix
from data_pipeline.validators.weather import validate_weather

logger = get_logger(__name__)

_VALIDATORS: Dict[str, Callable[[pd.DataFrame], None]] = {
    "carbon_intensity": validate_carbon_intensity,
    "generation_mix": validate_generation_mix,
    "weather": validate_weather,
    "ev_sessions": validate_ev_sessions,
}


def validate_all(dataframes: Dict[str, pd.DataFrame]) -> Dict[str, List[str]]:
    """Run all validators and collect errors without raising immediately."""
    report: Dict[str, List[str]] = {}

    for source_name, df in dataframes.items():
        validator = _VALIDATORS.get(source_name)
        if validator is None:
            logger.warning("No validator registered for source '%s' — skipping", source_name)
            continue

        errors: List[str] = []
        for idx in df.index:
            row_df = df.loc[[idx]]
            try:
                validator(row_df)
            except ValidationError as exc:
                errors.append(str(exc))

        if errors:
            report[source_name] = errors
            logger.info("Source '%s': %d validation error(s) found", source_name, len(errors))
        else:
            logger.info("Source '%s': all rows passed validation", source_name)

    return report
