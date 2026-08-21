import type { FastifyInstance } from "fastify";
import { db } from "../db/index.js";
import { users, registerKey, userTiers } from "../db/schema.js";
import { eq, and, sql } from "drizzle-orm";
import { hashPassword, verifyPassword, validatePassword } from "../utils/password.js";
import { createToken } from "../utils/jwt.js";
import { authenticate } from "../middleware/auth.js";
import crypto from "node:crypto";
import { sendError } from "../utils/apiError.js";
import { ErrorCode } from "../types/errors.js";
import { boardCapacity } from "../utils/capacity.js";

type RateLimitConfig = {
  max: number;
  timeWindow: string | number;
};

type AuthRoutesOptions = {
  authRateLimit?: RateLimitConfig;
};

const DEFAULT_AUTH_RATE_LIMIT: RateLimitConfig = {
  max: 12,
  timeWindow: "1 minute",
};

interface LoginBody {
  email: string;
  password: string;
}

interface RegisterBody {
  email: string;
  keyPass: string;
  password: string;
}

interface PasswordChangeBody {
  currentPassword?: string;
  newPassword?: string;
}

export default async function authRoutes(app: FastifyInstance, opts: AuthRoutesOptions = {}) {
  const authRateLimit = opts.authRateLimit ?? DEFAULT_AUTH_RATE_LIMIT;

  app.post<{ Body: LoginBody }>(
    "/auth/login",
    { config: { rateLimit: authRateLimit } },
    async (request, reply) => {
    const { email, password } = request.body;

    if (!email || !password) {
      return sendError(reply, 422, ErrorCode.authCredentialsRequired, "Email and password are required");
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user || !verifyPassword(password, user.password)) {
      return sendError(reply, 401, ErrorCode.authInvalidCredentials, "Invalid email or password");
    }

    const token = createToken(user.id);
    return { access_token: token, token_type: "bearer" };
    },
  );

  app.post<{ Body: RegisterBody }>(
    "/auth/register",
    { config: { rateLimit: authRateLimit } },
    async (request, reply) => {
    const { email, keyPass, password } = request.body;

    if (!email || !keyPass || !password) {
      return sendError(reply, 422, ErrorCode.registerFieldsRequired, "Email, invitation key, and password are required");
    }

    try {
      validatePassword(password);
    } catch (e) {
      return sendError(reply, 422, ErrorCode.registerPasswordInvalid, (e as Error).message);
    }

    // Look up the invitation key
    const [key] = await db
      .select()
      .from(registerKey)
      .where(and(eq(registerKey.keyPass, keyPass), sql`${registerKey.availCount} > 0`))
      .limit(1);

    if (!key) {
      return sendError(reply, 401, ErrorCode.registerKeyInvalidOrExhausted, "Invalid or exhausted invitation key");
    }

    // Validate email against the key's regexp
    if (key.emailRegexp && key.emailRegexp !== ".*") {
      try {
        const re = new RegExp(key.emailRegexp);
        if (!re.test(email)) {
          return sendError(reply, 401, ErrorCode.registerEmailNotEligible, "Email not eligible for this invitation key");
        }
      } catch {
        // Invalid regexp in DB — allow through (admin error, not user's fault)
      }
    }

    // Check for duplicate email
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser) {
      return sendError(reply, 409, ErrorCode.registerEmailAlreadyRegistered, "Email already registered");
    }

    // Race-safe decrement of avail_count
    const updateResult = await db
      .update(registerKey)
      .set({ availCount: sql`${registerKey.availCount} - 1` })
      .where(and(eq(registerKey.id, key.id), sql`${registerKey.availCount} > 0`));

    if (updateResult.rowsAffected === 0) {
      return sendError(reply, 409, ErrorCode.registerKeyJustExhausted, "Invitation key just exhausted");
    }

    // Create user
    const userId = crypto.randomUUID();
    const hashedPassword = hashPassword(password);

    await db.insert(users).values({
      id: userId,
      email,
      password: hashedPassword,
    });

    const token = createToken(userId);
    return { access_token: token, token_type: "bearer" };
    },
  );

  app.get(
    "/auth/tier",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const [tier] = await db
        .select({
          name: userTiers.name,
          listsPerBoardLimit: userTiers.listsPerBoardLimit,
          cardsPerListLimit: userTiers.cardsPerListLimit,
        })
        .from(users)
        .innerJoin(userTiers, eq(users.tierId, userTiers.id))
        .where(eq(users.id, request.user.id))
        .limit(1);

      if (!tier) {
        return sendError(reply, 401, ErrorCode.authUserNotFound, "User tier not found");
      }

      return {
        name: tier.name ?? "free",
        boards: await boardCapacity(db, request.user.id),
        listsPerBoardLimit: Number(tier.listsPerBoardLimit ?? 0),
        cardsPerListLimit: Number(tier.cardsPerListLimit ?? 0),
      };
    },
  );

  app.put<{ Body: PasswordChangeBody }>(
    "/auth/password",
    {
    preHandler: [authenticate],
    config: { rateLimit: authRateLimit },
    },
    async (request, reply) => {
    const { currentPassword, newPassword } = request.body;
    const userId = request.user?.id;

    if (!userId) {
      return sendError(reply, 401, ErrorCode.passwordChangeUnauthorized, "Unauthorized");
    }

    if (!currentPassword || !newPassword) {
      return sendError(reply, 422, ErrorCode.passwordChangeFieldsRequired, "Current password and new password are required");
    }

    try {
      validatePassword(newPassword);
    } catch (e) {
      return sendError(reply, 422, ErrorCode.passwordChangePasswordInvalid, (e as Error).message);
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user || !verifyPassword(currentPassword, user.password)) {
      return sendError(reply, 401, ErrorCode.passwordChangeCurrentInvalid, "Invalid current password");
    }

    const newHashedPassword = hashPassword(newPassword);

    await db
      .update(users)
      .set({ password: newHashedPassword })
      .where(eq(users.id, userId));

      return reply.code(200).send({ detail: "Password updated successfully" });
    },
  );
}
