-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `user` (
	`id` text,
	`email` text NOT NULL UNIQUE,
	`password` text NOT NULL,
	`created_at` text DEFAULT datetime('now') NOT NULL,
	CONSTRAINT `user_pk` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `board` (
	`id` text,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`created_at` text DEFAULT datetime('now') NOT NULL,
	CONSTRAINT `board_pk` PRIMARY KEY(`id`),
	CONSTRAINT `fk_board_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `list` (
	`id` text,
	`board_id` text NOT NULL,
	`name` text NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT datetime('now') NOT NULL,
	CONSTRAINT `list_pk` PRIMARY KEY(`id`),
	CONSTRAINT `fk_list_board_id_board_id_fk` FOREIGN KEY (`board_id`) REFERENCES `board`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `card` (
	`id` text,
	`list_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT datetime('now') NOT NULL,
	`modified_by` text,
	`due_date` text,
	`color` text,
	CONSTRAINT `card_pk` PRIMARY KEY(`id`),
	CONSTRAINT `fk_card_list_id_list_id_fk` FOREIGN KEY (`list_id`) REFERENCES `list`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `board_member` (
	`board_id` text NOT NULL,
	`user_id` text NOT NULL,
	`added_at` text DEFAULT datetime('now') NOT NULL,
	CONSTRAINT `board_member_pk` PRIMARY KEY(`board_id`, `user_id`),
	CONSTRAINT `fk_board_member_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_board_member_board_id_board_id_fk` FOREIGN KEY (`board_id`) REFERENCES `board`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `list_archive` (
	`list_id` text,
	`board_id` text NOT NULL,
	`archived_by` text,
	`archived_at` text DEFAULT datetime('now') NOT NULL,
	CONSTRAINT `list_archive_pk` PRIMARY KEY(`list_id`),
	CONSTRAINT `fk_list_archive_archived_by_user_id_fk` FOREIGN KEY (`archived_by`) REFERENCES `user`(`id`) ON DELETE SET NULL,
	CONSTRAINT `fk_list_archive_board_id_board_id_fk` FOREIGN KEY (`board_id`) REFERENCES `board`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_list_archive_list_id_list_id_fk` FOREIGN KEY (`list_id`) REFERENCES `list`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `card_archive` (
	`card_id` text,
	`list_id` text NOT NULL,
	`archived_by` text,
	`archived_at` text DEFAULT datetime('now') NOT NULL,
	CONSTRAINT `card_archive_pk` PRIMARY KEY(`card_id`),
	CONSTRAINT `fk_card_archive_archived_by_user_id_fk` FOREIGN KEY (`archived_by`) REFERENCES `user`(`id`) ON DELETE SET NULL,
	CONSTRAINT `fk_card_archive_list_id_list_id_fk` FOREIGN KEY (`list_id`) REFERENCES `list`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_card_archive_card_id_card_id_fk` FOREIGN KEY (`card_id`) REFERENCES `card`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `card_member` (
	`card_id` text NOT NULL,
	`user_id` text NOT NULL,
	`assigned_at` text DEFAULT datetime('now') NOT NULL,
	`assigned_by` text,
	CONSTRAINT `card_member_pk` PRIMARY KEY(`card_id`, `user_id`),
	CONSTRAINT `fk_card_member_assigned_by_user_id_fk` FOREIGN KEY (`assigned_by`) REFERENCES `user`(`id`) ON DELETE SET NULL,
	CONSTRAINT `fk_card_member_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_card_member_card_id_card_id_fk` FOREIGN KEY (`card_id`) REFERENCES `card`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `register_key` (
	`id` integer,
	`key_pass` text NOT NULL,
	`email_regexp` text NOT NULL,
	`avail_count` integer NOT NULL,
	`created_at` text DEFAULT datetime('now') NOT NULL,
	CONSTRAINT `register_key_pk` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);
*/