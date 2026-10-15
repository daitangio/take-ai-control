PRAGMA foreign_keys = ON;

-- There are limits on add column. We need to proceed with a bigger enhancement
-- create new table, copy entries over, delete the old table and rename the new table.
/*
CREATE TABLE card (
    id          TEXT PRIMARY KEY,
    list_id     TEXT NOT NULL REFERENCES list(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    position    INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
, modified_by TEXT, due_date TEXT, color TEXT, effort integer not null default 0, fte real not null default 1.0, ro_effort_days TEXT GENERATED ALWAYS AS (effort/fte) VIRTUAL, start_date TEXT, end_date TEXT, ro_end_date TEXT GENERATED ALWAYS as 
    (
        date(start_date,'+ '|| (effort/fte) || ' days')
    ) VIRTUAL);

    
alter table card add column effort integer not null default 0;
-- The Full time equivalent, used to calculate 
-- the effort_days
alter table card add column fte real not null default 1.0;

-- GENERATED COLUMN
alter table card add column ro_effort_days TEXT GENERATED ALWAYS AS (effort/fte) VIRTUAL;

alter table card add column start_date TEXT ;
alter table card add column   end_date TEXT ;
alter table card add column ro_end_date TEXT GENERATED ALWAYS as 
    (
        date(start_date,'+ '|| (effort/fte) || ' days')
    ) VIRTUAL;
*/
