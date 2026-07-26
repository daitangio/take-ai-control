import { describe, it, expect, beforeEach } from "vitest";
import {
  buildTestApp,
  authHeadersFor,
  registerUser,
  raw,
  userIdByEmail,
  type TestApp,
} from "./helpers.js";

async function _setupBoardAndList(env: TestApp, auth: Record<string, string>) {
  await env.app.inject({ method: "POST", url: "/api/boards", headers: auth, payload: { id: "b-1", name: "Work" } });
  await env.app.inject({ method: "POST", url: "/api/lists", headers: auth, payload: { id: "l-1", boardId: "b-1", name: "Todo" } });
  await env.app.inject({ method: "POST", url: "/api/lists", headers: auth, payload: { id: "l-2", boardId: "b-1", name: "Done" } });
}

const asJson = (res: any) => JSON.parse(res.body);

describe("CreateCard", () => {
  let env: TestApp;
  let auth: Record<string, string>;

  beforeEach(async () => {
    env = await buildTestApp();
    auth = await authHeadersFor(env.app, env.db, "test@example.com", "secret123");
  });

  it("creates a card with 201 and default fields", async () => {
    await _setupBoardAndList(env, auth);
    const res = await env.app.inject({
      method: "POST",
      url: "/api/cards",
      headers: auth,
      payload: { id: "card-1", listId: "l-1", title: "Write specs" },
    });
    expect(res.statusCode).toBe(201);
    const data = asJson(res);
    expect(data.title).toBe("Write specs");
    expect(data.description).toBe("");
    expect(data.dueDate).toBeNull();
    expect(data.members).toEqual([]);
    expect(data.listId).toBe("l-1");
  });

  it("rejects a whitespace-only title with 422", async () => {
    await _setupBoardAndList(env, auth);
    const res = await env.app.inject({
      method: "POST",
      url: "/api/cards",
      headers: auth,
      payload: { id: "card-1", listId: "l-1", title: "   " },
    });
    expect(res.statusCode).toBe(422);
  });

  it("returns 404 when creating a card in another user's list", async () => {
    const other = await authHeadersFor(env.app, env.db, "other@example.com", "secret456");
    await _setupBoardAndList(env, other);
    const res = await env.app.inject({
      method: "POST",
      url: "/api/cards",
      headers: auth,
      payload: { id: "card-1", listId: "l-1", title: "Nope" },
    });
    expect(res.statusCode).toBe(404);
  });
});

