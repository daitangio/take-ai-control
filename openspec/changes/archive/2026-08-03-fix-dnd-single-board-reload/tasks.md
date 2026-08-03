## 1. State layer

- [x] 1.1 Add a `board/reload` action type to `src/state/types.ts` carrying `boardId` and the fresh board detail (lists with their cards).
- [x] 1.2 Implement the `board/reload` case in `src/state/reducer.ts`: no-op if the board is absent; otherwise remove the board's existing lists and their cards, insert the fresh lists/cards, and set `board.listIds` to the new order.

## 2. Store integration

- [x] 2.1 Add `reloadBoard(boardId)` to `src/state/StoreContext.tsx` that calls `api.getBoard(boardId)` and dispatches `board/reload`; expose it on the store value/interface.
- [x] 2.2 Replace `await loadBoards(activeBefore)` in the `card/move` success branch of `apiDispatch` with `reloadBoard(activeBefore)` (guarded when `activeBefore` is set).
- [x] 2.3 In the `apiDispatch` catch block, reload only the active board (`reloadBoard(activeBefore)`) for drag operations instead of `loadBoards(activeBefore)`.

## 3. Verification

- [x] 3.1 Update/add unit tests covering `board/reload` reducer behavior and that `card/move` triggers a single-board reload (not `loadBoards`).
- [x] 3.2 Run `rtk npm run build` and existing tests to confirm nothing is broken.
- [x] 3.3 Manually verify dragging a card refreshes only the current board without a full-page/all-boards refresh.
