import type { FastifyInstance } from "fastify";
import { db } from "../db/index.js";
import { users, registerKey } from "../db/schema.js";
import { eq, and, sql } from "drizzle-orm";
import { hashPassword, verifyPassword, validatePassword } from "../utils/password.js";
import { createToken } from "../utils/jwt.js";
import { authenticate } from "../middleware/auth.js";
import crypto from "node:crypto";

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

export default async function authRoutes(app: FastifyInstance) {
  app.post<{ Body: LoginBody }>("/auth/login", async (request, reply) => {
    const { email, password } = request.body;

    if (!email || !password) {
      return reply.code(422).send({ detail: "Email and password are required" });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user || !verifyPassword(password, user.password)) {
      return reply.code(401).send({ detail: "Invalid email or password" });
    }

    const token = createToken(user.id);
    return { access_token: token, token_type: "bearer" };
  });

  app.post<{ Body: RegisterBody }>("/auth/register", async (request, reply) => {
    const { email, keyPass, password } = request.body;

    if (!email || !keyPass || !password) {
      return reply.code(422).send({ detail: "Email, invitation key, and password are required" });
    }

    try {
      validatePassword(password);
    } catch (e) {
      return reply.code(422).send({ detail: (e as Error).message });
    }

    // Look up the invitation key
    const [key] = await db
      .select()
      .from(registerKey)
      .where(and(eq(registerKey.keyPass, keyPass), sql`${registerKey.availCount} > 0`))
      .limit(1);

    if (!key) {
      return reply.code(401).send({ detail: "Invalid or exhausted invitation key" });
    }

    // Validate email against the key's regexp
    if (key.emailRegexp && key.emailRegexp !== ".*") {
      try {
        const re = new RegExp(key.emailRegexp);
        if (!re.test(email)) {
          return reply.code(401).send({ detail: "Email not eligible for this invitation key" });
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
      return reply.code(409).send({ detail: "Email already registered" });
    }

    // Race-safe decrement of avail_count
    const updateResult = await db
      .update(registerKey)
      .set({ availCount: sql`${registerKey.availCount} - 1` })
      .where(and(eq(registerKey.id, key.id), sql`${registerKey.availCount} > 0`));

    if (updateResult.rowsAffected === 0) {
      return reply.code(409).send({ detail: "Invitation key just exhausted" });
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
  });

  app.put<{ Body: PasswordChangeBody }>("/auth/password", { preHandler: [authenticate] }, async (request, reply) => {
    const { currentPassword, newPassword } = request.body;
    const userId = request.user?.id;

    if (!userId) {
      return reply.code(401).send({ detail: "Unauthorized" });
    }

    if (!currentPassword || !newPassword) {
      return reply.code(422).send({ detail: "Current password and new password are required" });
    }

    try {
      validatePassword(newPassword);
    } catch (e) {
      return reply.code(422).send({ detail: (e as Error).message });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user || !verifyPassword(currentPassword, user.password)) {
      return reply.code(401).send({ detail: "Invalid current password" });
    }

    const newHashedPassword = hashPassword(newPassword);

    await db
      .update(users)
      .set({ password: newHashedPassword })
      .where(eq(users.id, userId));

    return reply.code(200).send({ detail: "Password updated successfully" });
  });
}
