from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.database.session import get_db
from backend.app.schemas.charging import ChargingRecommendation, ChargingRequestCreate
from backend.app.services.charging import recommend_charging

router = APIRouter(prefix="/charging", tags=["charging"])


@router.post("/recommend", response_model=ChargingRecommendation)
def recommend_endpoint(payload: ChargingRequestCreate, db: Session = Depends(get_db)):
    try:
        rec = recommend_charging(payload, db, time_limit_seconds=10, num_workers=2)
    except ValueError as e:
        if str(e) == "vehicle_not_found":
            raise HTTPException(status_code=404, detail="Vehicle not found")
        raise HTTPException(status_code=400, detail="invalid_request")
    return rec
