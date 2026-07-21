## Why

Deleting a list is currently exposed as a one-click destructive action in the list header. Moving that command into a menu and adding archive as the primary list removal path preserves list data while keeping the column header compact.

## What Changes

- Replace the direct list delete button in `nello/frontend/src/components/ListColumn.tsx` with a `...` menu button.
- Add a popup menu action named `Archive` for lists.
- Archive removes the list from the active board view without deleting the list record.
- Persist archived lists in a new `list_archive` table so archived list metadata survives reloads and hard deletes remain separate.
- Keep existing hard-delete behavior available only where explicitly retained by implementation, not as the visible header button.

## Capabilities

### New Capabilities

### Modified Capabilities

- `list-management`: List header controls change from direct delete to a menu-driven archive action, and archive becomes a supported list lifecycle operation.
- `backend-api`: List endpoints gain an authenticated archive operation and board/list reads exclude archived lists.
- `data-persistence`: SQLite initialization creates and preserves a `list_archive` table used to hide archived lists without deleting the original list row.

## Impact

- Frontend list header UI, menu state, styling, API client, store actions, reducer behavior, and tests.
- Backend list router/service, board detail queries, SQLite schema/migration logic, and list/archive tests.
- Existing board detail and list reorder behavior must ignore archived lists.
