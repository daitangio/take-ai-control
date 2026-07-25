## 1. Backend: List archived cards endpoint

- [x] 1.1 Add `list_archived_cards` function to `nello/backend/src/cards/service.py` — query joins `card`, `card_archive`, `list`, and `user` to return all archived cards for a board with archival metadata
- [x] 1.2 Add `GET /api/boards/{board_id}/archived-cards` route to `nello/backend/src/cards/router.py` with auth and board-access checks

## 2. Backend: Unarchive card endpoint

- [x] 2.1 Add `unarchive_card` function to `nello/backend/src/cards/service.py` — deletes the `card_archive` row, updates `card.list_id` to the target list, sets position to `MAX(position) + 1` for the target list
- [x] 2.2 Add `POST /api/cards/{card_id}/unarchive` route to `nello/backend/src/cards/router.py` with auth, board-access checks, and request body validation

## 3. Backend: Tests

- [x] 3.1 Add tests for `GET /boards/{board_id}/archived-cards` — with archived cards, empty board, no access
- [x] 3.2 Add tests for `POST /cards/{card_id}/unarchive` — successful restore to same list, restore to different list, non-existent card, non-existent target list, no access

## 4. Frontend: API client

- [x] 4.1 Add `ArchivedCard` response type and `UnarchiveRequest` type to `nello/frontend/src/api.ts`
- [x] 4.2 Add `getArchivedCards(boardId)` function calling `GET /api/boards/{board_id}/archived-cards`
- [x] 4.3 Add `unarchiveCard(cardId, targetListId)` function calling `POST /api/cards/{card_id}/unarchive`

## 5. Frontend: State management

- [x] 5.1 Add `card/unarchive` action type to `nello/frontend/src/state/types.ts`
- [x] 5.2 Add `card/unarchive` case to `nello/frontend/src/state/reducer.ts` — triggers a board refetch (or no-op in reducer, with refetch handled at the StoreContext level)
- [x] 5.3 Wire `card/unarchive` to `api.unarchiveCard()` in `nello/frontend/src/state/StoreContext.tsx`, refetch board on success

## 6. Frontend: ArchivedItemsDialog component

- [x] 6.1 Create `nello/frontend/src/components/ArchivedItemsDialog.tsx` with props `{ boardId, sourceListId, listName, onClose }`
- [x] 6.2 Implement `loadArchivedCards` with `useCallback`, loading/error/empty states
- [x] 6.3 Render archived cards grouped by original list, showing title, archiver email, and archive date
- [x] 6.4 Add "De-archive" button per card that calls `unarchiveCard(cardId, sourceListId)` and refetches the archived cards list

## 7. Frontend: ListColumn menu integration

- [x] 7.1 Add "Show archived items" button to the list action popup in `nello/frontend/src/components/ListColumn.tsx` (above "Archive")
- [x] 7.2 Add `onShowArchived` callback prop to `ListColumn`, call it with list ID and list name

## 8. Frontend: BoardView wiring

- [x] 8.1 Add `archivedItemsListId` state and `archivedItemsListName` state to `nello/frontend/src/components/BoardView.tsx`
- [x] 8.2 Pass `onShowArchived` callback to each `ListColumn`
- [x] 8.3 Render `ArchivedItemsDialog` conditionally when `archivedItemsListId` is set, passing `boardId`, `sourceListId`, and `listName`

## 9. Verification

- [x] 9.1 Run backend tests to confirm endpoints work
- [x] 9.2 Manual verification: archive a card, open "Show archived items" from a list menu, verify it appears in the dialog, de-archive it, verify it appears at the bottom of the source list
- [x] 9.3 Verify edge cases: empty dialog, de-archive multiple cards, close dialog via backdrop/Escape/button
