"""Health and liveness router."""

from fastapi import APIRouter

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
