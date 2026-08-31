import { beforeEach, describe, expect, it } from "vitest";
import { authHeadersFor, buildTestApp, raw, type TestApp } from "./helpers.js";

async function board(env: TestApp, auth: Record<string, string>, id: string) {
  return env.app.inject({ method: "POST", url: "/api/boards", headers: auth, payload: { id, name: id } });
}
async function list(env: TestApp, auth: Record<string, string>, id: string, boardId = "b") {
  return env.app.inject({ method: "POST", url: "/api/lists", headers: auth, payload: { id, boardId, name: id } });
}
async function card(env: TestApp, auth: Record<string, string>, id: string, listId = "l") {
  return env.app.inject({ method: "POST", url: "/api/cards", headers: auth, payload: { id, listId, title: id } });
}

describe("Capacity limits", () => {
  let env: TestApp;
  let auth: Record<string, string>;
  beforeEach(async () => {
    env = await buildTestApp();
    auth = await authHeadersFor(env.app, env.db, "owner@example.com", "secret123");
  });

  it("enforces the free board limit and reports usage", async () => {
    for (let i = 1; i <= 3; i++) expect((await board(env, auth, `b${i}`)).statusCode).toBe(201);
    const blocked = await board(env, auth, "b4");
    expect(blocked.statusCode).toBe(409);
    expect(JSON.parse(blocked.body).error_code).toBe("BOARD_LIMIT_REACHED");
    const boards = JSON.parse((await env.app.inject({ method: "GET", url: "/api/boards", headers: auth })).body);
    expect(boards[0].capacity.boards).toEqual({ used: 3, limit: 3 });
  });

  it("counts only active lists and cards", async () => {
    await board(env, auth, "b");
    for (let i = 1; i <= 12; i++) expect((await list(env, auth, `l${i}`)).statusCode).toBe(201);
    expect((await list(env, auth, "l13")).statusCode).toBe(409);
    expect((await env.app.inject({ method: "POST", url: "/api/lists/l1/delete-all", headers: auth })).statusCode).toBe(204);
    expect((await list(env, auth, "l13")).statusCode).toBe(201);

    await board(env, auth, "card-board");
    await list(env, auth, "l", "card-board");
    for (let i = 1; i <= 48; i++) expect((await card(env, auth, `c${i}`)).statusCode).toBe(201);
    expect(JSON.parse((await card(env, auth, "c49")).body).error_code).toBe("CARD_LIMIT_REACHED");
    await env.app.inject({ method: "POST", url: "/api/cards/c1/archive", headers: auth });
    expect((await card(env, auth, "c49")).statusCode).toBe(201);
  });

  it("uses the board owner's tier for shared-board card capacity", async () => {
    await board(env, auth, "shared");
    await list(env, auth, "l", "shared");
    const member = await authHeadersFor(env.app, env.db, "member@example.com", "secret456");
    await raw(env.db, "INSERT INTO board_member (board_id, user_id) VALUES (?, ?)", ["shared", "member@example.com"]);
    for (let i = 1; i <= 48; i++) expect((await card(env, member, `c${i}`)).statusCode).toBe(201);
    expect(JSON.parse((await card(env, member, "c49")).body).error_code).toBe("CARD_LIMIT_REACHED");
  });
});
