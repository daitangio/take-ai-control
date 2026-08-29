-- Remove the list archive concept: archiving a list now deletes the list
-- together with its cards. Legacy archived lists are deleted on upgrade.
PRAGMA foreign_keys = ON;
DELETE FROM list WHERE id IN (SELECT list_id FROM list_archive);
DROP TABLE IF EXISTS list_archive;
