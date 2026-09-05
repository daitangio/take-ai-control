## 1. Frontend state

- [x] 1.1 Add `boards/refresh` action to `src/state/types.ts` and reducer handling in `src/state/reducer.ts`: upsert each brief from the list (merge metadata, keep existing `listIds`, insert new boards with empty `listIds`), remove boards absent from the response along with their lists/cards, and re-point the active board to the first remaining one when it was removed — verify with new unit tests in `src/state/reducer.test.ts` (`npm test` passes)
- [x] 1.2 Rework `loadBoards(preferredBoardId?)` in `src/state/StoreContext.tsx` to refresh the list via `getBoards()` and load only the target board via `getBoard()` + `board/reload`, then switch to it; drop `store/reset` — verify with updated `src/state/StoreContext.test.tsx` asserting exactly one detail fetch per call and correct active board (`npm test` passes)
- [x] 1.3 Add `selectBoard(boardId)` store operation (list refresh → detail fetch → switch) with a latest-click-wins ref so a slow response for a previously clicked board never steals the active selection; keep the previous board active and toast on detail failure — verify with new `StoreContext.test.tsx` cases for rapid consecutive switches and fetch failure (`npm test` passes)
- [x] 1.4 Update `apiDispatch` error recovery in `src/state/StoreContext.tsx` to refresh the board list and `reloadBoard(activeBefore)` instead of `loadBoards(activeBefore)` — verify with a `StoreContext.test.tsx` case for mutation failure recovery (`npm test` passes)

## 2. Frontend UI

- [x] 2.1 In `src/components/BoardSwitcher.tsx`, change the tab click handler to call `selectBoard(board.id)` instead of `loadBoards(board.id)`; keep the active-tab click a no-op — verify with updated `src/components/BoardSwitcher.test.tsx` asserting selectBoard is called on tab click and nothing on active-tab click (`npm test` passes)
- [x] 2.2 Audit remaining `loadBoards` call sites (`src/App.tsx`, `src/components/*`) so every path uses the new list + single-board flow and no full reload remains — verify with a `grep` for `loadBoards` showing only intended call sites and the full frontend test suite passing

## 3. Backend

- [x] 3.1 Batch the per-board queries in `GET /boards` (`src/routes/boards.ts`): one grouped query for list ids ordered by position, one grouped count for list usage, and owner tiers fetched with a single `IN` query; keep the response shape unchanged — verify existing board route tests in `nello/backend/tests` pass (`npm test` in `nello/backend`) and a manual `GET /boards` response matches the pre-change shape

## 4. Verification

- [x] 4.1 Run `npm test` in both `nello/frontend` and `nello/backend`, then `npm run build` in `nello/frontend` as final gate — verify all suites pass and the production build succeeds
- [x] 4.2 Human test: log in, create several boards with lists/cards, then click each tab and confirm via the browser network tab that each click issues one `GET /boards` and one `GET /boards/:id` (not one per board); verify rapid tab switching always lands on the last clicked board, a renamed board shows the new name after refresh, and app start loads only the first board's content — verify observable behavior matches the specs
