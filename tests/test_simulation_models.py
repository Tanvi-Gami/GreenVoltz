"""Tests for EV simulation domain models and generator placeholder."""

from datetime import datetime, timezone

from intelligence.simulation.generator import BasicSimulationGenerator
from intelligence.simulation.models import (
    BatteryState,
    SimulatedEV,
)


def test_battery_state_energy_required():
    """Verify calculation of energy required from SOC delta."""
    battery = BatteryState(
        capacity_kwh=100.0,
        current_soc_pct=20.0,
        target_soc_pct=80.0,
    )
    # Deficit is 60% of 100 kWh = 60 kWh
    assert battery.energy_required_kwh == 60.0

    # Over target SOC should require 0 kWh
    battery_full = BatteryState(
        capacity_kwh=100.0,
        current_soc_pct=90.0,
        target_soc_pct=80.0,
    )
    assert battery_full.energy_required_kwh == 0.0


def test_basic_simulation_generator():
    """Verify fleet and request generation stubs."""
    generator = BasicSimulationGenerator()
    fleet = generator.generate_fleet(count=10)
    assert len(fleet) == 10
    assert all(isinstance(ev, SimulatedEV) for ev in fleet)

    start = datetime(2026, 9, 12, 8, 0, tzinfo=timezone.utc)
    requests = generator.generate_requests(fleet, start_time=start, duration_hours=12)
    assert len(requests) == 10
    assert all(req.arrival_time < req.departure_deadline for req in requests)
