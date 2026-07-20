"""Tests for member management endpoints."""


def _create_shared_board(client, auth_header, board_id="shared-1", name="Team$"):
    client.post("/api/boards", json={"id": board_id, "name": name}, headers=auth_header)


def _create_personal_board(client, auth_header, board_id="personal-1", name="Personal"):
    client.post("/api/boards", json={"id": board_id, "name": name}, headers=auth_header)


class TestAddMember:
    def test_add_member(self, client, auth_header, other_auth_header):
        _create_shared_board(client, auth_header)
        resp = client.post("/api/boards/shared-1/members", json={
            "email": "other@example.com",
        }, headers=auth_header)
        assert resp.status_code == 201
        data = resp.json()
        assert data["email"] == "other@example.com"
        assert "id" in data

    def test_add_member_to_non_shared_board(self, client, auth_header, other_auth_header):
        _create_personal_board(client, auth_header)
        resp = client.post("/api/boards/personal-1/members", json={
            "email": "other@example.com",
        }, headers=auth_header)
        assert resp.status_code == 409

    def test_add_non_existent_user(self, client, auth_header):
        _create_shared_board(client, auth_header)
        resp = client.post("/api/boards/shared-1/members", json={
            "email": "ghost@example.com",
        }, headers=auth_header)
        assert resp.status_code == 404

    def test_add_self_as_member(self, client, auth_header):
        _create_shared_board(client, auth_header)
        resp = client.post("/api/boards/shared-1/members", json={
            "email": "test@example.com",
        }, headers=auth_header)
        assert resp.status_code == 409

    def test_add_duplicate_member(self, client, auth_header, other_auth_header):
        _create_shared_board(client, auth_header)
        # First add succeeds
        client.post("/api/boards/shared-1/members", json={
            "email": "other@example.com",
        }, headers=auth_header)
        # Second add should fail
        resp = client.post("/api/boards/shared-1/members", json={
            "email": "other@example.com",
        }, headers=auth_header)
        assert resp.status_code == 409

    def test_non_owner_cannot_add_member(self, client, auth_header, other_auth_header):
        _create_shared_board(client, auth_header)
        # Add other user as member
        client.post("/api/boards/shared-1/members", json={
            "email": "other@example.com",
        }, headers=auth_header)

        # Register a third user
        third_resp = client.post("/api/auth/register", json={
            "email": "third@example.com",
            "password": "secret789",
        })
        third_token = third_resp.json()["access_token"]
        third_headers = {"Authorization": f"Bearer {third_token}"}

        # The third user is not a member, so they can't add anyone
        resp = client.post("/api/boards/shared-1/members", json={
            "email": "third@example.com",
        }, headers=third_headers)
        assert resp.status_code == 404  # Board not visible to non-member

        # The other user (member but not owner) tries to add
        resp = client.post("/api/boards/shared-1/members", json={
            "email": "third@example.com",
        }, headers=other_auth_header)
        assert resp.status_code == 403


class TestRemoveMember:
    def test_remove_member(self, client, auth_header, other_auth_header):
        _create_shared_board(client, auth_header)
        # Add a member
        add_resp = client.post("/api/boards/shared-1/members", json={
            "email": "other@example.com",
        }, headers=auth_header)
        member_id = add_resp.json()["id"]

        # Remove them
        resp = client.delete(f"/api/boards/shared-1/members/{member_id}", headers=auth_header)
        assert resp.status_code == 204

    def test_remove_non_existent_member(self, client, auth_header):
        _create_shared_board(client, auth_header)
        resp = client.delete("/api/boards/shared-1/members/nonexistent-id", headers=auth_header)
        assert resp.status_code == 404

    def test_non_owner_cannot_remove_member(self, client, auth_header, other_auth_header):
        _create_shared_board(client, auth_header)
        # Add other user as member
        add_resp = client.post("/api/boards/shared-1/members", json={
            "email": "other@example.com",
        }, headers=auth_header)
        member_id = add_resp.json()["id"]

        # Register a third user and add them
        third_resp = client.post("/api/auth/register", json={
            "email": "third@example.com",
            "password": "secret789",
        })
        third_token = third_resp.json()["access_token"]
        third_headers = {"Authorization": f"Bearer {third_token}"}

        # The other user (member, not owner) tries to remove the third user
        # But wait, the third user isn't even added. Let me just test that "other" can't remove anyone.
        resp = client.delete(f"/api/boards/shared-1/members/{member_id}", headers=other_auth_header)
        assert resp.status_code == 403


