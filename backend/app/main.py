"""FastAPI application entrypoint for GreenVoltz."""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from backend.app.api.v1.router import api_router
from backend.app.config import get_settings
from backend.app.database.session import get_db
from backend.app.schemas.health import HealthResponse


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan manager for startup and shutdown events."""
    # Startup initialization
    yield
    # Shutdown cleanup


def create_app() -> FastAPI:
    """Application factory for GreenVoltz backend."""
    settings = get_settings()

    app = FastAPI(
        title=settings.app_name,
        description="AI-powered EV charging orchestration platform (PREDICT -> OPTIMISE -> RESERVE -> ADAPT)",
        version="0.1.0",
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Direct health check endpoint on root
    @app.get("/health", response_model=HealthResponse, tags=["health"])
    def root_health() -> HealthResponse:
        """Root health check returning service operational status."""
        return HealthResponse(
            status="healthy",
            service="greenvoltz-backend",
            version="0.1.0",
        )

    @app.get("/health/ready", response_model=HealthResponse, tags=["health"])
    def root_ready(db: Session = Depends(get_db)) -> HealthResponse:
        try:
            db.execute(text("SELECT 1"))
        except Exception:
            raise HTTPException(status_code=503, detail="database_unavailable")
        return HealthResponse(status="ready", service="greenvoltz-backend", version="0.1.0")

    # Include versioned API router
    app.include_router(api_router, prefix=settings.api_v1_prefix)

    return app


app = create_app()

if __name__ == "__main__":
    import uvicorn

    settings = get_settings()
    uvicorn.run(
        "backend.app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
    )
