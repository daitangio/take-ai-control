import logging

logger = logging.getLogger(__name__)


def create_board(db, user_id: str, board_id: str, name: str) -> dict:
    name = name.strip()
    db.execute(
        "INSERT INTO board (id, user_id, name) VALUES (?, ?, ?)",
        (board_id, user_id, name),
    )
    db.commit()
    logger.debug("INSERT board id=%s name=%s user_id=%s", board_id, name, user_id)
    return {"id": board_id, "name": name, "listIds": []}


def get_boards(db, user_id: str) -> list[dict]:
    rows = db.execute(
        "SELECT id, name FROM board WHERE user_id = ? ORDER BY name ASC",
        (user_id,),
    ).fetchall()

    boards = []
    for row in rows:
        list_rows = db.execute(
            "SELECT id FROM list WHERE board_id = ? ORDER BY position ASC",
            (row["id"],),
        ).fetchall()
        boards.append({
            "id": row["id"],
            "name": row["name"],
            "listIds": [lr["id"] for lr in list_rows],
        })
    return boards


def get_board(db, user_id: str, board_id: str) -> dict | None:
    row = db.execute(
        "SELECT id, name FROM board WHERE id = ? AND user_id = ?",
        (board_id, user_id),
    ).fetchone()

    if row is None:
        return None

    list_rows = db.execute(
        "SELECT id, name FROM list WHERE board_id = ? ORDER BY position ASC",
        (board_id,),
    ).fetchall()

    lists = []
    for lr in list_rows:
        card_rows = db.execute(
            "SELECT id, title, description FROM card WHERE list_id = ? ORDER BY position ASC",
            (lr["id"],),
        ).fetchall()
        lists.append({
            "id": lr["id"],
            "name": lr["name"],
            "cards": [{"id": cr["id"], "title": cr["title"], "description": cr["description"]} for cr in card_rows],
        })

    return {"id": row["id"], "name": row["name"], "lists": lists}


def update_board(db, user_id: str, board_id: str, name: str) -> dict | None:
    name = name.strip()
    row = db.execute(
        "SELECT id FROM board WHERE id = ? AND user_id = ?",
        (board_id, user_id),
    ).fetchone()

    if row is None:
        return None

    db.execute("UPDATE board SET name = ? WHERE id = ?", (name, board_id))
    db.commit()
    logger.debug("UPDATE board id=%s name=%s user_id=%s", board_id, name, user_id)
    return {"id": board_id, "name": name}


def delete_board(db, user_id: str, board_id: str) -> bool:
    row = db.execute(
        "SELECT id FROM board WHERE id = ? AND user_id = ?",
        (board_id, user_id),
    ).fetchone()

    if row is None:
        return False

    db.execute("DELETE FROM board WHERE id = ?", (board_id,))
    db.commit()
    logger.debug("DELETE board id=%s user_id=%s", board_id, user_id)
    return True
