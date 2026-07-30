import type { FastifyInstance } from "fastify";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { createToken } from "../utils/jwt.js";
import { authenticate } from "../middleware/auth.js";

interface LoginBody {
  email: string;
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

  app.put<{ Body: PasswordChangeBody }>("/auth/password", { preHandler: [authenticate] }, async (request, reply) => {
    const { currentPassword, newPassword } = request.body;
    const userId = request.user?.id;

    if (!userId) {
      return reply.code(401).send({ detail: "Unauthorized" });
    }

    if (!currentPassword || !newPassword) {
      return reply.code(422).send({ detail: "Current password and new password are required" });
    }

    if (newPassword.length < 12) {
      return reply.code(422).send({ detail: "New password must be at least 12 characters long" });
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
