from sqlalchemy.orm import Session

from intelligence.adaptation.models import DisruptionEvent as ADEvent
from intelligence.adaptation.service import adapt_event as adapt_event_impl


def submit_event(payload: dict, db: Session):
    ev = ADEvent(**payload)
    return adapt_event_impl(db, ev)


def trigger_replan(payload: dict, db: Session):
    ev = ADEvent(**payload)
    return adapt_event_impl(db, ev)


def get_adaptation(db: Session, adaptation_id: int):
    from backend.app.database.models import AdaptationResult as DBAdaptationResult
    rec = db.get(DBAdaptationResult, adaptation_id)
    if not rec:
        return None
    try:
        return rec.result_data
    except Exception:
        return None