describe("UpdateCard", () => {
  let env: TestApp;
  let auth: Record<string, string>;

  beforeEach(async () => {
    env = await buildTestApp();
    auth = await authHeadersFor(env.app, env.db, "test@example.com", "secret123");
  });

  it("edits title and description", async () => {
    await _setupBoardAndList(env, auth);
    await env.app.inject({ method: "POST", url: "/api/cards", headers: auth, payload: { id: "card-1", listId: "l-1", title: "Write specs" } });

    const res = await env.app.inject({
      method: "PATCH",
      url: "/api/cards/card-1",
      headers: auth,
      payload: { title: "Write delta specs", description: "Focus on edge cases" },
    });
    expect(res.statusCode).toBe(200);
    const data = asJson(res);
    expect(data.title).toBe("Write delta specs");
    expect(data.description).toBe("Focus on edge cases");
  });

  it("sets a due date", async () => {
    await _setupBoardAndList(env, auth);
    await env.app.inject({ method: "POST", url: "/api/cards", headers: auth, payload: { id: "card-1", listId: "l-1", title: "Task" } });
    const res = await env.app.inject({
      method: "PATCH",
      url: "/api/cards/card-1",
      headers: auth,
      payload: { title: "Task", description: "", dueDate: "2026-08-15" },
    });
    expect(res.statusCode).toBe(200);
    expect(asJson(res).dueDate).toBe("2026-08-15");
  });

  it("clears a due date by sending null", async () => {
    await _setupBoardAndList(env, auth);
    await env.app.inject({ method: "POST", url: "/api/cards", headers: auth, payload: { id: "card-1", listId: "l-1", title: "Task" } });
    await env.app.inject({ method: "PATCH", url: "/api/cards/card-1", headers: auth, payload: { title: "Task", description: "", dueDate: "2026-08-15" } });

    const res = await env.app.inject({
      method: "PATCH",
      url: "/api/cards/card-1",
      headers: auth,
      payload: { title: "Task", description: "", dueDate: null },
    });
    expect(res.statusCode).toBe(200);
    expect(asJson(res).dueDate).toBeNull();
  });

  it("preserves the existing due date when the field is omitted", async () => {
    await _setupBoardAndList(env, auth);
    await env.app.inject({ method: "POST", url: "/api/cards", headers: auth, payload: { id: "card-1", listId: "l-1", title: "Task" } });
    await env.app.inject({ method: "PATCH", url: "/api/cards/card-1", headers: auth, payload: { title: "Task", description: "", dueDate: "2026-08-15" } });

    const res = await env.app.inject({
      method: "PATCH",
      url: "/api/cards/card-1",
      headers: auth,
      payload: { title: "Task renamed", description: "Still due" },
    });
    expect(res.statusCode).toBe(200);
    expect(asJson(res).dueDate).toBe("2026-08-15");
  });

  it("rejects a whitespace-only title with 422", async () => {
    await _setupBoardAndList(env, auth);
    await env.app.inject({ method: "POST", url: "/api/cards", headers: auth, payload: { id: "card-1", listId: "l-1", title: "Task" } });
    const res = await env.app.inject({
      method: "PATCH",
      url: "/api/cards/card-1",
      headers: auth,
      payload: { title: "   " },
    });
    expect(res.statusCode).toBe(422);
  });
});

describe("DeleteCard", () => {
  let env: TestApp;
  let auth: Record<string, string>;

  beforeEach(async () => {
    env = await buildTestApp();
    auth = await authHeadersFor(env.app, env.db, "test@example.com", "secret123");
  });

  it("deletes a card and it disappears from the list", async () => {
    await _setupBoardAndList(env, auth);
    await env.app.inject({ method: "POST", url: "/api/cards", headers: auth, payload: { id: "card-1", listId: "l-1", title: "Task" } });

    const res = await env.app.inject({ method: "DELETE", url: "/api/cards/card-1", headers: auth });
    expect(res.statusCode).toBe(204);

    const board = asJson(await env.app.inject({ method: "GET", url: "/api/boards/b-1", headers: auth }));
    expect(board.lists[0].cards).toEqual([]);
  });
});

describe("ArchiveCard", () => {
  let env: TestApp;
  let auth: Record<string, string>;

  beforeEach(async () => {
    env = await buildTestApp();
    auth = await authHeadersFor(env.app, env.db, "test@example.com", "secret123");
  });

  it("hides a card without deleting rows and preserves members + metadata", async () => {
    await _setupBoardAndList(env, auth);
    await env.app.inject({ method: "POST", url: "/api/cards", headers: auth, payload: { id: "card-1", listId: "l-1", title: "Task" } });
    await env.app.inject({
      method: "PATCH",
      url: "/api/cards/card-1",
      headers: auth,
      payload: { title: "Task", description: "Keep me", dueDate: "2026-08-15" },
    });
    const ownerId = await userIdByEmail(env.db, "test@example.com");
    await env.app.inject({ method: "POST", url: "/api/cards/card-1/members", headers: auth, payload: { userId: ownerId } });

    const res = await env.app.inject({ method: "POST", url: "/api/cards/card-1/archive", headers: auth });
    expect(res.statusCode).toBe(204);

    const board = asJson(await env.app.inject({ method: "GET", url: "/api/boards/b-1", headers: auth }));
    expect(board.lists[0].cards).toEqual([]);

    const card = await raw(env.db, "SELECT title, description, due_date FROM card WHERE id = ?", ["card-1"]);
    expect(card[0].title).toBe("Task");
    expect(card[0].description).toBe("Keep me");
    expect(card[0].due_date).toBe("2026-08-15");

    const cm = await raw(env.db, "SELECT card_id FROM card_member WHERE card_id = ?", ["card-1"]);
    expect(cm).toHaveLength(1);
  });

  it("archiving a card is idempotent (one card_archive row)", async () => {
    await _setupBoardAndList(env, auth);
    await env.app.inject({ method: "POST", url: "/api/cards", headers: auth, payload: { id: "card-1", listId: "l-1", title: "Task" } });

    expect((await env.app.inject({ method: "POST", url: "/api/cards/card-1/archive", headers: auth })).statusCode).toBe(204);
    expect((await env.app.inject({ method: "POST", url: "/api/cards/card-1/archive", headers: auth })).statusCode).toBe(204);

    const rows = await raw(env.db, "SELECT COUNT(*) AS count FROM card_archive WHERE card_id = ?", ["card-1"]);
    expect(Number(rows[0].count)).toBe(1);
  });

  it("returns 404 when archiving another user's card", async () => {
    const other = await authHeadersFor(env.app, env.db, "other@example.com", "secret456");
    await _setupBoardAndList(env, other);
    await env.app.inject({ method: "POST", url: "/api/cards", headers: other, payload: { id: "card-1", listId: "l-1", title: "Task" } });

    const res = await env.app.inject({ method: "POST", url: "/api/cards/card-1/archive", headers: auth });
    expect(res.statusCode).toBe(404);
  });
});

