import logging

logger = logging.getLogger(__name__)


def _check_list_owner(db, list_id: str, user_id: str) -> bool:
    row = db.execute(
        """SELECT board.user_id
           FROM list JOIN board ON list.board_id = board.id
           WHERE list.id = ?""",
        (list_id,),
    ).fetchone()
    return row is not None and row["user_id"] == user_id


def _check_card_owner(db, card_id: str, user_id: str) -> dict | None:
    """Return the card row if owned by user, else None."""
    row = db.execute(
        """SELECT card.id, card.list_id, card.title, card.description, board.user_id
           FROM card
           JOIN list ON card.list_id = list.id
           JOIN board ON list.board_id = board.id
           WHERE card.id = ?""",
        (card_id,),
    ).fetchone()

    if row is None or row["user_id"] != user_id:
        return None
    return row


def create_card(db, user_id: str, card_id: str, list_id: str, title: str) -> dict | None:
    if not _check_list_owner(db, list_id, user_id):
        return None

    title = title.strip()

    max_pos = db.execute(
        "SELECT COALESCE(MAX(position), -1) AS mx FROM card WHERE list_id = ?",
        (list_id,),
    ).fetchone()["mx"]

    db.execute(
        "INSERT INTO card (id, list_id, title, position) VALUES (?, ?, ?, ?)",
        (card_id, list_id, title, max_pos + 1),
    )
    db.commit()
    logger.debug("INSERT card id=%s list_id=%s title=%s user_id=%s", card_id, list_id, title, user_id)
    return {"id": card_id, "listId": list_id, "title": title, "description": ""}


def update_card(db, user_id: str, card_id: str, title: str, description: str) -> dict | None:
    card = _check_card_owner(db, card_id, user_id)
    if card is None:
        return None

    title = title.strip()
    db.execute(
        "UPDATE card SET title = ?, description = ? WHERE id = ?",
        (title, description, card_id),
    )
    db.commit()
    logger.debug("UPDATE card id=%s title=%s user_id=%s", card_id, title, user_id)
    return {"id": card_id, "listId": card["list_id"], "title": title, "description": description}


def delete_card(db, user_id: str, card_id: str) -> bool:
    card = _check_card_owner(db, card_id, user_id)
    if card is None:
        return False

    db.execute("DELETE FROM card WHERE id = ?", (card_id,))
    db.commit()
    logger.debug("DELETE card id=%s user_id=%s", card_id, user_id)
    return True


def move_card(db, user_id: str, card_id: str, to_list_id: str, index: int) -> bool:
    card = _check_card_owner(db, card_id, user_id)
    if card is None:
        return False

    if not _check_list_owner(db, to_list_id, user_id):
        return False

    # Remove from current list position and renumber
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

    # Insert at target position in destination list
    target_cards = list(db.execute(
        "SELECT id FROM card WHERE list_id = ? ORDER BY position ASC",
        (to_list_id,),
    ).fetchall())

    clamped = max(0, min(index, len(target_cards)))
    target_cards.insert(clamped, {"id": card_id})

    db.execute("UPDATE card SET list_id = ? WHERE id = ?", (to_list_id, card_id))
    for pos, cr in enumerate(target_cards):
        db.execute("UPDATE card SET position = ? WHERE id = ?", (pos, cr["id"]))

    db.commit()
    logger.debug(
        "MOVE card id=%s from_list=%s to_list=%s index=%d user_id=%s",
        card_id, old_list_id, to_list_id, index, user_id,
    )
    return True
