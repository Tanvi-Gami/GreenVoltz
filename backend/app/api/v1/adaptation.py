from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.database.session import get_db
from backend.app.schemas.adaptation import AdaptationResultResponse
from backend.app.schemas.adaptation import DisruptionEvent as DisruptionSchema
from backend.app.services.adaptation import submit_event

router = APIRouter(prefix="/adaptation", tags=["adaptation"])


@router.post("/events", response_model=AdaptationResultResponse)
def post_event(payload: DisruptionSchema, db: Session = Depends(get_db)):
    try:
        res = submit_event(payload.model_dump(), db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return AdaptationResultResponse(**{
        "adaptation_id": res.id,
        "status": res.status,
        "affected_ev_ids": res.affected_ev_ids,
        "preserved_plan_items": res.preserved_plan_items,
        "changed_plan_items": res.changed_plan_items,
        "removed_plan_items": res.removed_plan_items,
        "added_plan_items": res.added_plan_items,
        "new_charging_plan": res.new_charging_plan,
        "unscheduled_ev_ids": res.unscheduled_ev_ids,
        "schedule_changes": res.schedule_changes,
        "runtime_seconds": res.runtime_seconds,
        "before_cost": res.metadata.get("before_cost"),
        "after_cost": res.metadata.get("after_cost"),
        "before_carbon": res.metadata.get("before_carbon"),
        "after_carbon": res.metadata.get("after_carbon"),
        "delay_minutes": res.metadata.get("delay_minutes"),
    })


@router.post("/replan", response_model=AdaptationResultResponse)
def post_replan(payload: DisruptionSchema, db: Session = Depends(get_db)):
    try:
        res = submit_event(payload.model_dump(), db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return AdaptationResultResponse(**{
        "adaptation_id": res.id,
        "status": res.status,
        "affected_ev_ids": res.affected_ev_ids,
        "preserved_plan_items": res.preserved_plan_items,
        "changed_plan_items": res.changed_plan_items,
        "removed_plan_items": res.removed_plan_items,
        "added_plan_items": res.added_plan_items,
        "new_charging_plan": res.new_charging_plan,
        "unscheduled_ev_ids": res.unscheduled_ev_ids,
        "schedule_changes": res.schedule_changes,
        "runtime_seconds": res.runtime_seconds,
        "before_cost": res.metadata.get("before_cost"),
        "after_cost": res.metadata.get("after_cost"),
        "before_carbon": res.metadata.get("before_carbon"),
        "after_carbon": res.metadata.get("after_carbon"),
        "delay_minutes": res.metadata.get("delay_minutes"),
    })


@router.get("/{adaptation_id}")
def get_adaptation(adaptation_id: int, db: Session = Depends(get_db)):
    from backend.app.services.adaptation import get_adaptation as get_adapt

    rec = get_adapt(db, adaptation_id)
    if not rec:
        raise HTTPException(status_code=404, detail="not_found")
    # result_data stored as JSON string; return parsed
    import json

    try:
        parsed = json.loads(rec)
    except Exception:
        parsed = rec
    return parsed
