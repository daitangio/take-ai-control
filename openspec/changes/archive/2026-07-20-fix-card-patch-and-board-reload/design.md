## Context

The Nello frontend uses a `CardModal` component that calls `apiDispatch({ type: 'card/edit' })` on every blur/close event, regardless of whether the user made changes. This dispatches a PATCH to `/api/cards/:id`. The `BoardSwitcher` dispatches `board/switch` which only updates local state (`activeBoardId`) without fetching fresh data from the server.

## Goals / Non-Goals

**Goals:**
- Eliminate unnecessary PATCH calls when a card is opened and closed without edits
- Ensure board switch fetches fresh data from the server

**Non-Goals:**
- Implementing optimistic concurrency / conflict resolution
- Adding loading spinners or skeleton screens during board reload
- Changing the backend API

## Decisions

1. **Dirty check in CardModal**: Compare current `title`/`description` state against the original `card.title`/`card.description` before calling `apiDispatch`. Only dispatch `card/edit` when values differ.
   - *Alternative*: Track a `dirty` boolean on each keystroke — rejected as more complex for no benefit.

2. **Board reload on switch**: In `BoardSwitcher`, replace `dispatch({ type: 'board/switch' })` with `loadBoards(boardId)` (which already fetches all boards and switches to the specified one).
   - *Alternative*: Fetch only the target board's detail — rejected because `loadBoards` already handles full state reset and is simpler; the data set is small.

## Risks / Trade-offs

- **[Brief flash on switch]** → Acceptable; `loadBoards` dispatches `store/reset` then repopulates, which may flash the UI. Mitigation: boards load fast (small payloads).
- **[Race condition on rapid switch]** → Already mitigated by `loadingRef` guard in `StoreContext`.
