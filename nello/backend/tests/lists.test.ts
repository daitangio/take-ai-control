import { describe, it, expect, beforeEach } from "vitest";
import {
  buildTestApp,
  authHeadersFor,
  raw,
  type TestApp,
} from "./helpers.js";

async function _createBoard(env: TestApp, auth: Record<string, string>, id = "b-1", name = "Test Board") {
  await env.app.inject({ method: "POST", url: "/api/boards", headers: auth, payload: { id, name } });
}

async function _createList(env: TestApp, auth: Record<string, string>, id: string, boardId: string, name: string) {
  return env.app.inject({
    method: "POST",
    url: "/api/lists",
    headers: auth,
    payload: { id, boardId, name },
  });
}

describe("CreateList", () => {
  let env: TestApp;
  let auth: Record<string, string>;

  beforeEach(async () => {
    env = await buildTestApp();
    auth = await authHeadersFor(env.app, env.db, "test@example.com", "secret123");
  });

  it("creates a list with 201 and echoes name + boardId + empty cardIds", async () => {
    await _createBoard(env, auth);
    const res = await _createList(env, auth, "list-1", "b-1", "Todo");
    expect(res.statusCode).toBe(201);
    const data = JSON.parse(res.body);
    expect(data.name).toBe("Todo");
    expect(data.boardId).toBe("b-1");
    expect(data.cardIds).toEqual([]);
  });

  it("returns 404 when creating a list in another user's board", async () => {
    const other = await authHeadersFor(env.app, env.db, "other@example.com", "secret456");
    await _createBoard(env, other, "theirs", "Theirs");
    const res = await _createList(env, auth, "list-1", "theirs", "Nope");
    expect(res.statusCode).toBe(404);
  });

  it("rejects creating a list without authentication with 401", async () => {
    const res = await env.app.inject({
      method: "POST",
      url: "/api/lists",
      payload: { id: "list-1", boardId: "b-1", name: "Todo" },
    });
    expect(res.statusCode).toBe(401);
  });
});

describe("UpdateList", () => {
  let env: TestApp;
  let auth: Record<string, string>;

  beforeEach(async () => {
    env = await buildTestApp();
    auth = await authHeadersFor(env.app, env.db, "test@example.com", "secret123");
  });

  it("renames a list", async () => {
    await _createBoard(env, auth);
    await _createList(env, auth, "list-1", "b-1", "Todo");
    const res = await env.app.inject({
      method: "PATCH",
      url: "/api/lists/list-1",
      headers: auth,
      payload: { name: "Backlog" },
    });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).name).toBe("Backlog");
  });

  it("returns 404 when renaming another user's list", async () => {
    const other = await authHeadersFor(env.app, env.db, "other@example.com", "secret456");
    await _createBoard(env, auth);
    await _createList(env, other, "list-1", "b-1", "Todo");
    const res = await env.app.inject({
      method: "PATCH",
      url: "/api/lists/list-1",
      headers: auth,
      payload: { name: "Hacked" },
    });
    expect(res.statusCode).toBe(404);
  });
});

describe("DeleteList", () => {
  let env: TestApp;
  let auth: Record<string, string>;

  beforeEach(async () => {
    env = await buildTestApp();
    auth = await authHeadersFor(env.app, env.db, "test@example.com", "secret123");
  });

  it("deleting a list cascades to its cards", async () => {
    await _createBoard(env, auth);
    await _createList(env, auth, "list-1", "b-1", "Todo");
    await env.app.inject({ method: "POST", url: "/api/cards", headers: auth, payload: { id: "card-1", listId: "list-1", title: "Task" } });

    const res = await env.app.inject({ method: "DELETE", url: "/api/lists/list-1", headers: auth });
    expect(res.statusCode).toBe(204);

    const board = await env.app.inject({ method: "GET", url: "/api/boards/b-1", headers: auth });
    expect(JSON.parse(board.body).lists).toHaveLength(0);
  });
});

