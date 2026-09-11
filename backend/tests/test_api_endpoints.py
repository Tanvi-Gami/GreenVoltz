from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.app.database.base import Base
from backend.app.database.session import get_db
from backend.app.main import create_app


def get_test_app():
    app = create_app()
    # create in-memory sqlite and override db dependency
    # use file-backed sqlite to avoid in-memory connection scoping issues
    engine = create_engine("sqlite:///./test_api.db", connect_args={"check_same_thread": False})
    # ensure models are imported so metadata is populated
    import backend.app.database.models  # noqa: F401
    Base.metadata.create_all(engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    return app


def test_health_and_station_endpoints():
    app = get_test_app()
    client = TestClient(app)
    r = client.get("/health")
    assert r.status_code == 200
    # stations empty initially
    r = client.get("/api/v1/stations/")
    assert r.status_code == 200
    assert isinstance(r.json(), list)
