# app/schemas/household.py
from pydantic import BaseModel, EmailStr
from datetime import datetime

class HouseholdCreate(BaseModel):
    name: str

class HouseholdResponse(BaseModel):
    id: str
    name: str
    created_by: str
    created_at: datetime

    model_config = {"from_attributes": True}

class MemberResponse(BaseModel):
    id: str
    email: str
    display_name: str | None = None

    model_config = {"from_attributes": True}

class InviteCreate(BaseModel):
    email: EmailStr

class InviteResponse(BaseModel):
    id: str
    household_id: str
    invited_email: str
    token: str
    status: str
    expires_at: datetime

    model_config = {"from_attributes": True}

class JoinRequest(BaseModel):
    token: str
