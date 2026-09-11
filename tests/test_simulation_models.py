"""Tests for canonical Phase 3 simulation models and generator."""

from intelligence.simulation import generate_simulation
from intelligence.simulation.energy import energy_required_kwh


def test_energy_required_from_ev_soc():
    """Verify energy calculation derived from EV battery SOC values."""
    # Use canonical EV semantics: SOCs are fractional (0.0-1.0)
    capacity = 100.0
    current = 0.2
    target = 0.8
    energy = energy_required_kwh(capacity, current, target)
    assert round(energy, 6) == 60.0


def test_generate_simulation_produces_evs_and_requests():
    """Verify `generate_simulation` creates EVs and matching requests."""
    sim = generate_simulation(seed=1, num_evs=10, num_stations=2, horizon_hours=12, time_step_minutes=15)
    assert len(sim.evs) == 10
    assert len(sim.requests) == 10
    # Requests must have arrival before departure (slot-based)
    for req in sim.requests:
        assert req.arrival_slot < req.departure_slot
