# Add Board Events

## Why

Nello boards are shared, but a user only sees another user's changes after a manual refresh or a board switch. The goal is that when one user makes a change, every other user viewing the same board sees it within a configurable interval (`NELLO_EVENTS_INTERVAL_SECONDS`, default 3 seconds), without touching the existing REST architecture.

## What Changes

- New backend SSE endpoint `GET /api/boards/:id/events`: a one-way, ping-only push channel scoped to a single board. Events carry only `{ boardId, actorId, ts }` — no entity payloads; clients refetch through the existing `GET /boards/:id`. Changes are batched per board and flushed at most once per `NELLO_EVENTS_INTERVAL_SECONDS` (default 3 s), so viewers see a change within that interval.
- New backend endpoint `POST /api/events/ticket`: takes `{ boardId }` and issues a short-lived opaque ticket scoped to that board, so `EventSource` connections can authenticate (browsers cannot set the `Authorization` header on `EventSource`) and a stolen ticket cannot be replayed against other boards.
- One-line event emits at 17 of the 18 existing mutation handlers (boards, lists, cards, members); the `boardId` is already resolved there for access checks. The board-deletion handler instead closes the board's streams: there is nothing to notify, and an emit would make subscribers refetch a 404.
- Frontend subscription in the store: while a board is active, receive events and trigger the existing `reloadBoard(boardId)` — one new code path, reusing current fetch logic.
- Ability to disable the feature independently on each side:
  - Backend: env var `NELLO_EVENTS_ENABLED` — when off, the events routes are not registered and all emits no-op.
  - Frontend: build-time env `VITE_EVENTS_ENABLED` — when off, no subscription is opened.
  - Both default to enabled; the app degrades gracefully if either side is off (REST remains the source of truth).
- Events streams do not consume the global REST rate-limit budget, but the backend enforces per-user and process-wide concurrent-stream limits so long-lived connections cannot exhaust sockets or memory. Event traffic is excluded from the request audit log (avoid persisting the event stream).

## Capabilities

### New Capabilities
- `board-events`: server-to-client push notifications of board changes over SSE, including subscription authorization, event emission, and feature kill switches.

### Modified Capabilities
<!-- none: existing requirements are unchanged; the new behavior is fully additive -->

## Impact

- Backend: new `src/events.ts` (bounded subscriber registry + emit + flush ticker) and `src/routes/events.ts` (SSE + ticket routes); `src/app.ts` registers the routes behind the env flag; 17 one-line `emit(...)` calls in `src/routes/{boards,lists,cards,members}.ts` plus `closeBoardStreams` calls in the member-removal and board-deletion handlers; one-line audit exclusion in `app.ts`; `nello/docker-compose.yml` passes `NELLO_EVENTS_ENABLED`, `NELLO_EVENTS_INTERVAL_SECONDS`, and stream-limit configuration through to the backend.
- Frontend: new `src/events.ts` (subscription client); `src/state/StoreContext.tsx` gains an effect that subscribes on the active board and calls `reloadBoard` on events.
- No new npm dependencies on either side (hand-rolled SSE via `reply.raw`); no vite proxy changes.
- No **BREAKING** changes: existing REST behavior, auth, and data flow are untouched; events are best-effort and never required for correctness.
