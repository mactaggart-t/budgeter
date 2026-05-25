# app/api/auth.py
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.db import get_db
from app.core.auth import verify_token
from app.models.auth import User
from app.schemas.user import UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/callback", response_model=UserResponse)
async def auth_callback(
    db: AsyncSession = Depends(get_db),
    token_data: dict = Depends(verify_token),
):
    auth0_sub = token_data["sub"]
    email = token_data["email"]

    result = await db.execute(select(User).where(User.auth0_sub == auth0_sub))
    user = result.scalar_one_or_none()

    if not user:
        user = User(auth0_sub=auth0_sub, email=email)
        db.add(user)
        await db.commit()
        await db.refresh(user)

    return user