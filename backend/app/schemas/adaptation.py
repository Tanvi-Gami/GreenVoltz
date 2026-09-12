from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class DisruptionEvent(BaseModel):
    event_id: Optional[str] = None
    event_type: str
    station_id: Optional[str] = None
    charger_id: Optional[str] = None
    affected_slots: Optional[List[int]] = None
    old_value: Optional[float] = None
    new_value: Optional[float] = None
    timestamp: datetime = datetime.utcnow()
    severity: Optional[str] = "medium"


class AdaptationResultResponse(BaseModel):
    adaptation_id: int | None = None
    status: str
    affected_ev_ids: List[str]
    preserved_plan_items: List[str]
    changed_plan_items: List[str]
    removed_plan_items: List[str]
    added_plan_items: List[str]
    new_charging_plan: List[dict]
    unscheduled_ev_ids: List[str]
    schedule_changes: int
    runtime_seconds: float
    before_cost: float | None = None
    after_cost: float | None = None
    before_carbon: float | None = None
    after_carbon: float | None = None
    delay_minutes: float | None = None