class TestListMembers:
    def test_list_members(self, client, auth_header, other_auth_header):
        _create_shared_board(client, auth_header)
        client.post("/api/boards/shared-1/members", json={
            "email": "other@example.com",
        }, headers=auth_header)

        resp = client.get("/api/boards/shared-1/members", headers=auth_header)
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["email"] == "other@example.com"

    def test_list_members_empty(self, client, auth_header):
        _create_shared_board(client, auth_header)
        resp = client.get("/api/boards/shared-1/members", headers=auth_header)
        assert resp.status_code == 200
        assert resp.json() == []

    def test_non_member_cannot_list_members(self, client, auth_header, other_auth_header):
        _create_shared_board(client, auth_header)
        # Other user is not a member, so they can't see the board
        resp = client.get("/api/boards/shared-1/members", headers=other_auth_header)
        assert resp.status_code == 404


class TestSharedBoardAccess:
    def test_shared_board_appears_in_member_listing(self, client, auth_header, other_auth_header):
        _create_shared_board(client, auth_header)
        # Add other user as member
        client.post("/api/boards/shared-1/members", json={
            "email": "other@example.com",
        }, headers=auth_header)

        # Other user should see the shared board in their listing
        resp = client.get("/api/boards", headers=other_auth_header)
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["name"] == "Team$"
        assert data[0]["isShared"] is True
        assert data[0]["isOwner"] is False

    def test_member_cannot_delete_shared_board(self, client, auth_header, other_auth_header):
        _create_shared_board(client, auth_header)
        # Add other user as member
        client.post("/api/boards/shared-1/members", json={
            "email": "other@example.com",
        }, headers=auth_header)

        # Other user tries to delete
        resp = client.delete("/api/boards/shared-1", headers=other_auth_header)
        assert resp.status_code == 403

    def test_member_can_crud_cards_on_shared_board(self, client, auth_header, other_auth_header):
        _create_shared_board(client, auth_header)
        client.post("/api/boards/shared-1/members", json={
            "email": "other@example.com",
        }, headers=auth_header)

        # Create a list as owner
        client.post("/api/lists", json={"id": "l-1", "boardId": "shared-1", "name": "Todo"}, headers=auth_header)

        # Other user can create a card
        resp = client.post("/api/cards", json={
            "id": "c-1", "listId": "l-1", "title": "Shared task",
        }, headers=other_auth_header)
        assert resp.status_code == 201
        assert resp.json()["modifiedBy"] is not None

        # Other user can see the board detail
        resp = client.get("/api/boards/shared-1", headers=other_auth_header)
        assert resp.status_code == 200
        assert resp.json()["name"] == "Team$"

    def test_board_response_fields(self, client, auth_header):
        """Verify BoardResponse includes isShared and isOwner."""
        resp = client.post("/api/boards", json={"id": "b-1", "name": "Work"}, headers=auth_header)
        assert resp.status_code == 201
        data = resp.json()
        assert data["isShared"] is False
        assert data["isOwner"] is True

        resp2 = client.post("/api/boards", json={"id": "b-2", "name": "Collab$"}, headers=auth_header)
        assert resp2.status_code == 201
        data2 = resp2.json()
        assert data2["isShared"] is True
        assert data2["isOwner"] is True

    def test_cannot_remove_dollar_from_shared_board(self, client, auth_header):
        _create_shared_board(client, auth_header)
        resp = client.patch("/api/boards/shared-1", json={"name": "Team"}, headers=auth_header)
        assert resp.status_code == 409

    def test_can_rename_shared_board_keeping_dollar(self, client, auth_header):
        _create_shared_board(client, auth_header)
        resp = client.patch("/api/boards/shared-1", json={"name": "New Team$"}, headers=auth_header)
        assert resp.status_code == 200
        assert resp.json()["name"] == "New Team$"
