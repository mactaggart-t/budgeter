"""Pydantic schemas for the user resource."""
import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr


class UserRead(BaseModel):
    id: uuid.UUID
    auth0_sub: str
    email: str | None
    display_name: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserCreate(BaseModel):
    auth0_sub: str
    email: str | None = None
    display_name: str | None = None


class UserUpdate(BaseModel):
    display_name: str | None = None
    email: str | None = None
