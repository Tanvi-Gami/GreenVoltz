"""Aggregated API v1 router."""

from fastapi import APIRouter

from backend.app.api.v1.analytics import router as analytics_router
from backend.app.api.v1.charging import router as charging_router
from backend.app.api.v1.health import router as health_router
from backend.app.api.v1.reservations import router as reservations_router
from backend.app.api.v1.stations import router as stations_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(stations_router)
api_router.include_router(charging_router)
api_router.include_router(reservations_router)
api_router.include_router(analytics_router)
