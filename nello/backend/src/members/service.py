import logging
import sqlite3

from ..deps import check_board_access

logger = logging.getLogger(__name__)


def add_member(db, owner_id: str, board_id: str, email: str) -> dict | None:
    """Add a user to a shared board. Returns member dict, or None on failure.
    Raises ValueError for business rule violations.
    """
    role = check_board_access(db, board_id, owner_id)
    if role is None:
        return None  # Board not found or no access
    if role != "owner":
        raise PermissionError("Only the board owner can add members")

    # Check board is shared
    board = db.execute("SELECT name FROM board WHERE id = ?", (board_id,)).fetchone()
    if not board["name"].endswith("$"):
        raise ValueError("Board is not shared (name must end with '$')")

    # Resolve email to user_id
    user_row = db.execute(
        "SELECT id, email FROM user WHERE email = ?", (email,)
    ).fetchone()
    if user_row is None:
        raise LookupError("User not found")

    if user_row["id"] == owner_id:
        raise ValueError("Cannot add yourself as a member")

    try:
        db.execute(
            "INSERT INTO board_member (board_id, user_id) VALUES (?, ?)",
            (board_id, user_row["id"]),
        )
        db.commit()
    except sqlite3.IntegrityError:
        raise ValueError("User is already a member")

    logger.debug("ADD_MEMBER board_id=%s user_id=%s email=%s", board_id, user_row["id"], email)
    return {"id": user_row["id"], "email": user_row["email"]}


def remove_member(db, owner_id: str, board_id: str, member_id: str) -> bool:
    """Remove a user from a shared board. Only the owner can do this."""
    role = check_board_access(db, board_id, owner_id)
    if role is None or role != "owner":
        return False

    cursor = db.execute(
        "DELETE FROM board_member WHERE board_id = ? AND user_id = ?",
        (board_id, member_id),
    )
    db.commit()
    if cursor.rowcount == 0:
        return False
    logger.debug("REMOVE_MEMBER board_id=%s user_id=%s", board_id, member_id)
    return True


def list_members(db, user_id: str, board_id: str) -> list[dict] | None:
    """List all members of a shared board. Requires board access."""
    if check_board_access(db, board_id, user_id) is None:
        return None

    rows = db.execute(
        """SELECT u.id, u.email
           FROM board_member bm
           JOIN user u ON bm.user_id = u.id
           WHERE bm.board_id = ?
           ORDER BY bm.added_at ASC""",
        (board_id,),
    ).fetchall()

    return [{"id": r["id"], "email": r["email"]} for r in rows]
