--liquibase formatted sql

--changeset nello:005-cards
CREATE TABLE cards (
    id          UUID        NOT NULL DEFAULT RANDOM_UUID(),
    list_id     UUID        NOT NULL,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    due_date    DATE,
    assignee_id UUID,
    position    INTEGER     NOT NULL DEFAULT 1000,
    created_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_cards PRIMARY KEY (id),
    CONSTRAINT fk_cards_list     FOREIGN KEY (list_id)     REFERENCES board_lists(id) ON DELETE CASCADE,
    CONSTRAINT fk_cards_assignee FOREIGN KEY (assignee_id) REFERENCES users(id)
);
