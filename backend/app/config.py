"""Application configuration management for GreenVoltz."""

from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """GreenVoltz application settings loaded from environment or .env file."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # General
    app_name: str = "GreenVoltz"
    environment: str = "development"
    debug: bool = False
    log_level: str = "INFO"
    api_v1_prefix: str = "/api/v1"

    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    # CORS
    cors_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:4321",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5175",
    ]

    # Database
    postgres_user: str = "greenvoltz"
    postgres_password: str = "greenvoltz_secret"
    postgres_db: str = "greenvoltz_db"
    postgres_host: str = "localhost"
    postgres_port: int = 5432
    database_url: str = (
        "postgresql://greenvoltz:greenvoltz_secret@localhost:5432/greenvoltz_db"
    )

    # Storage paths
    artifact_storage_path: str = "./saved_models"
    features_storage_path: str = "./data/features"
    raw_data_storage_path: str = "./data/raw"


@lru_cache
def get_settings() -> Settings:
    """Cached settings dependency."""
    return Settings()
