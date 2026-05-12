"""Auth0 JWT verification as a FastAPI dependency.

Usage
-----
Add ``Depends(require_auth)`` to any route that should be protected:

    @router.get("/me")
    async def me(claims: TokenClaims = Depends(require_auth)):
        return {"sub": claims.sub}
"""
from __future__ import annotations

import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwk, jwt
from jose.utils import base64url_decode

from app.config import Settings, get_settings

_bearer = HTTPBearer()


class TokenClaims:
    """Parsed and validated claims from an Auth0 JWT."""

    def __init__(self, payload: dict):
        self._payload = payload

    @property
    def sub(self) -> str:
        return self._payload["sub"]

    @property
    def email(self) -> str | None:
        return self._payload.get("email") or self._payload.get(
            "https://budgeter.app/email"
        )

    def get(self, key: str, default=None):
        return self._payload.get(key, default)


# ---------------------------------------------------------------------------
# JWKS helpers
# ---------------------------------------------------------------------------

_jwks_cache: dict | None = None


async def _get_jwks(domain: str) -> dict:
    global _jwks_cache
    if _jwks_cache is None:
        url = f"https://{domain}/.well-known/jwks.json"
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, timeout=10)
            resp.raise_for_status()
            _jwks_cache = resp.json()
    return _jwks_cache


def _find_rsa_key(jwks: dict, kid: str) -> dict | None:
    for key in jwks.get("keys", []):
        if key.get("kid") == kid:
            return key
    return None


# ---------------------------------------------------------------------------
# Main dependency
# ---------------------------------------------------------------------------


async def require_auth(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
    settings: Settings = Depends(get_settings),
) -> TokenClaims:
    """Verify an Auth0 JWT and return its claims.

    Raises ``HTTP 401`` when the token is missing, malformed, or invalid.
    """
    token = credentials.credentials

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        unverified_header = jwt.get_unverified_header(token)
    except JWTError:
        raise credentials_exception

    kid = unverified_header.get("kid")
    if not kid:
        raise credentials_exception

    jwks = await _get_jwks(settings.auth0_domain)
    rsa_key = _find_rsa_key(jwks, kid)
    if rsa_key is None:
        raise credentials_exception

    try:
        payload = jwt.decode(
            token,
            rsa_key,
            algorithms=settings.auth0_algorithms,
            audience=settings.auth0_audience,
            issuer=f"https://{settings.auth0_domain}/",
        )
    except JWTError:
        raise credentials_exception

    return TokenClaims(payload)
