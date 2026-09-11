"""Health and liveness router."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from backend.app.database.session import get_db
from backend.app.schemas.health import HealthResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
def get_health() -> HealthResponse:
    """Return current service health status."""
    return HealthResponse(
        status="healthy",
        service="greenvoltz-backend",
        version="0.1.0",
    )


@router.get("/health/ready", response_model=HealthResponse)
def get_ready(db: Session = Depends(get_db)) -> HealthResponse:
    try:
        # quick DB reachability check
        db.execute(text("SELECT 1"))
    except Exception:
        raise HTTPException(status_code=503, detail="database_unavailable")
    return HealthResponse(status="ready", service="greenvoltz-backend", version="0.1.0")
