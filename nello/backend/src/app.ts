import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import authRoutes from "./routes/auth.js";
import boardRoutes from "./routes/boards.js";
import listRoutes from "./routes/lists.js";
import cardRoutes from "./routes/cards.js";
import memberRoutes from "./routes/members.js";

/**
 * Build the Fastify app with all plugins and routes registered, but do NOT
 * call `listen`. Tests import this so they can drive `app.inject` without
 * binding a port; `src/index.ts` calls `listen` on the result for prod.
 */
export async function buildApp(
  opts: { logger?: false | { level: string } } = {},
): Promise<FastifyInstance> {
  const app = Fastify({ logger: opts.logger ?? { level: "debug" } });

  await app.register(cors, {
    origin: ["http://localhost:5173"],
    credentials: true,
    methods: ["*"],
    allowedHeaders: ["*"],
  });

  await app.register(rateLimit, {
    max: 200,
    timeWindow: "1 minute",
  });

  await app.register(authRoutes, { prefix: "/api" });
  await app.register(boardRoutes, { prefix: "/api" });
  await app.register(listRoutes, { prefix: "/api" });
  await app.register(cardRoutes, { prefix: "/api" });
  await app.register(memberRoutes, { prefix: "/api" });

  app.get("/api/health", async () => ({ status: "ok" }));

  return app;
}