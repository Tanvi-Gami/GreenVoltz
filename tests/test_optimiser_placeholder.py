"""Tests for OR-Tools CP-SAT scheduler placeholder and domain models."""

from intelligence.optimiser.models import (
    ScheduleRequest,
    ScheduleStatus,
)
from intelligence.optimiser.scheduler import CPSATScheduler


def test_ortools_cpsat_scheduler_instantiation():
    """Verify that Google OR-Tools CP-SAT scheduler engine initializes."""
    scheduler = CPSATScheduler(time_limit_seconds=5.0)
    assert scheduler.time_limit_seconds == 5.0


def test_cpsat_scheduler_empty_request():
    """Verify scheduler handles empty EV fleet gracefully."""
    scheduler = CPSATScheduler()
    request = ScheduleRequest(
        horizon_slots=48,
        slot_duration_minutes=30,
        evs=[],
        charger_capacities=[],
    )
    result = scheduler.solve(request)
    assert result.status == ScheduleStatus.OPTIMAL
    assert result.total_energy_kwh == 0.0


def test_cpsat_scheduler_invalid_horizon():
    """Verify scheduler rejects invalid time horizons."""
    scheduler = CPSATScheduler()
    request = ScheduleRequest(
        horizon_slots=0,
        slot_duration_minutes=30,
        evs=[],
        charger_capacities=[],
    )
    result = scheduler.solve(request)
    assert result.status == ScheduleStatus.MODEL_INVALID
