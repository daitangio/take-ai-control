PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;

INSERT INTO user(id,email,password) VALUES('alfa','alfa@gioorgi.com','$2b$12$KFGoRZwL9pcrHd0yv6tR5eDrVm5zOcZy4gH7t1LF4be4h.pqrzAdu');
INSERT INTO user(id,email,password) VALUES('beta','beta@gioorgi.com','$2b$12$/nQ7NUZOkCjtA6r7fm9cBuPsETGCMPgB7TJ4m4giKhhoNDVke9y.q');
INSERT INTO user(id,email,password) VALUES('gamma','gamma@gioorgi.com','$2b$12$bKZ8En1lWBnTDIE.3HSgZOqVwBF8iOB/J3FsdngVqhw1Nd4psVn/i');

INSERT INTO board VALUES('ab3f9f54-6ad8-42d1-9842-3af3dddb2c89','alfa','SharedDemo$','2026-07-20 11:34:52');
INSERT INTO board VALUES('intro','alfa','Nello Intro$','2026-07-26 10:22:20');

INSERT INTO list VALUES('todo-id','ab3f9f54-6ad8-42d1-9842-3af3dddb2c89','TODO',0,'2026-07-20 11:34:57');
INSERT INTO list VALUES('inprogress-id','ab3f9f54-6ad8-42d1-9842-3af3dddb2c89','In Progress',2,'2026-07-20 11:35:03');
INSERT INTO list VALUES('done-id','ab3f9f54-6ad8-42d1-9842-3af3dddb2c89','DONE',3,'2026-07-20 11:35:06');
INSERT INTO list VALUES('mvp-38c4db5a','ab3f9f54-6ad8-42d1-9842-3af3dddb2c89','MVP',4,'2026-07-21 13:38:51');
INSERT INTO list VALUES('test-results-a079359d','ab3f9f54-6ad8-42d1-9842-3af3dddb2c89','BUGS',4,'2026-07-21 16:03:03');
INSERT INTO list VALUES('todo-architecture-c3e77a1d','ab3f9f54-6ad8-42d1-9842-3af3dddb2c89','ColorMap',1,'2026-07-21 19:25:20');
INSERT INTO list VALUES('weelcome-to-nello-6ab048fe','intro','Wellcome to Nello',0,'2026-07-26 10:22:28');
INSERT INTO list VALUES('nello-feature-f03444b6','intro','Nello Feature: Basic',1,'2026-07-26 10:22:45');
INSERT INTO list VALUES('shared-boards-c5d71ad2','intro','Shared Boards',2,'2026-07-26 10:30:48');
INSERT INTO list VALUES('filter-fab0b8d1','intro','Filter',3,'2026-07-26 10:31:32');

