## 1. Reducer changes

- [x] 1.1 Add `store/reset` to the `Action` discriminated union type in `state/types.ts`
- [x] 1.2 Implement `store/reset` case in `reducer.ts` that returns `createInitialState()`
- [x] 1.3 Add idempotency guard to `list/create` in `reducer.ts`: skip appending `listId` if already present in `board.listIds`
- [x] 1.4 Add idempotency guard to `card/create` in `reducer.ts`: skip appending `cardId` if already present in `list.cardIds`

## 2. StoreContext changes

- [x] 2.1 Add a `useRef<boolean>` concurrency guard to `loadBoards` in `StoreContext.tsx` that skips the call if a load is already in progress
- [x] 2.2 Dispatch `store/reset` synchronously at the start of `loadBoards` before any `await` calls

## 3. Tests

- [x] 3.1 Add reducer tests for `store/reset`: verifies it clears all boards, lists, cards, and activeBoardId
- [x] 3.2 Add reducer tests for idempotent `list/create`: dispatching twice with same listId only appends once
- [x] 3.3 Add reducer tests for idempotent `card/create`: dispatching twice with same cardId only appends once

## 4. Verification

- [x] 4.1 Start the app, log in, create a board with a list, log out, log back in — confirm no duplicated lists
- [x] 4.2 Run existing reducer test suite (`npx vitest run`) — confirm all tests pass (43/43)
