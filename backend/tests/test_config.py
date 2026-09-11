"""Tests for configuration settings."""

from backend.app.config import Settings, get_settings


def test_default_settings():
    settings = get_settings()
    assert settings.app_name == "GreenVoltz"
    assert settings.api_v1_prefix == "/api/v1"
    assert settings.environment == "development"
    assert "postgresql://" in settings.database_url


def test_custom_settings():
    custom = Settings(app_name="TestApp", environment="test")
    assert custom.app_name == "TestApp"
    assert custom.environment == "test"
