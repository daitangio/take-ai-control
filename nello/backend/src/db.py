import sqlite3
import logging
from pathlib import Path

from .config import DATABASE_PATH

logger = logging.getLogger(__name__)

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS user (
    id          TEXT PRIMARY KEY,
    email       TEXT UNIQUE NOT NULL,
    password    TEXT NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS board (
    id          TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS list (
    id          TEXT PRIMARY KEY,
    board_id    TEXT NOT NULL REFERENCES board(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    position    INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS list_archive (
    list_id     TEXT PRIMARY KEY REFERENCES list(id) ON DELETE CASCADE,
    board_id    TEXT NOT NULL REFERENCES board(id) ON DELETE CASCADE,
    archived_by TEXT REFERENCES user(id) ON DELETE SET NULL,
    archived_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS card (
    id          TEXT PRIMARY KEY,
    list_id     TEXT NOT NULL REFERENCES list(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    position    INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS board_member (
    board_id    TEXT NOT NULL REFERENCES board(id) ON DELETE CASCADE,
    user_id     TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    added_at    TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (board_id, user_id)
);
"""


def _add_column_if_missing(conn: sqlite3.Connection, table: str, column_sql: str) -> None:
    try:
        conn.execute(f"ALTER TABLE {table} ADD COLUMN {column_sql}")
    except sqlite3.OperationalError:
        pass


def apply_migrations(conn: sqlite3.Connection) -> None:
    """Apply additive schema changes for existing SQLite databases."""
    _add_column_if_missing(conn, "card", "modified_by TEXT")
    _add_column_if_missing(conn, "card", "due_date TEXT")
    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS card_archive (
            card_id     TEXT PRIMARY KEY REFERENCES card(id) ON DELETE CASCADE,
            list_id     TEXT NOT NULL REFERENCES list(id) ON DELETE CASCADE,
            archived_by TEXT REFERENCES user(id) ON DELETE SET NULL,
            archived_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS card_member (
            card_id     TEXT NOT NULL REFERENCES card(id) ON DELETE CASCADE,
            user_id     TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
            assigned_at TEXT NOT NULL DEFAULT (datetime('now')),
            assigned_by TEXT REFERENCES user(id) ON DELETE SET NULL,
            PRIMARY KEY (card_id, user_id)
        );
        """
    )
    conn.commit()


def init_db() -> None:
    """Create database file and tables if they don't exist."""
    db_path = Path(DATABASE_PATH)
    db_path.parent.mkdir(parents=True, exist_ok=True)

    conn = sqlite3.connect(str(db_path), check_same_thread=False)
    conn.executescript(SCHEMA_SQL)
    apply_migrations(conn)
    conn.close()
    logger.info("Database initialized at %s", db_path)


def get_db() -> sqlite3.Connection:
    """Yield a database connection. Use as a FastAPI dependency.
    GG: to fix a 'SQLite objects created in a thread can only be used in that same thread.'
    AI put check_same_thread=False
    but I am not fully convinced of this course of action but seems confirmed by
    https://fastapi.tiangolo.com/tutorial/sql-databases/
    
    """
    conn = sqlite3.connect(DATABASE_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        yield conn
    finally:
        conn.close()
