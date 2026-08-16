CREATE table if not exists audit_log (
    id  integer PRIMARY KEY NOT NULL, -- alias for rowid
    url TEXT,
    method TEXT,
    request TEXT,
    response TEXT,
    user_email TEXT,
    log_time  TEXT NOT NULL DEFAULT (datetime('now'))
) STRICT;