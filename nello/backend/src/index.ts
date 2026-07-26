import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import authRoutes from "./routes/auth.js";
import boardRoutes from "./routes/boards.js";
import listRoutes from "./routes/lists.js";
import cardRoutes from "./routes/cards.js";
import memberRoutes from "./routes/members.js";

const app = Fastify({ logger: { level: "debug" } });

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

// Register routes
await app.register(authRoutes, { prefix: "/api" });
await app.register(boardRoutes, { prefix: "/api" });
await app.register(listRoutes, { prefix: "/api" });
await app.register(cardRoutes, { prefix: "/api" });
await app.register(memberRoutes, { prefix: "/api" });

// Health check
app.get("/api/health", async () => ({ status: "ok" }));

const port = Number(process.env.PORT || 6502);

try {
  await app.listen({ port, host: "0.0.0.0" });
  console.log(`Nello backend listening on port ${port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}

export { app };
