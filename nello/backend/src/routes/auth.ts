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
}
