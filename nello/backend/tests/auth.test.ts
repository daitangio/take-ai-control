import { describe, it, expect, beforeEach } from "vitest";
import {
  buildTestApp,
  authHeadersFor,
  registerUser,
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