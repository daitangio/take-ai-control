import { describe, it, expect, vi } from "vitest";
import { buildTestApp, authHeadersFor, registerUser, type TestApp } from "./helpers.js";
import { subscribe, flushBoardEvents, type EventSocket } from "../src/events.js";

function stubSocket() {
  const listeners: Record<string, () => void> = {};
  const socket = {
    on: vi.fn((event: string, cb: () => void) => {
      listeners[event] = cb;
    }),
    write: vi.fn(),
    end: vi.fn(),
    destroyed: false,
  };
  return { socket: socket as unknown as EventSocket, listeners, write: socket.write, end: socket.end };
}

function parseFrame(frame: string) {
  return JSON.parse(frame.replace(/^data: /, "").trim());
}

type Auth = Record<string, string>;

async function createBoard(env: TestApp, auth: Auth, id = "b-1", name = "Test Board") {
  await env.app.inject({ method: "POST", url: "/api/boards", headers: auth, payload: { id, name } });
}

async function createList(env: TestApp, auth: Auth, id = "l-1", boardId = "b-1", name = "Todo") {
  await env.app.inject({ method: "POST", url: "/api/lists", headers: auth, payload: { id, boardId, name } });
}

async function createCard(env: TestApp, auth: Auth, id = "c-1", listId = "l-1", title = "Card") {
  await env.app.inject({ method: "POST", url: "/api/cards", headers: auth, payload: { id, listId, title } });
}

/** Subscribe a stub to a board; flush and assert it received exactly one event for that board. */
function expectOneEvent(boardId: string, userId: string) {
  const stub = stubSocket();
  subscribe(boardId, userId, stub.socket);
  return () => {
    flushBoardEvents();
    expect(stub.write).toHaveBeenCalledTimes(1);
    expect(parseFrame(stub.write.mock.calls[0][0]).boardId).toBe(boardId);
  };
}

describe("emit points — boards", () => {
  it("POST /boards emits for the new board", async () => {
    const env = await buildTestApp();
    const auth = await authHeadersFor(env.app, env.db, "test@example.com", "secret123");
    const assert = expectOneEvent("b-new", "test@example.com");
    await createBoard(env, auth, "b-new");
    assert();
  });

  it("PATCH /boards/:id emits for that board", async () => {
    const env = await buildTestApp();
    const auth = await authHeadersFor(env.app, env.db, "test@example.com", "secret123");
    await createBoard(env, auth);
    flushBoardEvents(); // drain the create emission
    const assert = expectOneEvent("b-1", "test@example.com");
    await env.app.inject({ method: "PATCH", url: "/api/boards/b-1", headers: auth, payload: { name: "Renamed" } });
    assert();
  });

  it("DELETE /boards/:id closes streams instead of emitting", async () => {
    const env = await buildTestApp();
    const auth = await authHeadersFor(env.app, env.db, "test@example.com", "secret123");
    await createBoard(env, auth);
    flushBoardEvents();
    const stub = stubSocket();
    subscribe("b-1", "test@example.com", stub.socket);
    const res = await env.app.inject({ method: "DELETE", url: "/api/boards/b-1", headers: auth });
    expect(res.statusCode).toBe(204);
    expect(stub.end).toHaveBeenCalled();
    flushBoardEvents();
    expect(stub.write).not.toHaveBeenCalled();
  });
});

