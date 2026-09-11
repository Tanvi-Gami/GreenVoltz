"""Deterministic EV request generator."""
import random
from typing import List, Tuple

from intelligence.simulation.energy import energy_required_kwh
from intelligence.simulation.models import EV, ChargingRequest

PROFILES = ["urgent", "cost_sensitive", "green_preference", "balanced"]


def generate_evs(
    seed: int,
    num_evs: int,
    horizon_slots: int,
    time_step_minutes: int,
    stations: List[EV],
) -> Tuple[List[EV], List[ChargingRequest]]:
    rnd = random.Random(seed)
    evs = []
    requests = []
    for i in range(num_evs):
        ev_id = f"EV{i+1}"
        battery = rnd.uniform(40.0, 100.0)
        current_soc = round(rnd.uniform(0.05, 0.8), 3)
        target_soc = round(min(1.0, current_soc + rnd.uniform(0.1, 0.6)), 3)
        max_power = rnd.choice([7.0, 11.0, 22.0, 50.0])
        connector = rnd.choice(["Type2", "CCS2"])
        arrival_slot = rnd.randint(0, max(0, horizon_slots - 2))
        # departure at least one slot after arrival
        departure_slot = rnd.randint(arrival_slot + 1, min(horizon_slots, arrival_slot + rnd.randint(4, 48)))
        preferred = []
        # prefer a few random stations
        # stations param is reused for selection; if empty, leave empty
        try:
            preferred = [s.station_id for s in rnd.sample(stations, k=min(2, len(stations)))]
        except Exception:
            preferred = []

        ev = EV(
            ev_id=ev_id,
            battery_capacity_kwh=round(battery, 2),
            current_soc=current_soc,
            target_soc=target_soc,
            max_charging_power_kw=max_power,
            connector_type=connector,
            arrival_slot=arrival_slot,
            departure_slot=departure_slot,
            preferred_station_ids=preferred,
            profile=rnd.choice(PROFILES),
        )
        evs.append(ev)

        energy = energy_required_kwh(ev.battery_capacity_kwh, ev.current_soc, ev.target_soc)
        # ensure positive
        if energy <= 0:
            energy = 0.1

        req = ChargingRequest(
            request_id=f"R{i+1}",
            ev_id=ev.ev_id,
            arrival_slot=ev.arrival_slot,
            departure_slot=ev.departure_slot,
            energy_required_kwh=round(energy, 3),
            current_soc=ev.current_soc,
            target_soc=ev.target_soc,
            connector_type=ev.connector_type,
            max_power_kw=ev.max_charging_power_kw,
            budget=None,
            preferences={},
        )
        requests.append(req)

    return evs, requests
