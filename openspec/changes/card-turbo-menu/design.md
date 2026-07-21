## Context

Cards currently open their detail modal when the tile is clicked. The modal edits title and description and can hard-delete the card. Board membership already exists through `board_member`, but that table represents board access, not assignment to individual cards. Lists recently gained non-destructive archive behavior through a marker table and filtered board reads; cards need the same "hide without deleting" semantics.

The requested card turbo menu is a compact action surface on the right side of each card tile. It must coexist with dnd-kit sortable card behavior, preserve normal card-click behavior, and expose deeper actions without adding a large always-visible control set to every card.

## Goals / Non-Goals

**Goals:**

- Add a right-side card action button with a popup menu for Details, Members, Due date, and Archive.
- Keep clicking the main card body opening the existing card details modal.
- Support multiple assigned members per card.
- Keep `board_member` unchanged and use it only as the eligibility source for assignments.
- Persist due dates, card archives, and card assignments on the backend.
- Hide archived cards from normal board views without deleting card rows or assignment rows.
- Keep the implementation compact and aligned with existing reducer/API patterns.

**Non-Goals:**

- Archive restore UI or archive browsing.
- Notifications, comments, labels, checklists, reminders, or recurring due dates.
- Assigning users who do not already have board access.
- Changing board sharing semantics or mutating the `board_member` table schema.
- Replacing the existing card detail modal.

## Decisions

### Card action popup lives inside `CardTile`

Add a small right-side button to each card tile and render a local popup menu from `CardTile`. The button and popup must stop pointer/click/keyboard propagation so they do not start card dragging or trigger the card body click.

Alternative considered: put all controls directly on the card tile. That would make every card visually heavier and increase accidental action risk in the compact board layout.

### `card_member` is separate from `board_member`

Create a new many-to-many table:

```sql
CREATE TABLE IF NOT EXISTS card_member (
    card_id     TEXT NOT NULL REFERENCES card(id) ON DELETE CASCADE,
    user_id     TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    assigned_at TEXT NOT NULL DEFAULT (datetime('now')),
    assigned_by TEXT REFERENCES user(id) ON DELETE SET NULL,
    PRIMARY KEY (card_id, user_id)
);
```

Assignment APIs validate that the assigned user is either the board owner or appears in `board_member` for the card's parent board. `board_member` remains the board access table and is not modified.

Alternative considered: add an assignee column to `card`. That only supports one assignee and conflicts with the clarified requirement that multiple members can be assigned to the same card.

### Due date is nullable card metadata

Add a nullable `due_date` column to `card`. The API should transport it as `dueDate: string | null` using a date-only `YYYY-MM-DD` value. The frontend should treat an empty date input as clearing the due date.

Alternative considered: store due date in a separate table. That adds unnecessary structure for one optional scalar value.

### Card archive mirrors list archive

Create `card_archive` as a marker table keyed by `card_id`, with `list_id`, `archived_by`, and `archived_at`. Normal board/detail reads filter archived cards out. Card rows, descriptions, due dates, and assignments remain intact.

Alternative considered: reusing `DELETE /api/cards/:id` for archive. That would silently change hard-delete semantics and remove the current explicit destructive action from the API.

### Board detail carries assignment summaries

Board detail/card responses should include `members: [{ id, email }]` so the frontend can render assigned member summaries without per-card fetches. The member popup can fetch eligible board members from the existing member endpoint and compare them to the card's assigned members.

Alternative considered: fetch assignments lazily for every card tile. That would multiply requests and complicate initial board rendering.

## Risks / Trade-offs

- [Popup interactions conflict with drag-and-drop] -> Stop event propagation on the action button and popup; add component tests for card body click versus menu click.
- [Archived cards reappear after reload] -> Filter `card_archive` at board-detail read boundaries and reload after archive failures.
- [Invalid card assignments create access leaks] -> Validate assigned users through the parent board before insertion; reject users outside the owner/member set.
- [Board member removal leaves stale card assignments] -> Either cascade manually when removing a board member or filter invalid assignments from reads. Prefer deleting that member's `card_member` rows for the board during member removal.
- [Due date timezone confusion] -> Store and display date-only strings, not timestamps.

## Migration Plan

1. Add startup migrations for `card.due_date`, `card_archive`, and `card_member`.
2. Backfill nothing; existing cards have `dueDate: null`, no archived marker, and no assigned members.
3. Keep existing card delete endpoint as hard delete.
4. Rollback is possible by ignoring the new tables/column from application code; existing card/list/board data remains usable.

## Open Questions

- Whether the card member popup should include the board owner as an assignable member. The recommended default is yes, because the owner has board access and often owns work.