describe("emit points — lists", () => {
  it("POST /lists emits", async () => {
    const env = await buildTestApp();
    const auth = await authHeadersFor(env.app, env.db, "test@example.com", "secret123");
    await createBoard(env, auth);
    flushBoardEvents();
    const assert = expectOneEvent("b-1", "test@example.com");
    await createList(env, auth);
    assert();
  });

  it("PATCH /lists/:id emits", async () => {
    const env = await buildTestApp();
    const auth = await authHeadersFor(env.app, env.db, "test@example.com", "secret123");
    await createBoard(env, auth);
    await createList(env, auth);
    flushBoardEvents();
    const assert = expectOneEvent("b-1", "test@example.com");
    await env.app.inject({ method: "PATCH", url: "/api/lists/l-1", headers: auth, payload: { name: "Backlog" } });
    assert();
  });

  it("DELETE /lists/:id emits", async () => {
    const env = await buildTestApp();
    const auth = await authHeadersFor(env.app, env.db, "test@example.com", "secret123");
    await createBoard(env, auth);
    await createList(env, auth);
    flushBoardEvents();
    const assert = expectOneEvent("b-1", "test@example.com");
    await env.app.inject({ method: "DELETE", url: "/api/lists/l-1", headers: auth });
    assert();
  });

  it("POST /lists/:id/delete-all emits", async () => {
    const env = await buildTestApp();
    const auth = await authHeadersFor(env.app, env.db, "test@example.com", "secret123");
    await createBoard(env, auth);
    await createList(env, auth);
    await createCard(env, auth);
    flushBoardEvents();
    const assert = expectOneEvent("b-1", "test@example.com");
    await env.app.inject({ method: "POST", url: "/api/lists/l-1/delete-all", headers: auth });
    assert();
  });

  it("PUT /boards/:boardId/lists/reorder emits", async () => {
    const env = await buildTestApp();
    const auth = await authHeadersFor(env.app, env.db, "test@example.com", "secret123");
    await createBoard(env, auth);
    await createList(env, auth, "l-1");
    await createList(env, auth, "l-2");
    flushBoardEvents();
    const assert = expectOneEvent("b-1", "test@example.com");
    await env.app.inject({
      method: "PUT",
      url: "/api/boards/b-1/lists/reorder",
      headers: auth,
      payload: { listIds: ["l-2", "l-1"] },
    });
    assert();
  });
});

describe("emit points — cards", () => {
  async function setup(env: TestApp, auth: Auth) {
    await createBoard(env, auth);
    await createList(env, auth);
    await createCard(env, auth);
    flushBoardEvents();
  }

  it("POST /cards emits", async () => {
    const env = await buildTestApp();
    const auth = await authHeadersFor(env.app, env.db, "test@example.com", "secret123");
    await createBoard(env, auth);
    await createList(env, auth);
    flushBoardEvents();
    const assert = expectOneEvent("b-1", "test@example.com");
    await createCard(env, auth);
    assert();
  });

  it("PATCH /cards/:id emits", async () => {
    const env = await buildTestApp();
    const auth = await authHeadersFor(env.app, env.db, "test@example.com", "secret123");
    await setup(env, auth);
    const assert = expectOneEvent("b-1", "test@example.com");
    await env.app.inject({ method: "PATCH", url: "/api/cards/c-1", headers: auth, payload: { title: "New" } });
    assert();
  });

  it("DELETE /cards/:id emits", async () => {
    const env = await buildTestApp();
    const auth = await authHeadersFor(env.app, env.db, "test@example.com", "secret123");
    await setup(env, auth);
    const assert = expectOneEvent("b-1", "test@example.com");
    await env.app.inject({ method: "DELETE", url: "/api/cards/c-1", headers: auth });
    assert();
  });

  it("POST /cards/:id/archive emits", async () => {
    const env = await buildTestApp();
    const auth = await authHeadersFor(env.app, env.db, "test@example.com", "secret123");
    await setup(env, auth);
    const assert = expectOneEvent("b-1", "test@example.com");
    await env.app.inject({ method: "POST", url: "/api/cards/c-1/archive", headers: auth });
    assert();
  });

  it("POST /cards/:id/unarchive emits", async () => {
    const env = await buildTestApp();
    const auth = await authHeadersFor(env.app, env.db, "test@example.com", "secret123");
    await setup(env, auth);
    await env.app.inject({ method: "POST", url: "/api/cards/c-1/archive", headers: auth });
    flushBoardEvents();
    const assert = expectOneEvent("b-1", "test@example.com");
    await env.app.inject({ method: "POST", url: "/api/cards/c-1/unarchive", headers: auth, payload: { targetListId: "l-1" } });
    assert();
  });

  it("POST /cards/:id/members emits", async () => {
    const env = await buildTestApp();
    const auth = await authHeadersFor(env.app, env.db, "test@example.com", "secret123");
    await setup(env, auth);
    const assert = expectOneEvent("b-1", "test@example.com");
    await env.app.inject({
      method: "POST",
      url: "/api/cards/c-1/members",
      headers: auth,
      payload: { userId: "test@example.com" },
    });
    assert();
  });

  it("DELETE /cards/:id/members/:memberId emits", async () => {
    const env = await buildTestApp();
    const auth = await authHeadersFor(env.app, env.db, "test@example.com", "secret123");
    await setup(env, auth);
    await env.app.inject({
      method: "POST",
      url: "/api/cards/c-1/members",
      headers: auth,
      payload: { userId: "test@example.com" },
    });
    flushBoardEvents();
    const assert = expectOneEvent("b-1", "test@example.com");
    await env.app.inject({ method: "DELETE", url: "/api/cards/c-1/members/test@example.com", headers: auth });
    assert();
  });

  it("PUT /cards/:id/move emits for both boards on a cross-board move", async () => {
    const env = await buildTestApp();
    const auth = await authHeadersFor(env.app, env.db, "test@example.com", "secret123");
    await setup(env, auth);
    await createBoard(env, auth, "b-2");
    await createList(env, auth, "l-2", "b-2");
    flushBoardEvents();
    const assertFrom = expectOneEvent("b-1", "test@example.com");
    const assertTo = expectOneEvent("b-2", "test@example.com");
    await env.app.inject({
      method: "PUT",
      url: "/api/cards/c-1/move",
      headers: auth,
      payload: { toListId: "l-2", index: 0 },
    });
    assertFrom();
    assertTo();
  });
});

