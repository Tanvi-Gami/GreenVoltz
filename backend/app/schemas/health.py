"""Health endpoint response schema."""

from datetime import datetime

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """Payload returned by the /health endpoint."""

    status: str = Field(default="healthy", description="Current service health status")
    service: str = Field(default="greenvoltz-backend", description="Service identifier")
    version: str = Field(default="0.1.0", description="Service version")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="UTC timestamp of response")
