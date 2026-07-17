--liquibase formatted sql

--changeset GG:1

CREATE TABLE IF NOT EXISTS users (
    id         VARCHAR(36)  NOT NULL PRIMARY KEY,
    email      VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP    NOT NULL
);

CREATE TABLE IF NOT EXISTS magic_link_tokens (
    id         VARCHAR(36)  NOT NULL PRIMARY KEY,
    token_hash VARCHAR(64)  NOT NULL UNIQUE,
    email      VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP    NOT NULL,
    used       BOOLEAN      NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS boards (
    id         VARCHAR(36)  NOT NULL PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    owner_id   VARCHAR(36)  NOT NULL REFERENCES users(id),
    created_at TIMESTAMP    NOT NULL
);

CREATE TABLE IF NOT EXISTS board_members (
    board_id VARCHAR(36) NOT NULL REFERENCES boards(id),
    user_id  VARCHAR(36) NOT NULL REFERENCES users(id),
    PRIMARY KEY (board_id, user_id)
);

CREATE TABLE IF NOT EXISTS board_lists (
    id       VARCHAR(36)  NOT NULL PRIMARY KEY,
    board_id VARCHAR(36)  NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    name     VARCHAR(255) NOT NULL,
    position INTEGER      NOT NULL
);

CREATE TABLE IF NOT EXISTS cards (
    id          VARCHAR(36)  NOT NULL PRIMARY KEY,
    list_id     VARCHAR(36)  NOT NULL REFERENCES board_lists(id) ON DELETE CASCADE,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    due_date    DATE,
    assignee_id VARCHAR(36)  REFERENCES users(id),
    position    INTEGER      NOT NULL,
    created_at  TIMESTAMP    NOT NULL
);

-- Hibernate Envers audit tables
CREATE TABLE IF NOT EXISTS revinfo (
    rev        INTEGER   NOT NULL PRIMARY KEY AUTOINCREMENT,
    revtstmp   BIGINT    NOT NULL,
    author_email VARCHAR(255)
);

-- Hibernate SequenceStyleGenerator table (emulates a sequence on SQLite)
-- for @GeneratedValue on NelloRevision.id
CREATE TABLE IF NOT EXISTS revinfo_seq (
    next_val BIGINT
);
INSERT INTO revinfo_seq (next_val) VALUES (1);

CREATE TABLE IF NOT EXISTS boards_aud (
    id       VARCHAR(36) NOT NULL,
    rev      INTEGER     NOT NULL REFERENCES revinfo(rev),
    revtype  TINYINT,
    name     VARCHAR(255),
    owner_id VARCHAR(36),
    PRIMARY KEY (id, rev)
);

CREATE TABLE IF NOT EXISTS board_lists_aud (
    id       VARCHAR(36) NOT NULL,
    rev      INTEGER     NOT NULL REFERENCES revinfo(rev),
    revtype  TINYINT,
    board_id VARCHAR(36),
    name     VARCHAR(255),
    position INTEGER,
    PRIMARY KEY (id, rev)
);

CREATE TABLE IF NOT EXISTS cards_aud (
    id          VARCHAR(36) NOT NULL,
    rev         INTEGER     NOT NULL REFERENCES revinfo(rev),
    revtype     TINYINT,
    list_id     VARCHAR(36),
    title       VARCHAR(255),
    description TEXT,
    due_date    DATE,
    assignee_id VARCHAR(36),
    position    INTEGER,
    PRIMARY KEY (id, rev)
);
