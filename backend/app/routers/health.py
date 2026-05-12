"""Health-check router."""
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/health", tags=["health"])


class HealthResponse(BaseModel):
    status: str
    service: str


@router.get("", response_model=HealthResponse, summary="Health check")
async def health() -> HealthResponse:
    """Returns ``{"status": "ok"}`` if the API is running."""
    return HealthResponse(status="ok", service="budgeter-api")
