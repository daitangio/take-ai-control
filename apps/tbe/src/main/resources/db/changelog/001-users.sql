--liquibase formatted sql

--changeset nello:001-users
CREATE TABLE users (
    id          UUID        NOT NULL DEFAULT RANDOM_UUID(),
    email       VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uq_users_email UNIQUE (email)
);
