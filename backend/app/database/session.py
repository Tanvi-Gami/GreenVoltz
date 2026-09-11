"""SQLAlchemy session and engine management."""

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

from backend.app.config import get_settings

_engine: Engine | None = None
_session_factory: sessionmaker[Session] | None = None


def get_engine() -> Engine:
    """Return singleton SQLAlchemy engine initialized from application settings."""
    global _engine
    if _engine is None:
        settings = get_settings()
        _engine = create_engine(
            settings.database_url,
            pool_pre_ping=True,
            echo=settings.debug,
        )
    return _engine


def SessionLocal() -> Session:
    """Create a new database session."""
    global _session_factory
    if _session_factory is None:
        _session_factory = sessionmaker(
            autocommit=False,
            autoflush=False,
            bind=get_engine(),
        )
    return _session_factory()


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency that yields a database session and ensures proper closure."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
