"""Plan validation utilities."""
from typing import List

from intelligence.optimiser.result import OptimisationResult
from intelligence.simulation.models import SimulationState


def validate_plan(sim: SimulationState, res: OptimisationResult) -> List[str]:
    """Validate the optimisation result against simulation state.

    Returns a list of error messages (empty if valid).
    """
    errors: List[str] = []

    # build mappings
    ev_ids = {e.ev_id for e in sim.evs}
    charger_ids = {c.charger_id for c in sim.chargers}
    # station_map and charger_map not required; keep minimal lookups below
    # check items
    # track occupancy per (charger, slot) and per (ev, slot)
    occ_charger = {}
    occ_ev = {}

    for item in res.charging_plan:
        if item.ev_id not in ev_ids:
            errors.append(f"Unknown EV {item.ev_id}")
        if item.charger_id not in charger_ids:
            errors.append(f"Unknown charger {item.charger_id}")
        # slot bounds
        if item.time_slot < 0 or item.time_slot >= sim.horizon_slots:
            errors.append(f"Invalid time_slot {item.time_slot} for EV {item.ev_id}")
        # charger occupancy
        key = (item.charger_id, item.time_slot)
        if occ_charger.get(key, 0) >= 1:
            errors.append(f"Charger {item.charger_id} double-booked at slot {item.time_slot}")
        occ_charger[key] = occ_charger.get(key, 0) + 1
        # ev occupancy
        key2 = (item.ev_id, item.time_slot)
        if occ_ev.get(key2, 0) >= 1:
            errors.append(f"EV {item.ev_id} charging on multiple chargers at slot {item.time_slot}")
        occ_ev[key2] = occ_ev.get(key2, 0) + 1

    # verify energy requirements per EV
    delivered = {e.ev_id: 0.0 for e in sim.evs}
    for item in res.charging_plan:
        delivered[item.ev_id] = delivered.get(item.ev_id, 0.0) + item.energy_kwh
    for req in sim.requests:
        if delivered.get(req.ev_id, 0.0) + 1e-6 < req.energy_required_kwh:
            errors.append(
                "EV %s undercharged: delivered=%s required=%s"
                % (req.ev_id, delivered.get(req.ev_id, 0.0), req.energy_required_kwh)
            )

    return errors
