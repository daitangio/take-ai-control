--liquibase formatted sql

--changeset nello:002-magic-link-tokens
CREATE TABLE magic_link_tokens (
    id          UUID        NOT NULL DEFAULT RANDOM_UUID(),
    token_hash  VARCHAR(64) NOT NULL,
    email       VARCHAR(255) NOT NULL,
    expires_at  TIMESTAMP   NOT NULL,
    used        BOOLEAN     NOT NULL DEFAULT FALSE,
    CONSTRAINT pk_magic_link_tokens PRIMARY KEY (id),
    CONSTRAINT uq_magic_link_tokens_hash UNIQUE (token_hash)
);
