"""Tests for card endpoints."""


def _setup_board_and_list(client, auth_header):
    client.post("/api/boards", json={"id": "b-1", "name": "Work"}, headers=auth_header)
    client.post("/api/lists", json={"id": "l-1", "boardId": "b-1", "name": "Todo"}, headers=auth_header)
    client.post("/api/lists", json={"id": "l-2", "boardId": "b-1", "name": "Done"}, headers=auth_header)


class TestCreateCard:
    def test_create_card(self, client, auth_header):
        _setup_board_and_list(client, auth_header)
        resp = client.post("/api/cards", json={
            "id": "card-1", "listId": "l-1", "title": "Write specs",
        }, headers=auth_header)
        assert resp.status_code == 201
        data = resp.json()
        assert data["title"] == "Write specs"
        assert data["description"] == ""
        assert data["dueDate"] is None
        assert data["members"] == []
        assert data["listId"] == "l-1"

    def test_create_card_empty_title(self, client, auth_header):
        _setup_board_and_list(client, auth_header)
        resp = client.post("/api/cards", json={
            "id": "card-1", "listId": "l-1", "title": "   ",
        }, headers=auth_header)
        assert resp.status_code == 422

    def test_create_card_in_other_users_list(self, client, auth_header, other_auth_header):
        _setup_board_and_list(client, other_auth_header)
        resp = client.post("/api/cards", json={
            "id": "card-1", "listId": "l-1", "title": "Nope",
        }, headers=auth_header)
        assert resp.status_code == 404


class TestUpdateCard:
    def test_edit_card_title_and_description(self, client, auth_header):
        _setup_board_and_list(client, auth_header)
        client.post("/api/cards", json={"id": "card-1", "listId": "l-1", "title": "Write specs"}, headers=auth_header)

        resp = client.patch("/api/cards/card-1", json={
            "title": "Write delta specs",
            "description": "Focus on edge cases",
        }, headers=auth_header)
        assert resp.status_code == 200
        data = resp.json()
        assert data["title"] == "Write delta specs"
        assert data["description"] == "Focus on edge cases"

    def test_edit_card_due_date(self, client, auth_header):
        _setup_board_and_list(client, auth_header)
        client.post("/api/cards", json={"id": "card-1", "listId": "l-1", "title": "Task"}, headers=auth_header)

        resp = client.patch("/api/cards/card-1", json={
            "title": "Task",
            "description": "",
            "dueDate": "2026-08-15",
        }, headers=auth_header)

        assert resp.status_code == 200
        assert resp.json()["dueDate"] == "2026-08-15"

    def test_clear_card_due_date(self, client, auth_header):
        _setup_board_and_list(client, auth_header)
        client.post("/api/cards", json={"id": "card-1", "listId": "l-1", "title": "Task"}, headers=auth_header)
        client.patch("/api/cards/card-1", json={
            "title": "Task",
            "description": "",
            "dueDate": "2026-08-15",
        }, headers=auth_header)

        resp = client.patch("/api/cards/card-1", json={
            "title": "Task",
            "description": "",
            "dueDate": None,
        }, headers=auth_header)

        assert resp.status_code == 200
        assert resp.json()["dueDate"] is None

    def test_edit_card_without_due_date_preserves_existing_due_date(self, client, auth_header):
        _setup_board_and_list(client, auth_header)
        client.post("/api/cards", json={"id": "card-1", "listId": "l-1", "title": "Task"}, headers=auth_header)
        client.patch("/api/cards/card-1", json={
            "title": "Task",
            "description": "",
            "dueDate": "2026-08-15",
        }, headers=auth_header)

        resp = client.patch("/api/cards/card-1", json={
            "title": "Task renamed",
            "description": "Still due",
        }, headers=auth_header)

        assert resp.status_code == 200
        assert resp.json()["dueDate"] == "2026-08-15"

    def test_edit_card_empty_title(self, client, auth_header):
        _setup_board_and_list(client, auth_header)
        client.post("/api/cards", json={"id": "card-1", "listId": "l-1", "title": "Task"}, headers=auth_header)

        resp = client.patch("/api/cards/card-1", json={"title": "   "}, headers=auth_header)
        assert resp.status_code == 422


