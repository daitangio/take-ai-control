"""Shared FastAPI dependencies."""

import sqlite3

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from .auth.service import verify_token

security = HTTPBearer()


def get_db() -> sqlite3.Connection:
    """Yield a per-request database connection."""
    from .db import get_db as _get_db
    yield from _get_db()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: sqlite3.Connection = Depends(get_db),
) -> dict:
    """Extract and verify JWT, return user dict."""
    user_id = verify_token(credentials.credentials)
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    row = db.execute(
        "SELECT id, email FROM user WHERE id = ?", (user_id,)
    ).fetchone()

    if row is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return {"id": row["id"], "email": row["email"]}
