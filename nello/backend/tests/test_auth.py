"""Tests for user authentication endpoints."""


class TestRegister:
    def test_register_success(self, client):
        resp = client.post("/api/auth/register", json={
            "email": "new@example.com",
            "password": "mypassword",
        })
        assert resp.status_code == 201
        data = resp.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_register_duplicate_email(self, client):
        client.post("/api/auth/register", json={
            "email": "dup@example.com",
            "password": "secret123",
        })
        resp = client.post("/api/auth/register", json={
            "email": "dup@example.com",
            "password": "another",
        })
        assert resp.status_code == 409
        assert "already registered" in resp.json()["detail"].lower()

    def test_register_empty_password(self, client):
        resp = client.post("/api/auth/register", json={
            "email": "user@example.com",
            "password": "   ",
        })
        assert resp.status_code == 422

    def test_register_invalid_email(self, client):
        resp = client.post("/api/auth/register", json={
            "email": "not-an-email",
            "password": "secret123",
        })
        assert resp.status_code == 422

    def test_register_missing_fields(self, client):
        resp = client.post("/api/auth/register", json={})
        assert resp.status_code == 422


class TestLogin:
    def test_login_success(self, client, test_user):
        resp = client.post("/api/auth/login", json={
            "email": "test@example.com",
            "password": "secret123",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_login_wrong_password(self, client, test_user):
        resp = client.post("/api/auth/login", json={
            "email": "test@example.com",
            "password": "wrongpassword",
        })
        assert resp.status_code == 401

    def test_login_unknown_email(self, client):
        resp = client.post("/api/auth/login", json={
            "email": "nobody@example.com",
            "password": "secret123",
        })
        assert resp.status_code == 401

    def test_login_missing_fields(self, client):
        resp = client.post("/api/auth/login", json={})
        assert resp.status_code == 422


class TestToken:
    def test_invalid_token_rejected(self, client):
        resp = client.get(
            "/api/boards",
            headers={"Authorization": "Bearer invalid-token-here"},
        )
        assert resp.status_code == 401

    def test_no_token_rejected(self, client):
        resp = client.get("/api/boards")
        assert resp.status_code == 401
