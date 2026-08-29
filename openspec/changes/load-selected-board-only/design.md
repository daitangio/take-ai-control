## Context

- `StoreContext.loadBoards()` resets the store, fetches `GET /boards`, then fetches `GET /boards/:id` for **every** board and seeds lists/cards. `BoardSwitcher` calls it on every tab click.
- `reloadBoard(boardId)` + the `board/reload` reducer already replace a single board's lists/cards atomically (built for drag-and-drop; see board-data-sync spec).
- `GET /boards` already returns only brief metadata (name, background, listIds, isShared, isOwner, capacity) but runs per-board queries (N+1).
- Motivation: see proposal.md.

## Goals / Non-Goals

**Goals:**
- Board click and app start fetch the board list plus one board's content.
- Board list refresh updates metadata in place without touching loaded content.
- `GET /boards` stays cheap enough to be the per-click hot path.

**Non-Goals:**
- No caching/invalidation protocol, no pagination, no websockets or polling for realtime sync.
- No changes to the API response shapes (frontend and backend stay wire-compatible).
- No lazy loading of lists/cards within a board.

## Decisions

### 1. One loading path: list + selected board
`loadBoards(preferredBoardId?)` becomes "refresh list, load one board": `getBoards()` → upsert briefs → `getBoard(target)` → `board/reload` → `board/switch`. App start and board click both use it.

*Alternative rejected*: keep full load on app start and go lazy only on click — still pays the expensive startup and leaves inconsistent state semantics between start and switch.

### 2. New reducer action `boards/refresh` for in-place list sync
Upserts each brief from `GET /boards` (merge name/background/isShared/isOwner/capacity, keep existing `listIds`; insert new boards with empty `listIds`). Boards absent from the response are removed from state, including their lists and cards (reuse `board/delete` bookkeeping). If the removed board was active, the first remaining board becomes active.

*Alternative rejected*: dispatch `board/create`/`board/rename` per row — those actions carry list-creation semantics and make deletions awkward.

### 3. Board click: refresh list → fetch detail → switch
`BoardSwitcher` calls a new store op `selectBoard(boardId)` instead of `loadBoards(boardId)`. It refreshes the list, fetches the clicked board's detail, and only then switches. On detail fetch failure it toasts and leaves the previous board active (matches spec). A "latest click wins" ref guards against out-of-order responses: only the most recently requested board id may apply the switch.

### 4. Error recovery stays single-board
`apiDispatch` error path replaces `loadBoards(activeBefore)` with list refresh + `reloadBoard(activeBefore)`. `board/delete` success path keeps refreshing the list (no detail fetch needed).

### 5. Backend: batch `GET /boards` queries
Replace the per-board loops with set-based queries: one query for all list ids (grouped by board, ordered by position), one grouped count for list usage, and owner tiers fetched with one `IN` query. Response shape is unchanged, so no contract or frontend `api.ts` change.

*Alternative rejected*: leave the N+1 as-is — the endpoint becomes the per-click hot path, so per-board round trips would dominate.

## Risks / Trade-offs

- [Out-of-order responses when switching quickly] → "latest click wins" ref in `selectBoard` (decision 3).
- [StrictMode double-effect runs initial load twice] → keep the existing `loadingRef` guard; `boards/refresh` upserts are also naturally idempotent.
- [Boards deleted elsewhere linger in state until next refresh] → `boards/refresh` drops boards missing from the response; refresh runs on every click and after every mutation failure.
- [Non-active boards' content is never refreshed in place] → acceptable: every switch fetches the target board fresh, so visible content is always current; unloaded boards cost nothing.
- [Backend batching changes query behavior] → response shape and ordering preserved; existing backend route tests verify.

## Migration Plan

Frontend + backend deploy together as one release. No data migration. Backend change is behavior-preserving (same JSON responses). Rollback: revert the commit; nothing persisted changes.
