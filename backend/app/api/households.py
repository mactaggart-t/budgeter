import secrets
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select
from app.core.db import get_db
from app.core.auth import get_current_user
from app.models.auth import Household, HouseholdInvite, User
from app.schemas.household import (
    HouseholdCreate, HouseholdResponse,
    InviteCreate, InviteResponse,
    JoinRequest, MemberResponse
)

router = APIRouter(prefix="/households", tags=["households"])


@router.post("", response_model=HouseholdResponse, status_code=201)
async def create_household(
    body: HouseholdCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.household_id:
        raise HTTPException(409, "You already belong to a household")

    household = Household(name=body.name, created_by=current_user.id)
    db.add(household)
    await db.flush()  # get household.id before committing

    current_user.household_id = household.id
    await db.commit()
    await db.refresh(household)
    return household


@router.get("/me", response_model=HouseholdResponse)
async def get_my_household(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.household_id:
        raise HTTPException(404, "You are not in a household")

    result = await db.execute(
        select(Household).where(Household.id == current_user.household_id)
    )
    household = result.scalar_one_or_none()
    if not household:
        raise HTTPException(404, "Household not found")
    return household

@router.get("/me/members", response_model=list[MemberResponse])
async def get_household_members(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.household_id:
        raise HTTPException(404, "You are not in a household")

    result = await db.execute(
        select(User).where(User.household_id == current_user.household_id)
    )
    return result.scalars().all()

@router.post("/invite", response_model=InviteResponse, status_code=201)
async def invite_to_household(
    body: InviteCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.household_id:
        raise HTTPException(403, "You must be in a household to invite someone")

    invited_email = body.email.lower()

    # Check for an existing pending invite for this email
    result = await db.execute(
        select(HouseholdInvite).where(
            HouseholdInvite.household_id == current_user.household_id,
            func.lower(HouseholdInvite.invited_email) == invited_email,
            HouseholdInvite.status == "pending",
        )
    )
    existing = result.scalar_one_or_none()
    expires_at = datetime.now(timezone.utc) + timedelta(hours=48)

    if existing:
        if existing.expires_at > datetime.now(timezone.utc):
            raise HTTPException(409, "A pending invite already exists for this email")
        # Reissue the lapsed invite instead of blocking the address forever
        existing.token = secrets.token_urlsafe(32)
        existing.expires_at = expires_at
        await db.commit()
        await db.refresh(existing)
        return existing

    invite = HouseholdInvite(
        household_id=current_user.household_id,
        invited_email=invited_email,
        expires_at=expires_at,
    )
    db.add(invite)
    await db.commit()
    await db.refresh(invite)
    return invite


@router.post("/join", response_model=HouseholdResponse)
async def join_household(
    body: JoinRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.household_id:
        raise HTTPException(409, "You already belong to a household")

    result = await db.execute(
        select(HouseholdInvite).where(HouseholdInvite.token == body.token)
    )
    invite = result.scalar_one_or_none()

    if not invite:
        raise HTTPException(404, "Invite not found")
    if invite.status != "pending":
        raise HTTPException(410, "Invite has already been used")
    if invite.expires_at < datetime.now(timezone.utc):
        invite.status = "expired"
        await db.commit()
        raise HTTPException(410, "Invite has expired")
    if invite.invited_email.lower() != current_user.email.lower():
        raise HTTPException(403, "This invite was sent to a different email address")

    invite.status = "accepted"
    current_user.household_id = invite.household_id
    await db.commit()

    result = await db.execute(
        select(Household).where(Household.id == invite.household_id)
    )
    return result.scalar_one()


@router.delete("/leave", status_code=204)
async def leave_household(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.household_id:
        raise HTTPException(400, "You are not in a household")

    household_id = current_user.household_id
    current_user.household_id = None
    await db.flush()

    # Check if any members remain
    result = await db.execute(
        select(User).where(User.household_id == household_id)
    )
    remaining = result.scalars().all()

    if not remaining:
        # Clean up the household and all its pending invites (cascade handles invites)
        result = await db.execute(
            select(Household).where(Household.id == household_id)
        )
        household = result.scalar_one_or_none()
        if household:
            await db.delete(household)

    await db.commit()