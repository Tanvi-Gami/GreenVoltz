"""Tests for CP-SAT optimiser."""
from datetime import datetime

from intelligence.optimiser.scheduler import CPSATScheduler, ObjectiveWeights, optimise
from intelligence.simulation import generate_simulation
from intelligence.simulation.models import (
    EV,
    Charger,
    ChargingRequest,
    SimulationState,
    Station,
    StationState,
)


def test_single_ev_single_charger_basic_feasible():
    station = Station(
        station_id="S1",
        name="S1",
        latitude=0.0,
        longitude=0.0,
        charger_ids=["C1"],
        total_capacity=1,
        reliability_score=0.9,
        base_tariff=0.2,
        renewable_capability=0.0,
    )
    charger = Charger(charger_id="C1", station_id="S1", connector_type="Type2", max_power_kw=22.0)
    ev = EV(
        ev_id="EV1",
        battery_capacity_kwh=50.0,
        current_soc=0.2,
        target_soc=0.6,
        max_charging_power_kw=22.0,
        connector_type="Type2",
        arrival_slot=0,
        departure_slot=2,
        preferred_station_ids=[],
    )
    req = ChargingRequest(
        request_id="R1",
        ev_id="EV1",
        arrival_slot=0,
        departure_slot=2,
        energy_required_kwh=11.0,
        current_soc=0.2,
        target_soc=0.6,
        connector_type="Type2",
        max_power_kw=22.0,
        budget=None,
        preferences={},
    )
    st_state = StationState(
        station_id="S1",
        available_chargers=1,
        occupied_chargers=0,
        queue_length=0,
        estimated_wait_minutes=0,
        current_tariff=0.2,
        renewable_availability=0.0,
        carbon_intensity_gco2=400.0,
        reliability=0.9,
        congestion=0.0,
    )
    sim = SimulationState(
        generated_at=datetime.utcnow(),
        horizon_slots=2,
        time_step_minutes=60,
        stations=[station],
        chargers=[charger],
        evs=[ev],
        requests=[req],
        station_states=[st_state],
        tariffs=[[0.2, 0.2]],
        renewable_profile=[0.1, 0.1],
        carbon_profile=[400.0, 400.0],
    )

    sched = CPSATScheduler(time_limit_seconds=5)
    res = sched.optimise(sim)
    assert res.solver_status in ("FEASIBLE", "OPTIMAL")
    assert res.total_energy_delivered >= 11.0


def test_infeasible_scenario_detected():
    # EV requires more energy than available slots at charger power
    sim = generate_simulation(seed=1, num_evs=1, num_stations=1, horizon_hours=1, time_step_minutes=60)
    # make EV require huge energy
    sim.requests[0].energy_required_kwh = 1000.0
    sched = CPSATScheduler(time_limit_seconds=2)
    res = sched.optimise(sim)
    assert res.solver_status == "INFEASIBLE" or res.unscheduled_ev_ids


def test_objective_preference_cost_vs_carbon():
    # one EV, one charger, two slots: slot0 low tariff high carbon, slot1 high tariff low carbon
    station = Station(
        station_id="S1",
        name="S1",
        latitude=0.0,
        longitude=0.0,
        charger_ids=["C1"],
        total_capacity=1,
        reliability_score=0.9,
        base_tariff=0.2,
        renewable_capability=0.0,
    )
    charger = Charger(charger_id="C1", station_id="S1", connector_type="Type2", max_power_kw=22.0)
    ev = EV(
        ev_id="EV1",
        battery_capacity_kwh=50.0,
        current_soc=0.0,
        target_soc=0.5,
        max_charging_power_kw=22.0,
        connector_type="Type2",
        arrival_slot=0,
        departure_slot=2,
        preferred_station_ids=[],
    )
    req = ChargingRequest(
        request_id="R1",
        ev_id="EV1",
        arrival_slot=0,
        departure_slot=2,
        energy_required_kwh=11.0,
        current_soc=0.0,
        target_soc=0.5,
        connector_type="Type2",
        max_power_kw=22.0,
        budget=None,
        preferences={},
    )
    st_state = StationState(
        station_id="S1",
        available_chargers=1,
        occupied_chargers=0,
        queue_length=0,
        estimated_wait_minutes=0,
        current_tariff=0.1,
        renewable_availability=0.0,
        carbon_intensity_gco2=400.0,
        reliability=0.9,
        congestion=0.0,
    )
    sim = SimulationState(
        generated_at=datetime.utcnow(),
        horizon_slots=2,
        time_step_minutes=60,
        stations=[station],
        chargers=[charger],
        evs=[ev],
        requests=[req],
        station_states=[st_state],
        tariffs=[[0.1, 1.0]],
        renewable_profile=[0.0, 0.0],
        carbon_profile=[400.0, 10.0],
    )
    # prefer cost
    weights_cost = ObjectiveWeights(cost=10.0, carbon=0.001)
    sched = CPSATScheduler(time_limit_seconds=5)
    res_cost = sched.optimise(sim, weights=weights_cost)
    # energy should be scheduled in slot 0 (lower tariff)
    slots = {item.time_slot for item in res_cost.charging_plan}
    assert 0 in slots

    # prefer carbon
    weights_carbon = ObjectiveWeights(cost=0.1, carbon=10.0)
    res_carbon = sched.optimise(sim, weights=weights_carbon)
    slots2 = {item.time_slot for item in res_carbon.charging_plan}
    assert 1 in slots2


def test_100_ev_smoke():
    sim = generate_simulation(seed=123, num_evs=100, num_stations=10, horizon_hours=24, time_step_minutes=15)
    # allow more time for the 100-EV smoke test in CI
    res = optimise(sim, time_limit_seconds=20, num_workers=4)
    # Accept feasible/optimal or infeasible (but solver must finish)
    assert res.solver_status in ("FEASIBLE", "OPTIMAL", "INFEASIBLE")
    assert res.solver_runtime_seconds <= 20.0 + 2.0
    from intelligence.optimiser.validation import validate_plan
    if res.solver_status in ("FEASIBLE", "OPTIMAL"):
        errors = validate_plan(sim, res)
        assert not errors
    else:
        # infeasible should report some unscheduled EVs
        assert res.unscheduled_ev_ids
