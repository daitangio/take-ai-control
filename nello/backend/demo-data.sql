PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE user (
    id          TEXT PRIMARY KEY,
    email       TEXT UNIQUE NOT NULL,
    password    TEXT NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT INTO user VALUES('30c8a2cb-7fde-499f-a444-561c59cd3126','alfa@gioorgi.com','$2b$12$KFGoRZwL9pcrHd0yv6tR5eDrVm5zOcZy4gH7t1LF4be4h.pqrzAdu','2026-07-20 08:30:43');
INSERT INTO user VALUES('66e31bd2-77c6-42bf-8f9a-b752a6b06a72','beta@gioorgi.com','$2b$12$/nQ7NUZOkCjtA6r7fm9cBuPsETGCMPgB7TJ4m4giKhhoNDVke9y.q','2026-07-20 08:30:43');
INSERT INTO user VALUES('ce2cdc8e-3e38-4ddd-8ea7-45dcef0c47ed','gamma@gioorgi.com','$2b$12$bKZ8En1lWBnTDIE.3HSgZOqVwBF8iOB/J3FsdngVqhw1Nd4psVn/i','2026-07-20 08:30:43');
CREATE TABLE board (
    id          TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT INTO board VALUES('417a506a-aa3d-4873-a5b4-334021dd640e','66e31bd2-77c6-42bf-8f9a-b752a6b06a72','ZBoard','2026-07-20 08:36:34');
INSERT INTO board VALUES('ab3f9f54-6ad8-42d1-9842-3af3dddb2c89','30c8a2cb-7fde-499f-a444-561c59cd3126','SharedDemo$','2026-07-20 11:34:52');
CREATE TABLE list (
    id          TEXT PRIMARY KEY,
    board_id    TEXT NOT NULL REFERENCES board(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    position    INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT INTO list VALUES('e503d2f9-668d-4a61-a0cb-906874914f43','ab3f9f54-6ad8-42d1-9842-3af3dddb2c89','TODO',0,'2026-07-20 11:34:57');
INSERT INTO list VALUES('95f43ef9-c7f5-4f94-8cbf-3dc17d693ad6','ab3f9f54-6ad8-42d1-9842-3af3dddb2c89','In Progress',1,'2026-07-20 11:35:03');
INSERT INTO list VALUES('9400daa3-b1cb-42ec-86b4-66a87813d9a3','ab3f9f54-6ad8-42d1-9842-3af3dddb2c89','DONE',2,'2026-07-20 11:35:06');
CREATE TABLE card (
    id          TEXT PRIMARY KEY,
    list_id     TEXT NOT NULL REFERENCES list(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    position    INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
, modified_by TEXT);
INSERT INTO card VALUES('322f646b-84cd-4ebe-931b-3acd6eb05195','e503d2f9-668d-4a61-a0cb-906874914f43','Created by Alfa','',0,'2026-07-20 11:35:18','30c8a2cb-7fde-499f-a444-561c59cd3126');
INSERT INTO card VALUES('efaaad59-3b1b-42f3-bb95-10eab16241b2','e503d2f9-668d-4a61-a0cb-906874914f43','Card2 by alfa','',1,'2026-07-20 11:35:41','30c8a2cb-7fde-499f-a444-561c59cd3126');
INSERT INTO card VALUES('e4c5cadb-6bde-46ac-af65-f384b51e5071','e503d2f9-668d-4a61-a0cb-906874914f43','Card3 by alfa','',2,'2026-07-20 11:35:46','30c8a2cb-7fde-499f-a444-561c59cd3126');
INSERT INTO card VALUES('fb43770c-51a5-4e54-9956-c5cc7855e52e','9400daa3-b1cb-42ec-86b4-66a87813d9a3','Card-done by alfa','',0,'2026-07-20 11:35:52','30c8a2cb-7fde-499f-a444-561c59cd3126');
INSERT INTO card VALUES('4ed5b3c6-d261-4a00-8c33-e3419e0f54ce','95f43ef9-c7f5-4f94-8cbf-3dc17d693ad6','Card in progress by Beta','',0,'2026-07-20 11:37:28','66e31bd2-77c6-42bf-8f9a-b752a6b06a72');
CREATE TABLE board_member (
    board_id    TEXT NOT NULL REFERENCES board(id) ON DELETE CASCADE,
    user_id     TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    added_at    TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (board_id, user_id)
);
INSERT INTO board_member VALUES('ab3f9f54-6ad8-42d1-9842-3af3dddb2c89','66e31bd2-77c6-42bf-8f9a-b752a6b06a72','2026-07-20 11:35:28');
INSERT INTO board_member VALUES('ab3f9f54-6ad8-42d1-9842-3af3dddb2c89','ce2cdc8e-3e38-4ddd-8ea7-45dcef0c47ed','2026-07-20 11:35:33');
COMMIT;
