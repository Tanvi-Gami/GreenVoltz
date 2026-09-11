"""Smoke test: verify all core GreenVoltz dependencies and internal modules import without error."""


def test_core_library_imports():
    import duckdb  # noqa: F401
    import fastapi  # noqa: F401
    import httpx  # noqa: F401
    import joblib  # noqa: F401
    import lightgbm  # noqa: F401
    import numpy  # noqa: F401
    import ortools  # noqa: F401
    import pandas  # noqa: F401
    import psycopg2  # noqa: F401
    import pyarrow  # noqa: F401
    import pydantic  # noqa: F401
    import pydantic_settings  # noqa: F401
    import scipy  # noqa: F401
    import shap  # noqa: F401
    import sklearn  # noqa: F401
    import sqlalchemy  # noqa: F401
    import uvicorn  # noqa: F401
    import workalendar  # noqa: F401


def test_internal_module_imports():
    from backend.app.config import get_settings  # noqa: F401
    from backend.app.database.session import SessionLocal, get_engine  # noqa: F401
    from backend.app.main import app  # noqa: F401
    from data_pipeline.collectors.carbon_intensity import fetch_carbon_intensity  # noqa: F401
    from data_pipeline.collectors.generation_mix import fetch_generation_mix  # noqa: F401
    from data_pipeline.collectors.weather import fetch_weather  # noqa: F401
    from data_pipeline.features.alignment import align_to_settlement_periods  # noqa: F401
    from data_pipeline.features.calendar_features import add_calendar_features  # noqa: F401
    from data_pipeline.features.lags import add_lag_features  # noqa: F401
    from data_pipeline.features.penetration import add_penetration_features  # noqa: F401
    from data_pipeline.features.rolling import add_rolling_features  # noqa: F401
    from data_pipeline.features.weather_join import join_weather_to_grid  # noqa: F401
    from intelligence.forecasting.cv import time_series_cv_split  # noqa: F401
    from intelligence.forecasting.metrics import pinball_loss  # noqa: F401
    from intelligence.forecasting.monotonicity import check_quantile_monotonicity  # noqa: F401
    from intelligence.forecasting.targets import ForecastTarget, get_target_config  # noqa: F401
    from intelligence.forecasting.trainer import MultiQuantileForecaster, train_quantile_lgbm  # noqa: F401
    from intelligence.optimiser.scheduler import CPSATScheduler  # noqa: F401
    from intelligence.simulation.generator import BasicSimulationGenerator  # noqa: F401
    from intelligence.simulation.models import SimulatedEV  # noqa: F401
