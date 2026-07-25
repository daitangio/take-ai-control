## Context

The existing archive system uses a soft-delete pattern: archiving a card inserts a row into `card_archive` and the board query filters these out via `LEFT JOIN ... WHERE card_archive.card_id IS NULL`. The card row itself is preserved. There is currently no way to list archived cards or restore them.

The frontend follows a consistent pattern: API client functions in `api.ts`, actions dispatched through `StoreContext`, a reducer in `reducer.ts`, and modal dialogs rendered conditionally from `BoardView.tsx`. The `ListColumn.tsx` "..." menu currently has a single "Archive" item.

## Goals / Non-Goals

**Goals:**
- Let users see all archived cards across the board in a single dialog
- Let users de-archive individual cards, placing them at the bottom of the list whose menu they opened from
- Show archival metadata: which list the card was in, who archived it, and when
- Follow existing modal dialog patterns for consistency
- Keep the dialog open after de-archive to allow multiple restores

**Non-Goals:**
- Restoring cards to their exact original position (always goes to bottom of the source list)
- Bulk de-archive (single card at a time)
- Viewing or restoring archived lists (cards only, though the API is structured to allow future extension)
- Searching/filtering archived cards (no search input in this iteration)

## Decisions

### 1. Per-board scope with per-list restore target

**Decision**: The dialog fetches archived cards for the entire board (`GET /api/boards/{board_id}/archived-cards`), but de-archive always places the card at the bottom of the **list whose "..." menu was opened** — not the list it was originally archived from.

**Rationale**: Showing board-wide scope gives users the full picture. Restoring to the source list (not the original list) is more intuitive — the user opened the menu from a specific list, so that's their working context. It also avoids confusion when the original list has been archived.

**Alternative considered**: Per-list scope (`GET /api/lists/{list_id}/archived-cards`). Rejected because users think in terms of "what have I archived" not "what did I archive from this specific list." A board-level view is more useful.

### 2. Refetch board after de-archive (not surgical state update)

**Decision**: After a successful de-archive, the frontend refetches the entire board rather than surgically inserting the card into the reducer state.

**Rationale**: The card may be restored to a different list than its original, with a fresh position at the bottom. A full refetch guarantees consistency without adding complex position-handling logic to the reducer. Board data is small enough that this is not a performance concern.

**Alternative considered**: Returning the updated card from the API and adding it to state via a `card/unarchive` reducer case. Rejected because position management in the reducer is error-prone (racing with other cards, stale max-position values).

### 3. `POST /cards/{id}/unarchive` with target list in body

**Decision**: The de-archive endpoint uses `POST` with a JSON body `{targetListId}` rather than `DELETE /cards/{id}/archive`.

**Rationale**: De-archive is not simply "undo archive" — it also moves the card to a potentially different list with a fresh position. `POST` with a body communicates this as an action with side effects beyond just removing the archive marker. A `DELETE` on the archive resource would be semantically cleaner for idempotent removal, but would need a separate call to move the card.

**Alternative considered**: `DELETE /cards/{id}/archive` + `PUT /cards/{id}/move`. Rejected because it requires two round-trips and allows inconsistent intermediate state.

### 4. Follow CardMemberDialog pattern

**Decision**: `ArchivedItemsDialog` copies the structure of `CardMemberDialog`: overlay ref, `useCallback`-wrapped load function, loading/error/empty states, conditional render from `BoardView`.

**Rationale**: Consistency. All three existing dialogs (`CardModal`, `CardMemberDialog`, `MemberDialog`) use the same pattern. No new CSS classes needed — `.modal-overlay`, `.modal`, `.modal-close-btn` are fully reusable.

### 5. Backend returns archival metadata

**Decision**: The `GET /boards/{board_id}/archived-cards` response includes `archivedBy`, `archivedByEmail`, `archivedAt`, and `originalListId` for each card.

**Rationale**: The dialog needs to show who archived each card and when. `archived_by` can be NULL (user deleted — `ON DELETE SET NULL`), so the frontend will display "Unknown user" in that case. The `originalListId` allows the dialog to group or label cards by their source list.

## Risks / Trade-offs

- **[Low] Stale dialog data**: If another user archives or de-archives cards while the dialog is open, the list may be stale. → Mitigation: The dialog refetches after each de-archive action. No real-time sync is attempted (consistent with the rest of the app).
- **[Low] Deleted user**: `archived_by` can be NULL if the archiving user was deleted. → Mitigation: Frontend displays "Unknown user" for NULL values.
- **[Low] Archived source list**: A card's original list might be archived. → Mitigation: The `originalListId` in the response is informational only. De-archive always targets the active source list, which is guaranteed to be visible (it's the list whose menu was clicked).

## Open Questions

- None remaining. Both design ambiguities (per-board vs per-list scope, and de-archive destination) were resolved during exploration.
