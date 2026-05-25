# app/schemas/user.py
from pydantic import BaseModel
from typing import Optional

class UserResponse(BaseModel):
    id: str
    email: str
    display_name: Optional[str]
    household_id: Optional[str]

    model_config = {"from_attributes": True}
