import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  subscribe,
  emitBoardChange,
  closeBoardStreams,
  flushBoardEvents,
  startEventTimers,
  stopEventTimers,
  issueEventTicket,
  consumeEventTicket,
  purgeExpiredEventTickets,
  type EventSocket,
} from "../src/events.js";
import { buildTestApp, authHeadersFor, raw, type TestApp } from "./helpers.js";

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

describe("board event delivery", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    startEventTimers();
  });
  afterEach(() => {
    stopEventTimers();
    vi.useRealTimers();
  });

  it("delivers one event per dirty board within one interval, then clears it", () => {
    const s = stubSocket();
    subscribe("b1", "u1", s.socket);
    emitBoardChange("b1", "u1");
    vi.advanceTimersByTime(3000);
    expect(s.write).toHaveBeenCalledTimes(1);
    const evt = parseFrame(s.write.mock.calls[0][0]);
    expect(evt.boardId).toBe("b1");
    expect(evt.actorId).toBe("u1");
    expect(typeof evt.ts).toBe("string");
    vi.advanceTimersByTime(3000);
    expect(s.write).toHaveBeenCalledTimes(1);
  });

  it("coalesces a burst into a single event reflecting the latest mutation", () => {
    const s = stubSocket();
    subscribe("b1", "u1", s.socket);
    emitBoardChange("b1", "u1");
    emitBoardChange("b1", "u2");
    vi.advanceTimersByTime(3000);
    expect(s.write).toHaveBeenCalledTimes(1);
    expect(parseFrame(s.write.mock.calls[0][0]).actorId).toBe("u2");
  });

  it("sends nothing when the board has no subscribers", () => {
    emitBoardChange("b1", "u1");
    vi.advanceTimersByTime(3000); // must not throw and must deliver nothing
  });

  it("unsubscribes when the socket closes", () => {
    const s = stubSocket();
    subscribe("b1", "u1", s.socket);
    s.listeners["close"]();
    emitBoardChange("b1", "u1");
    vi.advanceTimersByTime(3000);
    expect(s.write).not.toHaveBeenCalled();
  });

  it("writes a heartbeat comment on idle streams", () => {
    const s = stubSocket();
    subscribe("b1", "u1", s.socket);
    vi.advanceTimersByTime(15_000);
    expect(s.write).toHaveBeenCalledWith(": ping\n\n");
  });

  it("closeBoardStreams(boardId) closes every user's stream on that board only", () => {
    const a = stubSocket();
    const b = stubSocket();
    subscribe("b1", "u1", a.socket);
    subscribe("b1", "u2", b.socket);
    closeBoardStreams("b1");
    expect(a.end).toHaveBeenCalled();
    expect(b.end).toHaveBeenCalled();
  });

  it("closeBoardStreams(boardId, userId) closes only that user's streams", () => {
    const a = stubSocket();
    const b = stubSocket();
    subscribe("b1", "u1", a.socket);
    subscribe("b1", "u2", b.socket);
    closeBoardStreams("b1", "u1");
    expect(a.end).toHaveBeenCalled();
    expect(b.end).not.toHaveBeenCalled();
    emitBoardChange("b1", "u2");
    vi.advanceTimersByTime(3000);
    expect(b.write).toHaveBeenCalledTimes(1);
  });
});

describe("event tickets", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("issues an opaque ticket and consumes it once for the matching board", () => {
    const ticket = issueEventTicket("u1", "b1");
    expect(ticket).toMatch(/^[0-9a-f]{64}$/);
    expect(consumeEventTicket(ticket, "b1")).toEqual({ userId: "u1" });
    expect(consumeEventTicket(ticket, "b1")).toBeNull(); // consume-on-connect
  });

  it("rejects unknown, expired and foreign-board tickets", () => {
    expect(consumeEventTicket("nope", "b1")).toBeNull();
    const foreign = issueEventTicket("u1", "b1");
    expect(consumeEventTicket(foreign, "b2")).toBeNull();
    const expired = issueEventTicket("u1", "b1");
    vi.advanceTimersByTime(121_000);
    expect(consumeEventTicket(expired, "b1")).toBeNull();
  });

  it("purgeExpiredEventTickets removes expired entries", () => {
    const ticket = issueEventTicket("u1", "b1");
    vi.advanceTimersByTime(121_000);
    purgeExpiredEventTickets();
    expect(consumeEventTicket(ticket, "b1")).toBeNull();
  });

  it("periodic sweep removes expired tickets", () => {
    startEventTimers();
    const ticket = issueEventTicket("u1", "b1");
    vi.advanceTimersByTime(181_000); // sweep every 60 s, TTL 120 s
    expect(consumeEventTicket(ticket, "b1")).toBeNull();
    stopEventTimers();
  });
});

