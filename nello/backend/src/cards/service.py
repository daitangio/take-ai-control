import logging

from ..deps import check_board_access

logger = logging.getLogger(__name__)


def _list_board_id(db, list_id: str) -> str | None:
    """Return the board_id for a given list_id, or None."""
    row = db.execute(
        "SELECT board_id FROM list WHERE id = ?", (list_id,)
    ).fetchone()
    return row["board_id"] if row else None


def _card_board_id(db, card_id: str) -> str | None:
    """Return the board_id for a given card_id (via its list), or None."""
    row = db.execute(
        """SELECT list.board_id
           FROM card JOIN list ON card.list_id = list.id
           WHERE card.id = ?""",
        (card_id,),
    ).fetchone()
    return row["board_id"] if row else None


def _editor_metadata(db, modified_by: str | None, requester_id: str) -> dict:
    """Return modifiedByEmail and isModifiedByCurrentUser for a card."""
    if not modified_by:
        return {"modifiedByEmail": None, "isModifiedByCurrentUser": None}
    is_current = modified_by == requester_id
    email = None
    if not is_current:
        row = db.execute("SELECT email FROM user WHERE id = ?", (modified_by,)).fetchone()
        if row:
            email = row["email"]
    return {"modifiedByEmail": email, "isModifiedByCurrentUser": is_current}


def _card_row(db, card_id: str):
    """Return the card row with board_id, or None."""
    return db.execute(
        """SELECT card.id, card.list_id, card.title, card.description, card.due_date, card.modified_by,
                  list.board_id
           FROM card JOIN list ON card.list_id = list.id
           WHERE card.id = ?""",
        (card_id,),
    ).fetchone()


def card_members(db, card_id: str) -> list[dict]:
    rows = db.execute(
        """SELECT u.id, u.email
           FROM card_member cm
           JOIN user u ON u.id = cm.user_id
           WHERE cm.card_id = ?
           ORDER BY cm.assigned_at ASC, u.email ASC""",
        (card_id,),
    ).fetchall()
    return [{"id": row["id"], "email": row["email"]} for row in rows]


def eligible_card_members(db, board_id: str) -> list[dict]:
    rows = db.execute(
        """SELECT u.id, u.email
           FROM board b
           JOIN user u ON u.id = b.user_id
           WHERE b.id = ?
           UNION
           SELECT u.id, u.email
           FROM board_member bm
           JOIN user u ON u.id = bm.user_id
           WHERE bm.board_id = ?
           ORDER BY email ASC""",
        (board_id, board_id),
    ).fetchall()
    return [{"id": row["id"], "email": row["email"]} for row in rows]


def _card_response(db, requester_id: str, card) -> dict:
    meta = _editor_metadata(db, card["modified_by"], requester_id)
    return {
        "id": card["id"],
        "listId": card["list_id"],
        "title": card["title"],
        "description": card["description"],
        "dueDate": card["due_date"],
        "members": card_members(db, card["id"]),
        "modifiedBy": card["modified_by"],
        **meta,
    }


def create_card(db, user_id: str, card_id: str, list_id: str, title: str) -> dict | None:
    board_id = _list_board_id(db, list_id)
    if board_id is None or check_board_access(db, board_id, user_id) is None:
        return None

    title = title.strip()

    max_pos = db.execute(
        "SELECT COALESCE(MAX(position), -1) AS mx FROM card WHERE list_id = ?",
        (list_id,),
    ).fetchone()["mx"]

    db.execute(
        "INSERT INTO card (id, list_id, title, position, modified_by) VALUES (?, ?, ?, ?, ?)",
        (card_id, list_id, title, max_pos + 1, user_id),
    )
    db.commit()
    logger.debug("INSERT card id=%s list_id=%s title=%s user_id=%s", card_id, list_id, title, user_id)
    card = _card_row(db, card_id)
    return _card_response(db, user_id, card)


def update_card(
    db,
    user_id: str,
    card_id: str,
    title: str,
    description: str,
    due_date: str | None = None,
    due_date_provided: bool = False,
) -> dict | None:
    card = _card_row(db, card_id)
    if card is None or check_board_access(db, card["board_id"], user_id) is None:
        return None

    title = title.strip()
    if due_date_provided:
        db.execute(
            "UPDATE card SET title = ?, description = ?, due_date = ?, modified_by = ? WHERE id = ?",
            (title, description, due_date, user_id, card_id),
        )
    else:
        db.execute(
            "UPDATE card SET title = ?, description = ?, modified_by = ? WHERE id = ?",
            (title, description, user_id, card_id),
        )
    db.commit()
    logger.debug("UPDATE card id=%s title=%s user_id=%s", card_id, title, user_id)
    updated = _card_row(db, card_id)
    return _card_response(db, user_id, updated)


