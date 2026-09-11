"""Build optimisation inputs from SimulationState."""
from typing import Dict, List

from intelligence.simulation.models import EV, Charger, SimulationState, Station


def build_optimisation_input(sim: SimulationState) -> Dict:
    """Extracts and returns dictionaries required by the optimiser.

    Returns a dict with keys:
      - horizon_slots
      - slot_duration_minutes
      - evs: list of EV models
      - chargers: dict charger_id -> Charger
      - stations: dict station_id -> Station
      - charger_to_station: dict charger_id -> station_id
      - tariffs: dict station_id -> list[float]
      - renewable: list[float]
      - carbon: list[float]
    """
    horizon_slots = sim.horizon_slots
    slot_duration_minutes = sim.time_step_minutes
    evs: List[EV] = sim.evs
    chargers: Dict[str, Charger] = {c.charger_id: c for c in sim.chargers}
    stations: Dict[str, Station] = {s.station_id: s for s in sim.stations}

    charger_to_station = {c.charger_id: c.station_id for c in sim.chargers}

    # tariffs is stored per station index as lists in sim.tariffs; map by station_id
    tariffs: Dict[str, List[float]] = {}
    for idx, s in enumerate(sim.stations):
        if idx < len(sim.tariffs):
            tariffs[s.station_id] = sim.tariffs[idx]
        else:
            tariffs[s.station_id] = [s.base_tariff] * horizon_slots

    renewable = sim.renewable_profile
    carbon = sim.carbon_profile
    # station_states mapping (may contain dynamic signals like congestion, reliability)
    station_states = {st.station_id: st for st in getattr(sim, "station_states", [])}

    return {
        "horizon_slots": horizon_slots,
        "slot_duration_minutes": slot_duration_minutes,
        "evs": evs,
        "chargers": chargers,
        "stations": stations,
        "charger_to_station": charger_to_station,
        "tariffs": tariffs,
        "renewable": renewable,
        "carbon": carbon,
        "station_states": station_states,
    }
