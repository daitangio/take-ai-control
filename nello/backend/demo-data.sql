PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE user (
    id          TEXT PRIMARY KEY,
    email       TEXT UNIQUE NOT NULL,
    password    TEXT NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT INTO user VALUES('alfa','alfa@gioorgi.com','$2b$12$KFGoRZwL9pcrHd0yv6tR5eDrVm5zOcZy4gH7t1LF4be4h.pqrzAdu','2026-07-20 08:30:43');
INSERT INTO user VALUES('beta','beta@gioorgi.com','$2b$12$/nQ7NUZOkCjtA6r7fm9cBuPsETGCMPgB7TJ4m4giKhhoNDVke9y.q','2026-07-20 08:30:43');
INSERT INTO user VALUES('gamma','gamma@gioorgi.com','$2b$12$bKZ8En1lWBnTDIE.3HSgZOqVwBF8iOB/J3FsdngVqhw1Nd4psVn/i','2026-07-20 08:30:43');
CREATE TABLE board (
    id          TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT INTO board VALUES('417a506a-aa3d-4873-a5b4-334021dd640e','beta','ZBoard','2026-07-20 08:36:34');
INSERT INTO board VALUES('ab3f9f54-6ad8-42d1-9842-3af3dddb2c89','alfa','SharedDemo$','2026-07-20 11:34:52');
CREATE TABLE list (
    id          TEXT PRIMARY KEY,
    board_id    TEXT NOT NULL REFERENCES board(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    position    INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT INTO list VALUES('todo-id','ab3f9f54-6ad8-42d1-9842-3af3dddb2c89','TODO',0,'2026-07-20 11:34:57');
INSERT INTO list VALUES('inprogress-id','ab3f9f54-6ad8-42d1-9842-3af3dddb2c89','In Progress',1,'2026-07-20 11:35:03');
INSERT INTO list VALUES('done-id','ab3f9f54-6ad8-42d1-9842-3af3dddb2c89','DONE',3,'2026-07-20 11:35:06');
INSERT INTO list VALUES('mvp-38c4db5a','ab3f9f54-6ad8-42d1-9842-3af3dddb2c89','MVP',4,'2026-07-21 13:38:51');
INSERT INTO list VALUES('test-results-a079359d','ab3f9f54-6ad8-42d1-9842-3af3dddb2c89','Test results',2,'2026-07-21 16:03:03');
CREATE TABLE card (
    id          TEXT PRIMARY KEY,
    list_id     TEXT NOT NULL REFERENCES list(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    position    INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
, modified_by TEXT, due_date TEXT);
INSERT INTO card VALUES('322f646b-84cd-4ebe-931b-3acd6eb05195','todo-id','Add extra feature','',0,'2026-07-20 11:35:18','alfa',NULL);
INSERT INTO card VALUES('efaaad59-3b1b-42f3-bb95-10eab16241b2','todo-id','Add background','',1,'2026-07-20 11:35:41','alfa',NULL);
INSERT INTO card VALUES('e4c5cadb-6bde-46ac-af65-f384b51e5071','todo-id','Create docker compose','',2,'2026-07-20 11:35:46','alfa',NULL);
INSERT INTO card VALUES('fb43770c-51a5-4e54-9956-c5cc7855e52e','done-id','Card-done by alfa','',1,'2026-07-20 11:35:52','alfa',NULL);
INSERT INTO card VALUES('4ed5b3c6-d261-4a00-8c33-e3419e0f54ce','done-id','Card in progress by Beta','',2,'2026-07-20 11:37:28','beta',NULL);
INSERT INTO card VALUES('ad47e695-175f-4461-80f0-df2f4575f1ad','todo-id','Add search upper bar','',3,'2026-07-21 12:23:05','alfa',NULL);
INSERT INTO card VALUES('8c73f3a0-ded4-48d5-a5f6-56fab46a0e07','done-id','Add card numbers on top','',3,'2026-07-21 12:23:20','alfa',NULL);
INSERT INTO card VALUES('e579c7dd-8916-4a45-9c2a-265a6ff9831c','done-id','Add "..." button on List','',4,'2026-07-21 12:23:27','alfa',NULL);
INSERT INTO card VALUES('d4c7c3f3-9792-4c81-b600-bafc5da44f3d','todo-id','Search Filter','',5,'2026-07-21 12:24:19','alfa',NULL);
INSERT INTO card VALUES('9385dac8-6789-475d-83d5-41ebd6de03b7','todo-id','Background on board','',6,'2026-07-21 12:25:18','alfa',NULL);
INSERT INTO card VALUES('61bfd261-487a-43af-aa62-6917ac150970','todo-id','Background on cards','',7,'2026-07-21 12:25:29','alfa',NULL);
INSERT INTO card VALUES('71913442-8009-4fa3-acfe-c98ca1fcbfe5','inprogress-id','All together','',0,'2026-07-21 15:35:04','alfa',NULL);
INSERT INTO card VALUES('cc13c8da-97d6-495b-98ac-ff9ff462eeef','done-id','Add "..." on Card too','',5,'2026-07-21 15:51:00','alfa',NULL);
INSERT INTO card VALUES('f097e20c-29df-4985-acad-acc0eeb45384','test-results-a079359d','When you edit members, last edited is not changed (it is fine for the meantime)','',0,'2026-07-21 16:02:53','alfa',NULL);
INSERT INTO card VALUES('bf447291-fc52-4585-b773-c0d10c87392a','done-id','Due date on card (extra-meta info)','',6,'2026-07-21 16:03:56','alfa',NULL);
CREATE TABLE board_member (
    board_id    TEXT NOT NULL REFERENCES board(id) ON DELETE CASCADE,
    user_id     TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    added_at    TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (board_id, user_id)
);
INSERT INTO board_member VALUES('ab3f9f54-6ad8-42d1-9842-3af3dddb2c89','beta','2026-07-20 11:35:28');
INSERT INTO board_member VALUES('ab3f9f54-6ad8-42d1-9842-3af3dddb2c89','gamma','2026-07-20 11:35:33');
CREATE TABLE list_archive (
    list_id     TEXT PRIMARY KEY REFERENCES list(id) ON DELETE CASCADE,
    board_id    TEXT NOT NULL REFERENCES board(id) ON DELETE CASCADE,
    archived_by TEXT REFERENCES user(id) ON DELETE SET NULL,
    archived_at TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT INTO list_archive VALUES('mvp-38c4db5a','ab3f9f54-6ad8-42d1-9842-3af3dddb2c89','alfa','2026-07-21 14:14:15');
CREATE TABLE card_archive (
            card_id     TEXT PRIMARY KEY REFERENCES card(id) ON DELETE CASCADE,
            list_id     TEXT NOT NULL REFERENCES list(id) ON DELETE CASCADE,
            archived_by TEXT REFERENCES user(id) ON DELETE SET NULL,
            archived_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
CREATE TABLE card_member (
            card_id     TEXT NOT NULL REFERENCES card(id) ON DELETE CASCADE,
            user_id     TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
            assigned_at TEXT NOT NULL DEFAULT (datetime('now')),
            assigned_by TEXT REFERENCES user(id) ON DELETE SET NULL,
            PRIMARY KEY (card_id, user_id)
        );
INSERT INTO card_member VALUES('e4c5cadb-6bde-46ac-af65-f384b51e5071','gamma','2026-07-21 15:35:32','alfa');
INSERT INTO card_member VALUES('e4c5cadb-6bde-46ac-af65-f384b51e5071','beta','2026-07-21 15:35:40','alfa');
INSERT INTO card_member VALUES('71913442-8009-4fa3-acfe-c98ca1fcbfe5','gamma','2026-07-21 15:46:09','alfa');
INSERT INTO card_member VALUES('71913442-8009-4fa3-acfe-c98ca1fcbfe5','beta','2026-07-21 15:46:09','alfa');
INSERT INTO card_member VALUES('71913442-8009-4fa3-acfe-c98ca1fcbfe5','alfa','2026-07-21 15:46:10','alfa');
INSERT INTO card_member VALUES('4ed5b3c6-d261-4a00-8c33-e3419e0f54ce','alfa','2026-07-21 16:02:21','alfa');
COMMIT;
