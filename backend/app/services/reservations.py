from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from backend.app.database.models import (
    Charger,
    ChargingRequest,
    ChargingStation,
    Reservation,
    Vehicle,
)
from backend.app.schemas.reservation import ReservationCreate


def create_reservation(payload: ReservationCreate, db: Session) -> Reservation:
    # ensure referenced request exists
    req = db.get(ChargingRequest, payload.request_id)
    if not req:
        raise ValueError("request_not_found")
    # ensure charger exists and station exists
    charger = db.get(Charger, payload.charger_id)
    if not charger:
        raise ValueError("charger_not_found")
    station = db.get(ChargingStation, charger.station_id)
    if not station:
        raise ValueError("station_not_found")
    # ensure vehicle exists (via request.vehicle_id)
    if not req.vehicle_id:
        raise ValueError("request_missing_vehicle")
    vehicle = db.get(Vehicle, req.vehicle_id)
    if not vehicle:
        raise ValueError("vehicle_not_found")
    # connector compatibility
    if req.connector_type and charger.connector_type and req.connector_type != charger.connector_type:
        raise ValueError("connector_incompatible")
    # conflict detection: consider PENDING and CONFIRMED
    overlapping = (
        db.query(Reservation)
        .filter(
            Reservation.charger_id == payload.charger_id,
            Reservation.start_time < payload.end_time,
            Reservation.end_time > payload.start_time,
            Reservation.status.in_(["PENDING", "CONFIRMED"]),
        )
        .all()
    )
    if overlapping:
        raise ValueError("conflict")
    # create reservation in PENDING state
    r = Reservation(
        request_id=payload.request_id,
        charger_id=payload.charger_id,
        start_time=payload.start_time,
        end_time=payload.end_time,
        status="PENDING",
        created_at=datetime.utcnow(),
    )
    db.add(r)
    db.commit()
    db.refresh(r)
    return r


def get_reservation(reservation_id: int, db: Session) -> Optional[Reservation]:
    return db.get(Reservation, reservation_id)


def cancel_reservation(reservation_id: int, db: Session) -> Reservation:
    r = db.get(Reservation, reservation_id)
    if not r:
        raise ValueError("not_found")
    if r.status in ["CANCELLED", "COMPLETED"]:
        return r
    r.status = "CANCELLED"
    db.add(r)
    db.commit()
    db.refresh(r)
    return r
