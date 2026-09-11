from typing import List

from pydantic import BaseModel


class ChargerResponse(BaseModel):
    id: int
    station_id: int
    connector_type: str
    max_power_kw: float


class StationResponse(BaseModel):
    id: int
    name: str
    latitude: float
    longitude: float
    total_chargers: int
    chargers: List[ChargerResponse] = []
