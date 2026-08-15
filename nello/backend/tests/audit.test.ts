import { beforeEach, describe, expect, it } from "vitest";
import { buildTestApp, raw, registerUser, type TestApp } from "./helpers.js";
import { purgeExpiredAuditLogs, serializeAuditPayload } from "../src/utils/audit.js";

describe("request and response audit logging", () => {
  let env: TestApp;

  beforeEach(async () => {
    env = await buildTestApp();
  });

  it("redacts nested sensitive JSON values", () => {
    expect(JSON.parse(serializeAuditPayload({ nested: { password: "secret" }, keyPass: "invite" }, true)))
      .toEqual({ nested: { password: "[REDACTED]" }, keyPass: "[REDACTED]" });
  });

  it("stores redacted login request and response JSON", async () => {
    await registerUser(env.db, "audit@example.com", "secret123");

    const res = await env.app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "audit@example.com", password: "secret123" },
    });
    expect(res.statusCode).toBe(200);

    const [row] = await raw(env.db, "SELECT url, method, request, response FROM audit_log WHERE url = ?", ["/api/auth/login"]);
    expect(row).toMatchObject({ url: "/api/auth/login", method: "POST" });
    expect(JSON.parse(row?.request as string)).toMatchObject({
      email: "audit@example.com",
      password: "[REDACTED]",
    });
    expect(JSON.parse(row?.response as string).access_token).toBe("[REDACTED]");
  });

  it("stores null for bodyless requests and audits rejected requests", async () => {
    const health = await env.app.inject({ method: "GET", url: "/api/health" });
    expect(health.statusCode).toBe(200);

    const rejected = await env.app.inject({ method: "GET", url: "/api/boards" });
    expect(rejected.statusCode).toBe(401);

    const [healthRow] = await raw(env.db, "SELECT request, response FROM audit_log WHERE url = ?", ["/api/health"]);
    expect(healthRow?.request).toBe("null");
    expect(JSON.parse(healthRow?.response as string)).toEqual({ status: "ok" });

    const [rejectedRow] = await raw(env.db, "SELECT request, response FROM audit_log WHERE url = ?", ["/api/boards"]);
    expect(rejectedRow?.request).toBe("null");
    expect(JSON.parse(rejectedRow?.response as string)).toMatchObject({ error_code: "AUTH_REQUIRED" });
  });

  it("omits non-JSON payloads instead of recording their raw content", () => {
    expect(JSON.parse(serializeAuditPayload("secret form value", false))).toEqual({
      body: "[non-JSON payload omitted]",
    });
  });

  it("removes audit rows older than four weeks and retains newer rows", async () => {
    await raw(env.db, `
      INSERT INTO audit_log (url, method, request, response, log_time)
      VALUES
        ('/expired', 'GET', 'null', 'null', datetime('now', '-29 days')),
        ('/current', 'GET', 'null', 'null', datetime('now', '-27 days'))
    `);

    await purgeExpiredAuditLogs(env.db);

    const rows = await raw(env.db, "SELECT url FROM audit_log ORDER BY url");
    expect(rows.map((row) => row.url)).toEqual(["/current"]);
  });
});
