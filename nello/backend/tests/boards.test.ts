import { describe, it, expect, beforeEach } from "vitest";
import {
  buildTestApp,
  authHeadersFor,
  type TestApp,
} from "./helpers.js";

async function _createBoard(
  env: TestApp,
  auth: Record<string, string>,
  id = "b-1",
  name = "Test Board",
) {
  return env.app.inject({
    method: "POST",
    url: "/api/boards",
    headers: auth,
    payload: { id, name },
  });
}

describe("CreateBoard", () => {
  let env: TestApp;
  let auth: Record<string, string>;

  beforeEach(async () => {
    env = await buildTestApp();
    auth = await authHeadersFor(env.app, env.db, "test@example.com", "secret123");
  });

  it("creates a board with 201 and echoes name + empty listIds", async () => {
    const res = await _createBoard(env, auth, "board-1", "Work");
    expect(res.statusCode).toBe(201);
    const data = JSON.parse(res.body);
    expect(data.name).toBe("Work");
    expect(data.listIds).toEqual([]);
  });

  it("rejects a whitespace-only name with 422", async () => {
    const res = await _createBoard(env, auth, "board-1", "   ");
    expect(res.statusCode).toBe(422);
  });

  it("rejects creating a board without authentication with 401", async () => {
    const res = await env.app.inject({
      method: "POST",
      url: "/api/boards",
      payload: { id: "board-1", name: "Work" },
    });
    expect(res.statusCode).toBe(401);
  });
});

describe("ListBoards", () => {
  let env: TestApp;
  let auth: Record<string, string>;

  beforeEach(async () => {
    env = await buildTestApp();
    auth = await authHeadersFor(env.app, env.db, "test@example.com", "secret123");
  });

  it("returns boards sorted by name", async () => {
    await _createBoard(env, auth, "b-3", "Zebra");
    await _createBoard(env, auth, "b-1", "Alpha");
    await _createBoard(env, auth, "b-2", "Middle");

    const res = await env.app.inject({ method: "GET", url: "/api/boards", headers: auth });
    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.body);
    expect(data.map((b: any) => b.name)).toEqual(["Alpha", "Middle", "Zebra"]);
  });

  it("returns an empty list when there are no boards", async () => {
    const res = await env.app.inject({ method: "GET", url: "/api/boards", headers: auth });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual([]);
  });

  it("isolates board listing per user", async () => {
    const other = await authHeadersFor(env.app, env.db, "other@example.com", "secret456");
    await _createBoard(env, auth, "b-1", "Mine");
    await _createBoard(env, other, "b-2", "Theirs");

    const res = await env.app.inject({ method: "GET", url: "/api/boards", headers: auth });
    const data = JSON.parse(res.body);
    expect(data).toHaveLength(1);
    expect(data[0].name).toBe("Mine");
  });
});

describe("GetBoard", () => {
  let env: TestApp;
  let auth: Record<string, string>;

  beforeEach(async () => {
    env = await buildTestApp();
    auth = await authHeadersFor(env.app, env.db, "test@example.com", "secret123");
  });

  it("returns the board with its non-archived lists", async () => {
    await _createBoard(env, auth, "board-1", "Work");
    await env.app.inject({ method: "POST", url: "/api/lists", headers: auth, payload: { id: "list-1", boardId: "board-1", name: "Todo" } });
    await env.app.inject({ method: "POST", url: "/api/lists", headers: auth, payload: { id: "list-2", boardId: "board-1", name: "Done" } });

    const res = await env.app.inject({ method: "GET", url: "/api/boards/board-1", headers: auth });
    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.body);
    expect(data.name).toBe("Work");
    expect(data.lists).toHaveLength(2);
    expect(data.lists[0].name).toBe("Todo");
    expect(data.lists[1].name).toBe("Done");
  });

  it("returns 404 for a nonexistent board", async () => {
    const res = await env.app.inject({ method: "GET", url: "/api/boards/nonexistent", headers: auth });
    expect(res.statusCode).toBe(404);
  });

  it("returns 404 for another user's board", async () => {
    const other = await authHeadersFor(env.app, env.db, "other@example.com", "secret456");
    await _createBoard(env, other, "b-1", "Theirs");
    const res = await env.app.inject({ method: "GET", url: "/api/boards/b-1", headers: auth });
    expect(res.statusCode).toBe(404);
  });
});

