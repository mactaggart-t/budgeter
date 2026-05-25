"""create users households household_invites

Revision ID: b2ff5a9c9b31
Revises: 
Create Date: 2026-05-12 22:27:20.368589

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b2ff5a9c9b31'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('households',
    sa.Column('id', sa.UUID(as_uuid=False), server_default=sa.text('gen_random_uuid()'), nullable=False),
    sa.Column('name', sa.String(length=100), nullable=False),
    sa.Column('created_by', sa.UUID(as_uuid=False), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('users',
    sa.Column('id', sa.UUID(as_uuid=False), server_default=sa.text('gen_random_uuid()'), nullable=False),
    sa.Column('auth0_sub', sa.String(length=128), nullable=False),
    sa.Column('email', sa.String(length=255), nullable=False),
    sa.Column('display_name', sa.String(length=100), nullable=True),
    sa.Column('household_id', sa.UUID(as_uuid=False), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['household_id'], ['households.id'], ondelete='SET NULL'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('email')
    )
    op.create_index(op.f('ix_users_auth0_sub'), 'users', ['auth0_sub'], unique=True)
    op.create_index('ix_users_household_id', 'users', ['household_id'], unique=False)
    op.create_foreign_key(
        'fk_households_created_by',
        'households', 'users',
        ['created_by'], ['id'],
        ondelete='RESTRICT'
    )
    op.create_table('household_invites',
    sa.Column('id', sa.UUID(as_uuid=False), server_default=sa.text('gen_random_uuid()'), nullable=False),
    sa.Column('household_id', sa.UUID(as_uuid=False), nullable=False),
    sa.Column('invited_email', sa.String(length=255), nullable=False),
    sa.Column('token', sa.String(length=64), nullable=False),
    sa.Column('status', sa.String(length=20), server_default='pending', nullable=False),
    sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.CheckConstraint("status IN ('pending', 'accepted', 'expired')", name='ck_household_invites_status'),
    sa.ForeignKeyConstraint(['household_id'], ['households.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('household_id', 'invited_email', 'status', name='uq_household_invites_pending')
    )
    op.create_index(op.f('ix_household_invites_token'), 'household_invites', ['token'], unique=True)


def downgrade() -> None:
    op.drop_index(op.f('ix_household_invites_token'), table_name='household_invites')
    op.drop_table('household_invites')
    op.drop_index('ix_users_household_id', table_name='users')
    op.drop_index(op.f('ix_users_auth0_sub'), table_name='users')
    op.drop_constraint('fk_households_created_by', 'households', type_='foreignkey')
    op.drop_table('users')
    op.drop_table('households')