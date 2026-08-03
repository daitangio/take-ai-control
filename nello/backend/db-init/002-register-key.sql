-- New table to implement form registration with a key_pass+ an email regexp guard
CREATE TABLE IF NOT EXISTS register_key  (
	id                     integer PRIMARY KEY NOT NULL,
	key_pass               text NOT NULL UNIQUE,
	email_regexp           text NOT NULL,
	avail_count            integer NOT NULL,
	created_at  TEXT NOT NULL DEFAULT (datetime('now'))
) STRICT;

INSERT INTO register_key (key_pass, email_regexp, avail_count) VALUES ('EARLY-ACCESS', '.*@gmail.com', 1);