describe("UpdateBoard", () => {
  let env: TestApp;
  let auth: Record<string, string>;

  beforeEach(async () => {
    env = await buildTestApp();
    auth = await authHeadersFor(env.app, env.db, "test@example.com", "secret123");
  });

  it("renames a board", async () => {
    await _createBoard(env, auth, "board-1", "Work");
    const res = await env.app.inject({
      method: "PATCH",
      url: "/api/boards/board-1",
      headers: auth,
      payload: { name: "Work 2026" },
    });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).name).toBe("Work 2026");
  });

  it("returns 404 when renaming another user's board", async () => {
    const other = await authHeadersFor(env.app, env.db, "other@example.com", "secret456");
    await _createBoard(env, other, "b-1", "Theirs");
    const res = await env.app.inject({
      method: "PATCH",
      url: "/api/boards/b-1",
      headers: auth,
      payload: { name: "Hacked" },
    });
    expect(res.statusCode).toBe(404);
  });
});

describe("DeleteBoard", () => {
  let env: TestApp;
  let auth: Record<string, string>;

  beforeEach(async () => {
    env = await buildTestApp();
    auth = await authHeadersFor(env.app, env.db, "test@example.com", "secret123");
  });

  it("deletes a board and cascades to its lists and cards", async () => {
    await _createBoard(env, auth, "board-1", "Work");
    await env.app.inject({ method: "POST", url: "/api/lists", headers: auth, payload: { id: "list-1", boardId: "board-1", name: "Todo" } });
    await env.app.inject({ method: "POST", url: "/api/cards", headers: auth, payload: { id: "card-1", listId: "list-1", title: "Task" } });

    const res = await env.app.inject({ method: "DELETE", url: "/api/boards/board-1", headers: auth });
    expect(res.statusCode).toBe(204);

    const gone = await env.app.inject({ method: "GET", url: "/api/boards/board-1", headers: auth });
    expect(gone.statusCode).toBe(404);
  });

  it("returns 404 when deleting another user's board", async () => {
    const other = await authHeadersFor(env.app, env.db, "other@example.com", "secret456");
    await _createBoard(env, other, "b-1", "Theirs");
    const res = await env.app.inject({ method: "DELETE", url: "/api/boards/b-1", headers: auth });
    expect(res.statusCode).toBe(404);
  });
});

describe("BoardResponse", () => {
  let env: TestApp;
  let auth: Record<string, string>;

  beforeEach(async () => {
    env = await buildTestApp();
    auth = await authHeadersFor(env.app, env.db, "test@example.com", "secret123");
  });

  it("exposes isShared and isOwner flags (personal vs shared-with-$)", async () => {
    const r1 = await _createBoard(env, auth, "b-1", "Work");
    expect(r1.statusCode).toBe(201);
    const d1 = JSON.parse(r1.body);
    expect(d1.isShared).toBe(false);
    expect(d1.isOwner).toBe(true);

    const r2 = await _createBoard(env, auth, "b-2", "Collab$");
    expect(r2.statusCode).toBe(201);
    const d2 = JSON.parse(r2.body);
    expect(d2.isShared).toBe(true);
    expect(d2.isOwner).toBe(true);
  });

  it("forbids removing the $ suffix from a shared board (409)", async () => {
    await _createBoard(env, auth, "shared-1", "Team$");
    const res = await env.app.inject({
      method: "PATCH",
      url: "/api/boards/shared-1",
      headers: auth,
      payload: { name: "Team" },
    });
    expect(res.statusCode).toBe(409);
  });

  it("allows renaming a shared board while keeping the $ (200)", async () => {
    await _createBoard(env, auth, "shared-1", "Team$");
    const res = await env.app.inject({
      method: "PATCH",
      url: "/api/boards/shared-1",
      headers: auth,
      payload: { name: "New Team$" },
    });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).name).toBe("New Team$");
  });
});
