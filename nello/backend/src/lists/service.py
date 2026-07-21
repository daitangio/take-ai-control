import logging

from ..deps import check_board_access

logger = logging.getLogger(__name__)


def create_list(db, user_id: str, list_id: str, board_id: str, name: str) -> dict | None:
    if check_board_access(db, board_id, user_id) is None:
        return None

    name = name.strip()

    max_pos = db.execute(
        """SELECT COALESCE(MAX(list.position), -1) AS mx
           FROM list
           LEFT JOIN list_archive ON list_archive.list_id = list.id
           WHERE list.board_id = ? AND list_archive.list_id IS NULL""",
        (board_id,),
    ).fetchone()["mx"]

    db.execute(
        "INSERT INTO list (id, board_id, name, position) VALUES (?, ?, ?, ?)",
        (list_id, board_id, name, max_pos + 1),
    )
    db.commit()
    logger.debug("INSERT list id=%s board_id=%s name=%s user_id=%s", list_id, board_id, name, user_id)
    return {"id": list_id, "boardId": board_id, "name": name, "cardIds": []}


def update_list(db, user_id: str, list_id: str, name: str) -> dict | None:
    name = name.strip()

    list_row = db.execute(
        """SELECT list.id, list.board_id, board.user_id
           FROM list JOIN board ON list.board_id = board.id
           WHERE list.id = ?""",
        (list_id,),
    ).fetchone()

    if list_row is None:
        return None

    if check_board_access(db, list_row["board_id"], user_id) is None:
        return None

    db.execute("UPDATE list SET name = ? WHERE id = ?", (name, list_id))
    db.commit()
    logger.debug("UPDATE list id=%s name=%s user_id=%s", list_id, name, user_id)

    card_rows = db.execute(
        "SELECT id FROM card WHERE list_id = ? ORDER BY position ASC",
        (list_id,),
    ).fetchall()

    return {
        "id": list_id,
        "boardId": list_row["board_id"],
        "name": name,
        "cardIds": [cr["id"] for cr in card_rows],
    }


def delete_list(db, user_id: str, list_id: str) -> bool:
    list_row = db.execute(
        """SELECT list.id, board.id AS board_id, board.user_id
           FROM list JOIN board ON list.board_id = board.id
           WHERE list.id = ?""",
        (list_id,),
    ).fetchone()

    if list_row is None:
        return False

    if check_board_access(db, list_row["board_id"], user_id) is None:
        return False

    db.execute("DELETE FROM list WHERE id = ?", (list_id,))
    db.commit()
    logger.debug("DELETE list id=%s user_id=%s", list_id, user_id)
    return True


def archive_list(db, user_id: str, list_id: str) -> bool:
    list_row = db.execute(
        """SELECT list.id, list.board_id
           FROM list
           WHERE list.id = ?""",
        (list_id,),
    ).fetchone()

    if list_row is None:
        return False

    if check_board_access(db, list_row["board_id"], user_id) is None:
        return False

    db.execute(
        """INSERT OR IGNORE INTO list_archive (list_id, board_id, archived_by)
           VALUES (?, ?, ?)""",
        (list_id, list_row["board_id"], user_id),
    )
    db.commit()
    logger.debug("ARCHIVE list id=%s board_id=%s user_id=%s", list_id, list_row["board_id"], user_id)
    return True


def reorder_lists(db, user_id: str, board_id: str, list_ids: list[str]) -> bool:
    if check_board_access(db, board_id, user_id) is None:
        return False

    visible_rows = db.execute(
        """SELECT list.id
           FROM list
           LEFT JOIN list_archive ON list_archive.list_id = list.id
           WHERE list.board_id = ? AND list_archive.list_id IS NULL""",
        (board_id,),
    ).fetchall()
    visible_ids = {row["id"] for row in visible_rows}
    visible_requested_ids = [lid for lid in list_ids if lid in visible_ids]

    for i, lid in enumerate(visible_requested_ids):
        db.execute(
            "UPDATE list SET position = ? WHERE id = ? AND board_id = ?",
            (i, lid, board_id),
        )
    db.commit()
    logger.debug("REORDER lists board_id=%s ids=%s user_id=%s", board_id, list_ids, user_id)
    return True
