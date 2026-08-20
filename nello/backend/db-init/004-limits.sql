PRAGMA foreign_keys = ON;

create table if not exists user_tier (
    id  integer PRIMARY KEY NOT NULL,
    name text,
    description text,
    boards_limit integer,
    lists_per_board_limit integer,
    cards_per_list_limit integer,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
) STRICT;

CREATE UNIQUE INDEX IF NOT EXISTS `user_tier_name_unique` ON `user_tier` (`name`);

insert into user_tier(id,name, boards_limit, lists_per_board_limit,cards_per_list_limit, description)
values(0,'free',3,12,48, 'Default free tier with limits');

-- Add free tier to everyone
alter table user add tier_id integer default 0 not null REFERENCES user_tier(id) ;


insert into user_tier(name, boards_limit, lists_per_board_limit,cards_per_list_limit, description)
values('nello-remindme',12,12,48, 'Paid Nello Remind-me offers more space and ability to get reminds on your own inbox!');

insert into user_tier(name, boards_limit, lists_per_board_limit,cards_per_list_limit, description)
values('nello-one',12*5,12*5,12*5, 'Nello One offers separated database and maximum flexibility.');

