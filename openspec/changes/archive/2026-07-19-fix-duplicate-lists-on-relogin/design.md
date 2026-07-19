## Context

The frontend uses a React `useReducer` with normalized state (boards, lists, cards as Records keyed by ID). On login, `loadBoards()` fetches all boards from the backend API and populates the store by dispatching `board/create`, `list/create`, and `card/create` actions.

The `StoreProvider` is conditionally rendered inside `AuthGuard`: when `token` is null, only `LoginForm` renders; when `token` is non-null, `StoreProvider` mounts fresh. This means state is naturally cleared by unmounting on logout.

However, within a single mount cycle, `loadBoards()` can be invoked concurrently:
- **React 18 StrictMode** (development): effects are double-invoked (mount → unmount → mount), and without a cleanup function, both async `loadBoards()` calls run to completion.
- **Token changes**: if the token value changes in quick succession, the `useEffect([token, loadBoards])` in `AppInner` triggers multiple `loadBoards()` calls.

When two `loadBoards()` calls interleave, the append-only `list/create` reducer action appends the same list ID to `board.listIds` twice, producing duplicated list columns in the UI. The same race applies to `card/create` appending to `list.cardIds`.

## Goals / Non-Goals

**Goals:**
- Prevent duplicate list/card entries in parent entity ID arrays when `loadBoards()` runs concurrently
- Clear stale state before repopulating on each `loadBoards()` call
- Make `loadBoards()` safe against concurrent invocation
- Preserve existing behavior for all other reducer actions

**Non-Goals:**
- Changing the backend API or database schema
- Adding backend-side deduplication
- Changing the component hierarchy or AuthGuard pattern
- Adding loading/empty states (existing behavior preserved)
- Persisting state to localStorage (usePersistedReducer remains unused)

## Decisions

### Decision 1: Add `store/reset` action and dispatch at start of `loadBoards`

**Choice**: Add a new `store/reset` reducer action that resets state to `createInitialState()`, and dispatch it synchronously at the very start of `loadBoards()`.

**Rationale**: Resetting state at the start (not the end) ensures that even if the subsequent API calls fail, the UI shows an empty "no boards" state rather than stale data from a previous session. The synchronous dispatch happens before any `await`, so it applies before any concurrent `loadBoards()` call can interleave.

**Alternatives considered**:
- *Reset at end of `loadBoards`*: rejected because a failed load would leave stale data visible.
- *No reset, rely on unmounting*: rejected because unmounting only happens on logout, not on re-login-within-same-mount.
- *No reset, rely on idempotency alone*: rejected because idempotency doesn't help if entity IDs differ between sessions (different user logs in).

### Decision 2: Guard `loadBoards()` against concurrent execution with a ref flag

**Choice**: Use a `useRef<boolean>` to track whether a load is in progress. If `loadBoards()` is called while a load is already running, return early.

**Rationale**: This is the simplest correct guard. Unlike `useState`, `useRef` updates are synchronous and don't trigger re-renders, which is exactly what we need for a concurrency guard. An `AbortController`-based approach was considered but is unnecessarily complex — we want to let the first call complete, not cancel it.

**Alternatives considered**:
- *AbortController*: rejected as overengineered. We want the first call to succeed, not cancel it.
- *useState flag*: rejected because state updates are batched and asynchronous, which could allow a race where both calls pass the guard check before either sets the flag.
- *Debounce/throttle*: rejected because it doesn't prevent concurrent execution, it only delays it.

### Decision 3: Make `list/create` and `card/create` idempotent in the reducer

**Choice**: Before appending `listId` to `board.listIds`, check if it's already present. Same for `cardId` in `list.cardIds`.

**Rationale**: This is a defense-in-depth measure. Even with the reset and concurrency guard, making these actions idempotent ensures correctness regardless of how they're called. It also protects against any future code paths that might dispatch `list/create` for an already-existing list.

**Alternatives considered**:
- *Only reset + guard, no idempotency*: this would work for the current bug, but leaves a latent footgun.
- *Error on duplicate*: rejected because it would crash `loadBoards` on the second concurrent invocation rather than silently succeeding.

## Risks / Trade-offs

- **[Risk] Adding a new action type requires updating the TypeScript union type** → Mitigation: straightforward one-line addition to the `Action` type in `types.ts`.

- **[Risk] The concurrency guard prevents a second load even if it's intentional** (e.g., user quickly logs out and back in) → Mitigation: this is actually the desired behavior — the second login creates a new `StoreProvider` mount (since logout unmounts it), so the guard only prevents concurrent loads within the same mount.

- **[Trade-off] `list/create` now silently succeeds if the list already exists** → This is acceptable because the action is idempotent: creating the same list twice should produce the same state as creating it once. The UI already handles this because `state.lists` is a Record keyed by ID.

## Migration Plan

1. No database migrations needed — backend is unchanged.
2. No API version bumps — the fix is entirely client-side.
3. Rollback: revert the frontend changes. No data corruption risk since the backend is unaffected.
4. Deployment: standard frontend deploy. The fix is backward-compatible.

## Open Questions

None — the root cause and fix are well-understood.