describe("CardMembers", () => {
  let env: TestApp;
  let auth: Record<string, string>;

  beforeEach(async () => {
    env = await buildTestApp();
    auth = await authHeadersFor(env.app, env.db, "test@example.com", "secret123");
  });

  it("assigns multiple members and dedups duplicates to distinct rows", async () => {
    await env.app.inject({ method: "POST", url: "/api/boards", headers: auth, payload: { id: "shared-1", name: "Team$" } });
    await env.app.inject({ method: "POST", url: "/api/lists", headers: auth, payload: { id: "l-1", boardId: "shared-1", name: "Todo" } });
    await env.app.inject({ method: "POST", url: "/api/cards", headers: auth, payload: { id: "card-1", listId: "l-1", title: "Task" } });
    await registerUser(env.db, "other@example.com", "secret456");
    const otherId = asJson(await env.app.inject({ method: "POST", url: "/api/boards/shared-1/members", headers: auth, payload: { email: "other@example.com" } })).id;
    await registerUser(env.db, "third@example.com", "secret789");
    const thirdId = asJson(await env.app.inject({ method: "POST", url: "/api/boards/shared-1/members", headers: auth, payload: { email: "third@example.com" } })).id;

    const r1 = await env.app.inject({ method: "POST", url: "/api/cards/card-1/members", headers: auth, payload: { userId: otherId } });
    const r2 = await env.app.inject({ method: "POST", url: "/api/cards/card-1/members", headers: auth, payload: { userId: thirdId } });
    const dup = await env.app.inject({ method: "POST", url: "/api/cards/card-1/members", headers: auth, payload: { userId: otherId } });

    expect(r1.statusCode).toBe(201);
    expect(r2.statusCode).toBe(201);
    expect(dup.statusCode).toBe(201);

    const members = asJson(await env.app.inject({ method: "GET", url: "/api/cards/card-1/members", headers: auth }));
    expect(members.map((m: any) => m.email)).toEqual(["other@example.com", "third@example.com"]);

    const count = await raw(env.db, "SELECT COUNT(*) AS count FROM card_member WHERE card_id = ?", ["card-1"]);
    expect(Number(count[0].count)).toBe(2);

    const boardCard = asJson(await env.app.inject({ method: "GET", url: "/api/boards/shared-1", headers: auth })).lists[0].cards[0];
    expect(boardCard.members.map((m: any) => m.email)).toEqual(["other@example.com", "third@example.com"]);
  });

  it("member-options include the owner and board members", async () => {
    await env.app.inject({ method: "POST", url: "/api/boards", headers: auth, payload: { id: "shared-1", name: "Team$" } });
    await env.app.inject({ method: "POST", url: "/api/lists", headers: auth, payload: { id: "l-1", boardId: "shared-1", name: "Todo" } });
    await env.app.inject({ method: "POST", url: "/api/cards", headers: auth, payload: { id: "card-1", listId: "l-1", title: "Task" } });
    await registerUser(env.db, "other@example.com", "secret456");
    await env.app.inject({ method: "POST", url: "/api/boards/shared-1/members", headers: auth, payload: { email: "other@example.com" } });

    const res = await env.app.inject({ method: "GET", url: "/api/cards/card-1/member-options", headers: auth });
    expect(res.statusCode).toBe(200);
    expect(asJson(res).map((m: any) => m.email)).toEqual(["other@example.com", "test@example.com"]);
  });

  it("rejects assignment for a user outside the board with 409", async () => {
    await _setupBoardAndList(env, auth);
    await env.app.inject({ method: "POST", url: "/api/cards", headers: auth, payload: { id: "card-1", listId: "l-1", title: "Task" } });
    await registerUser(env.db, "outsider@example.com", "secret789");
    const outsiderId = (await raw(env.db, "SELECT id FROM user WHERE email = ?", ["outsider@example.com"]))[0].id as string;

    const res = await env.app.inject({ method: "POST", url: "/api/cards/card-1/members", headers: auth, payload: { userId: outsiderId } });
    expect(res.statusCode).toBe(409);
    expect(asJson(await env.app.inject({ method: "GET", url: "/api/cards/card-1/members", headers: auth }))).toEqual([]);
  });

  it("removes a card member", async () => {
    await _setupBoardAndList(env, auth);
    await env.app.inject({ method: "POST", url: "/api/cards", headers: auth, payload: { id: "card-1", listId: "l-1", title: "Task" } });
    const ownerId = await userIdByEmail(env.db, "test@example.com");
    await env.app.inject({ method: "POST", url: "/api/cards/card-1/members", headers: auth, payload: { userId: ownerId } });

    const res = await env.app.inject({ method: "DELETE", url: `/api/cards/card-1/members/${ownerId}`, headers: auth });
    expect(res.statusCode).toBe(204);
    expect(asJson(await env.app.inject({ method: "GET", url: "/api/cards/card-1/members", headers: auth }))).toEqual([]);
  });
});

