## Why

When a user logs out and logs back in, lists (and potentially cards) appear duplicated in the UI. The backend data is correct — only one copy of each entity exists in the database — but the frontend renders duplicates because `loadBoards()` can run concurrently and the reducer's `list/create` and `card/create` actions unconditionally append to parent entity ID arrays without checking for existing entries. This happens reliably in development (React StrictMode double-invokes effects) and can also occur in production under race conditions.

## What Changes

- Add a `store/reset` reducer action that clears all boards, lists, and cards, restoring the initial empty state
- Dispatch `store/reset` at the start of `loadBoards()` to clear any stale state before repopulating
- Make `loadBoards()` guard against concurrent execution using a ref flag, so only one load is in flight at a time
- Make `list/create` idempotent: do not append `listId` to `board.listIds` if it is already present
- Make `card/create` idempotent: do not append `cardId` to `list.cardIds` if it is already present

## Capabilities

### New Capabilities
<!-- None — this is a bug fix, not a new capability. -->

### Modified Capabilities
- `board-persistence`: The "State persisted across sessions and devices" requirement now includes that state is correctly rebuilt on re-login without duplication, and that `loadBoards` is safe against concurrent invocation.

## Impact

- Frontend: `state/reducer.ts` — new `store/reset` action and idempotency guards in `list/create`, `card/create`
- Frontend: `state/types.ts` — new `store/reset` action type
- Frontend: `state/StoreContext.tsx` — `loadBoards` now resets state first and guards against concurrency
- No backend changes needed
- No API changes needed
- Existing reducer tests should be updated to cover the new action and idempotency behavior
