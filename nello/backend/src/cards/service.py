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


def _card_row(db, card_id: str):
    """Return the card row with board_id, or None."""
    return db.execute(
        """SELECT card.id, card.list_id, card.title, card.description, card.modified_by,
                  list.board_id
           FROM card JOIN list ON card.list_id = list.id
           WHERE card.id = ?""",
        (card_id,),
    ).fetchone()


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
    return {"id": card_id, "listId": list_id, "title": title, "description": "", "modifiedBy": user_id}


def update_card(db, user_id: str, card_id: str, title: str, description: str) -> dict | None:
    card = _card_row(db, card_id)
    if card is None or check_board_access(db, card["board_id"], user_id) is None:
        return None

    title = title.strip()
    db.execute(
        "UPDATE card SET title = ?, description = ?, modified_by = ? WHERE id = ?",
        (title, description, user_id, card_id),
    )
    db.commit()
    logger.debug("UPDATE card id=%s title=%s user_id=%s", card_id, title, user_id)
    return {"id": card_id, "listId": card["list_id"], "title": title, "description": description, "modifiedBy": user_id}


def delete_card(db, user_id: str, card_id: str) -> bool:
    card = _card_row(db, card_id)
    if card is None or check_board_access(db, card["board_id"], user_id) is None:
        return False

    db.execute("DELETE FROM card WHERE id = ?", (card_id,))
    db.commit()
    logger.debug("DELETE card id=%s user_id=%s", card_id, user_id)
    return True


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
