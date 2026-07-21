## 1. Backend Persistence

- [x] 1.1 Add `list_archive` DDL and startup migration in `nello/backend/src/db.py` with foreign keys to `list`, `board`, and `user`.
- [x] 1.2 Update board summary/detail queries to exclude lists that have a `list_archive` row.
- [x] 1.3 Update list creation and reorder logic so positions and reorder operations only affect visible, non-archived lists.

## 2. Backend Archive API

- [x] 2.1 Add a list archive service function that authorizes via `check_board_access`, inserts the archive marker idempotently, preserves list/card rows, commits, and logs the mutation.
- [x] 2.2 Add `POST /api/lists/:id/archive` returning 204 and 404 for missing or inaccessible lists.
- [x] 2.3 Add backend tests for archive success, archived list omission from board reads, card preservation, unauthorized archive rejection, and reorder behavior with archived lists.

## 3. Frontend State And API

- [x] 3.1 Add `archiveList` to the frontend API client.
- [x] 3.2 Add a `list/archive` action and wire `StoreContext` so the archive API call uses the existing optimistic removal and reload-on-failure pattern.
- [x] 3.3 Keep existing hard-delete state behavior available for tests or future explicit delete flows.

## 4. List Action Menu UI

- [x] 4.1 Replace the list header delete button in `ListColumn.tsx` with an accessible `...` menu button.
- [x] 4.2 Render a popup menu containing `Archive`, close it on action, outside click, and Escape, and stop menu interactions from triggering list drag.
- [x] 4.3 Style the trigger and popup in `ListColumn.css` with stable dimensions that fit the compact column header.
- [x] 4.4 Add frontend tests for opening the menu, triggering archive, closing behavior, and no visible direct delete button in the header.

## 5. Verification

- [x] 5.1 Run backend tests.
- [x] 5.2 Run frontend tests.
- [x] 5.3 Run `rtk npm run build` from `nello/frontend` as the final frontend verification step.
