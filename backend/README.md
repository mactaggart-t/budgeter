# Budgeter – Backend

FastAPI backend with **async SQLAlchemy**, **Alembic** migrations, and **Auth0 JWT** authentication.

## Tech stack

| Layer | Library |
|-------|---------|
| Web framework | [FastAPI](https://fastapi.tiangolo.com/) |
| ASGI server | [Uvicorn](https://www.uvicorn.org/) |
| ORM | [SQLAlchemy 2 (async)](https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html) |
| Migrations | [Alembic](https://alembic.sqlalchemy.org/) |
| Auth | [Auth0](https://auth0.com/) + [python-jose](https://github.com/mpdavis/python-jose) |
| Settings | [pydantic-settings](https://docs.pydantic.dev/latest/concepts/pydantic_settings/) |

## Getting started

### 1. Prerequisites

- Python 3.11+
- A running PostgreSQL instance
- An Auth0 tenant with an API registered

### 2. Install dependencies

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env with your DB URL and Auth0 credentials
```

### 4. Run database migrations

```bash
# Generate a new migration after model changes:
alembic revision --autogenerate -m "describe your change"

# Apply all pending migrations:
alembic upgrade head
```

### 5. Start the development server

```bash
uvicorn app.main:app --reload --port 8000
```

Interactive API docs → <http://localhost:8000/docs>

## Project layout

```
backend/
├── app/
│   ├── main.py            # FastAPI app factory + lifespan
│   ├── config.py          # Pydantic Settings (reads .env)
│   ├── database.py        # Async engine, session factory, get_db dep
│   ├── middleware/
│   │   └── auth.py        # Auth0 JWT dependency (require_auth)
│   ├── models/
│   │   └── user.py        # SQLAlchemy User model
│   ├── routers/
│   │   ├── health.py      # GET /health
│   │   └── users.py       # GET/PATCH /users/me  (protected)
│   └── schemas/
│       └── user.py        # Pydantic request/response schemas
├── alembic/
│   ├── env.py             # Async-aware Alembic environment
│   ├── script.py.mako     # Migration file template
│   └── versions/          # Auto-generated migration files
├── alembic.ini
├── requirements.txt
└── .env.example
```

## Authentication flow

1. The React frontend authenticates with Auth0 and receives an access token.
2. The token is sent as `Authorization: Bearer <token>` on every API request.
3. `require_auth` (a FastAPI dependency) fetches the Auth0 JWKS, verifies the
   RS256 signature, validates audience + issuer, and returns parsed `TokenClaims`.
4. Any route that depends on `require_auth` is automatically protected.
