## Why

Opening a card in the modal and closing it without making any edits currently triggers a spurious `PATCH /api/cards/:id` call, causing unnecessary network traffic and potentially overwriting concurrent edits by other users. Additionally, switching between boards does not reload board data from the server, so stale state persists until a full page refresh.

## What Changes

- **CardModal**: Only call `apiDispatch({ type: 'card/edit', … })` on close/blur when the title or description has actually changed compared to the original card data.
- **BoardSwitcher / board switch flow**: When switching boards via `dispatch({ type: 'board/switch', boardId })`, trigger a full board reload (`loadBoards`) so that fresh server data is fetched.

## Capabilities

### New Capabilities

_(none — this is a bug fix within existing capabilities)_

### Modified Capabilities

- `card-management`: Card editing must only PATCH when data actually changed (dirty check).
- `board-management`: Board switching must reload data from the server.

## Impact

- **Frontend components**: `CardModal.tsx`, `BoardSwitcher.tsx`, `StoreContext.tsx`
- **API calls**: Reduces unnecessary PATCH requests to `/api/cards/:id`
- **UX**: Board switch now guarantees fresh data (brief loading flash acceptable)
- **No backend changes required**
