## Why

Archiving a card is currently a one-way operation — once archived, there is no way to see it or bring it back. The `card_archive` table preserves the data, but no UI or API exists to list archived items or restore them. Users need a way to recover accidentally archived cards.

## What Changes

- Add a "Show archived items" button to the list header "..." menu that opens a dialog
- New `ArchivedItemsDialog` component showing all archived cards across the board, grouped by original list, with who archived each card and when
- Each archived card gets a "De-archive" button that restores it to the bottom of the list whose menu was opened
- New backend endpoint `GET /api/boards/{board_id}/archived-cards` to fetch archived cards for a board
- New backend endpoint `POST /api/cards/{card_id}/unarchive` to remove the archive marker and move the card to a target list
- New frontend API client methods, action type, reducer case, and state wiring for de-archive

## Capabilities

### New Capabilities
- `archived-items-view`: Viewing and restoring archived cards from a board-wide dialog. Users can browse all archived cards across lists, see archival metadata (who, when), and restore individual cards to an active list.

### Modified Capabilities
- `card-management`: Adds card unarchive — a new `POST /cards/{id}/unarchive` endpoint and `card/unarchive` action that removes the archive marker and places the card in a target list.
- `list-management`: Adds "Show archived items" to the list header action menu, complementing the existing "Archive" menu item.

## Impact

- **Backend**: `nello/backend/src/cards/router.py` (2 new endpoints), `nello/backend/src/cards/service.py` (new `list_archived_cards` and `unarchive_card` functions)
- **Frontend API**: `nello/frontend/src/api.ts` (new `getArchivedCards` and `unarchiveCard` methods)
- **Frontend state**: `nello/frontend/src/state/types.ts`, `reducer.ts`, `StoreContext.tsx` (new action + wiring)
- **Frontend components**: `ListColumn.tsx` (new menu item), `BoardView.tsx` (dialog state + render), new `ArchivedItemsDialog.tsx`
- **No breaking changes** — existing archive endpoints and UI remain unchanged
