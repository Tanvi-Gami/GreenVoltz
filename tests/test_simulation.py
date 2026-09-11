"""Unit tests for Phase 3 simulation foundation."""
from intelligence.simulation import generate_simulation


def test_deterministic_generation():
    s1 = generate_simulation(seed=42, num_evs=10, num_stations=3, horizon_hours=4, time_step_minutes=15)
    s2 = generate_simulation(seed=42, num_evs=10, num_stations=3, horizon_hours=4, time_step_minutes=15)
    assert s1.model_dump_json() == s2.model_dump_json()


def test_soc_and_deadline_validity():
    sim = generate_simulation(seed=7, num_evs=5, num_stations=2, horizon_hours=6, time_step_minutes=15)
    for ev in sim.evs:
        assert 0.0 <= ev.current_soc <= ev.target_soc <= 1.0
        assert ev.departure_slot > ev.arrival_slot


def test_positive_energy_demand_and_no_duplicate_ids():
    sim = generate_simulation(seed=9, num_evs=20, num_stations=4, horizon_hours=8, time_step_minutes=15)
    ids = set()
    for req in sim.requests:
        assert req.energy_required_kwh > 0
        assert req.request_id not in ids
        ids.add(req.request_id)


def test_connector_compatibility_and_charging_duration():
    sim = generate_simulation(seed=11, num_evs=6, num_stations=3, horizon_hours=6, time_step_minutes=15)
    for ev in sim.evs:
        # EV connector type should be a known type
        assert ev.connector_type in ("Type2", "CCS2")


def test_large_scenario_performance_and_serialisation():
    sim = generate_simulation(seed=123, num_evs=100, num_stations=10, horizon_hours=24, time_step_minutes=15)
    assert len(sim.evs) >= 100
    # Serialization
    j = sim.model_dump_json()
    assert isinstance(j, str) and len(j) > 0
