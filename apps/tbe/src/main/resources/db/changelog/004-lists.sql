--liquibase formatted sql

--changeset nello:004-lists
CREATE TABLE board_lists (
    id          UUID        NOT NULL DEFAULT RANDOM_UUID(),
    board_id    UUID        NOT NULL,
    name        VARCHAR(255) NOT NULL,
    position    INTEGER     NOT NULL DEFAULT 1000,
    CONSTRAINT pk_board_lists PRIMARY KEY (id),
    CONSTRAINT fk_board_lists_board FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
);
