from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.database.models import Charger, ChargingStation, StationWaitingList
from backend.app.database.session import get_db
from backend.app.schemas.station import ChargerResponse, StationResponse

router = APIRouter(prefix="/stations", tags=["stations"])


@router.get("/", response_model=List[StationResponse])
def list_stations(db: Session = Depends(get_db)):
    stations = db.query(ChargingStation).all()
    results = []
    for s in stations:
        chargers = db.query(Charger).filter(Charger.station_id == s.id).all()
        waiting = db.query(StationWaitingList).filter(StationWaitingList.station_id == s.id).first()
        charger_resp = [
            ChargerResponse(
                id=c.id,
                station_id=c.station_id,
                connector_type=c.connector_type,
                max_power_kw=c.max_power_kw,
            )
            for c in chargers
        ]
        results.append(
            StationResponse(
                id=s.id,
                name=s.name,
                latitude=s.latitude,
                longitude=s.longitude,
                total_chargers=s.total_chargers,
                waiting_count=waiting.waiting_count if waiting else 0,
                chargers=charger_resp,
            )
        )
    return results


@router.get("/{station_id}", response_model=StationResponse)
def get_station(station_id: int, db: Session = Depends(get_db)):
    s = db.get(ChargingStation, station_id)
    if not s:
        raise HTTPException(status_code=404, detail="Station not found")
    chargers = db.query(Charger).filter(Charger.station_id == s.id).all()
    waiting = db.query(StationWaitingList).filter(StationWaitingList.station_id == s.id).first()
    charger_resp = [
        ChargerResponse(
            id=c.id, station_id=c.station_id, connector_type=c.connector_type, max_power_kw=c.max_power_kw
        )
        for c in chargers
    ]
    return StationResponse(
        id=s.id,
        name=s.name,
        latitude=s.latitude,
        longitude=s.longitude,
        total_chargers=s.total_chargers,
        waiting_count=waiting.waiting_count if waiting else 0,
        chargers=charger_resp,
    )


@router.get("/{station_id}/chargers", response_model=List[ChargerResponse])
def get_station_chargers(station_id: int, db: Session = Depends(get_db)):
    s = db.get(ChargingStation, station_id)
    if not s:
        raise HTTPException(status_code=404, detail="Station not found")
    chargers = db.query(Charger).filter(Charger.station_id == s.id).all()
    return [
        ChargerResponse(
            id=c.id, station_id=c.station_id, connector_type=c.connector_type, max_power_kw=c.max_power_kw
        )
        for c in chargers
    ]