INSERT INTO card VALUES('e4c5cadb-6bde-46ac-af65-f384b51e5071','done-id','Create docker compose','',9,'2026-07-20 11:35:46','alfa',NULL,'orange');
INSERT INTO card VALUES('fb43770c-51a5-4e54-9956-c5cc7855e52e','done-id','Card-done by alfa','',1,'2026-07-20 11:35:52','alfa',NULL,NULL);
INSERT INTO card VALUES('4ed5b3c6-d261-4a00-8c33-e3419e0f54ce','done-id','Card in progress by Beta','',2,'2026-07-20 11:37:28','beta',NULL,NULL);
INSERT INTO card VALUES('8c73f3a0-ded4-48d5-a5f6-56fab46a0e07','done-id','Add card numbers on top','',3,'2026-07-21 12:23:20','alfa',NULL,NULL);
INSERT INTO card VALUES('e579c7dd-8916-4a45-9c2a-265a6ff9831c','done-id','Add "..." button on List','',4,'2026-07-21 12:23:27','alfa',NULL,NULL);
INSERT INTO card VALUES('d4c7c3f3-9792-4c81-b600-bafc5da44f3d','done-id','Search Filter','',7,'2026-07-21 12:24:19','alfa',NULL,'red');
INSERT INTO card VALUES('9385dac8-6789-475d-83d5-41ebd6de03b7','todo-id','Background on board','',2,'2026-07-21 12:25:18','alfa',NULL,'green');
INSERT INTO card VALUES('61bfd261-487a-43af-aa62-6917ac150970','done-id','Background colors on cards','',8,'2026-07-21 12:25:29','alfa',NULL,'red');
INSERT INTO card VALUES('71913442-8009-4fa3-acfe-c98ca1fcbfe5','inprogress-id','All together','',0,'2026-07-21 15:35:04','alfa',NULL,NULL);
INSERT INTO card VALUES('cc13c8da-97d6-495b-98ac-ff9ff462eeef','done-id','Add "..." on Card too','',5,'2026-07-21 15:51:00','alfa',NULL,NULL);
INSERT INTO card VALUES('f097e20c-29df-4985-acad-acc0eeb45384','test-results-a079359d','When you edit members, last edited is not changed (it is fine for the meantime)','',0,'2026-07-21 16:02:53','alfa',NULL,NULL);
INSERT INTO card VALUES('bf447291-fc52-4585-b773-c0d10c87392a','done-id','Due date on card (extra-meta info)','',6,'2026-07-21 16:03:56','alfa',NULL,NULL);
INSERT INTO card VALUES('2f5af671-74d3-4b02-b576-cbe1de1485a5','todo-architecture-c3e77a1d','Introduce SQLModel',unistr('SQLModel https://fastapi.tiangolo.com/tutorial/sql-databases/#create-an-engine\u000a\u000aSeems a bit too complex'),1,'2026-07-21 19:25:47','alfa','2026-09-30',NULL);
INSERT INTO card VALUES('5c66affb-5053-4bd6-a651-a1e84652f7c0','test-results-a079359d','When you create a new card, last modified by is wrong','',1,'2026-07-21 19:48:36','alfa',NULL,NULL);
INSERT INTO card VALUES('622f1033-162d-4a06-a312-2b273149a940','todo-architecture-c3e77a1d','Super audit tracker','Audi to track all the modifications in an elegant way',7,'2026-07-21 19:49:26','alfa',NULL,NULL);
INSERT INTO card VALUES('7173d864-c11d-482f-95c5-56d628d8fdfb','done-id','Archive functionality (Archive me) if you dare!','',10,'2026-07-25 15:06:57','alfa',NULL,'gray');
INSERT INTO card VALUES('ab7ae225-ce0d-47ab-a4e2-946f42812672','todo-id','Translate in Typescript?','',1,'2026-07-25 15:40:49','alfa',NULL,'orange');
INSERT INTO card VALUES('1e10df88-51d4-4bd7-9235-4a8277b67e71','inprogress-id','White card','',1,'2026-07-25 15:45:16','alfa',NULL,NULL);
INSERT INTO card VALUES('a55abef1-0a6a-4407-a021-04819067544e','todo-architecture-c3e77a1d','High prioriy','',3,'2026-07-25 15:52:39','alfa',NULL,'red');
INSERT INTO card VALUES('6774bf5a-c7fc-45c7-a8aa-83a702a23bc5','todo-architecture-c3e77a1d','Medium Priority','',4,'2026-07-25 15:52:49','alfa',NULL,'green');
INSERT INTO card VALUES('154e6991-d889-4afe-8203-c963e220b7ec','todo-architecture-c3e77a1d','Nice to have','',5,'2026-07-25 15:53:04','alfa',NULL,'orange');
INSERT INTO card VALUES('01a84226-d10b-4c95-897c-575fae9f236d','todo-architecture-c3e77a1d','Only if you have time','',6,'2026-07-25 15:53:24','alfa',NULL,'gray');
INSERT INTO card VALUES('5d42be4c-1a35-420e-9e8c-d0338e606f46','todo-id','Trello json import','',3,'2026-07-25 15:53:51','alfa',NULL,'gray');
INSERT INTO card VALUES('fae97bdd-458c-4e84-b1a9-92bdc0ce6006','todo-id','Resume Archived list?','',4,'2026-07-25 16:45:32','alfa',NULL,'blue');
INSERT INTO card VALUES('cc626729-4442-4275-931e-7621574ea363','weelcome-to-nello-6ab048fe','The super-simple Kanban board','',0,'2026-07-26 10:22:39','alfa',NULL,NULL);
INSERT INTO card VALUES('dd03a35a-29fa-4518-9bf7-9f79f509b96f','nello-feature-f03444b6','Written by DeepSeek+ClaudeCode','',0,'2026-07-26 10:22:57','alfa',NULL,'green');
INSERT INTO card VALUES('e5d57021-2016-4818-81de-b83976e0c145','nello-feature-f03444b6','Zero-Distraction','',1,'2026-07-26 10:23:15','alfa',NULL,'green');
INSERT INTO card VALUES('bdb57fcb-9c9a-448a-92e9-3f1987b7a8a1','nello-feature-f03444b6','DeleteNo! Card can be archived and easily de-archived in bulk','',2,'2026-07-26 10:30:16','alfa',NULL,'blue');
INSERT INTO card VALUES('ac5b6ce2-cdd3-4f6b-ba6c-4601a6cb3109','nello-feature-f03444b6','Colors','',3,'2026-07-26 10:30:32','alfa',NULL,'violet');
INSERT INTO card VALUES('551d0bb0-a456-408d-a83b-ec1d2ac1cfa4','shared-boards-c5d71ad2','If you add a $ at the end of a board it gets shared. You can add member if youlike','',0,'2026-07-26 10:31:09','alfa',NULL,'blue');
INSERT INTO card VALUES('93a0e4a5-b71d-47b6-bd0f-d1937973cd2f','filter-fab0b8d1','Client-Side filtering enable to dominate complex context','',0,'2026-07-26 10:31:48','alfa',NULL,NULL);
INSERT INTO card VALUES('81c74a99-0bc5-4163-a890-fa2a2a9b1ddf','shared-boards-c5d71ad2','Shared members get a nice icon and ability to share','',1,'2026-07-26 10:35:59','alfa',NULL,'blue');
INSERT INTO card VALUES('abca8ee1-431b-4b54-a0dc-a42489248b03','shared-boards-c5d71ad2','Remember: if you share a board you cannot de-share it','',2,'2026-07-26 10:37:06','alfa',NULL,'blue');
INSERT INTO card VALUES('800f2d14-8da0-40d9-b21c-b11752a95d73','nello-feature-f03444b6','Every Card has detail and a due date','',5,'2026-07-26 10:37:31','alfa',NULL,'orange');
INSERT INTO card VALUES('3af27321-b773-42e4-9155-9eddc9aff101','weelcome-to-nello-6ab048fe','This is a card.','',1,'2026-07-26 11:43:21','alfa',NULL,'red');
INSERT INTO card VALUES('3119e09b-08ba-40df-a4a9-51bd6626d8ce','weelcome-to-nello-6ab048fe','A card can be moved between lists','',2,'2026-07-26 11:43:42','alfa',NULL,'red');
INSERT INTO card VALUES('92267e52-21b5-46f3-bfb7-c6835999208d','shared-boards-c5d71ad2','Archived waiting for you','',3,'2026-07-26 20:08:29','alfa',NULL,'gray');