describe("emit points — members", () => {
  async function sharedSetup(env: TestApp, auth: Auth, memberEmail: string) {
    await createBoard(env, auth, "b-1", "Shared$");
    await registerUser(env.db, memberEmail, "secret456");
    await env.app.inject({
      method: "POST",
      url: "/api/boards/b-1/members",
      headers: auth,
      payload: { email: memberEmail },
    });
    flushBoardEvents();
  }

  it("POST /boards/:id/members emits", async () => {
    const env = await buildTestApp();
    const auth = await authHeadersFor(env.app, env.db, "test@example.com", "secret123");
    await createBoard(env, auth, "b-1", "Shared$");
    await registerUser(env.db, "member@example.com", "secret456");
    flushBoardEvents();
    const assert = expectOneEvent("b-1", "test@example.com");
    await env.app.inject({
      method: "POST",
      url: "/api/boards/b-1/members",
      headers: auth,
      payload: { email: "member@example.com" },
    });
    assert();
  });

  it("DELETE /boards/:id/members/:memberId emits and closes the removed member's stream", async () => {
    const env = await buildTestApp();
    const auth = await authHeadersFor(env.app, env.db, "test@example.com", "secret123");
    await sharedSetup(env, auth, "member-a@example.com");
    await registerUser(env.db, "member-b@example.com", "secret789");
    await env.app.inject({
      method: "POST",
      url: "/api/boards/b-1/members",
      headers: auth,
      payload: { email: "member-b@example.com" },
    });
    flushBoardEvents();

    const removedStub = stubSocket();
    const otherStub = stubSocket();
    subscribe("b-1", "member-a@example.com", removedStub.socket);
    subscribe("b-1", "member-b@example.com", otherStub.socket);

    const res = await env.app.inject({
      method: "DELETE",
      url: "/api/boards/b-1/members/member-a@example.com",
      headers: auth,
    });
    expect(res.statusCode).toBe(204);
    expect(removedStub.end).toHaveBeenCalled();
    expect(otherStub.end).not.toHaveBeenCalled();
    flushBoardEvents();
    expect(removedStub.write).not.toHaveBeenCalled();
    expect(otherStub.write).toHaveBeenCalledTimes(1);
  });
});
