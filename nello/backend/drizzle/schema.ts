import { sqliteTable, foreignKey, primaryKey, uniqueIndex, unique, text, integer } from "drizzle-orm/sqlite-core"
import { sql } from "drizzle-orm"

export const user = sqliteTable("user", {
	id: text().primaryKey(),
	email: text().notNull(),
	password: text().notNull(),
	tierId: integer("tier_id").default(0).notNull().references(() => userTier.id),
	createdAt: text("created_at").default(sql`datetime('now')`).notNull(),
},
(table) => [uniqueIndex("user_email_unique").on(table.email),
unique("user_email_unique").on(table.email),
]);

export const board = sqliteTable("board", {
	id: text().primaryKey(),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" } ),
	name: text().notNull(),
	createdAt: text("created_at").default(sql`datetime('now')`).notNull(),
});

export const userTier = sqliteTable("user_tier", {
	id: integer().primaryKey(),
	name: text(),
	description: text(),
	boardsLimit: integer("boards_limit"),
	listsPerBoardLimit: integer("lists_per_board_limit"),
	cardsPerListLimit: integer("cards_per_list_limit"),
	createdAt: text("created_at").default(sql`datetime('now')`).notNull(),
});

export const list = sqliteTable("list", {
	id: text().primaryKey(),
	boardId: text("board_id").notNull().references(() => board.id, { onDelete: "cascade" } ),
	name: text().notNull(),
	position: integer().default(0).notNull(),
	createdAt: text("created_at").default(sql`datetime('now')`).notNull(),
});

export const card = sqliteTable("card", {
	id: text().primaryKey(),
	listId: text("list_id").notNull().references(() => list.id, { onDelete: "cascade" } ),
	title: text().notNull(),
	description: text().default("").notNull(),
	position: integer().default(0).notNull(),
	createdAt: text("created_at").default(sql`datetime('now')`).notNull(),
	modifiedBy: text("modified_by"),
	dueDate: text("due_date"),
	color: text(),
});

export const boardMember = sqliteTable("board_member", {
	boardId: text("board_id").notNull().references(() => board.id, { onDelete: "cascade" } ),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" } ),
	addedAt: text("added_at").default(sql`datetime('now')`).notNull(),
},
(table) => [primaryKey({ columns: [table.boardId, table.userId], name: "board_member_pk"}),
]);

export const cardArchive = sqliteTable("card_archive", {
	cardId: text("card_id").primaryKey().references(() => card.id, { onDelete: "cascade" } ),
	listId: text("list_id").notNull().references(() => list.id, { onDelete: "cascade" } ),
	archivedBy: text("archived_by").references(() => user.id, { onDelete: "set null" } ),
	archivedAt: text("archived_at").default(sql`datetime('now')`).notNull(),
});

export const cardMember = sqliteTable("card_member", {
	cardId: text("card_id").notNull().references(() => card.id, { onDelete: "cascade" } ),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" } ),
	assignedAt: text("assigned_at").default(sql`datetime('now')`).notNull(),
	assignedBy: text("assigned_by").references(() => user.id, { onDelete: "set null" } ),
},
(table) => [primaryKey({ columns: [table.cardId, table.userId], name: "card_member_pk"}),
]);

export const registerKey = sqliteTable("register_key", {
	id: integer().primaryKey(),
	keyPass: text("key_pass").notNull(),
	emailRegexp: text("email_regexp").notNull(),
	availCount: integer("avail_count").notNull(),
	createdAt: text("created_at").default(sql`datetime('now')`).notNull(),
});
