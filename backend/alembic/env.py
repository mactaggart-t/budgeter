"""Alembic environment for async SQLAlchemy.

Key points
----------
* Uses ``run_async_migrations`` so Alembic works with an async engine.
* Imports all ORM models so autogenerate can detect schema changes.
* DATABASE_URL is read from Settings (which reads .env), so we never
  hardcode credentials.
"""
import asyncio
import os
import sys
from logging.config import fileConfig

from alembic import context
from sqlalchemy.ext.asyncio import async_engine_from_config
from sqlalchemy import pool

# ---------------------------------------------------------------------------
# Make sure the app package is importable when running alembic from the
# backend/ directory (i.e. ``alembic upgrade head``).
# ---------------------------------------------------------------------------
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# Import models so autogenerate picks them up.
from app.config import get_settings  # noqa: E402
from app.database import Base  # noqa: E402
import app.models.user  # noqa: F401, E402

# ---------------------------------------------------------------------------
# Alembic Config object – gives access to values in alembic.ini.
# ---------------------------------------------------------------------------
config = context.config

# Override the sqlalchemy.url with the value from our Settings.
settings = get_settings()
config.set_main_option("sqlalchemy.url", settings.database_url)

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


# ---------------------------------------------------------------------------
# Offline migrations (no DB connection – generates SQL script)
# ---------------------------------------------------------------------------


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


# ---------------------------------------------------------------------------
# Online migrations (connects to the real DB)
# ---------------------------------------------------------------------------


def do_run_migrations(connection):
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