describe("MoveCard", () => {
  let env: TestApp;
  let auth: Record<string, string>;

  beforeEach(async () => {
    env = await buildTestApp();
    auth = await authHeadersFor(env.app, env.db, "test@example.com", "secret123");
  });

  it("reorders within the same list at the given index", async () => {
    await _setupBoardAndList(env, auth);
    await env.app.inject({ method: "POST", url: "/api/cards", headers: auth, payload: { id: "c-1", listId: "l-1", title: "First" } });
    await env.app.inject({ method: "POST", url: "/api/cards", headers: auth, payload: { id: "c-2", listId: "l-1", title: "Second" } });
    await env.app.inject({ method: "POST", url: "/api/cards", headers: auth, payload: { id: "c-3", listId: "l-1", title: "Third" } });

    const res = await env.app.inject({
      method: "PUT",
      url: "/api/cards/c-3/move",
      headers: auth,
      payload: { toListId: "l-1", index: 0 },
    });
    expect(res.statusCode).toBe(200);

    const board = asJson(await env.app.inject({ method: "GET", url: "/api/boards/b-1", headers: auth }));
    expect(board.lists[0].cards.map((c: any) => c.id)).toEqual(["c-3", "c-1", "c-2"]);
  });

  it("moves a card across lists", async () => {
    await _setupBoardAndList(env, auth);
    await env.app.inject({ method: "POST", url: "/api/cards", headers: auth, payload: { id: "c-1", listId: "l-1", title: "Moving" } });

    const res = await env.app.inject({
      method: "PUT",
      url: "/api/cards/c-1/move",
      headers: auth,
      payload: { toListId: "l-2", index: 0 },
    });
    expect(res.statusCode).toBe(200);

    const board = asJson(await env.app.inject({ method: "GET", url: "/api/boards/b-1", headers: auth }));
    expect(board.lists[0].cards).toEqual([]);
    expect(board.lists[1].cards.map((c: any) => c.id)).toEqual(["c-1"]);
  });

  it("moves a card to an empty list", async () => {
    await _setupBoardAndList(env, auth);
    await env.app.inject({ method: "POST", url: "/api/cards", headers: auth, payload: { id: "c-1", listId: "l-1", title: "Move me" } });

    const res = await env.app.inject({
      method: "PUT",
      url: "/api/cards/c-1/move",
      headers: auth,
      payload: { toListId: "l-2", index: 0 },
    });
    expect(res.statusCode).toBe(200);

    const board = asJson(await env.app.inject({ method: "GET", url: "/api/boards/b-1", headers: auth }));
    expect(board.lists[1].cards.map((c: any) => c.id)).toEqual(["c-1"]);
  });
});

