import logging
import sqlite3
import uuid
from datetime import datetime, timedelta, timezone

import bcrypt
from jose import jwt, JWTError

from ..config import JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRATION_HOURS

logger = logging.getLogger(__name__)


def register_user(db, email: str, password: str) -> dict:
    """Create a new user. Returns user dict or raises ValueError on duplicate."""
    user_id = str(uuid.uuid4())
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    try:
        db.execute(
            "INSERT INTO user (id, email, password) VALUES (?, ?, ?)",
            (user_id, email, hashed),
        )
        db.commit()
    except sqlite3.IntegrityError:
        raise ValueError("Email already registered")

    logger.info("User registered: %s", email)
    logger.debug("INSERT user id=%s email=%s", user_id, email)
    return {"id": user_id, "email": email}


def authenticate_user(db, email: str, password: str) -> dict | None:
    """Verify credentials and return user dict, or None."""
    row = db.execute(
        "SELECT id, email, password FROM user WHERE email = ?", (email,)
    ).fetchone()

    if row is None:
        logger.debug("Login attempt for unknown email: %s", email)
        return None

    if not bcrypt.checkpw(password.encode("utf-8"), row["password"].encode("utf-8")):
        logger.debug("Wrong password for user: %s", email)
        return None

    logger.info("User logged in: %s", email)
    return {"id": row["id"], "email": row["email"]}


def create_token(user_id: str) -> str:
    """Create a JWT access token for the given user ID."""
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "iat": now,
        "exp": now + timedelta(hours=JWT_EXPIRATION_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def verify_token(token: str) -> str | None:
    """Verify a JWT token and return the user ID, or None."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None
