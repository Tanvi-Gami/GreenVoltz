"""Top-level simulation generator combining components into SimulationState."""

import random
from datetime import datetime

from intelligence.simulation.congestion import station_state_from
from intelligence.simulation.ev_generator import generate_evs
from intelligence.simulation.models import SimulationState
from intelligence.simulation.renewable import generate_renewable_profile
from intelligence.simulation.scenarios import SCENARIOS
from intelligence.simulation.station_generator import generate_stations
from intelligence.simulation.tariffs import generate_tariff_profile


def generate_simulation(
    seed: int = 42,
    num_evs: int = 100,
    num_stations: int = 10,
    horizon_hours: int = 24,
    time_step_minutes: int = 15,
    scenario: str = "NORMAL_DAY",
) -> SimulationState:
    rnd = random.Random(seed)
    horizon_slots = int((horizon_hours * 60) / time_step_minutes)

    # stations and chargers
    stations, chargers = generate_stations(seed=seed, num_stations=num_stations)

    # apply scenario modifiers
    scen = SCENARIOS.get(scenario, SCENARIOS["NORMAL_DAY"])
    num_evs_scaled = max(1, int(num_evs * scen.get("demand_multiplier", 1.0)))

    # profiles
    tariffs = [generate_tariff_profile(horizon_slots) for _ in stations]
    renewable = generate_renewable_profile(horizon_slots)
    # simple carbon profile: inverse of renewable scaled
    carbon = []
    for r in renewable:
        val = 400.0 * (1.0 - r * scen.get("renewable_scale", 1.0))
        carbon.append(max(50.0, val))

    evs, requests = generate_evs(
        seed=seed + 1,
        num_evs=num_evs_scaled,
        horizon_slots=horizon_slots,
        time_step_minutes=time_step_minutes,
        stations=stations,
    )

    # build initial station states
    station_states = []
    for i, s in enumerate(stations):
        # deterministic occupied/queue based on seed
        occ = rnd.randint(0, max(0, len(s.charger_ids) - 1))
        queue = rnd.randint(0, 3)
        st = station_state_from(
            s, chargers, occupied=occ, queue=queue, tariff=s.base_tariff, renewable=renewable[0], carbon=carbon[0]
        )
        station_states.append(st)

    # Make generated_at deterministic for reproducible scenarios (based on seed)
    gen_time = datetime.utcfromtimestamp(seed)
    sim = SimulationState(
        generated_at=gen_time,
        horizon_slots=horizon_slots,
        time_step_minutes=time_step_minutes,
        stations=stations,
        chargers=chargers,
        evs=evs,
        requests=requests,
        station_states=station_states,
        tariffs=tariffs,
        renewable_profile=renewable,
        carbon_profile=carbon,
    )

    # scenario: station failure
    if scen.get("fail_one_station"):
        if sim.stations:
            sim.stations[0].operational_status = "degraded"
            # mark first charger as unavailable
            if sim.chargers:
                sim.chargers[0].status = "unavailable"

    return sim
    return sim
