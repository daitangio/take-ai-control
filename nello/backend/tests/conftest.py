import sqlite3
import sys
import os

import pytest
from fastapi.testclient import TestClient

# Ensure src/ is importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from src.main import app
from src.db import SCHEMA_SQL, apply_migrations
from src import deps
from src.auth.service import create_token, register_user


@pytest.fixture
def in_memory_db():
    """Create a fresh in-memory SQLite database with schema."""
    conn = sqlite3.connect(":memory:", check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.executescript(SCHEMA_SQL)
    apply_migrations(conn)
    # register a fake user
    register_user(conn, "test@example.com","secret123")
    yield conn
    conn.close()


@pytest.fixture
def client(in_memory_db):
    """TestClient with get_db overridden to use in-memory database."""

    def override_get_db():
        try:
            yield in_memory_db
        finally:
            pass  # Don't close — the fixture handles it

    app.dependency_overrides[deps.get_db] = override_get_db
    with TestClient(app) as tc:
        yield tc
    app.dependency_overrides.clear()

## GG To fix providing the register client only for tests

@pytest.fixture
def test_user(client):
    resp = client.post("/api/auth/login", json={
        "email": "test@example.com",
        "password": "secret123",
    })
    assert resp.status_code == 200
    data = resp.json()
    return {"token": data["access_token"], "email": "test@example.com"}


@pytest.fixture
def auth_header(test_user):
    """Return an Authorization header dict for the test user."""
    return {"Authorization": f"Bearer {test_user['token']}"}


@pytest.fixture
def other_user_token(client):
    """Register a second user and return their token."""
    resp = client.post("/api/auth/register", json={
        "email": "other@example.com",
        "password": "secret456",
    })
    assert resp.status_code == 201
    return resp.json()["access_token"]


@pytest.fixture
def other_auth_header(other_user_token):
    """Return an Authorization header dict for the other user."""
    return {"Authorization": f"Bearer {other_user_token}"}