describe("ArchiveList", () => {
  let env: TestApp;
  let auth: Record<string, string>;

  beforeEach(async () => {
    env = await buildTestApp();
    auth = await authHeadersFor(env.app, env.db, "test@example.com", "secret123");
  });

  it("hides a list without deleting its rows and records list_archive fields", async () => {
    await _createBoard(env, auth);
    await _createList(env, auth, "list-1", "b-1", "Todo");
    await env.app.inject({ method: "POST", url: "/api/cards", headers: auth, payload: { id: "card-1", listId: "list-1", title: "Task" } });

    const res = await env.app.inject({ method: "POST", url: "/api/lists/list-1/archive", headers: auth });
    expect(res.statusCode).toBe(204);

    const board = JSON.parse((await env.app.inject({ method: "GET", url: "/api/boards/b-1", headers: auth })).body);
    expect(board.lists).toEqual([]);

    const boardsList = JSON.parse((await env.app.inject({ method: "GET", url: "/api/boards", headers: auth })).body);
    expect(boardsList[0].listIds).toEqual([]);

    // list/card rows persist
    expect(await raw(env.db, "SELECT id FROM list WHERE id = ?", ["list-1"])).toHaveLength(1);
    expect(await raw(env.db, "SELECT id FROM card WHERE id = ?", ["card-1"])).toHaveLength(1);

    const archive = await raw(
      env.db,
      "SELECT list_id, board_id, archived_by FROM list_archive WHERE list_id = ?",
      ["list-1"],
    );
    expect(archive[0].list_id).toBe("list-1");
    expect(archive[0].board_id).toBe("b-1");
    expect(archive[0].archived_by).not.toBeNull();
  });

  it("archiving a list is idempotent (one list_archive row)", async () => {
    await _createBoard(env, auth);
    await _createList(env, auth, "list-1", "b-1", "Todo");

    expect((await env.app.inject({ method: "POST", url: "/api/lists/list-1/archive", headers: auth })).statusCode).toBe(204);
    expect((await env.app.inject({ method: "POST", url: "/api/lists/list-1/archive", headers: auth })).statusCode).toBe(204);

    const rows = await raw(env.db, "SELECT COUNT(*) AS count FROM list_archive WHERE list_id = ?", ["list-1"]);
    expect(Number(rows[0].count)).toBe(1);
  });

  it("returns 404 when archiving another user's list", async () => {
    const other = await authHeadersFor(env.app, env.db, "other@example.com", "secret456");
    await _createBoard(env, other);
    await _createList(env, other, "list-1", "b-1", "Todo");
    const res = await env.app.inject({ method: "POST", url: "/api/lists/list-1/archive", headers: auth });
    expect(res.statusCode).toBe(404);
  });
});

describe("ReorderLists", () => {
  let env: TestApp;
  let auth: Record<string, string>;

  beforeEach(async () => {
    env = await buildTestApp();
    auth = await authHeadersFor(env.app, env.db, "test@example.com", "secret123");
  });

  it("reorders lists in the requested order", async () => {
    await _createBoard(env, auth);
    await _createList(env, auth, "l-1", "b-1", "First");
    await _createList(env, auth, "l-2", "b-1", "Second");
    await _createList(env, auth, "l-3", "b-1", "Third");

    const res = await env.app.inject({
      method: "PUT",
      url: "/api/boards/b-1/lists/reorder",
      headers: auth,
      payload: { listIds: ["l-3", "l-2", "l-1"] },
    });
    expect(res.statusCode).toBe(200);

    const board = JSON.parse((await env.app.inject({ method: "GET", url: "/api/boards/b-1", headers: auth })).body);
    expect(board.lists.map((l: any) => l.name)).toEqual(["Third", "Second", "First"]);
  });

  it("ignores archived lists when reordering", async () => {
    await _createBoard(env, auth);
    await _createList(env, auth, "l-1", "b-1", "First");
    await _createList(env, auth, "l-2", "b-1", "Second");
    await _createList(env, auth, "l-3", "b-1", "Third");
    await env.app.inject({ method: "POST", url: "/api/lists/l-2/archive", headers: auth });

    const res = await env.app.inject({
      method: "PUT",
      url: "/api/boards/b-1/lists/reorder",
      headers: auth,
      payload: { listIds: ["l-3", "l-2", "l-1"] },
    });
    expect(res.statusCode).toBe(200);

    const board = JSON.parse((await env.app.inject({ method: "GET", url: "/api/boards/b-1", headers: auth })).body);
    expect(board.lists.map((l: any) => l.name)).toEqual(["Third", "First"]);
  });
});