## Why

Every time the user clicks a board tab, the frontend calls `loadBoards`, which re-fetches the full content (lists and cards) of **every** board. With several boards this is slow and wastes bandwidth and server work, when the user only needs the board they clicked.

## What Changes

- Clicking a board tab refreshes only the brief board list (`GET /boards`) and loads only the selected board's content (`GET /boards/:id`), then switches the active board. No full reload of all boards, no `store/reset`.
- Initial app load uses the same strategy: fetch the board list, load only the preferred/first board's content. The current "full load of all boards on start" behavior is replaced.
- The store gains a "refresh board list" operation that updates board metadata (name, background, sharing, capacity) in place without clearing loaded board content.
- No new backend endpoint is required: `GET /boards` (brief) and `GET /boards/:id` (detail) already exist. The backend change is limited to making `GET /boards` cheap enough for per-click refresh by batching its per-board queries (list ids, capacities) instead of N+1 lookups.

## Capabilities

### New Capabilities

<!-- None -->

### Modified Capabilities

- `board-data-sync`: board selection and initial load no longer fetch all boards' content; they fetch the board list plus the selected board only.

## Impact

- Frontend: `src/state/StoreContext.tsx` (`loadBoards`, new list-refresh operation, `apiDispatch` error recovery), `src/components/BoardSwitcher.tsx` (click handler), possibly `src/state/reducer.ts` (in-place board metadata merge). Existing `reloadBoard`/`board/reload` is reused for single-board loading.
- Backend: `src/routes/boards.ts` — batch queries in `GET /boards` (no response-shape change).
- Tests: `StoreContext.test.tsx`, `BoardSwitcher.test.tsx`, backend route tests.
- No API contract changes; no new dependencies.
