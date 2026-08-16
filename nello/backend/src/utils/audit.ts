import { sql } from "drizzle-orm";
import type { Db } from "../db/index.js";
import { auditLog } from "../db/schema.js";

const REDACTED = "[REDACTED]";
const NON_JSON_OMITTED = { body: "[non-JSON payload omitted]" };
const SENSITIVE_KEY = /password|keypass|authorization|token/i;

export const AUDIT_RETENTION_DAYS = 28; // 4 weeks retention policy

type AuditLogEntry = {
  url: string;
  method: string;
  request: string;
  response: string;
  userEmail?: string;
};

function sanitize(value: unknown, seen = new WeakSet<object>()): unknown {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") return Number.isFinite(value) ? value : String(value);
  if (typeof value === "bigint") return value.toString();
  if (typeof value !== "object") return String(value);
  if (seen.has(value)) return "[circular]";
  seen.add(value);

  if (Array.isArray(value)) return value.map((item) => sanitize(item, seen));

  const result: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    result[key] = SENSITIVE_KEY.test(key) ? REDACTED : sanitize(item, seen);
  }
  return result;
}

export function isJsonContentType(contentType: string | undefined): boolean {
  return Boolean(contentType?.split(";", 1)[0]?.trim().match(/(?:^application\/json$|\+json$)/i));
}

export function serializeAuditPayload(payload: unknown, isJson: boolean): string {
  if (payload === undefined || payload === null) return "null";

  let jsonPayload = payload;
  if (typeof payload === "string") {
    if (!isJson) return JSON.stringify(NON_JSON_OMITTED);
    try {
      jsonPayload = JSON.parse(payload);
    } catch {
      return JSON.stringify(NON_JSON_OMITTED);
    }
  } else if (!isJson && (typeof payload !== "object" || Buffer.isBuffer(payload))) {
    return JSON.stringify(NON_JSON_OMITTED);
  }

  return JSON.stringify(sanitize(jsonPayload));
}

export async function persistAuditLog(
  database: Pick<Db, "insert">,
  entry: AuditLogEntry,
): Promise<void> {
  await database.insert(auditLog).values(entry);
}

export async function purgeExpiredAuditLogs(database: Pick<Db, "delete">): Promise<void> {
  await database
    .delete(auditLog)
    .where(sql`${auditLog.logTime} < datetime('now', ${`-${AUDIT_RETENTION_DAYS} days`})`);
}
