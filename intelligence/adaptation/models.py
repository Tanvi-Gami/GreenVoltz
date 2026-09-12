from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel


class DisruptionType(str, Enum):
    CHARGER_UNAVAILABLE = "charger_unavailable"
    STATION_UNAVAILABLE = "station_unavailable"
    CONGESTION_SPIKE = "congestion_spike"
    POWER_REDUCTION = "power_reduction"
    RENEWABLE_CHANGE = "renewable_change"
    TARIFF_CHANGE = "tariff_change"
    INTERRUPTION = "interruption"


class Severity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class DisruptionEvent(BaseModel):
    event_id: Optional[str]
    event_type: DisruptionType
    station_id: Optional[str] = None
    charger_id: Optional[str] = None
    affected_slots: Optional[List[int]] = None
    old_value: Optional[float] = None
    new_value: Optional[float] = None
    timestamp: datetime = datetime.utcnow()
    severity: Severity = Severity.MEDIUM


class ImpactResult(BaseModel):
    affected_ev_ids: List[str]
    affected_reservation_ids: List[int]
    invalidated_plan_items: List[str]


class AdaptationStatus(str, Enum):
    NO_IMPACT = "NO_IMPACT"
    ADAPTED = "ADAPTED"
    PARTIALLY_ADAPTED = "PARTIALLY_ADAPTED"
    INFEASIBLE = "INFEASIBLE"


class AdaptationResult(BaseModel):
    id: Optional[int]
    status: AdaptationStatus
    event: DisruptionEvent
    affected_ev_ids: List[str]
    preserved_plan_items: List[str]
    changed_plan_items: List[str]
    removed_plan_items: List[str]
    added_plan_items: List[str]
    new_charging_plan: List[dict]
    unscheduled_ev_ids: List[str]
    schedule_changes: int
    runtime_seconds: float
    metadata: dict = {}
