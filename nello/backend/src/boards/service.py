import logging

from ..deps import check_board_access
from ..cards.service import card_members

logger = logging.getLogger(__name__)


def create_board(db, user_id: str, board_id: str, name: str) -> dict:
    name = name.strip()
    db.execute(
        "INSERT INTO board (id, user_id, name) VALUES (?, ?, ?)",
        (board_id, user_id, name),
    )
    db.commit()
    logger.debug("INSERT board id=%s name=%s user_id=%s", board_id, name, user_id)
    is_shared = name.endswith("$")
    return {"id": board_id, "name": name, "listIds": [], "isShared": is_shared, "isOwner": True}


def get_boards(db, user_id: str) -> list[dict]:
    rows = db.execute(
        """SELECT id, name, user_id FROM board WHERE user_id = ?
           UNION
           SELECT b.id, b.name, b.user_id FROM board b
           JOIN board_member bm ON b.id = bm.board_id
           WHERE bm.user_id = ?
           ORDER BY name ASC""",
        (user_id, user_id),
    ).fetchall()

    boards = []
    for row in rows:
        list_rows = db.execute(
            """SELECT list.id
               FROM list
               LEFT JOIN list_archive ON list_archive.list_id = list.id
               WHERE list.board_id = ? AND list_archive.list_id IS NULL
               ORDER BY list.position ASC""",
            (row["id"],),
        ).fetchall()
        boards.append({
            "id": row["id"],
            "name": row["name"],
            "listIds": [lr["id"] for lr in list_rows],
            "isShared": row["name"].endswith("$"),
            "isOwner": row["user_id"] == user_id,
        })
    return boards


def get_board(db, user_id: str, board_id: str) -> dict | None:
    role = check_board_access(db, board_id, user_id)
    if role is None:
        return None

    row = db.execute(
        "SELECT id, name, user_id FROM board WHERE id = ?", (board_id,)
    ).fetchone()

    list_rows = db.execute(
        """SELECT list.id, list.name
           FROM list
           LEFT JOIN list_archive ON list_archive.list_id = list.id
           WHERE list.board_id = ? AND list_archive.list_id IS NULL
           ORDER BY list.position ASC""",
        (board_id,),
    ).fetchall()

    lists = []
    for lr in list_rows:
        card_rows = db.execute(
            """SELECT card.id, card.title, card.description, card.due_date, card.modified_by,
                      u.email AS modified_by_email
               FROM card
               LEFT JOIN user u ON card.modified_by = u.id
               LEFT JOIN card_archive ON card_archive.card_id = card.id
               WHERE card.list_id = ?
                 AND card_archive.card_id IS NULL
               ORDER BY card.position ASC""",
            (lr["id"],),
        ).fetchall()
        lists.append({
            "id": lr["id"],
            "name": lr["name"],
            "cards": [
                {
                    "id": cr["id"],
                    "title": cr["title"],
                    "description": cr["description"],
                    "dueDate": cr["due_date"],
                    "members": card_members(db, cr["id"]),
                    "modifiedBy": cr["modified_by"],
                    "modifiedByEmail": None if cr["modified_by"] == user_id else cr["modified_by_email"],
                    "isModifiedByCurrentUser": (cr["modified_by"] == user_id) if cr["modified_by"] else None,
                }
                for cr in card_rows
            ],
        })

    return {"id": row["id"], "name": row["name"], "lists": lists}


def update_board(db, user_id: str, board_id: str, name: str) -> dict | None:
    name = name.strip()
    role = check_board_access(db, board_id, user_id)
    if role is None:
        return None

    row = db.execute(
        "SELECT name FROM board WHERE id = ?", (board_id,)
    ).fetchone()

    # Reject rename that removes $ from a shared board
    if row["name"].endswith("$") and not name.endswith("$"):
        logger.debug("REJECT rename board id=%s: cannot remove $ from shared board", board_id)
        return None

    db.execute("UPDATE board SET name = ? WHERE id = ?", (name, board_id))
    db.commit()
    logger.debug("UPDATE board id=%s name=%s user_id=%s", board_id, name, user_id)
    return {"id": board_id, "name": name, "isShared": name.endswith("$"), "isOwner": role == "owner"}


def delete_board(db, user_id: str, board_id: str) -> bool:
    role = check_board_access(db, board_id, user_id)
    if role != "owner":
        return False

    db.execute("DELETE FROM board WHERE id = ?", (board_id,))
    db.commit()
    logger.debug("DELETE board id=%s user_id=%s", board_id, user_id)
    return True
