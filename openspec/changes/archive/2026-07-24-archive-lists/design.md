## Context

Lists currently have a direct `x` delete button in `ListColumn.tsx`. That dispatches `list/delete`, calls `DELETE /api/lists/:id`, and the backend deletes the `list` row, cascading its cards through SQLite foreign keys.

The requested behavior is an archive operation: the list disappears from normal board views, but its list row and cards are not deleted. The backend already centralizes board access through `check_board_access`, and board/list reads are built from the `list` table ordered by `position`.

## Goals / Non-Goals

**Goals:**

- Replace the direct delete button with a compact `...` menu button in the list header.
- Add an `Archive` menu action that hides the list from normal board and board-list views.
- Persist archived state in a new `list_archive` table while preserving the original `list` and `card` rows.
- Keep archive authorization consistent with existing list update/delete permissions.

**Non-Goals:**

- Restoring archived lists in the UI.
- Displaying an archive browser or archived-list count.
- Changing card archival semantics independently from the parent list.
- Removing the existing backend hard-delete endpoint unless implementation chooses to do so later.

## Decisions

### Archive marker table

Create `list_archive` as a marker table keyed by `list_id`, with `board_id`, `archived_by`, and `archived_at` metadata. The original `list` row remains the canonical list record, and cards stay attached to that row.

Alternative considered: moving rows from `list` into `list_archive`. That would break card foreign keys or require duplicating cards, which conflicts with the compact current schema and the "do not delete" requirement.

### Dedicated archive endpoint

Add `POST /api/lists/:id/archive` returning 204. A dedicated endpoint keeps archive separate from hard delete and allows the frontend to dispatch a distinct `list/archive` action while reusing the existing optimistic removal behavior locally.

Alternative considered: changing `DELETE /api/lists/:id` to archive. That would silently change destructive API semantics and make tests or future maintenance ambiguous.

### Filter archived lists at read boundaries

Board summaries, board detail, list creation position calculations, and reorder validation should ignore rows present in `list_archive`. Reorder requests should operate only on visible lists and must not unarchive omitted archived list IDs.

Alternative considered: deleting the list ID from board state only on the frontend. That would fail after reload because backend reads would return the list again.

### Popup menu scoped to list header

The menu button lives where the delete button was, stops drag event propagation, and exposes an accessible label. The menu closes after archive, when clicking outside, and on Escape.

Alternative considered: a global menu component. That would add unnecessary structure for one local menu in a compact app.

## Risks / Trade-offs

- [Archived lists have no restore path yet] -> Preserve enough metadata and original rows so a future restore action can remove the marker row.
- [Archived lists could affect ordering positions] -> Keep positions stable and filter archived rows in board reads and reorder handling.
- [Popup interactions can conflict with dnd-kit list dragging] -> Stop pointer and keyboard propagation on the menu trigger and menu items, matching the existing rename input pattern.
- [Existing hard delete still exists through the API] -> Keep it out of the list header UI and cover archive as the visible user flow.
