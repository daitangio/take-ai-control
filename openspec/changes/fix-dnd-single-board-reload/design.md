## Context

`StoreContext.tsx`'s `apiDispatch` handles the `card/move` action by optimistically updating the reducer, calling `api.moveCard`, then awaiting `loadBoards(activeBefore)`. `loadBoards` dispatches `store/reset` (wiping all state) and re-fetches every board plus each board's detail sequentially. For a drag-and-drop that only touches the active board this is expensive and visually jarring (full refresh, flicker). The same full reload runs in the error path.

The reducer already applies `card/move` optimistically and correctly, so the reload's only purpose is to reconcile server-authoritative ordering.

## Goals / Non-Goals

**Goals:**
- After a drag-and-drop, refetch only the active board.
- Preserve state for other boards and the current active-board selection.
- Keep the error-recovery reconciliation, scoped to the active board.

**Non-Goals:**
- No backend/API changes.
- No change to full-load behavior on app start / auth.
- No change to non-drag mutations (create/edit/delete already update state without a global reload).

## Decisions

**Add a `board/reload` reducer action that replaces one board's slice.**
The action carries the board id plus the fresh lists/cards from `api.getBoard`. The reducer removes the board's existing lists (and their cards) from `state.lists`/`state.cards`, then inserts the fresh ones and updates `board.listIds`. This is atomic in a single dispatch, avoiding the duplicate-guard hacks that concurrent `loadBoards` needed.
- Alternative considered: reuse `store/reset` + selective re-add — rejected, that is what causes the global refresh.
- Alternative considered: no reload at all (trust optimistic update) — rejected, loses server reconciliation and the requested "reload current board" behavior.

**Add `reloadBoard(boardId)` to the store, calling `api.getBoard` then dispatching `board/reload`.**
`apiDispatch` calls `reloadBoard(activeBefore)` instead of `loadBoards(activeBefore)` in both the `card/move` success branch and the drag error-recovery branch (guarded by active board id present).

## Risks / Trade-offs

- [Reordering another board via list drag targets a different board] → drag handlers operate on the active board; `reloadBoard` uses the active board id, matching the mutation scope.
- [`getBoard` returns a board not currently in state] → `board/reload` no-ops if the board id is absent, avoiding orphan state.
- [Concurrent reloads] → single-board replace is idempotent, so the `loadingRef` guard is unnecessary for `reloadBoard`.

## Migration Plan

Pure frontend refactor; deploy with `npm run build`. Rollback = revert the commit. No data migration.

## Open Questions

None.