class TestDeleteCard:
    def test_delete_card(self, client, auth_header):
        _setup_board_and_list(client, auth_header)
        client.post("/api/cards", json={"id": "card-1", "listId": "l-1", "title": "Task"}, headers=auth_header)

        resp = client.delete("/api/cards/card-1", headers=auth_header)
        assert resp.status_code == 204

        # Verify it's no longer in the list
        board = client.get("/api/boards/b-1", headers=auth_header).json()
        todo = board["lists"][0]
        assert todo["cards"] == []


class TestArchiveCard:
    def test_archive_card_hides_it_without_deleting_rows(self, client, auth_header, in_memory_db):
        _setup_board_and_list(client, auth_header)
        client.post("/api/cards", json={"id": "card-1", "listId": "l-1", "title": "Task"}, headers=auth_header)
        client.patch("/api/cards/card-1", json={
            "title": "Task",
            "description": "Keep me",
            "dueDate": "2026-08-15",
        }, headers=auth_header)
        owner_id = in_memory_db.execute(
            "SELECT id FROM user WHERE email = ?",
            ("test@example.com",),
        ).fetchone()["id"]
        client.post("/api/cards/card-1/members", json={"userId": owner_id}, headers=auth_header)

        resp = client.post("/api/cards/card-1/archive", headers=auth_header)

        assert resp.status_code == 204
        board = client.get("/api/boards/b-1", headers=auth_header).json()
        assert board["lists"][0]["cards"] == []
        card = in_memory_db.execute("SELECT title, description, due_date FROM card WHERE id = ?", ("card-1",)).fetchone()
        assert card["title"] == "Task"
        assert card["description"] == "Keep me"
        assert card["due_date"] == "2026-08-15"
        assert in_memory_db.execute(
            "SELECT card_id FROM card_member WHERE card_id = ?",
            ("card-1",),
        ).fetchone() is not None

    def test_archive_card_is_idempotent(self, client, auth_header, in_memory_db):
        _setup_board_and_list(client, auth_header)
        client.post("/api/cards", json={"id": "card-1", "listId": "l-1", "title": "Task"}, headers=auth_header)

        assert client.post("/api/cards/card-1/archive", headers=auth_header).status_code == 204
        assert client.post("/api/cards/card-1/archive", headers=auth_header).status_code == 204

        count = in_memory_db.execute(
            "SELECT COUNT(*) AS count FROM card_archive WHERE card_id = ?",
            ("card-1",),
        ).fetchone()["count"]
        assert count == 1

    def test_archive_other_users_card_returns_404(self, client, auth_header, other_auth_header):
        _setup_board_and_list(client, other_auth_header)
        client.post("/api/cards", json={"id": "card-1", "listId": "l-1", "title": "Task"}, headers=other_auth_header)

        resp = client.post("/api/cards/card-1/archive", headers=auth_header)

        assert resp.status_code == 404


