import Fastify, { type FastifyInstance, type FastifyReply, type FastifyRequest } from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import underPressure from "@fastify/under-pressure";
import authRoutes from "./routes/auth.js";
import boardRoutes from "./routes/boards.js";
import listRoutes from "./routes/lists.js";
import cardRoutes from "./routes/cards.js";
import memberRoutes from "./routes/members.js";
import { sendError } from "./utils/apiError.js";
import { ErrorCode } from "./types/errors.js";

type RateLimitConfig = {
  max: number;
  timeWindow: string | number;
};

type UnderPressureConfig = {
  maxEventLoopDelay?: number;
  maxEventLoopUtilization?: number;
  maxHeapUsedBytes?: number;
  maxRssBytes?: number;
  message?: string;
  retryAfter?: number;
  healthCheck?: (fastify: FastifyInstance) => Promise<Record<string, unknown> | boolean>;
  healthCheckInterval?: number;
  pressureHandler?: (
    request: FastifyRequest,
    reply: FastifyReply,
    type: string,
    value: number | undefined,
  ) => Promise<void> | void;
  sampleInterval?: number;
  exposeStatusRoute?: boolean | string | {
    routeOpts: object;
    routeSchemaOpts?: object;
    routeResponseSchemaOpts?: object;
    url?: string;
  };
  customError?: Error | (new () => Error);
};

export interface BuildAppOptions {
  logger?: false | { level: string };
  rateLimit?: Partial<RateLimitConfig>;
  authRateLimit?: Partial<RateLimitConfig>;
  underPressure?: Partial<UnderPressureConfig>;
  pressureWarnings?: boolean;
  pressureWarningRatio?: number;
  pressureWarningIntervalMs?: number;
}

const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  max: 120,
  timeWindow: "1 minute",
};

const DEFAULT_AUTH_RATE_LIMIT: RateLimitConfig = {
  max: 12,
  timeWindow: "1 minute",
};

const DEFAULT_UNDER_PRESSURE: Partial<UnderPressureConfig> = {
  // GG FIXME: This value are configured for tiny setup
  maxEventLoopDelay: 1000,
  maxHeapUsedBytes: 256 * 1024 * 1024,
  maxRssBytes: 512 * 1024 * 1024,
  maxEventLoopUtilization: 0.98,
  message: "Service under pressure",
  retryAfter: 30,
};

const DEFAULT_WARNING_RATIO = 0.9;
const DEFAULT_WARNING_INTERVAL_MS = 5000;

function mergeRateLimitConfig(defaults: RateLimitConfig, overrides?: Partial<RateLimitConfig>): RateLimitConfig {
  return { ...defaults, ...overrides };
}

function installPressureWarnings(
  app: FastifyInstance,
  limits: Partial<UnderPressureConfig>,
  ratio: number,
  intervalMs: number,
) {
  const timer = setInterval(() => {
    const usage = app.memoryUsage();

    const checks = [
      {
        key: "eventLoopDelay",
        current: usage.eventLoopDelay,
        limit: limits.maxEventLoopDelay,
        message: "Backend event loop delay is nearing the pressure threshold",
      },
      {
        key: "heapUsedBytes",
        current: usage.heapUsed,
        limit: limits.maxHeapUsedBytes,
        message: "Backend heap usage is nearing the pressure threshold",
      },
      {
        key: "rssBytes",
        current: usage.rssBytes,
        limit: limits.maxRssBytes,
        message: "Backend RSS (Resident Memory) is nearing the pressure threshold",
      },
      {
        key: "eventLoopUtilization",
        current: usage.eventLoopUtilized,
        limit: limits.maxEventLoopUtilization,
        message: "Backend event loop utilization is nearing the pressure threshold",
      },
    ] as const;

    for (const check of checks) {
      if (!check.limit || check.current < check.limit * ratio) {
        continue;
      }

      app.log.warn(
        {
          metric: check.key,
          current: check.current,
          limit: check.limit,
          warningThreshold: check.limit * ratio,
        },
        check.message,
      );
    }
  }, intervalMs);

  timer.unref?.();
  app.addHook("onClose", async () => {
    clearInterval(timer);
  });
}

/**
 * Build the Fastify app with all plugins and routes registered, but do NOT
 * call `listen`. Tests import this so they can drive `app.inject` without
 * binding a port; `src/index.ts` calls `listen` on the result for prod.
 */
export async function buildApp(opts: BuildAppOptions = {}): Promise<FastifyInstance> {
  const app = Fastify({ logger: opts.logger ?? { level: "debug" } });

  await app.register(cors, {
    origin: ["http://localhost:5173"],
    credentials: true,
    methods: ["*"],
    allowedHeaders: ["*"],
  });

  const rateLimitConfig = mergeRateLimitConfig(DEFAULT_RATE_LIMIT, opts.rateLimit);
  await app.register(rateLimit, {
    max: rateLimitConfig.max,
    timeWindow: rateLimitConfig.timeWindow,
  });

  const authRateLimitConfig = mergeRateLimitConfig(DEFAULT_AUTH_RATE_LIMIT, opts.authRateLimit);
  const underPressureConfig: UnderPressureConfig = {
    ...DEFAULT_UNDER_PRESSURE,
    ...opts.underPressure,
    pressureHandler: (request, reply, type, value) => {
      app.log.error(
        { type, value, method: request.method, path: request.routeOptions.url },
        "Backend rejected a request because the process is under pressure",
      );

      sendError(reply, 503, ErrorCode.serviceUnderPressure, "Service under pressure");
    },
  };

  await app.register(underPressure, underPressureConfig);

  if (opts.pressureWarnings ?? true) {
    installPressureWarnings(
      app,
      underPressureConfig,
      opts.pressureWarningRatio ?? DEFAULT_WARNING_RATIO,
      opts.pressureWarningIntervalMs ?? DEFAULT_WARNING_INTERVAL_MS,
    );
  }

  await app.register(authRoutes, {
    prefix: "/api",
    authRateLimit: authRateLimitConfig,
  });
  await app.register(boardRoutes, { prefix: "/api" });
  await app.register(listRoutes, { prefix: "/api" });
  await app.register(cardRoutes, { prefix: "/api" });
  await app.register(memberRoutes, { prefix: "/api" });

  app.get("/api/health", async () => ({ status: "ok" }));

  return app;
}
