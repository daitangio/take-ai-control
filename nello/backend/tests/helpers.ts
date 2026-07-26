import { vi } from "vitest";
import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "../src/db/schema.js";
import { buildApp } from "../src/app.js";
import type { FastifyInstance } from "fastify";
import { hashPassword } from "../src/utils/password.js";

/**
 * One in-memory libsql client + Drizzle instance per test file. vitest
 * isolates each file, and vi.mock (hoisted) creates the instance inside the
 * factory so route/middleware modules receive this `db`.
 */
export type TestDb = LibSQLDatabase<Record<string, never>>;
export type RawRow = Record<string, unknown>;

// Holder populated by the hoisted mock factory below. vi.hoisted ensures the
// holder object exists before the vi.mock factory runs (which is hoisted above
// every other statement in the file).
const dbRef = vi.hoisted(() => ({ db: null as any, client: null as any }));

export const db: TestDb = new Proxy({} as TestDb, {
  get(_t, prop) {
    const target = dbRef.db as any;
    return typeof target?.[prop] === "function"
      ? target[prop].bind(target)
      : target?.[prop];
  },
}) as TestDb;

/**
 * Apply the production schema (all 8 tables) to the in-memory database, with
 * foreign keys ON. DDL mirrors src/db/schema.ts / demo-data.sql.
 */
const SCHEMA_DDL = [
  `CREATE TABLE user (
    id          TEXT PRIMARY KEY,
    email       TEXT UNIQUE NOT NULL,
    password    TEXT NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE board (
    id          TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE list (
    id          TEXT PRIMARY KEY,
    board_id    TEXT NOT NULL REFERENCES board(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    position    INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE card (
    id          TEXT PRIMARY KEY,
    list_id     TEXT NOT NULL REFERENCES list(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    position    INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    modified_by TEXT,
    due_date    TEXT,
    color       TEXT
  )`,
  `CREATE TABLE board_member (
    board_id    TEXT NOT NULL REFERENCES board(id) ON DELETE CASCADE,
    user_id    TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    added_at    TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (board_id, user_id)
  )`,
  `CREATE TABLE list_archive (
    list_id     TEXT PRIMARY KEY REFERENCES list(id) ON DELETE CASCADE,
    board_id    TEXT NOT NULL REFERENCES board(id) ON DELETE CASCADE,
    archived_by TEXT REFERENCES user(id) ON DELETE SET NULL,
    archived_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE card_archive (
    card_id     TEXT PRIMARY KEY REFERENCES card(id) ON DELETE CASCADE,
    list_id     TEXT NOT NULL REFERENCES list(id) ON DELETE CASCADE,
    archived_by TEXT REFERENCES user(id) ON DELETE SET NULL,
    archived_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE card_member (
    card_id     TEXT NOT NULL REFERENCES card(id) ON DELETE CASCADE,
    user_id     TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    assigned_at TEXT NOT NULL DEFAULT (datetime('now')),
    assigned_by TEXT REFERENCES user(id) ON DELETE SET NULL,
    PRIMARY KEY (card_id, user_id)
  )`,
];

const TABLES = [
  "card_member",
  "card_archive",
  "list_archive",
  "board_member",
  "card",
  "list",
  "board",
  "user",
] as const;

let schemaApplied = false;

/** Create all tables once; call resetTables() before each test for isolation. */
export async function ensureSchema(): Promise<void> {
  if (schemaApplied) return;
  const client = dbRef.client;
  await client.execute("PRAGMA foreign_keys = ON");
  for (const ddl of SCHEMA_DDL) await client.execute(ddl);
  schemaApplied = true;
}

/** Wipe all rows so each test starts clean (keeps the same db instance). */
export async function resetTables(): Promise<void> {
  const client = dbRef.client;
  for (const t of TABLES) {
    await client.execute(`DELETE FROM ${t}`);
  }
}

/**
 * Install `db` as the module singleton seen by all route/middleware modules.
 * Hoisted vi.mock: the factory creates the instance (no outer var refs) so
 * any module importing `../db/index.js` receives this `db`.
 */
vi.mock("../src/db/index.js", async () => {
  const actual = await vi.importActual<typeof import("../src/db/index.js")>(
    "../src/db/index.js",
  );
  const client = createClient({ url: ":memory:" });
  const instance = drizzle({ client, schema }) as TestDb;
  dbRef.db = instance;
  dbRef.client = client;
  return { ...actual, db: instance };
});

export type TestApp = { app: FastifyInstance; db: TestDb };

/** Build a fully wired test app against the in-memory db (schema already applied). */
export async function buildTestApp(): Promise<TestApp> {
  await ensureSchema();
  await resetTables();
  const app = await buildApp({ logger: false });
  return { app, db };
}

// --- conftest.py equivalents ----------------------------------------------

/** Register a user directly in the DB (mirrors Python register_user). */
export async function registerUser(
  db: TestDb,
  email: string,
  password: string,
): Promise<void> {
  await db.insert(schema.users).values({
    // Use email as a stable id: tests assert on ids via member add responses,
    // and login binds token.sub == user.id. A stable, predictable id is fine.
    id: email,
    email,
    password: hashPassword(password),
  });
}

/** Log in via the API; asserts 200 and returns the bearer token. */
export async function loginUser(
  app: FastifyInstance,
  email: string,
  password: string,
): Promise<string> {
  const res = await app.inject({
    method: "POST",
    url: "/api/auth/login",
    payload: { email, password },
  });
  if (res.statusCode !== 200) {
    throw new Error(`login failed for ${email}: ${res.statusCode} ${res.body}`);
  }
  return (JSON.parse(res.body) as { access_token: string }).access_token;
}

export function authHeader(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

/** Register + login a user, returning their auth header. */
export async function authHeadersFor(
  app: FastifyInstance,
  db: TestDb,
  email: string,
  password: string,
): Promise<Record<string, string>> {
  await registerUser(db, email, password);
  return authHeader(await loginUser(app, email, password));
}

/**
 * Run raw parameterized SQL against the in-memory client, returning rows keyed
 * by column name (replaces Python sqlite3.Row keyed access).
 */
export async function raw(
  _db: TestDb | undefined,
  sql: string,
  params: unknown[] = [],
): Promise<RawRow[]> {
  const rs = await dbRef.client.execute({ sql, args: params as any });
  return (rs.rows ?? []) as RawRow[];
}

/** Convenience: scalar COUNT(*) (or any aggregate aliased as `count`). */
export async function rawCount(
  db: TestDb | undefined,
  sql: string,
  params: unknown[] = [],
): Promise<number> {
  const rows = await raw(db, sql, params);
  const row = rows[0] ?? {};
  const v = row["count"] ?? row["COUNT(*)"] ?? Object.values(row)[0];
  return Number(v);
}

/** Look up a user id by email via raw SQL (mirrors Python `SELECT id FROM user WHERE email = ?`). */
export async function userIdByEmail(
  db: TestDb,
  email: string,
): Promise<string> {
  const rows = await raw(db, "SELECT id FROM user WHERE email = ?", [email]);
  if (!rows[0]) throw new Error(`no user found for ${email}`);
  return rows[0].id as string;
}