class TestCardMembers:
    def test_assign_multiple_members_and_prevent_duplicates(self, client, auth_header, other_auth_header, in_memory_db):
        client.post("/api/boards", json={"id": "shared-1", "name": "Team$"}, headers=auth_header)
        client.post("/api/lists", json={"id": "l-1", "boardId": "shared-1", "name": "Todo"}, headers=auth_header)
        client.post("/api/cards", json={"id": "card-1", "listId": "l-1", "title": "Task"}, headers=auth_header)
        other_id = client.post("/api/boards/shared-1/members", json={
            "email": "other@example.com",
        }, headers=auth_header).json()["id"]
        third_resp = client.post("/api/auth/register", json={
            "email": "third@example.com",
            "password": "secret789",
        })
        assert third_resp.status_code == 201
        third_id = client.post("/api/boards/shared-1/members", json={
            "email": "third@example.com",
        }, headers=auth_header).json()["id"]

        resp_one = client.post("/api/cards/card-1/members", json={"userId": other_id}, headers=auth_header)
        resp_two = client.post("/api/cards/card-1/members", json={"userId": third_id}, headers=auth_header)
        duplicate = client.post("/api/cards/card-1/members", json={"userId": other_id}, headers=auth_header)

        assert resp_one.status_code == 201
        assert resp_two.status_code == 201
        assert duplicate.status_code == 201
        members = client.get("/api/cards/card-1/members", headers=auth_header).json()
        assert [m["email"] for m in members] == ["other@example.com", "third@example.com"]
        count = in_memory_db.execute(
            "SELECT COUNT(*) AS count FROM card_member WHERE card_id = ?",
            ("card-1",),
        ).fetchone()["count"]
        assert count == 2
        board_card = client.get("/api/boards/shared-1", headers=auth_header).json()["lists"][0]["cards"][0]
        assert [m["email"] for m in board_card["members"]] == ["other@example.com", "third@example.com"]

    def test_member_options_include_owner_and_board_members(self, client, auth_header, other_auth_header):
        client.post("/api/boards", json={"id": "shared-1", "name": "Team$"}, headers=auth_header)
        client.post("/api/lists", json={"id": "l-1", "boardId": "shared-1", "name": "Todo"}, headers=auth_header)
        client.post("/api/cards", json={"id": "card-1", "listId": "l-1", "title": "Task"}, headers=auth_header)
        client.post("/api/boards/shared-1/members", json={
            "email": "other@example.com",
        }, headers=auth_header)

        resp = client.get("/api/cards/card-1/member-options", headers=auth_header)

        assert resp.status_code == 200
        assert [m["email"] for m in resp.json()] == ["other@example.com", "test@example.com"]

    def test_reject_assignment_for_user_outside_board(self, client, auth_header, in_memory_db):
        _setup_board_and_list(client, auth_header)
        client.post("/api/cards", json={"id": "card-1", "listId": "l-1", "title": "Task"}, headers=auth_header)
        client.post("/api/auth/register", json={
            "email": "outsider@example.com",
            "password": "secret789",
        })
        outsider_id = in_memory_db.execute(
            "SELECT id FROM user WHERE email = ?",
            ("outsider@example.com",),
        ).fetchone()["id"]

        resp = client.post("/api/cards/card-1/members", json={"userId": outsider_id}, headers=auth_header)

        assert resp.status_code == 409
        assert client.get("/api/cards/card-1/members", headers=auth_header).json() == []

    def test_remove_card_member(self, client, auth_header, in_memory_db):
        _setup_board_and_list(client, auth_header)
        client.post("/api/cards", json={"id": "card-1", "listId": "l-1", "title": "Task"}, headers=auth_header)
        owner_id = in_memory_db.execute(
            "SELECT id FROM user WHERE email = ?",
            ("test@example.com",),
        ).fetchone()["id"]
        client.post("/api/cards/card-1/members", json={"userId": owner_id}, headers=auth_header)

        resp = client.delete(f"/api/cards/card-1/members/{owner_id}", headers=auth_header)

        assert resp.status_code == 204
        assert client.get("/api/cards/card-1/members", headers=auth_header).json() == []


