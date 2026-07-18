--liquibase formatted sql

--changeset nello:003-boards
CREATE TABLE boards (
    id          UUID        NOT NULL DEFAULT RANDOM_UUID(),
    name        VARCHAR(255) NOT NULL,
    owner_id    UUID        NOT NULL,
    created_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_boards PRIMARY KEY (id),
    CONSTRAINT fk_boards_owner FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE TABLE board_members (
    board_id    UUID NOT NULL,
    user_id     UUID NOT NULL,
    CONSTRAINT pk_board_members PRIMARY KEY (board_id, user_id),
    CONSTRAINT fk_board_members_board FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
    CONSTRAINT fk_board_members_user  FOREIGN KEY (user_id)  REFERENCES users(id)
);
