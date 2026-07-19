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
