-- 000-stone-base.sql
create table if not exists stone_base (
    id integer primary key,
    file text,
    execution text created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 001-schema1.sql
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
-- Compatibility shim for legacy DBs: removed by 006-drop-list-archive.sql.
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


-- 002-register-key.sql
-- New table to implement form registration with a key_pass+ an email regexp guard
CREATE TABLE IF NOT EXISTS register_key  (
	id                     integer PRIMARY KEY NOT NULL,
	key_pass               text NOT NULL UNIQUE,
	email_regexp           text NOT NULL,
	avail_count            integer NOT NULL,
	created_at  TEXT NOT NULL DEFAULT (datetime('now'))
) STRICT;
-- 003-audit-log.sql
CREATE table if not exists audit_log (
    id  integer PRIMARY KEY NOT NULL, -- alias for rowid
    url TEXT,
    method TEXT,
    request TEXT,
    response TEXT,
    user_email TEXT,
    log_time  TEXT NOT NULL DEFAULT (datetime('now'))
) STRICT;

