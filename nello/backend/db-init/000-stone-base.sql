/**
 * It is a joke versous liquibase product
 * stone_base uses just one table to implement a simple tracker
 * No checks, if you editr files is your fault
 */
create table if not exists stone_base (
    id integer primary key,
    file text not null,
    md5 text not null,
    execution text created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

