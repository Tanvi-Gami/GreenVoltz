from datetime import datetime

from intelligence.optimiser.scheduler import CPSATScheduler, ObjectiveWeights
from intelligence.simulation.models import (
    EV,
    Charger,
    ChargingRequest,
    SimulationState,
    Station,
    StationState,
)


def test_congestion_and_reliability_affect_choice():
    """Controlled scenario: two stations, each cheaper in a different slot.

    Station S1: cheap in slot 0 but high congestion/low reliability.
    Station S2: cheap in slot 1 but low congestion/high reliability.
    """
    station = Station(
        station_id="S1",
        name="S1",
        latitude=0.0,
        longitude=0.0,
        charger_ids=["C1"],
        total_capacity=1,
        reliability_score=0.2,
        base_tariff=0.1,
        renewable_capability=0.0,
    )
    station2 = Station(
        station_id="S2",
        name="S2",
        latitude=0.0,
        longitude=0.0,
        charger_ids=["C2"],
        total_capacity=1,
        reliability_score=0.9,
        base_tariff=0.1,
        renewable_capability=0.0,
    )
    charger = Charger(charger_id="C1", station_id="S1", connector_type="Type2", max_power_kw=22.0)
    charger2 = Charger(charger_id="C2", station_id="S2", connector_type="Type2", max_power_kw=22.0)
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
        reliability=0.2,
        congestion=0.9,
    )
    st_state2 = StationState(
        station_id="S2",
        available_chargers=1,
        occupied_chargers=0,
        queue_length=0,
        estimated_wait_minutes=0,
        current_tariff=0.1,
        renewable_availability=0.0,
        carbon_intensity_gco2=100.0,
        reliability=0.9,
        congestion=0.0,
    )

    sim = SimulationState(
        generated_at=datetime.utcnow(),
        horizon_slots=2,
        time_step_minutes=60,
        stations=[station, station2],
        chargers=[charger, charger2],
        evs=[ev],
        requests=[req],
        station_states=[st_state, st_state2],
        tariffs=[[0.1, 1.0], [1.0, 0.1]],
        renewable_profile=[0.0, 0.0],
        carbon_profile=[400.0, 400.0],
    )

    # If we prefer reliability (penalise low reliability), scheduler should pick slot 1
    weights_rel = ObjectiveWeights(cost=0.1, carbon=0.0, congestion=0.0, reliability=-5.0, renewable=0.0, urgency=0.0)
    sched = CPSATScheduler(time_limit_seconds=5)
    res_rel = sched.optimise(sim, weights=weights_rel)
    # compute energy per slot
    energy_per_slot_rel = {}
    for it in res_rel.charging_plan:
        energy_per_slot_rel[it.time_slot] = energy_per_slot_rel.get(it.time_slot, 0.0) + it.energy_kwh

    # If we prefer congestion (penalise congestion), scheduler should pick slot 1
    weights_cong = ObjectiveWeights(cost=0.1, carbon=0.0, congestion=5.0, reliability=0.0, renewable=0.0, urgency=0.0)
    res_cong = sched.optimise(sim, weights=weights_cong)
    energy_per_slot_cong = {}
    for it in res_cong.charging_plan:
        energy_per_slot_cong[it.time_slot] = energy_per_slot_cong.get(it.time_slot, 0.0) + it.energy_kwh

    # both reliability and congestion preferences should bias energy towards slot 1
    assert energy_per_slot_rel.get(1, 0.0) >= energy_per_slot_rel.get(0, 0.0)
    assert energy_per_slot_cong.get(1, 0.0) >= energy_per_slot_cong.get(0, 0.0)


def test_objective_coefficients_are_integers():
    """Verify that objective integer coefficients are produced and reasonable."""
    station = Station(
        station_id="S1",
        name="S1",
        latitude=0.0,
        longitude=0.0,
        charger_ids=["C1"],
        total_capacity=1,
        reliability_score=0.9,
        base_tariff=0.1,
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
        tariffs=[[0.1, 0.1]],
        renewable_profile=[0.0, 0.0],
        carbon_profile=[400.0, 400.0],
    )

    sched = CPSATScheduler(time_limit_seconds=2, scale=1000)
    _ = sched.optimise(sim)
    coeffs = getattr(sched, "_last_objective_coeffs", [])
    assert coeffs
    assert all(isinstance(c, int) for c in coeffs)
    # coefficients should not be unreasonably large (avoid overflow)
    assert max(abs(c) for c in coeffs) < 10 ** 9
