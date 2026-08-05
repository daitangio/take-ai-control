import { describe, it, expect, beforeEach } from "vitest";
import { buildTestApp, registerUser, type TestApp } from "./helpers.js";

describe("backend abuse protection", () => {
  it("returns 429 when the global rate limit is exceeded", async () => {
    const env = await buildTestApp({
      rateLimit: { max: 1, timeWindow: "1 minute" },
    });

    const first = await env.app.inject({
      method: "GET",
      url: "/api/health",
    });
    expect(first.statusCode).toBe(200);

    const second = await env.app.inject({
      method: "GET",
      url: "/api/health",
    });
    expect(second.statusCode).toBe(429);
  });

  it("returns 429 for auth endpoints before the global limit is reached", async () => {
    const env = await buildTestApp({
      rateLimit: { max: 20, timeWindow: "1 minute" },
      authRateLimit: { max: 1, timeWindow: "1 minute" },
    });

    await registerUser(env.db, "throttle@example.com", "secret123");

    const first = await env.app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "throttle@example.com", password: "secret123" },
    });
    expect(first.statusCode).toBe(200);

    const second = await env.app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "throttle@example.com", password: "secret123" },
    });
    expect(second.statusCode).toBe(429);
  });

  it("returns 503 when the service reports unhealthy pressure", async () => {
    const env = await buildTestApp({
      underPressure: {
        healthCheck: async () => false,
        healthCheckInterval: 1,
      },
    });

    const res = await env.app.inject({
      method: "GET",
      url: "/api/health",
    });

    expect(res.statusCode).toBe(503);
    expect(JSON.parse(res.body).detail).toBe("Service under pressure");
  });
});
