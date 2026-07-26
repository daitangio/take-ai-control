import { describe, it, expect, beforeEach } from "vitest";
import {
  buildTestApp,
  authHeadersFor,
  registerUser,
  raw,
  type TestApp,
} from "./helpers.js";

const asJson = (res: any) => JSON.parse(res.body);

async function _createSharedBoard(env: TestApp, auth: Record<string, string>, id = "shared-1", name = "Team$") {
  await env.app.inject({ method: "POST", url: "/api/boards", headers: auth, payload: { id, name } });
}

async function _createPersonalBoard(env: TestApp, auth: Record<string, string>, id = "personal-1", name = "Personal") {
  await env.app.inject({ method: "POST", url: "/api/boards", headers: auth, payload: { id, name } });
}

describe("AddMember", () => {
  let env: TestApp;
  let auth: Record<string, string>;
  let other: Record<string, string>;

  beforeEach(async () => {
    env = await buildTestApp();
    auth = await authHeadersFor(env.app, env.db, "test@example.com", "secret123");
    other = await authHeadersFor(env.app, env.db, "other@example.com", "secret456");
  });

  it("adds a member with 201 and returns their email + id", async () => {
    await _createSharedBoard(env, auth);
    const res = await env.app.inject({
      method: "POST",
      url: "/api/boards/shared-1/members",
      headers: auth,
      payload: { email: "other@example.com" },
    });
    expect(res.statusCode).toBe(201);
    const data = asJson(res);
    expect(data.email).toBe("other@example.com");
    expect(data.id).toBeTruthy();
  });

  it("rejects adding a member to a non-shared (personal) board with 409", async () => {
    await _createPersonalBoard(env, auth);
    const res = await env.app.inject({
      method: "POST",
      url: "/api/boards/personal-1/members",
      headers: auth,
      payload: { email: "other@example.com" },
    });
    expect(res.statusCode).toBe(409);
  });

  it("rejects adding a nonexistent user with 404", async () => {
    await _createSharedBoard(env, auth);
    const res = await env.app.inject({
      method: "POST",
      url: "/api/boards/shared-1/members",
      headers: auth,
      payload: { email: "ghost@example.com" },
    });
    expect(res.statusCode).toBe(404);
  });

  it("rejects adding yourself as a member with 409", async () => {
    await _createSharedBoard(env, auth);
    const res = await env.app.inject({
      method: "POST",
      url: "/api/boards/shared-1/members",
      headers: auth,
      payload: { email: "test@example.com" },
    });
    expect(res.statusCode).toBe(409);
  });

  it("rejects a duplicate member with 409", async () => {
    await _createSharedBoard(env, auth);
    await env.app.inject({ method: "POST", url: "/api/boards/shared-1/members", headers: auth, payload: { email: "other@example.com" } });
    const res = await env.app.inject({ method: "POST", url: "/api/boards/shared-1/members", headers: auth, payload: { email: "other@example.com" } });
    expect(res.statusCode).toBe(409);
  });

  it("non-owner member cannot add a member (403); non-member gets 404", async () => {
    await _createSharedBoard(env, auth);
    await env.app.inject({ method: "POST", url: "/api/boards/shared-1/members", headers: auth, payload: { email: "other@example.com" } });

    // Register a third user.
    await registerUser(env.db, "third@example.com", "secret789");
    const thirdToken = asJson(await env.app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "third@example.com", password: "secret789" },
    })).access_token;
    const thirdHeaders = { Authorization: `Bearer ${thirdToken}` };

    // Third user is not a member at all → board invisible → 404.
    const r3 = await env.app.inject({ method: "POST", url: "/api/boards/shared-1/members", headers: thirdHeaders, payload: { email: "third@example.com" } });
    expect(r3.statusCode).toBe(404);

    // Other user is a member but not the owner → 403.
    const rMember = await env.app.inject({ method: "POST", url: "/api/boards/shared-1/members", headers: other, payload: { email: "third@example.com" } });
    expect(rMember.statusCode).toBe(403);
  });
});

