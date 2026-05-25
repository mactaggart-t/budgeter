"""Application configuration loaded from environment variables."""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://user:password@localhost:5432/budgeter"
    auth0_domain: str = "your-tenant.us.auth0.com"
    auth0_audience: str = "https://your-api-identifier"
    auth0_algorithms: list[str] = ["RS256"]
    app_name: str = "Budgeter API"
    debug: bool = False
    allowed_origins: list[str] = ["http://localhost:5173"]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


@lru_cache
def get_settings() -> Settings:
    return Settings()
