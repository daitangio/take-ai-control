"""Shared FastAPI dependencies."""

import sqlite3

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from .auth.service import verify_token


def check_board_access(db: sqlite3.Connection, board_id: str, user_id: str) -> str | None:
    """Return 'owner' if user created the board, 'member' if shared, None if no access."""
    row = db.execute(
        "SELECT user_id FROM board WHERE id = ?", (board_id,)
    ).fetchone()
    if row is None:
        return None
    if row["user_id"] == user_id:
        return "owner"
    member = db.execute(
        "SELECT 1 FROM board_member WHERE board_id = ? AND user_id = ?",
        (board_id, user_id),
    ).fetchone()
    if member:
        return "member"
    return None

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
