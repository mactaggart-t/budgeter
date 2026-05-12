"""Users router – protected endpoints that require a valid Auth0 JWT."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import TokenClaims, require_auth
from app.models.user import User
from app.schemas.user import UserRead, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])


async def _get_or_create_user(
    claims: TokenClaims, db: AsyncSession
) -> User:
    """Return the DB row for the authenticated user, creating it if needed."""
    result = await db.execute(
        select(User).where(User.auth0_sub == claims.sub)
    )
    user = result.scalar_one_or_none()

    if user is None:
        user = User(auth0_sub=claims.sub, email=claims.email)
        db.add(user)
        await db.flush()

    return user


@router.get("/me", response_model=UserRead, summary="Get current user")
async def get_me(
    claims: TokenClaims = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
) -> UserRead:
    """Return the profile of the currently authenticated user."""
    user = await _get_or_create_user(claims, db)
    return UserRead.model_validate(user)


@router.patch("/me", response_model=UserRead, summary="Update current user")
async def update_me(
    body: UserUpdate,
    claims: TokenClaims = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
) -> UserRead:
    """Update editable fields on the current user's profile."""
    user = await _get_or_create_user(claims, db)

    if body.display_name is not None:
        user.display_name = body.display_name
    if body.email is not None:
        user.email = body.email

    return UserRead.model_validate(user)