class TestMoveCard:
    def test_move_within_same_list(self, client, auth_header):
        _setup_board_and_list(client, auth_header)
        client.post("/api/cards", json={"id": "c-1", "listId": "l-1", "title": "First"}, headers=auth_header)
        client.post("/api/cards", json={"id": "c-2", "listId": "l-1", "title": "Second"}, headers=auth_header)
        client.post("/api/cards", json={"id": "c-3", "listId": "l-1", "title": "Third"}, headers=auth_header)

        # Move third card to index 0
        resp = client.put("/api/cards/c-3/move", json={
            "toListId": "l-1", "index": 0,
        }, headers=auth_header)
        assert resp.status_code == 200

        board = client.get("/api/boards/b-1", headers=auth_header).json()
        todo_card_ids = [c["id"] for c in board["lists"][0]["cards"]]
        assert todo_card_ids == ["c-3", "c-1", "c-2"]

    def test_move_across_lists(self, client, auth_header):
        _setup_board_and_list(client, auth_header)
        client.post("/api/cards", json={"id": "c-1", "listId": "l-1", "title": "Moving"}, headers=auth_header)

        resp = client.put("/api/cards/c-1/move", json={
            "toListId": "l-2", "index": 0,
        }, headers=auth_header)
        assert resp.status_code == 200

        board = client.get("/api/boards/b-1", headers=auth_header).json()
        assert board["lists"][0]["cards"] == []  # Todo is empty
        assert [c["id"] for c in board["lists"][1]["cards"]] == ["c-1"]  # Done has the card

    def test_move_to_empty_list(self, client, auth_header):
        _setup_board_and_list(client, auth_header)
        client.post("/api/cards", json={"id": "c-1", "listId": "l-1", "title": "Move me"}, headers=auth_header)

        # l-2 (Done) is empty
        resp = client.put("/api/cards/c-1/move", json={
            "toListId": "l-2", "index": 0,
        }, headers=auth_header)
        assert resp.status_code == 200

        board = client.get("/api/boards/b-1", headers=auth_header).json()
        assert [c["id"] for c in board["lists"][1]["cards"]] == ["c-1"]


class TestEditorMetadata:
    """Tests for modifiedByEmail and isModifiedByCurrentUser in card responses."""

    def test_own_editor_create(self, client, auth_header):
        """Card created by current user: isModifiedByCurrentUser=True, no email exposed."""
        _setup_board_and_list(client, auth_header)
        resp = client.post("/api/cards", json={
            "id": "card-1", "listId": "l-1", "title": "My card",
        }, headers=auth_header)
        assert resp.status_code == 201
        data = resp.json()
        assert data["isModifiedByCurrentUser"] is True
        assert data["modifiedByEmail"] is None

    def test_own_editor_in_board_detail(self, client, auth_header):
        """Board detail: card edited by requester shows isModifiedByCurrentUser=True."""
        _setup_board_and_list(client, auth_header)
        client.post("/api/cards", json={"id": "card-1", "listId": "l-1", "title": "My card"}, headers=auth_header)
        board = client.get("/api/boards/b-1", headers=auth_header).json()
        card = board["lists"][0]["cards"][0]
        assert card["isModifiedByCurrentUser"] is True
        assert card["modifiedByEmail"] is None

    def test_other_editor_in_board_detail(self, client, auth_header, other_auth_header):
        """Board detail: card edited by another user shows their email."""
        # Create a shared board with the primary user
        client.post("/api/boards", json={"id": "b-shared", "name": "Shared$"}, headers=auth_header)
        client.post("/api/lists", json={"id": "ls-1", "boardId": "b-shared", "name": "Todo"}, headers=auth_header)
        # Add other user as member
        client.post("/api/boards/b-shared/members", json={"email": "other@example.com"}, headers=auth_header)
        # Other user creates a card
        client.post("/api/cards", json={"id": "card-other", "listId": "ls-1", "title": "Their card"}, headers=other_auth_header)
        # Primary user fetches board detail
        board = client.get("/api/boards/b-shared", headers=auth_header).json()
        card = board["lists"][0]["cards"][0]
        assert card["isModifiedByCurrentUser"] is False
        assert card["modifiedByEmail"] == "other@example.com"

    def test_legacy_card_no_editor(self, client, auth_header, in_memory_db):
        """Legacy card with NULL modified_by: no metadata exposed."""
        _setup_board_and_list(client, auth_header)
        # Insert a legacy card directly (no modified_by)
        in_memory_db.execute(
            "INSERT INTO card (id, list_id, title, position) VALUES (?, ?, ?, ?)",
            ("legacy-1", "l-1", "Old card", 0),
        )
        in_memory_db.commit()
        board = client.get("/api/boards/b-1", headers=auth_header).json()
        card = next(c for c in board["lists"][0]["cards"] if c["id"] == "legacy-1")
        assert card["isModifiedByCurrentUser"] is None
        assert card["modifiedByEmail"] is None
