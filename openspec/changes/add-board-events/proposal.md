# Add Board Events

## Why

Nello boards are shared, but a user only sees another user's changes after a manual refresh or a board switch. The goal is that when one user makes a change, every other user viewing the same board sees it within 1 second, without touching the existing REST architecture.

## What Changes

- New backend SSE endpoint `GET /api/boards/:id/events`: a one-way, ping-only push channel scoped to a single board. Events carry only `{ boardId, actorId, ts }` — no entity payloads; clients refetch through the existing `GET /boards/:id`.
- New backend endpoint `POST /api/events/ticket`: issues a short-lived opaque ticket so `EventSource` connections can authenticate (browsers cannot set the `Authorization` header on `EventSource`).
- One-line event emits at each of the ~15 existing mutation handlers (boards, lists, cards, members); the `boardId` is already resolved there for access checks.
- Frontend subscription in the store: while a board is active, receive events and trigger the existing `reloadBoard(boardId)` — one new code path, reusing current fetch logic.
- Ability to disable the feature independently on each side:
  - Backend: env var `NELLO_EVENTS_ENABLED` — when off, the events routes are not registered and all emits no-op.
  - Frontend: build-time env `VITE_EVENTS_ENABLED` — when off, no subscription is opened.
  - Both default to enabled; the app degrades gracefully if either side is off (REST remains the source of truth).
- Events route is exempted from the global rate limit (a long-lived connection plus reconnects must not consume the 120 req/min budget) and excluded from the request audit log (avoid persisting the event stream).

## Capabilities

### New Capabilities
- `board-events`: server-to-client push notifications of board changes over SSE, including subscription authorization, event emission, and feature kill switches.

### Modified Capabilities
<!-- none: existing requirements are unchanged; the new behavior is fully additive -->

## Impact

- Backend: new `src/events.ts` (subscriber registry + emit) and `src/routes/events.ts` (SSE + ticket routes); `src/app.ts` registers the routes behind the env flag; ~15 one-line `emit(...)` calls in `src/routes/{boards,lists,cards,members}.ts`; one-line audit exclusion in `app.ts`; `nello/docker-compose.yml` passes `NELLO_EVENTS_ENABLED` through to the backend.
- Frontend: new `src/events.ts` (subscription client); `src/state/StoreContext.tsx` gains an effect that subscribes on the active board and calls `reloadBoard` on events.
- No new npm dependencies on either side (hand-rolled SSE via `reply.raw`); no vite proxy changes.
- No **BREAKING** changes: existing REST behavior, auth, and data flow are untouched; events are best-effort and never required for correctness.
