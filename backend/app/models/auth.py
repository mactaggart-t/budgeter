import secrets
from datetime import datetime
from typing import Optional

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.db import Base

class Household(Base):
    __tablename__ = "households"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        primary_key=True,
        server_default=func.gen_random_uuid(),
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    created_by: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    creator: Mapped["User"] = relationship(
        "User",
        foreign_keys=[created_by],
        back_populates="created_household",
    )
    members: Mapped[list["User"]] = relationship(
        "User",
        foreign_keys="User.household_id",
        back_populates="household",
    )
    invites: Mapped[list["HouseholdInvite"]] = relationship(
        "HouseholdInvite",
        back_populates="household",
        cascade="all, delete-orphan",
    )


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        primary_key=True,
        server_default=func.gen_random_uuid(),
    )
    auth0_sub: Mapped[str] = mapped_column(
        String(128),
        nullable=False,
        unique=True,
        index=True,
    )
    email: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        unique=True,
    )
    display_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    household_id: Mapped[Optional[str]] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("households.id", ondelete="SET NULL"),
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    household: Mapped[Optional["Household"]] = relationship(
        "Household",
        foreign_keys=[household_id],
        back_populates="members",
    )
    created_household: Mapped[Optional["Household"]] = relationship(
        "Household",
        foreign_keys="Household.created_by",
        back_populates="creator",
    )

    __table_args__ = (
        Index("ix_users_household_id", "household_id"),
    )


class HouseholdInvite(Base):
    __tablename__ = "household_invites"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        primary_key=True,
        server_default=func.gen_random_uuid(),
    )
    household_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("households.id", ondelete="CASCADE"),
        nullable=False,
    )
    invited_email: Mapped[str] = mapped_column(String(255), nullable=False)
    token: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        unique=True,
        index=True,
        default=lambda: secrets.token_urlsafe(32),
    )
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        server_default="pending",
    )
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    household: Mapped["Household"] = relationship(
        "Household",
        back_populates="invites",
    )

    __table_args__ = (
        CheckConstraint(
            "status IN ('pending', 'accepted', 'expired')",
            name="ck_household_invites_status",
        ),
        UniqueConstraint(
            "household_id",
            "invited_email",
            "status",
            name="uq_household_invites_pending",
        ),
    )