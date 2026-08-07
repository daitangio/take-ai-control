import { describe, it, expect, beforeEach } from "vitest";
import {
  buildTestApp,
  authHeadersFor,
  registerUser,
  insertRegisterKey,
  raw,
  type TestApp,
} from "./helpers.js";

describe("Login", () => {
  let env: TestApp;

  beforeEach(async () => {
    env = await buildTestApp();
    await registerUser(env.db, "test@example.com", "secret123");
  });

  it("logs in with valid credentials and returns a bearer token", async () => {
    const res = await env.app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "test@example.com", password: "secret123" },
    });
    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.body);
    expect(data.access_token).toBeTruthy();
    expect(data.token_type).toBe("bearer");
  });

  it("rejects a wrong password with 401", async () => {
    const res = await env.app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "test@example.com", password: "wrongpassword" },
    });
    expect(res.statusCode).toBe(401);
    expect(JSON.parse(res.body).error_code).toBe("AUTH_INVALID_CREDENTIALS");
  });

  it("rejects an unknown email with 401", async () => {
    const res = await env.app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "nobody@example.com", password: "secret123" },
    });
    expect(res.statusCode).toBe(401);
  });

  it("rejects missing fields with 422", async () => {
    const res = await env.app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: {},
    });
    expect(res.statusCode).toBe(422);
  });
});

describe("Token", () => {
  let env: TestApp;
  let auth: Record<string, string>;

  beforeEach(async () => {
    env = await buildTestApp();
    auth = await authHeadersFor(env.app, env.db, "test@example.com", "secret123");
  });

  it("rejects an invalid bearer token with 401", async () => {
    const res = await env.app.inject({
      method: "GET",
      url: "/api/boards",
      headers: { Authorization: "Bearer invalid-token-here" },
    });
    expect(res.statusCode).toBe(401);
  });

  it("rejects a request with no token at all with 401", async () => {
    const res = await env.app.inject({ method: "GET", url: "/api/boards" });
    expect(res.statusCode).toBe(401);
    expect(JSON.parse(res.body).error_code).toBe("AUTH_REQUIRED");
  });

  it("accepts a valid token issued by login", async () => {
    const res = await env.app.inject({
      method: "GET",
      url: "/api/boards",
      headers: auth,
    });
    expect(res.statusCode).toBe(200);
  });
});

describe("Password Change", () => {
  let env: TestApp;
  let auth: Record<string, string>;

  beforeEach(async () => {
    env = await buildTestApp();
    auth = await authHeadersFor(env.app, env.db, "change@example.com", "secret123");
  });

  it("changes password with valid current password and new password length >= 12", async () => {
    const res = await env.app.inject({
      method: "PUT",
      url: "/api/auth/password",
      headers: auth,
      payload: { currentPassword: "secret123", newPassword: "newlongpassword123" },
    });
    expect(res.statusCode).toBe(200);

    // Verify login with new password
    const loginRes = await env.app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "change@example.com", password: "newlongpassword123" },
    });
    expect(loginRes.statusCode).toBe(200);
  });

  it("rejects password change if current password is incorrect", async () => {
    const res = await env.app.inject({
      method: "PUT",
      url: "/api/auth/password",
      headers: auth,
      payload: { currentPassword: "wrongpassword", newPassword: "newlongpassword123" },
    });
    expect(res.statusCode).toBe(401);
    expect(JSON.parse(res.body).error_code).toBe("PASSWORD_CHANGE_CURRENT_INVALID");
  });

  it("rejects password change if new password is too short", async () => {
    const res = await env.app.inject({
      method: "PUT",
      url: "/api/auth/password",
      headers: auth,
      payload: { currentPassword: "secret123", newPassword: "short" },
    });
    expect(res.statusCode).toBe(422);
  });

  it("rejects password change if missing fields", async () => {
    const res = await env.app.inject({
      method: "PUT",
      url: "/api/auth/password",
      headers: auth,
      payload: { currentPassword: "secret123" },
    });
    expect(res.statusCode).toBe(422);
  });

  it("rejects password change for unauthenticated requests", async () => {
    const res = await env.app.inject({
      method: "PUT",
      url: "/api/auth/password",
      payload: { currentPassword: "secret123", newPassword: "newlongpassword123" },
    });
    expect(res.statusCode).toBe(401);
  });
});

describe("Registration", () => {
  let env: TestApp;

  beforeEach(async () => {
    env = await buildTestApp();
    await insertRegisterKey(env.db, "INVITE-2026", ".*@acme\\.com", 5);
  });

  it("registers successfully with valid invitation key and matching email", async () => {
    const res = await env.app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: { email: "new@acme.com", keyPass: "INVITE-2026", password: "securepassword123" },
    });
    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.body);
    expect(data.access_token).toBeTruthy();
    expect(data.token_type).toBe("bearer");
  });

  it("rejects invalid invitation key with 401", async () => {
    const res = await env.app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: { email: "new@acme.com", keyPass: "WRONG-KEY", password: "securepassword123" },
    });
    expect(res.statusCode).toBe(401);
    const data = JSON.parse(res.body);
    expect(data.detail).toBe("Invalid or exhausted invitation key");
    expect(data.error_code).toBe("REGISTER_KEY_INVALID_OR_EXHAUSTED");
  });

  it("rejects exhausted invitation key with 401", async () => {
    await insertRegisterKey(env.db, "EXHAUSTED", ".*", 0);
    const res = await env.app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: { email: "any@test.com", keyPass: "EXHAUSTED", password: "securepassword123" },
    });
    expect(res.statusCode).toBe(401);
    expect(JSON.parse(res.body).detail).toBe("Invalid or exhausted invitation key");
  });

  it("rejects email that does not match key regexp with 401", async () => {
    const res = await env.app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: { email: "outsider@gmail.com", keyPass: "INVITE-2026", password: "securepassword123" },
    });
    expect(res.statusCode).toBe(401);
    expect(JSON.parse(res.body).detail).toBe("Email not eligible for this invitation key");
  });

  it("rejects duplicate email with 409", async () => {
    // First registration
    await env.app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: { email: "dup@acme.com", keyPass: "INVITE-2026", password: "securepassword123" },
    });
    // Second registration with same email
    const res = await env.app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: { email: "dup@acme.com", keyPass: "INVITE-2026", password: "securepassword123" },
    });
    expect(res.statusCode).toBe(409);
    expect(JSON.parse(res.body).detail).toBe("Email already registered");
  });

  it("rejects short password with 422", async () => {
    const res = await env.app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: { email: "new@acme.com", keyPass: "INVITE-2026", password: "short" },
    });
    expect(res.statusCode).toBe(422);
  });

  it("rejects missing fields with 422", async () => {
    const res = await env.app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: { email: "new@acme.com" },
    });
    expect(res.statusCode).toBe(422);
  });

  it("accepts any email when regexp is wildcard", async () => {
    await insertRegisterKey(env.db, "WILDCARD", ".*", 3);
    const res = await env.app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: { email: "anyone@gmail.com", keyPass: "WILDCARD", password: "securepassword123" },
    });
    expect(res.statusCode).toBe(200);
  });

  it("decrements avail_count after successful registration", async () => {
    const res = await env.app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: { email: "counter@acme.com", keyPass: "INVITE-2026", password: "securepassword123" },
    });
    expect(res.statusCode).toBe(200);

    const rows = await raw(env.db, "SELECT avail_count FROM register_key WHERE key_pass = ?", ["INVITE-2026"]);
    expect(rows[0].avail_count).toBe(4);
  });
});
