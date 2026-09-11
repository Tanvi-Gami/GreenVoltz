"""Tests for the /health endpoint."""

from fastapi.testclient import TestClient

from backend.app.main import app

client = TestClient(app)


def test_root_health_endpoint():
    """Verify that GET /health returns 200 and expected status fields."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "greenvoltz-backend"
    assert data["version"] == "0.1.0"
    assert "timestamp" in data


def test_api_v1_health_endpoint():
    """Verify that GET /api/v1/health returns 200 and expected status fields."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "greenvoltz-backend"
    assert data["version"] == "0.1.0"