INSERT INTO board_member VALUES('ab3f9f54-6ad8-42d1-9842-3af3dddb2c89','beta','2026-07-20 11:35:28');
INSERT INTO board_member VALUES('ab3f9f54-6ad8-42d1-9842-3af3dddb2c89','gamma','2026-07-20 11:35:33');
INSERT INTO board_member VALUES('ab3f9f54-6ad8-42d1-9842-3af3dddb2c89','alfa','2026-07-21 19:17:03');
INSERT INTO board_member VALUES('intro','beta','2026-07-26 19:45:18');
INSERT INTO board_member VALUES('intro','gamma','2026-07-26 19:45:18');

INSERT INTO list_archive VALUES('mvp-38c4db5a','ab3f9f54-6ad8-42d1-9842-3af3dddb2c89','alfa','2026-07-21 14:14:15');

INSERT INTO card_archive VALUES('2f5af671-74d3-4b02-b576-cbe1de1485a5','todo-architecture-c3e77a1d','alfa','2026-07-25 15:52:17');
INSERT INTO card_archive VALUES('92267e52-21b5-46f3-bfb7-c6835999208d','shared-boards-c5d71ad2','alfa','2026-07-26 20:08:35');

INSERT INTO card_member VALUES('e4c5cadb-6bde-46ac-af65-f384b51e5071','gamma','2026-07-21 15:35:32','alfa');
INSERT INTO card_member VALUES('e4c5cadb-6bde-46ac-af65-f384b51e5071','beta','2026-07-21 15:35:40','alfa');
INSERT INTO card_member VALUES('71913442-8009-4fa3-acfe-c98ca1fcbfe5','gamma','2026-07-21 15:46:09','alfa');
INSERT INTO card_member VALUES('71913442-8009-4fa3-acfe-c98ca1fcbfe5','beta','2026-07-21 15:46:09','alfa');
INSERT INTO card_member VALUES('71913442-8009-4fa3-acfe-c98ca1fcbfe5','alfa','2026-07-21 15:46:10','alfa');
INSERT INTO card_member VALUES('4ed5b3c6-d261-4a00-8c33-e3419e0f54ce','alfa','2026-07-21 16:02:21','alfa');
COMMIT;
