

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
