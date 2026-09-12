from typing import List

from intelligence.adaptation.models import DisruptionEvent


def detect_impact(disruption: DisruptionEvent, existing_plan: List[dict], reservations: List[dict] = None):
    """Determine affected EVs, reservations and invalidated plan items.

    existing_plan: list of plan items dicts with keys: ev_id, charger_id, time_slot
    reservations: optional list of reservation dicts with keys: id, charger_id, request_id
    """
    affected_ev_ids = set()
    affected_res_ids = set()
    invalidated = []

    # Simple detection rules
    if disruption.event_type == disruption.event_type.CHARGER_UNAVAILABLE:
        for it in existing_plan:
            if str(it.get("charger_id")) == str(disruption.charger_id):
                affected_ev_ids.add(str(it.get("ev_id")))
                invalidated.append(f"{it.get('ev_id')}:{it.get('time_slot')}")
        if reservations:
            for r in reservations:
                if str(r.get("charger_id")) == str(disruption.charger_id):
                    affected_res_ids.add(int(r.get("id")))

    elif disruption.event_type == disruption.event_type.STATION_UNAVAILABLE:
        for it in existing_plan:
            if str(it.get("station_id")) == str(disruption.station_id):
                affected_ev_ids.add(str(it.get("ev_id")))
                invalidated.append(f"{it.get('ev_id')}:{it.get('time_slot')}")
        if reservations:
            for r in reservations:
                # assume reservation has station_id key
                if str(r.get("station_id")) == str(disruption.station_id):
                    affected_res_ids.add(int(r.get("id")))

    elif disruption.event_type == disruption.event_type.CONGESTION_SPIKE:
        # mark items at the station as affected
        for it in existing_plan:
            if str(it.get("station_id")) == str(disruption.station_id):
                affected_ev_ids.add(str(it.get("ev_id")))
                invalidated.append(f"{it.get('ev_id')}:{it.get('time_slot')}")
        if reservations:
            for r in reservations:
                if str(r.get("station_id")) == str(disruption.station_id):
                    affected_res_ids.add(int(r.get("id")))

    elif disruption.event_type == disruption.event_type.POWER_REDUCTION:
        # charger reduces power: EVs assigned to that charger are affected
        for it in existing_plan:
            if str(it.get("charger_id")) == str(disruption.charger_id):
                affected_ev_ids.add(str(it.get("ev_id")))
                invalidated.append(f"{it.get('ev_id')}:{it.get('time_slot')}")
        if reservations:
            for r in reservations:
                if str(r.get("charger_id")) == str(disruption.charger_id):
                    affected_res_ids.add(int(r.get("id")))

    else:
        # conservative fallback: mark any plan items overlapping affected_slots
        slots = set(disruption.affected_slots or [])
        for it in existing_plan:
            if it.get("time_slot") in slots:
                affected_ev_ids.add(str(it.get("ev_id")))
                invalidated.append(f"{it.get('ev_id')}:{it.get('time_slot')}")

    return {
        "affected_ev_ids": list(affected_ev_ids),
        "affected_reservation_ids": list(affected_res_ids),
        "invalidated_plan_items": invalidated,
    }
