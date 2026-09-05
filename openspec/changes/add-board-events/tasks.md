## 1. Backend events core

- [ ] 1.1 Create `src/events.ts`: subscriber registry (`Map<boardId, Set<Socket>>`), `subscribe`/`unsubscribe`, `emitBoardChange(boardId, actorId)`, `closeBoardStreams(boardId, userId)`, module flag read from `NELLO_EVENTS_ENABLED` (emit no-ops when off). Verify: new `tests/events.test.ts` unit tests cover subscribe/emit delivery, unsubscribe on close, closeStreams, and emit being a no-op when disabled
- [ ] 1.2 Add ticket store in `src/events.ts` (or a small `src/utils/eventTicket.ts`): issue opaque ticket (`crypto.randomBytes`), `Map<ticket, {userId, expiresAt}>` with 120 s TTL, consume-on-connect. Verify: unit tests for unknown and expired tickets returning no user

## 2. Backend routes

- [ ] 2.1 Create `src/routes/events.ts`: `POST /api/events/ticket` (preHandler `authenticate`, returns `{ ticket }`) and `GET /api/boards/:id/events` (ticket param auth + `checkBoardAccess`, route config `rateLimit: false`, SSE headers, subscribe, `data: {"boardId","actorId","ts"}` frames, heartbeat `: ping` every 15 s via one global timer following the app.ts pattern `unref()` + `onClose` cleanup). Verify: `tests/events.test.ts` route tests via `app.inject` — ticket issued with 200; stream rejected 401 without/with-invalid ticket and 404 for non-member
- [ ] 2.2 Register events routes in `src/app.ts` only when enabled, and add the one-line audit exclusion for the stream and ticket URLs in the existing `onResponse` hook. Verify: app-level test — with `NELLO_EVENTS_ENABLED=false` both routes return 404 and `audit_log` stays empty for stream requests; `npm test` green

## 3. Emit points in mutation routes

- [ ] 3.1 Add one `emitBoardChange(boardId, user.id)` line at each successful mutation return in `src/routes/{boards,lists,cards,members}.ts` (~15 sites; `boardId` is already resolved for access checks; never after a `sendError`). Verify: existing route test suites still pass, plus a registry-level test per route file — subscribe a stub, run a mutation via `app.inject`, assert the stub received one event
- [ ] 3.2 In `src/routes/members.ts` removal handler, call `closeBoardStreams(boardId, removedMemberId)` after success. Verify: unit test — stub stream for the removed member is closed, other members' streams stay open

## 4. Frontend subscription

- [ ] 4.1 Create `src/events.ts`: `subscribeBoardEvents(boardId, onEvent)` — gate on `import.meta.env.VITE_EVENTS_ENABLED`; fetch ticket via `api`, open `EventSource` on `/api/boards/{boardId}/events?ticket=...`, parse `data:` JSON into `onEvent`, on `error` close + fetch a fresh ticket + reopen after 1 s; return an unsubscribe that closes. Verify: unit tests with a mocked `EventSource` covering message delivery, error-triggered re-ticket/reopen, unsubscribe close, and a no-op subscription when the env flag is off
- [ ] 4.2 In `src/state/StoreContext.tsx`, add an effect keyed on `state.activeBoardId`: subscribe, coalesce events (~100 ms), call the existing `reloadBoard(activeBoardId)`; clean up on board switch/unmount. Verify: `StoreContext.test.tsx` with the events module mocked — switching boards re-subscribes with the new id, a received event triggers `api.getBoard` and `board/reload`, unmount unsubscribes

## 5. Config and packaging

- [ ] 5.1 Pass `NELLO_EVENTS_ENABLED` through `nello/docker-compose.yml` backend env and document both kill switches (`NELLO_EVENTS_ENABLED`, `VITE_EVENTS_ENABLED`) in `nello/DOCKER-README.md`. Verify: grep shows the var wired through; backend boots with the var set false and `/api/events/ticket` returns 404

## 6. Final verification and human test

- [ ] 6.1 Run `rtk npm test` in backend and frontend, and `rtk npm run build` in frontend. Verify: all suites pass and the production build succeeds
- [ ] 6.2 Human test: open the app in two browsers as two users sharing a board; change a card in one — it appears in the other within 1 s (no manual refresh); open a third tab with the same user and confirm it syncs too. Then restart the backend with `NELLO_EVENTS_ENABLED=false` and confirm the app still works normally with no visible errors. Verify: observed behavior matches; note results in LOG.md
