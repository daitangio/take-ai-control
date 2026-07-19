"""Tests for board endpoints."""


class TestCreateBoard:
    def test_create_board(self, client, auth_header):
        resp = client.post("/api/boards", json={
            "id": "board-1",
            "name": "Work",
        }, headers=auth_header)
        assert resp.status_code == 201
        data = resp.json()
        assert data["name"] == "Work"
        assert data["listIds"] == []

    def test_create_board_empty_name(self, client, auth_header):
        resp = client.post("/api/boards", json={
            "id": "board-1",
            "name": "   ",
        }, headers=auth_header)
        assert resp.status_code == 422

    def test_create_board_without_auth(self, client):
        resp = client.post("/api/boards", json={
            "id": "board-1",
            "name": "Work",
        })
        assert resp.status_code == 401


class TestListBoards:
    def test_list_boards_sorted_by_name(self, client, auth_header):
        client.post("/api/boards", json={"id": "b-3", "name": "Zebra"}, headers=auth_header)
        client.post("/api/boards", json={"id": "b-1", "name": "Alpha"}, headers=auth_header)
        client.post("/api/boards", json={"id": "b-2", "name": "Middle"}, headers=auth_header)

        resp = client.get("/api/boards", headers=auth_header)
        assert resp.status_code == 200
        data = resp.json()
        names = [b["name"] for b in data]
        assert names == ["Alpha", "Middle", "Zebra"]

    def test_list_boards_empty(self, client, auth_header):
        resp = client.get("/api/boards", headers=auth_header)
        assert resp.status_code == 200
        assert resp.json() == []

    def test_list_boards_isolated_per_user(self, client, auth_header, other_auth_header):
        client.post("/api/boards", json={"id": "b-1", "name": "Mine"}, headers=auth_header)
        client.post("/api/boards", json={"id": "b-2", "name": "Theirs"}, headers=other_auth_header)

        resp = client.get("/api/boards", headers=auth_header)
        data = resp.json()
        assert len(data) == 1
        assert data[0]["name"] == "Mine"


class TestGetBoard:
    def test_get_board_with_lists(self, client, auth_header):
        client.post("/api/boards", json={"id": "board-1", "name": "Work"}, headers=auth_header)
        client.post("/api/lists", json={"id": "list-1", "boardId": "board-1", "name": "Todo"}, headers=auth_header)
        client.post("/api/lists", json={"id": "list-2", "boardId": "board-1", "name": "Done"}, headers=auth_header)

        resp = client.get("/api/boards/board-1", headers=auth_header)
        assert resp.status_code == 200
        data = resp.json()
        assert data["name"] == "Work"
        assert len(data["lists"]) == 2
        assert data["lists"][0]["name"] == "Todo"
        assert data["lists"][1]["name"] == "Done"

    def test_get_board_not_found(self, client, auth_header):
        resp = client.get("/api/boards/nonexistent", headers=auth_header)
        assert resp.status_code == 404

    def test_get_other_users_board(self, client, auth_header, other_auth_header):
        client.post("/api/boards", json={"id": "b-1", "name": "Theirs"}, headers=other_auth_header)
        resp = client.get("/api/boards/b-1", headers=auth_header)
        assert resp.status_code == 404


class TestUpdateBoard:
    def test_rename_board(self, client, auth_header):
        client.post("/api/boards", json={"id": "board-1", "name": "Work"}, headers=auth_header)
        resp = client.patch("/api/boards/board-1", json={"name": "Work 2026"}, headers=auth_header)
        assert resp.status_code == 200
        assert resp.json()["name"] == "Work 2026"

    def test_rename_other_users_board(self, client, auth_header, other_auth_header):
        client.post("/api/boards", json={"id": "b-1", "name": "Theirs"}, headers=other_auth_header)
        resp = client.patch("/api/boards/b-1", json={"name": "Hacked"}, headers=auth_header)
        assert resp.status_code == 404


class TestDeleteBoard:
    def test_delete_board_cascades(self, client, auth_header):
        client.post("/api/boards", json={"id": "board-1", "name": "Work"}, headers=auth_header)
        client.post("/api/lists", json={"id": "list-1", "boardId": "board-1", "name": "Todo"}, headers=auth_header)
        client.post("/api/cards", json={"id": "card-1", "listId": "list-1", "title": "Task"}, headers=auth_header)

        resp = client.delete("/api/boards/board-1", headers=auth_header)
        assert resp.status_code == 204

        # Verify board is gone
        assert client.get("/api/boards/board-1", headers=auth_header).status_code == 404

    def test_delete_other_users_board(self, client, auth_header, other_auth_header):
        client.post("/api/boards", json={"id": "b-1", "name": "Theirs"}, headers=other_auth_header)
        resp = client.delete("/api/boards/b-1", headers=auth_header)
        assert resp.status_code == 404
