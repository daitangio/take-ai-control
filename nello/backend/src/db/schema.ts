import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("user", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

export const boards = sqliteTable("board", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

export const lists = sqliteTable("list", {
  id: text("id").primaryKey(),
  boardId: text("board_id").notNull().references(() => boards.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  position: integer("position").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

export const listArchive = sqliteTable("list_archive", {
  listId: text("list_id").primaryKey().references(() => lists.id, { onDelete: "cascade" }),
  boardId: text("board_id").notNull().references(() => boards.id, { onDelete: "cascade" }),
  archivedBy: text("archived_by").references(() => users.id, { onDelete: "set null" }),
  archivedAt: text("archived_at").notNull().default(sql`(datetime('now'))`),
});

export const cards = sqliteTable("card", {
  id: text("id").primaryKey(),
  listId: text("list_id").notNull().references(() => lists.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  position: integer("position").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  modifiedBy: text("modified_by"),
  dueDate: text("due_date"),
  color: text("color"),
});

export const cardArchive = sqliteTable("card_archive", {
  cardId: text("card_id").primaryKey().references(() => cards.id, { onDelete: "cascade" }),
  listId: text("list_id").notNull().references(() => lists.id, { onDelete: "cascade" }),
  archivedBy: text("archived_by").references(() => users.id, { onDelete: "set null" }),
  archivedAt: text("archived_at").notNull().default(sql`(datetime('now'))`),
});

export const boardMembers = sqliteTable("board_member", {
  boardId: text("board_id").notNull().references(() => boards.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  addedAt: text("added_at").notNull().default(sql`(datetime('now'))`),
}, (table) => ({
  pk: primaryKey({ columns: [table.boardId, table.userId] }),
}));

export const cardMembers = sqliteTable("card_member", {
  cardId: text("card_id").notNull().references(() => cards.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  assignedAt: text("assigned_at").notNull().default(sql`(datetime('now'))`),
  assignedBy: text("assigned_by").references(() => users.id, { onDelete: "set null" }),
}, (table) => ({
  pk: primaryKey({ columns: [table.cardId, table.userId] }),
}));


export const registerKey = sqliteTable("register_key", {
	id: integer().primaryKey(),
	keyPass: text("key_pass").notNull().unique(),
	emailRegexp: text("email_regexp").notNull(),
	availCount: integer("avail_count").notNull(),
	createdAt: text("created_at").default(sql`datetime('now')`).notNull(),
});

export const auditLog = sqliteTable("audit_log", {
  id: integer("id").primaryKey(),
  url: text("url"),
  method: text("method"),
  request: text("request"),
  response: text("response"),
  userEmail: text("user_email"),
  logTime: text("log_time").notNull().default(sql`(datetime('now'))`),
});
