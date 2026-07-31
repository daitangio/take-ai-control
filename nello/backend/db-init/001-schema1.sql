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
CREATE TABLE IF NOT EXISTS card (
    id          TEXT PRIMARY KEY,
    list_id     TEXT NOT NULL REFERENCES list(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    position    INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
, modified_by TEXT, due_date TEXT, color TEXT);
CREATE TABLE IF NOT EXISTS board_member (
    board_id    TEXT NOT NULL REFERENCES board(id) ON DELETE CASCADE,
    user_id     TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    added_at    TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (board_id, user_id)
);
CREATE TABLE IF NOT EXISTS list_archive (
    list_id     TEXT PRIMARY KEY REFERENCES list(id) ON DELETE CASCADE,
    board_id    TEXT NOT NULL REFERENCES board(id) ON DELETE CASCADE,
    archived_by TEXT REFERENCES user(id) ON DELETE SET NULL,
    archived_at TEXT NOT NULL DEFAULT (datetime('now'))
);
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
CREATE UNIQUE INDEX IF NOT EXISTS `user_email_unique` ON `user` (`email`);

