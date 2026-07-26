import { describe, it, expect, beforeEach } from "vitest";
import {
  buildTestApp,
  authHeadersFor,
  raw,
  type TestApp,
} from "./helpers.js";

describe("mock wiring smoke test", () => {
  let env: TestApp;
  let auth: Record<string, string>;

  beforeEach(async () => {
    env = await buildTestApp();
    auth = await authHeadersFor(env.app, env.db, "test@example.com", "secret123");
  });

  it("writes a board via inject and reads it back through the mocked db", async () => {
    const create = await env.app.inject({
      method: "POST",
      url: "/api/boards",
      headers: auth,
      payload: { id: "board-1", name: "Work" },
    });
    expect(create.statusCode).toBe(201);

    const list = await env.app.inject({
      method: "GET",
      url: "/api/boards",
      headers: auth,
    });
    expect(list.statusCode).toBe(200);
    const data = JSON.parse(list.body);
    expect(Array.isArray(data)).toBe(true);
    expect(data).toHaveLength(1);
    expect(data[0].name).toBe("Work");

    // Sanity: the row is in the in-memory db (mock was honored, not bypassed).
    const rows = await raw(env.db, "SELECT id, name FROM board WHERE id = ?", ["board-1"]);
    expect(rows[0]?.name).toBe("Work");
  });

  it("isolates state between tests (board-1 from above is gone)", async () => {
    const list = await env.app.inject({
      method: "GET",
      url: "/api/boards",
      headers: auth,
    });
    expect(JSON.parse(list.body)).toEqual([]);
  });
});