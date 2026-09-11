"""Tests for database engine and model definitions."""

from sqlalchemy import create_engine

from backend.app.database.base import Base


def test_database_models_metadata():
    """Verify that all 11 core domain tables are properly registered with Base metadata."""
    registered_tables = set(Base.metadata.tables.keys())
    expected_tables = {
        "users",
        "vehicles",
        "charging_stations",
        "chargers",
        "charging_requests",
        "reservations",
        "charging_sessions",
        "tariffs",
        "energy_forecasts",
        "station_status",
        "optimisation_results",
    }
    assert expected_tables.issubset(registered_tables)


def test_in_memory_sqlite_table_creation():
    """Verify schema syntax and DDL generation using in-memory SQLite engine."""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)

    # Validate that tables exist in SQLite metadata
    with engine.connect() as conn:
        from sqlalchemy import inspect
        inspector = inspect(conn)
        tables = set(inspector.get_table_names())
        assert "users" in tables
        assert "charging_stations" in tables
        assert "optimisation_results" in tables
