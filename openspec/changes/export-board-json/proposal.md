## Why

Users have no way to take a board's data out of Nello for backup, sharing, or offline analysis. The backend already returns the full board as JSON through `GET /api/boards/:id` — the frontend just needs to expose it as a download.

## What Changes

- Add an "Export board" entry to the user menu, placed before Logout and visible only when a board is active.
- On click, fetch the current board through the existing `/api/boards` API (`getBoard`) and download the response as a `.json` file.
- The file name derives from the board name: whitespace runs become `-` and every other non-alphanumeric character is removed (e.g. "Squad Board$" -> "Squad-Board.json"); if nothing remains, fall back to `board.json`.
- The menu entry is disabled while the export is in flight; failures surface through the existing toast mechanism.
- No backend changes; no new API endpoints.

## Capabilities

### New Capabilities

- `board-export`: export the currently active board as a downloadable JSON file using the existing boards API, with a sanitized file name.

### Modified Capabilities

None.

## Impact

- Frontend only: `StoreContext` (new `exportBoard` helper owning the API call and error toast), `UserMenu` component (new entry, name sanitization, blob download), i18n resources (new key in all 5 locales), `UserMenu` tests.
- No API, database schema, or dependency changes.