describe("RemoveMember", () => {
  let env: TestApp;
  let auth: Record<string, string>;
  let other: Record<string, string>;

  beforeEach(async () => {
    env = await buildTestApp();
    auth = await authHeadersFor(env.app, env.db, "test@example.com", "secret123");
    other = await authHeadersFor(env.app, env.db, "other@example.com", "secret456");
  });

  it("removes a member with 204", async () => {
    await _createSharedBoard(env, auth);
    const add = await env.app.inject({ method: "POST", url: "/api/boards/shared-1/members", headers: auth, payload: { email: "other@example.com" } });
    const memberId = asJson(add).id;

    const res = await env.app.inject({ method: "DELETE", url: `/api/boards/shared-1/members/${memberId}`, headers: auth });
    expect(res.statusCode).toBe(204);
  });

  it("removing a member clears their card assignments", async () => {
    await _createSharedBoard(env, auth);
    const add = await env.app.inject({ method: "POST", url: "/api/boards/shared-1/members", headers: auth, payload: { email: "other@example.com" } });
    const memberId = asJson(add).id;
    await env.app.inject({ method: "POST", url: "/api/lists", headers: auth, payload: { id: "l-1", boardId: "shared-1", name: "Todo" } });
    await env.app.inject({ method: "POST", url: "/api/cards", headers: auth, payload: { id: "c-1", listId: "l-1", title: "Task" } });
    await env.app.inject({ method: "POST", url: "/api/cards/c-1/members", headers: auth, payload: { userId: memberId } });

    const res = await env.app.inject({ method: "DELETE", url: `/api/boards/shared-1/members/${memberId}`, headers: auth });
    expect(res.statusCode).toBe(204);

    const count = await raw(env.db, "SELECT COUNT(*) AS count FROM card_member WHERE card_id = ?", ["c-1"]);
    expect(Number(count[0].count)).toBe(0);
  });

  it("removing a nonexistent member returns 404", async () => {
    await _createSharedBoard(env, auth);
    const res = await env.app.inject({ method: "DELETE", url: "/api/boards/shared-1/members/nonexistent-id", headers: auth });
    expect(res.statusCode).toBe(404);
  });

  it("non-owner member cannot remove a member (403)", async () => {
    await _createSharedBoard(env, auth);
    const add = await env.app.inject({ method: "POST", url: "/api/boards/shared-1/members", headers: auth, payload: { email: "other@example.com" } });
    const memberId = asJson(add).id;

    const res = await env.app.inject({ method: "DELETE", url: `/api/boards/shared-1/members/${memberId}`, headers: other });
    expect(res.statusCode).toBe(403);
  });
});

describe("ListMembers", () => {
  let env: TestApp;
  let auth: Record<string, string>;
  let other: Record<string, string>;

  beforeEach(async () => {
    env = await buildTestApp();
    auth = await authHeadersFor(env.app, env.db, "test@example.com", "secret123");
    other = await authHeadersFor(env.app, env.db, "other@example.com", "secret456");
  });

  it("lists board members", async () => {
    await _createSharedBoard(env, auth);
    await env.app.inject({ method: "POST", url: "/api/boards/shared-1/members", headers: auth, payload: { email: "other@example.com" } });

    const res = await env.app.inject({ method: "GET", url: "/api/boards/shared-1/members", headers: auth });
    expect(res.statusCode).toBe(200);
    const data = asJson(res);
    expect(data).toHaveLength(1);
    expect(data[0].email).toBe("other@example.com");
  });

  it("lists no members for a board with none", async () => {
    await _createSharedBoard(env, auth);
    const res = await env.app.inject({ method: "GET", url: "/api/boards/shared-1/members", headers: auth });
    expect(res.statusCode).toBe(200);
    expect(asJson(res)).toEqual([]);
  });

  it("non-member cannot list members (404)", async () => {
    await _createSharedBoard(env, auth);
    const res = await env.app.inject({ method: "GET", url: "/api/boards/shared-1/members", headers: other });
    expect(res.statusCode).toBe(404);
  });
});

describe("SharedBoardAccess", () => {
  let env: TestApp;
  let auth: Record<string, string>;
  let other: Record<string, string>;

  beforeEach(async () => {
    env = await buildTestApp();
    auth = await authHeadersFor(env.app, env.db, "test@example.com", "secret123");
    other = await authHeadersFor(env.app, env.db, "other@example.com", "secret456");
  });

  it("shared board appears in the member's listing with isShared/isOwner flags", async () => {
    await _createSharedBoard(env, auth);
    await env.app.inject({ method: "POST", url: "/api/boards/shared-1/members", headers: auth, payload: { email: "other@example.com" } });

    const res = await env.app.inject({ method: "GET", url: "/api/boards", headers: other });
    expect(res.statusCode).toBe(200);
    const data = asJson(res);
    expect(data).toHaveLength(1);
    expect(data[0].name).toBe("Team$");
    expect(data[0].isShared).toBe(true);
    expect(data[0].isOwner).toBe(false);
  });

  it("a non-owner member cannot delete the shared board (403)", async () => {
    await _createSharedBoard(env, auth);
    await env.app.inject({ method: "POST", url: "/api/boards/shared-1/members", headers: auth, payload: { email: "other@example.com" } });

    const res = await env.app.inject({ method: "DELETE", url: "/api/boards/shared-1", headers: other });
    expect(res.statusCode).toBe(403);
  });

  it("a non-owner member can CRUD cards on a shared board", async () => {
    await _createSharedBoard(env, auth);
    await env.app.inject({ method: "POST", url: "/api/boards/shared-1/members", headers: auth, payload: { email: "other@example.com" } });
    await env.app.inject({ method: "POST", url: "/api/lists", headers: auth, payload: { id: "l-1", boardId: "shared-1", name: "Todo" } });

    const res = await env.app.inject({
      method: "POST",
      url: "/api/cards",
      headers: other,
      payload: { id: "c-1", listId: "l-1", title: "Shared task" },
    });
    expect(res.statusCode).toBe(201);
    expect(asJson(res).modifiedBy).not.toBeNull();

    const detail = await env.app.inject({ method: "GET", url: "/api/boards/shared-1", headers: other });
    expect(detail.statusCode).toBe(200);
    expect(asJson(detail).name).toBe("Team$");
  });
});