## Why

After every card or list drag-and-drop, the frontend calls `loadBoards()`, which resets the entire store and re-fetches **every** board and all their lists/cards from the backend. This causes a jarring full-page refresh and unnecessary network load for a change that only affects a single board.

## What Changes

- After a successful `card/move` (and on error recovery for drag operations), refresh **only the active board** instead of reloading every board.
- Add a `reloadBoard(boardId)` capability to the store that re-fetches one board's lists/cards and replaces just that board's slice of state, leaving other boards and the active-board selection untouched.
- The optimistic reducer update for `card/move` remains; the single-board refetch reconciles server-authoritative ordering without a global reset.

## Capabilities

### New Capabilities
- `board-data-sync`: How the frontend store refreshes board data after mutations — full load on initial app start, single-board reload after drag-and-drop reordering.

### Modified Capabilities
<!-- None: no existing specs. -->

## Impact

- `nello/frontend/src/state/StoreContext.tsx`: replace `loadBoards(activeBefore)` in the `card/move` success/error paths with a new `reloadBoard`.
- `nello/frontend/src/state/reducer.ts`: add a `board/reload` (replace) action to atomically swap one board's lists/cards.
- `nello/frontend/src/state/types.ts`: add the new action type.
- No backend or API changes; reuses existing `api.getBoard(boardId)`.
