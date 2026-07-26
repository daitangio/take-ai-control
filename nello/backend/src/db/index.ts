import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema.js";

const dbPath = process.env.NELLO_DB_PATH || "file:./nello.db";

const client = createClient({ url: dbPath });
export const db = drizzle({ client, schema });

export type Db = typeof db;

