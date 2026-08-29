import { vi } from "vitest";
import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "../src/db/schema.js";
import { buildApp } from "../src/app.js";
import type { BuildAppOptions } from "../src/app.js";
import type { FastifyInstance } from "fastify";
import { hashPassword } from "../src/utils/password.js";
import fs from "fs";
import path from "path/posix";


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



const TABLES = [
  "audit_log",
  "card_member",
  "card_archive",
  "board_member",
  "card",
  "list",
  "board",
  "user",
  "register_key",
] as const;

let schemaApplied = false;

/** Create all tables once; call resetTables() before each test for isolation. 
 * GG: To apply the schema we use the migration scripts 
 */
export async function ensureSchema(): Promise<void> {
  if (schemaApplied) return;
  const client = dbRef.client;
  await client.execute("PRAGMA foreign_keys = ON");

  const paths = await fs.promises.readdir("./db-init", { withFileTypes: true});
  for(const p of paths) {
      console.debug(`Path ${p.name} Dir:${p.isDirectory()}`);  
      var ddl=await fs.promises.readFile(path.join(p.parentPath,p.name),'utf-8')
      /// console.log(ddl)
      for(const  statement of ddl.split(";")) {
        if(!statement.trim()){
          // Skip empty queries and avoid LibsqlError: SQLITE_OK: not an error
          // error... no comment
          continue
        }
        await client.execute(statement);
      }
  }
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
export async function buildTestApp(options: BuildAppOptions = {}): Promise<TestApp> {
  await ensureSchema();
  await resetTables();
  const app = await buildApp({ logger: false, pressureWarnings: false, ...options });
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

/** Insert an invitation key into register_key for tests. */
export async function insertRegisterKey(
  db: TestDb,
  keyPass: string,
  emailRegexp: string,
  availCount: number,
): Promise<void> {
  await db.insert(schema.registerKey).values({
    keyPass,
    emailRegexp,
    availCount,
  });
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