describe("EditorMetadata", () => {
  let env: TestApp;
  let auth: Record<string, string>;

  beforeEach(async () => {
    env = await buildTestApp();
    auth = await authHeadersFor(env.app, env.db, "test@example.com", "secret123");
  });

  it("card created by current user: isModifiedByCurrentUser=true, no email exposed", async () => {
    await _setupBoardAndList(env, auth);
    const res = await env.app.inject({
      method: "POST",
      url: "/api/cards",
      headers: auth,
      payload: { id: "card-1", listId: "l-1", title: "My card" },
    });
    expect(res.statusCode).toBe(201);
    const data = asJson(res);
    expect(data.isModifiedByCurrentUser).toBe(true);
    expect(data.modifiedByEmail).toBeNull();
  });

  it("board detail: card edited by requester shows isModifiedByCurrentUser=true + email", async () => {
    await _setupBoardAndList(env, auth);
    await env.app.inject({ method: "POST", url: "/api/cards", headers: auth, payload: { id: "card-1", listId: "l-1", title: "My card" } });
    const board = asJson(await env.app.inject({ method: "GET", url: "/api/boards/b-1", headers: auth }));
    const card = board.lists[0].cards[0];
    expect(card.isModifiedByCurrentUser).toBe(true);
    expect(card.modifiedByEmail).toBe("test@example.com");
  });

  it("board detail: card edited by another user shows their email", async () => {
    const other = await authHeadersFor(env.app, env.db, "other@example.com", "secret456");
    await env.app.inject({ method: "POST", url: "/api/boards", headers: auth, payload: { id: "b-shared", name: "Shared$" } });
    await env.app.inject({ method: "POST", url: "/api/lists", headers: auth, payload: { id: "ls-1", boardId: "b-shared", name: "Todo" } });
    await env.app.inject({ method: "POST", url: "/api/boards/b-shared/members", headers: auth, payload: { email: "other@example.com" } });
    await env.app.inject({ method: "POST", url: "/api/cards", headers: other, payload: { id: "card-other", listId: "ls-1", title: "Their card" } });

    const board = asJson(await env.app.inject({ method: "GET", url: "/api/boards/b-shared", headers: auth }));
    const card = board.lists[0].cards[0];
    expect(card.isModifiedByCurrentUser).toBe(false);
    expect(card.modifiedByEmail).toBe("other@example.com");
  });

  it("legacy card with null modified_by exposes no editor metadata", async () => {
    await _setupBoardAndList(env, auth);
    await raw(env.db, "INSERT INTO card (id, list_id, title, position) VALUES (?, ?, ?, ?)", ["legacy-1", "l-1", "Old card", 0]);

    const board = asJson(await env.app.inject({ method: "GET", url: "/api/boards/b-1", headers: auth }));
    const card = board.lists[0].cards.find((c: any) => c.id === "legacy-1");
    expect(card.isModifiedByCurrentUser).toBeNull();
    expect(card.modifiedByEmail).toBeNull();
  });
});