## Context

nello backend is a FastAPI + SQLite application with a domain-sliced structure (`auth/`, `boards/`, `lists/`, `cards/`). Each domain follows the same pattern: `models.py` (Pydantic), `service.py` (business logic + raw SQL), `router.py` (HTTP handlers). Authorization is currently a simple owner check: `board.user_id == current_user` (joined through for lists and cards). The repo mantra is *less is more*.

**Constraints:**
- Raw SQL only (no ORM)
- SQLite database
- Client-generated UUIDs for all entity IDs
- `$` suffix convention for shared boards
- Owner = board creator (board.user_id), immutable
- `$` is permanent — cannot be removed once set
- Only owner manages members
- Cards track `modified_by`; lists do NOT

## Goals / Non-Goals

**Goals:**
- Board sharing via `$` name suffix convention
- `board_member` junction table for many-to-many user-board access
- Owner vs member role distinction across all operations
- Member management endpoints (add, remove, list)
- `modified_by` column on cards tracking last user who touched the card
- Schema migration that works on existing databases (ALTER TABLE for new column)
- Backward compatible response changes (new fields are additive)

**Non-Goals:**
- Frontend changes (backend-only change)
- List `modified_by` tracking
- Roles beyond owner/member (no admin, no viewer)
- Sharing without `$` convention
- Removing `$` from a shared board
- Email notifications for invitations
- Real-time collaboration or WebSocket sync

## Decisions

### 1. Sharing signal: `$` suffix convention

The presence of a trailing `$` in the board name signals that the board is shared. The convention is checked at:
- **Board creation**: if name ends with `$`, the creator becomes the first member
- **Board rename**: if current name has `$` and new name doesn't → reject (409)
- **Add member**: if board name doesn't end with `$` → reject (400)

The `$` is kept in the stored name. The frontend may choose to strip it for display.

**Alternatives considered**: a boolean `is_shared` column. Rejected because the `$` convention is simpler and visible. It also avoids a schema migration on the board table.

### 2. Authorization: single `check_board_access()` helper

Currently `_check_board_owner()` is duplicated in `lists/service.py` and `cards/service.py` (with a JOIN variant). This change introduces a single shared helper:

```python
# deps.py or a new access.py
def check_board_access(db, board_id: str, user_id: str) -> str | None:
    """Return 'owner' if user created the board, 'member' if shared, None if no access."""
    row = db.execute(
        "SELECT user_id FROM board WHERE id = ?", (board_id,)
    ).fetchone()
    if row is None:
        return None
    if row["user_id"] == user_id:
        return "owner"
    member = db.execute(
        "SELECT 1 FROM board_member WHERE board_id = ? AND user_id = ?",
        (board_id, user_id),
    ).fetchone()
    if member:
        return "member"
    return None
```

All service functions replace their ad-hoc checks with this single helper. The helper returns a role string so privileged operations (delete board, manage members) can gate on `"owner"` specifically.

### 3. Member management: email-based add

`POST /api/boards/{id}/members` accepts `{email}` (not user_id) because you invite users by email, not by UUID. The service resolves the email → user_id, checks it's not the owner, and INSERTs into `board_member`. The PK constraint (`board_id, user_id`) prevents duplicate adds.

**Endpoints:**
| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| `POST` | `/api/boards/:id/members` | owner | `{email}` | `{id, email}` |
| `DELETE` | `/api/boards/:id/members/:user_id` | owner | — | `204` |
| `GET` | `/api/boards/:id/members` | owner+member | — | `[{id, email}]` |

### 4. Database migration

Two changes to `init_db()`:

```sql
-- New table
CREATE TABLE IF NOT EXISTS board_member (
    board_id   TEXT NOT NULL REFERENCES board(id) ON DELETE CASCADE,
    user_id    TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    added_at   TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (board_id, user_id)
);

-- Migration for existing databases
-- SQLite's ALTER TABLE is limited; we use a try/except pattern:
-- Try adding the column; if it already exists, ignore the error
```

For the `modified_by` column, since SQLite doesn't support `ADD COLUMN IF NOT EXISTS`, we'll use a try/except in `init_db()` to add the column if it doesn't exist, catching the "duplicate column" error.

### 5. Response model changes

```python
# BoardResponse — adds two fields
class BoardResponse(BaseModel):
    id: str
    name: str
    listIds: list[str]
    isShared: bool
    isOwner: bool

# CardResponse — adds one optional field
class CardResponse(BaseModel):
    id: str
    listId: str
    title: str
    description: str
    modifiedBy: str | None = None

# CardBrief (in lists/models.py) — same addition
class CardBrief(BaseModel):
    id: str
    title: str
    description: str
    modifiedBy: str | None = None
```

`isShared` is derived from `name.endswith("$")`. `isOwner` is derived from comparing `board.user_id` to the current user.

### 6. Shared auth dependency for member routes

A new FastAPI dependency `get_board_role` resolves both ownership and membership for a given board, returning `(role, board)`. This keeps the member router clean and consistent with the existing `get_current_user` pattern.

Actually, to keep it simple and consistent with the codebase style, we'll just call `check_board_access()` inline in each service function, similar to how `_check_board_owner()` is used today. No new dependency needed beyond the check function living in `deps.py`.

### 7. Board listing: UNION for owned + shared

`get_boards` currently does `SELECT ... FROM board WHERE user_id = ?`. With sharing, it becomes:

```sql
SELECT id, name FROM board WHERE user_id = ?
UNION
SELECT b.id, b.name FROM board b
JOIN board_member bm ON b.id = bm.board_id
WHERE bm.user_id = ?
ORDER BY name ASC
```

This returns all boards the user can access (owned + member), sorted alphabetically.

## Risks / Trade-offs

- [`$` convention fragility] → The `$` suffix is a naming convention, not a database constraint. A direct SQL UPDATE could strip it. Mitigation: the API is the only writer; the rename endpoint rejects the change.
- [Migration on sqlite] → `ALTER TABLE ADD COLUMN` cannot be run inside a transaction in SQLite and will fail if the column already exists. Mitigation: try/except in `init_db()`, catching the specific error.
- [No frontend changes] → The frontend won't show shared boards or `modifiedBy` until a follow-up change. This is intentional scope-limiting.
- [N+1 in board listing] → `get_boards` already loops to fetch listIds per board. Adding membership checks per board would compound this. Mitigation: the UNION query avoids the N+1 for membership; the existing list-id loop remains for now.

## Open Questions

- None. All decisions resolved during exploration.
