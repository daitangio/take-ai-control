# Design: Board Events (SSE)

## Context

Backend: Fastify 5.10 (no native SSE route helper — the stream is hand-rolled on `reply.raw`), libSQL, JWT Bearer auth via the `authenticate` preHandler which attaches `request.user`, and `checkBoardAccess(boardId, userId)` used by every entity route (so every mutation already resolves its `boardId`). Global `@fastify/rate-limit` of 120 req/min; an `onResponse` hook persists every request to the audit log. Frontend: React 19 + reducer store (`StoreContext`), with an existing `reloadBoard(boardId)` that fetches `GET /boards/:id` and replaces that board's state atomically. Vite dev proxy forwards `/api` to port 6502; env convention is `NELLO_*`; backend runs as a single process. See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**
- Other viewers see a change within 1 second of a successful mutation.
- One new code path for applying remote data (reuse `reloadBoard`).
- Independent kill switches per side, defaulting to enabled, degrading gracefully.
- Zero new npm dependencies; no vite proxy or CORS changes.

**Non-Goals:**
- WebSocket duplex (no second mutation path).
- Presence, cursors, or per-entity payload replication.
- A channel for board-list changes (rename/delete of other boards); the next list refresh or board switch picks those up. Possible phase 2.
- Multi-instance scaling: the subscriber registry is in-memory and local to one backend process.
- Cookie-based auth.

## Decisions

1. **SSE over WebSocket.** All mutations already travel through REST with auth, validation, rate limiting, and audit; the client only needs to be *notified*. EventSource reconnects natively; the vite proxy and any HTTP intermediary pass it through unchanged. WebSocket would add 2 dependencies, `ws: true` proxy config, and a hand-rolled reconnect.

2. **Hand-rolled SSE over `@fastify/sse`.** Fastify 5.10 core has no `reply.sse` (verified in the installed package). The stream is ~30 lines: set `Content-Type: text/event-stream`, `Cache-Control: no-cache`, then `reply.raw.write("data: ...\n\n")`. No dependency for something this small. The registry lives in a standalone `src/events.ts` with plain functions (`subscribe`, `emit`, `closeStreams`), so it is unit-testable without holding a socket open — `app.inject` cannot stream, so route tests cover only the ticket endpoint and the access guards.

3. **Ping-only events over payload replication.** An event is `{ boardId, actorId, ts }` (~50 bytes). The client refetches via the existing `GET /boards/:id`; there is exactly one code path that updates board state, so stale-event bugs are impossible. Payload replication would duplicate every serializer on the wire.

4. **Emission at mutation sites, not a central hook.** A URL-parsing `onResponse` hook cannot map list/card mutations to their board (`boardId` lives in the body, not the URL). Instead each of the ~15 successful mutation handlers calls one line: `emitBoardChange(boardId, request.user.id)` — `boardId` is already in scope from the access check. `emitBoardChange` no-ops when disabled. Failed mutations never reach the emit line.

5. **Ticket auth for EventSource.** Browsers cannot set the `Authorization` header on `EventSource`. A JWT in the query string would land in the audit DB (which logs URLs). So: `POST /api/events/ticket` (normal Bearer auth) returns a random opaque ticket stored in an in-memory `Map<ticket, {userId, expiresAt}>` with a 120 s TTL; the stream URL carries `?ticket=…`. Rejected alternatives: query-string JWT (leak), fetch+ReadableStream streaming (reuses Bearer but hand-rolls reconnection).

6. **Reconnect refreshes the ticket.** EventSource's auto-retry reuses the same URL, whose ticket eventually expires. The frontend subscription manager therefore closes the EventSource on `error`, requests a fresh ticket, and reopens (1 s delay). ~15 lines, still far less than a fetch-stream client.

7. **No actor filtering.** Filtering `actorId === myUserId` would break multi-tab sync of the same user. A redundant self-refetch is harmless (idempotent GET, identical data) and the `card/move` flow already refetches after mutations.

8. **Kill switches.** Backend: `NELLO_EVENTS_ENABLED` read once in `buildApp`; when off, the events routes are not registered and `emitBoardChange` no-ops. Frontend: `VITE_EVENTS_ENABLED` (build-time) gates the subscription effect. Both default to enabled. The spec's best-effort requirement guarantees a mismatch between the sides is invisible.

9. **Rate-limit exemption per route.** `{ config: { rateLimit: false } }` on the stream route, so a long-lived connection plus reconnects never consume the shared 120 req/min budget.

10. **Audit exclusion.** One-line check in the existing `onResponse` hook skips the stream and ticket URLs; otherwise the whole event stream would be serialized into the audit DB when the connection closes.

11. **Single global heartbeat timer.** One `setInterval` (~15 s) writes `: ping\n\n` to every subscriber; write errors detect dead sockets and trigger unsubscribe. No per-connection timers. Follows the existing app.ts house pattern: `timer.unref?.()` plus cleanup in the `onClose` hook.

12. **Connection lifecycle.** Registry is `Map<boardId, Set<reply.raw>>`; `reply.raw.on("close", …)` removes the socket. The members route additionally calls `closeBoardStreams(boardId, removedUserId)` so a removed member stops receiving events (spec requirement).

13. **Frontend shape.** New `src/events.ts` exports `subscribeBoardEvents(boardId, onEvent) → unsubscribe` (ticket + EventSource + reconnect, per decision 6). `StoreContext` gains one effect keyed on `state.activeBoardId`: subscribe → coalesce events (~100 ms debounce) → `reloadBoard(activeBoardId)`. Cleanup on board switch/unmount.

## Risks / Trade-offs

- **In-memory registry lost on restart** → all clients reconnect via EventSource and resume; the app never depends on events. Multi-instance deployment would silently split subscribers and emitters — out of scope today (single process); a future fix would need Redis pub/sub or DB triggers. Documented, not designed around.
- **Stolen ticket** → usable only until TTL (120 s) and only for one board's change pings (no content). Accepted; TTL is the mitigation.
- **Self-event races with optimistic dispatch** → `apiDispatch` applies optimistic state, then the API response patches it; a concurrent `reloadBoard` from our own event lands identical data. Idempotent by design (decision 7); the debounce reduces churn further.
- **Reload during open CardModal or drag** → CardModal keeps local state (verified), and dnd-kit tracks ids, so a board replace mid-drag is safe; `card/move` already refetches today.
- **under-pressure plugin** → measures event loop/heap, not connection count; idle SSE connections are cheap. Fine for the tiny setup.
- **Heartbeat write errors** → only path that reaps dead sockets if `close` never fires; acceptable.
- **Rate-limit exemption surface** → stream still requires a valid ticket and board membership; traffic is heartbeat comments and pings.

## Migration Plan

1. Deploy backend first: events routes registered only when `NELLO_EVENTS_ENABLED` is unset/true; the ~15 emit lines are inert otherwise. No schema, dependency, or REST change.
2. Deploy frontend: gated by `VITE_EVENTS_ENABLED`.
3. Rollback: set both env flags to false — the app returns to today's behavior exactly. No data to migrate.

## Open Questions

None — transport (SSE), event shape (ping), auth (ticket), and disable semantics were resolved during exploration.
