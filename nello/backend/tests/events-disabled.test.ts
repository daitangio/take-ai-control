import { describe, it, expect, vi } from "vitest";

// Must run before any import reads the env in src/events.ts
vi.hoisted(() => {
  process.env.NELLO_EVENTS_ENABLED = "false";
});

import { buildTestApp, authHeadersFor, raw } from "./helpers.js";

describe("events disabled at startup (NELLO_EVENTS_ENABLED=false)", () => {
  it("does not register the events routes and never audits them", async () => {
    const { app, db } = await buildTestApp();
    const auth = await authHeadersFor(app, db, "test@example.com", "secret123");

    const ticket = await app.inject({
      method: "POST",
      url: "/api/events/ticket",
      headers: auth,
      payload: { boardId: "b-1" },
    });
    expect(ticket.statusCode).toBe(404);

    const stream = await app.inject({ method: "GET", url: "/api/boards/b-1/events?ticket=x" });
    expect(stream.statusCode).toBe(404);

    const rows = await raw(db, "SELECT COUNT(*) as count FROM audit_log WHERE url LIKE '%events%'");
    expect(Number(rows[0]?.count)).toBe(0);
  });

  it("keeps mutations working exactly as before", async () => {
    const { app, db } = await buildTestApp();
    const auth = await authHeadersFor(app, db, "test@example.com", "secret123");

    const res = await app.inject({
      method: "POST",
      url: "/api/boards",
      headers: auth,
      payload: { id: "b-1", name: "Test" },
    });
    expect(res.statusCode).toBe(201);
  });
});