def delete_card(db, user_id: str, card_id: str) -> bool:
    card = _card_row(db, card_id)
    if card is None or check_board_access(db, card["board_id"], user_id) is None:
        return False

    db.execute("DELETE FROM card WHERE id = ?", (card_id,))
    db.commit()
    logger.debug("DELETE card id=%s user_id=%s", card_id, user_id)
    return True


def archive_card(db, user_id: str, card_id: str) -> bool:
    card = _card_row(db, card_id)
    if card is None or check_board_access(db, card["board_id"], user_id) is None:
        return False

    db.execute(
        """INSERT OR IGNORE INTO card_archive (card_id, list_id, archived_by)
           VALUES (?, ?, ?)""",
        (card_id, card["list_id"], user_id),
    )
    db.commit()
    logger.debug("ARCHIVE card id=%s list_id=%s user_id=%s", card_id, card["list_id"], user_id)
    return True


def list_card_members(db, user_id: str, card_id: str) -> list[dict] | None:
    card = _card_row(db, card_id)
    if card is None or check_board_access(db, card["board_id"], user_id) is None:
        return None
    return card_members(db, card_id)


def list_card_member_options(db, user_id: str, card_id: str) -> list[dict] | None:
    card = _card_row(db, card_id)
    if card is None or check_board_access(db, card["board_id"], user_id) is None:
        return None
    return eligible_card_members(db, card["board_id"])


def add_card_member(db, user_id: str, card_id: str, member_id: str) -> dict | None:
    card = _card_row(db, card_id)
    if card is None or check_board_access(db, card["board_id"], user_id) is None:
        return None
    if check_board_access(db, card["board_id"], member_id) is None:
        raise ValueError("User does not have access to this board")

    db.execute(
        """INSERT OR IGNORE INTO card_member (card_id, user_id, assigned_by)
           VALUES (?, ?, ?)""",
        (card_id, member_id, user_id),
    )
    db.commit()
    row = db.execute("SELECT id, email FROM user WHERE id = ?", (member_id,)).fetchone()
    if row is None:
        return None
    logger.debug("ADD_CARD_MEMBER card_id=%s user_id=%s assigned_by=%s", card_id, member_id, user_id)
    return {"id": row["id"], "email": row["email"]}


def remove_card_member(db, user_id: str, card_id: str, member_id: str) -> bool:
    card = _card_row(db, card_id)
    if card is None or check_board_access(db, card["board_id"], user_id) is None:
        return False

    cursor = db.execute(
        "DELETE FROM card_member WHERE card_id = ? AND user_id = ?",
        (card_id, member_id),
    )
    db.commit()
    logger.debug("REMOVE_CARD_MEMBER card_id=%s user_id=%s removed_by=%s", card_id, member_id, user_id)
    return cursor.rowcount > 0


def move_card(db, user_id: str, card_id: str, to_list_id: str, index: int) -> bool:
    card = _card_row(db, card_id)
    if card is None or check_board_access(db, card["board_id"], user_id) is None:
        return False

    to_board_id = _list_board_id(db, to_list_id)
    if to_board_id is None or check_board_access(db, to_board_id, user_id) is None:
        return False

    old_list_id = card["list_id"]
    old_cards = db.execute(
        "SELECT id FROM card WHERE list_id = ? ORDER BY position ASC",
        (old_list_id,),
    ).fetchall()

    for pos, cr in enumerate(old_cards):
        if cr["id"] != card_id:
            db.execute("UPDATE card SET position = ? WHERE id = ?", (pos, cr["id"]))
        else:
            db.execute("UPDATE card SET position = ? WHERE id = ?", (-1, cr["id"]))

    target_cards = list(db.execute(
        "SELECT id FROM card WHERE list_id = ? ORDER BY position ASC",
        (to_list_id,),
    ).fetchall())

    clamped = max(0, min(index, len(target_cards)))
    target_cards.insert(clamped, {"id": card_id})

    db.execute("UPDATE card SET list_id = ?, modified_by = ? WHERE id = ?", (to_list_id, user_id, card_id))
    for pos, cr in enumerate(target_cards):
        db.execute("UPDATE card SET position = ? WHERE id = ?", (pos, cr["id"]))

    db.commit()
    logger.debug(
        "MOVE card id=%s from_list=%s to_list=%s index=%d user_id=%s",
        card_id, old_list_id, to_list_id, index, user_id,
    )
    return True
