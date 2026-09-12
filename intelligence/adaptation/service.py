import json

from backend.app.database.models import AdaptationResult as DBAdaptationResult
from backend.app.database.models import OptimisationResult as DBOptimisationResult
from intelligence.adaptation.detector import detect_impact
from intelligence.adaptation.models import AdaptationResult, AdaptationStatus, DisruptionEvent
from intelligence.adaptation.replanner import replan_for_event


def adapt_event(db, event: DisruptionEvent) -> AdaptationResult:
    # load latest optimisation result
    last = db.query(DBOptimisationResult).order_by(DBOptimisationResult.run_timestamp.desc()).first()
    existing_plan = []
    if last and last.schedule_data:
        try:
            existing_plan = json.loads(last.schedule_data)
        except Exception:
            existing_plan = []

    # load reservations
    from backend.app.database.models import Reservation
    reservations = []
    try:
        for r in db.query(Reservation).all():
            reservations.append({"id": r.id, "charger_id": r.charger_id, "station_id": getattr(r, "station_id", None)})
    except Exception:
        reservations = []
    # naive detection
    impact = detect_impact(event, existing_plan, reservations)
    affected = impact["affected_ev_ids"]

    preserved = [p for p in existing_plan if str(p.get("ev_id")) not in affected]

    # invalidate affected reservations
    from backend.app.database.models import Reservation
    for rid in impact.get("affected_reservation_ids", []):
        try:
            r = db.get(Reservation, int(rid))
            if r:
                r.status = "CANCELLED"
                db.add(r)
                db.commit()
        except Exception:
            db.rollback()

    # determine horizon from existing plan if possible
    horizon = None
    if existing_plan:
        try:
            max_slot = max(int(p.get("time_slot", 0)) for p in existing_plan)
            horizon = max_slot + 1
        except Exception:
            horizon = None

    # perform replanning only for affected EVs, applying the event
    if horizon:
        res, runtime = replan_for_event(db, affected, preserved, event, horizon_slots=horizon, time_limit_seconds=10)
    else:
        res, runtime = replan_for_event(db, affected, preserved, event)

    # combine preserved and new plan
    new_plan = []
    # preserved: we keep original dicts (unaffected EVs)
    new_plan.extend(preserved)
    # add new plan items from optimiser but only for affected EVs
    affected_set = set(affected)
    for it in res.charging_plan:
        try:
            ev_id = str(it.ev_id)
        except Exception:
            ev_id = str(it.get("ev_id")) if isinstance(it, dict) else None
        if ev_id in affected_set:
            new_plan.append(it.model_dump())

    # ensure unaffected EVs keep exactly their original assignments
    existing_by_ev = {}
    for p in existing_plan:
        existing_by_ev.setdefault(str(p.get("ev_id")), []).append(p)
    # remove any new_plan items for EVs not affected and restore originals
    filtered_plan = [n for n in new_plan if str(n.get("ev_id")) in affected_set]
    for ev, items in existing_by_ev.items():
        if ev not in affected_set:
            filtered_plan.extend(items)
    new_plan = filtered_plan

    preserved_ids = [f"{p.get('ev_id')}:{p.get('time_slot')}" for p in preserved]
    new_ids = [f"{n.get('ev_id')}:{n.get('time_slot')}" for n in new_plan]
    old_ids = [f"{o.get('ev_id')}:{o.get('time_slot')}" for o in existing_plan]

    added = [i for i in new_ids if i not in old_ids]
    removed = [i for i in old_ids if i not in new_ids]
    changed = [i for i in new_ids if i in old_ids and i not in preserved_ids]

    status = AdaptationStatus.ADAPTED
    if not affected:
        status = AdaptationStatus.NO_IMPACT
    elif res.solver_status == "INFEASIBLE":
        status = AdaptationStatus.INFEASIBLE

    ar = AdaptationResult(
        id=None,
        status=status,
        event=event,
        affected_ev_ids=affected,
        preserved_plan_items=preserved_ids,
        changed_plan_items=changed,
        removed_plan_items=removed,
        added_plan_items=added,
        new_charging_plan=new_plan,
        unscheduled_ev_ids=res.unscheduled_ev_ids,
        schedule_changes=len(added) + len(removed),
        runtime_seconds=runtime,
        metadata={"solver_status": res.solver_status},
    )

    # persist adaptation result
    try:
        db_rec = DBAdaptationResult(
            status=getattr(ar.status, "value", str(ar.status)),
            event_data=json.dumps(ar.event.model_dump(), default=str),
            result_data=json.dumps(ar.model_dump(), default=str),
        )
        db.add(db_rec)
        db.commit()
    except Exception:
        db.rollback()

    return ar
