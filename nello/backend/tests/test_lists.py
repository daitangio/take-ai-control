"""Tests for list endpoints."""


def _create_board(client, auth_header, board_id="b-1", name="Test Board"):
    client.post("/api/boards", json={"id": board_id, "name": name}, headers=auth_header)


class TestCreateList:
    def test_create_list(self, client, auth_header):
        _create_board(client, auth_header)
        resp = client.post("/api/lists", json={
            "id": "list-1", "boardId": "b-1", "name": "Todo",
        }, headers=auth_header)
        assert resp.status_code == 201
        data = resp.json()
        assert data["name"] == "Todo"
        assert data["boardId"] == "b-1"
        assert data["cardIds"] == []

    def test_create_list_in_other_users_board(self, client, auth_header, other_auth_header):
        _create_board(client, other_auth_header, board_id="theirs")
        resp = client.post("/api/lists", json={
            "id": "list-1", "boardId": "theirs", "name": "Nope",
        }, headers=auth_header)
        assert resp.status_code == 404

    def test_create_list_without_auth(self, client):
        resp = client.post("/api/lists", json={
            "id": "list-1", "boardId": "b-1", "name": "Todo",
        })
        assert resp.status_code == 401


class TestUpdateList:
    def test_rename_list(self, client, auth_header):
        _create_board(client, auth_header)
        client.post("/api/lists", json={"id": "list-1", "boardId": "b-1", "name": "Todo"}, headers=auth_header)
        resp = client.patch("/api/lists/list-1", json={"name": "Backlog"}, headers=auth_header)
        assert resp.status_code == 200
        assert resp.json()["name"] == "Backlog"

    def test_rename_other_users_list(self, client, auth_header, other_auth_header):
        _create_board(client, other_auth_header)
        client.post("/api/lists", json={"id": "list-1", "boardId": "b-1", "name": "Todo"}, headers=other_auth_header)
        resp = client.patch("/api/lists/list-1", json={"name": "Hacked"}, headers=auth_header)
        assert resp.status_code == 404


class TestDeleteList:
    def test_delete_list_cascades_to_cards(self, client, auth_header):
        _create_board(client, auth_header)
        client.post("/api/lists", json={"id": "list-1", "boardId": "b-1", "name": "Todo"}, headers=auth_header)
        client.post("/api/cards", json={"id": "card-1", "listId": "list-1", "title": "Task"}, headers=auth_header)

        resp = client.delete("/api/lists/list-1", headers=auth_header)
        assert resp.status_code == 204

        # Card should also be deleted (cascade)
        resp2 = client.get("/api/boards/b-1", headers=auth_header)
        assert len(resp2.json()["lists"]) == 0


class TestReorderLists:
    def test_reorder_lists(self, client, auth_header):
        _create_board(client, auth_header)
        client.post("/api/lists", json={"id": "l-1", "boardId": "b-1", "name": "First"}, headers=auth_header)
        client.post("/api/lists", json={"id": "l-2", "boardId": "b-1", "name": "Second"}, headers=auth_header)
        client.post("/api/lists", json={"id": "l-3", "boardId": "b-1", "name": "Third"}, headers=auth_header)

        # Reverse order
        resp = client.put("/api/boards/b-1/lists/reorder", json={
            "listIds": ["l-3", "l-2", "l-1"],
        }, headers=auth_header)
        assert resp.status_code == 200

        # Verify order
        board = client.get("/api/boards/b-1", headers=auth_header).json()
        names = [l["name"] for l in board["lists"]]
        assert names == ["Third", "Second", "First"]
