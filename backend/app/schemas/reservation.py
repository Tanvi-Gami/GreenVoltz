from datetime import datetime

from pydantic import BaseModel


class ReservationCreate(BaseModel):
    request_id: int
    charger_id: int
    start_time: datetime
    end_time: datetime


class ReservationResponse(BaseModel):
    id: int
    request_id: int
    charger_id: int
    start_time: datetime
    end_time: datetime
    status: str
