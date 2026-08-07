import type { FastifyRequest, FastifyReply } from "fastify";
import { verifyToken } from "../utils/jwt.js";
import { db } from "../db/index.js";
import { users, boardMembers, boards } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import { sendError } from "../utils/apiError.js";
import { ErrorCode } from "../types/errors.js";


/**
 * GG: I prefer type to be sure they cannot "enriched"
 */
export type AuthUser = {
  id: string;
  email: string;
}

declare module "fastify" {
  interface FastifyRequest {
    user: AuthUser;
  }
}

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const header = request.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    sendError(reply, 401, ErrorCode.authRequired, "Not authenticated");
    return;
  }

  const token = header.slice(7);
  const userId = verifyToken(token);
  if (!userId) {
    sendError(reply, 401, ErrorCode.authTokenInvalid, "Invalid or expired token");
    return;
  }

  const [user] = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    sendError(reply, 401, ErrorCode.authUserNotFound, "User not found");
    return;
  }

  request.user = user;
}

export async function checkBoardAccess(
  boardId: string,
  userId: string,
): Promise<"owner" | "member" | null> {
  const [board] = await db
    .select({ userId: boards.userId })
    .from(boards)
    .where(eq(boards.id, boardId))
    .limit(1);

  if (!board) return null;
  if (board.userId === userId) return "owner";

  const [member] = await db
    .select()
    .from(boardMembers)
    .where(and(eq(boardMembers.boardId, boardId), eq(boardMembers.userId, userId)))
    .limit(1);

  return member ? "member" : null;
}