describe("events disabled (NELLO_EVENTS_ENABLED=false)", () => {
  it("no-ops emit, subscribe and timers", async () => {
    vi.resetModules();
    process.env.NELLO_EVENTS_ENABLED = "false";
    try {
      const events = await import("../src/events.js");
      const s = stubSocket();
      events.subscribe("b1", "u1", s.socket);
      events.emitBoardChange("b1", "u1");
      events.startEventTimers();
      events.flushBoardEvents();
      expect(s.write).not.toHaveBeenCalled();
      expect(events.EVENTS_ENABLED).toBe(false);
    } finally {
      delete process.env.NELLO_EVENTS_ENABLED;
      vi.resetModules();
      await import("../src/events.js");
    }
  });
});

describe("events routes", () => {
  let env: TestApp;
  let ownerAuth: Record<string, string>;
  let memberAuth: Record<string, string>;

  beforeEach(async () => {
    env = await buildTestApp();
    ownerAuth = await authHeadersFor(env.app, env.db, "owner@example.com", "secret123");
    await env.app.inject({
      method: "POST",
      url: "/api/boards",
      headers: ownerAuth,
      payload: { id: "b-1", name: "Shared$" },
    });
    memberAuth = await authHeadersFor(env.app, env.db, "member@example.com", "secret456");
    await env.app.inject({
      method: "POST",
      url: "/api/boards/b-1/members",
      headers: ownerAuth,
      payload: { email: "member@example.com" },
    });
  });

  it("issues a ticket for an authenticated user", async () => {
    const res = await env.app.inject({
      method: "POST",
      url: "/api/events/ticket",
      headers: memberAuth,
      payload: { boardId: "b-1" },
    });
    expect(res.statusCode).toBe(200);
    const { ticket } = JSON.parse(res.body);
    expect(typeof ticket).toBe("string");
    expect(ticket.length).toBe(64);
  });

  it("rejects the stream without a ticket with 401", async () => {
    const res = await env.app.inject({ method: "GET", url: "/api/boards/b-1/events" });
    expect(res.statusCode).toBe(401);
  });

  it("rejects the stream with an invalid ticket with 401", async () => {
    const res = await env.app.inject({ method: "GET", url: "/api/boards/b-1/events?ticket=nope" });
    expect(res.statusCode).toBe(401);
  });

  it("rejects a ticket issued for a different board with 401", async () => {
    const t = await env.app.inject({
      method: "POST",
      url: "/api/events/ticket",
      headers: memberAuth,
      payload: { boardId: "b-1" },
    });
    const { ticket } = JSON.parse(t.body);
    await env.app.inject({
      method: "POST",
      url: "/api/boards",
      headers: ownerAuth,
      payload: { id: "b-2", name: "Other" },
    });
    const res = await env.app.inject({
      method: "GET",
      url: `/api/boards/b-2/events?ticket=${ticket}`,
    });
    expect(res.statusCode).toBe(401);
  });

  it("rejects a non-member with 404", async () => {
    // Non-members cannot get a ticket at all
    const outsider = await authHeadersFor(env.app, env.db, "outsider@example.com", "secret789");
    const t = await env.app.inject({
      method: "POST",
      url: "/api/events/ticket",
      headers: outsider,
      payload: { boardId: "b-1" },
    });
    expect(t.statusCode).toBe(404);

    // Revocation race: ticket issued while a member, removed before connect
    const ticketRes = await env.app.inject({
      method: "POST",
      url: "/api/events/ticket",
      headers: memberAuth,
      payload: { boardId: "b-1" },
    });
    const { ticket } = JSON.parse(ticketRes.body);
    await env.app.inject({
      method: "DELETE",
      url: "/api/boards/b-1/members/member@example.com",
      headers: ownerAuth,
    });
    const res = await env.app.inject({
      method: "GET",
      url: `/api/boards/b-1/events?ticket=${ticket}`,
    });
    expect(res.statusCode).toBe(404);
  });

  it("does not audit rejected stream requests", async () => {
    await env.app.inject({ method: "GET", url: "/api/boards/b-1/events?ticket=nope" });
    const rows = await raw(env.db, "SELECT COUNT(*) as count FROM audit_log WHERE url LIKE '%events%'");
    expect(Number(rows[0]?.count)).toBe(0);
  });
});
