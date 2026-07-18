--liquibase formatted sql

--changeset nello:006-envers-audit
CREATE TABLE revinfo (
    rev         INTEGER     NOT NULL,
    revtstmp    BIGINT,
    author_email VARCHAR(255),
    CONSTRAINT pk_revinfo PRIMARY KEY (rev)
);

CREATE SEQUENCE revinfo_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE boards_aud (
    id          UUID,
    rev         INTEGER NOT NULL,
    revtype     TINYINT,
    name        VARCHAR(255),
    owner_id    UUID,
    created_at  TIMESTAMP,
    CONSTRAINT pk_boards_aud PRIMARY KEY (id, rev)
);

CREATE TABLE board_lists_aud (
    id          UUID,
    rev         INTEGER NOT NULL,
    revtype     TINYINT,
    board_id    UUID,
    name        VARCHAR(255),
    position    INTEGER,
    CONSTRAINT pk_board_lists_aud PRIMARY KEY (id, rev)
);

CREATE TABLE cards_aud (
    id          UUID,
    rev         INTEGER NOT NULL,
    revtype     TINYINT,
    list_id     UUID,
    title       VARCHAR(255),
    description TEXT,
    due_date    DATE,
    assignee_id UUID,
    position    INTEGER,
    created_at  TIMESTAMP,
    CONSTRAINT pk_cards_aud PRIMARY KEY (id, rev)
);
