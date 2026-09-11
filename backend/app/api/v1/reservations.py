
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.database.session import get_db
from backend.app.schemas.reservation import ReservationCreate, ReservationResponse
from backend.app.services.reservations import cancel_reservation, create_reservation, get_reservation

router = APIRouter(prefix="/reservations", tags=["reservations"])


@router.post("/", response_model=ReservationResponse)
def create_reservation_endpoint(payload: ReservationCreate, db: Session = Depends(get_db)):
    try:
        r = create_reservation(payload, db)
    except ValueError as e:
        err = str(e)
        if err == "request_not_found":
            raise HTTPException(status_code=404, detail="Charging request not found")
        if err == "charger_not_found":
            raise HTTPException(status_code=404, detail="Charger not found")
        if err == "station_not_found":
            raise HTTPException(status_code=404, detail="Station not found")
        if err == "vehicle_not_found":
            raise HTTPException(status_code=404, detail="Vehicle not found")
        if err == "connector_incompatible":
            raise HTTPException(status_code=400, detail="Connector incompatible")
        if err == "conflict":
            raise HTTPException(status_code=409, detail="Conflicting reservation")
        raise HTTPException(status_code=400, detail="invalid_request")
    return ReservationResponse(
        id=r.id,
        request_id=r.request_id,
        charger_id=r.charger_id,
        start_time=r.start_time,
        end_time=r.end_time,
        status=r.status,
    )


@router.get("/{reservation_id}", response_model=ReservationResponse)
def get_reservation_endpoint(reservation_id: int, db: Session = Depends(get_db)):
    r = get_reservation(reservation_id, db)
    if not r:
        raise HTTPException(status_code=404, detail="Reservation not found")
    return ReservationResponse(
        id=r.id,
        request_id=r.request_id,
        charger_id=r.charger_id,
        start_time=r.start_time,
        end_time=r.end_time,
        status=r.status,
    )


@router.post("/{reservation_id}/cancel", response_model=ReservationResponse)
def cancel_reservation_endpoint(reservation_id: int, db: Session = Depends(get_db)):
    try:
        r = cancel_reservation(reservation_id, db)
    except ValueError:
        raise HTTPException(status_code=404, detail="Reservation not found")
    return ReservationResponse(
        id=r.id,
        request_id=r.request_id,
        charger_id=r.charger_id,
        start_time=r.start_time,
        end_time=r.end_time,
        status=r.status,
    )
