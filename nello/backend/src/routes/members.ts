import type { FastifyInstance } from "fastify";
import { db } from "../db/index.js";
import { boards, boardMembers, cardMembers, cards, lists, users } from "../db/schema.js";
import { eq, and, asc } from "drizzle-orm";
import { authenticate, checkBoardAccess } from "../middleware/auth.js";
import { sendError } from "../utils/apiError.js";
import { ErrorCode } from "../types/errors.js";

interface AddMemberBody {
  email: string;
}

export default async function memberRoutes(app: FastifyInstance) {
  // GET /boards/:id/members
  app.get<{ Params: { id: string } }>("/boards/:id/members", { preHandler: [authenticate] }, async (request, reply) => {
    const user = request.user;
    const boardId = request.params.id;

    if (!(await checkBoardAccess(boardId, user.id))) {
      return sendError(reply, 404, ErrorCode.boardNotFound, "Board not found");
    }

    const rows = await db
      .select({ id: users.id, email: users.email })
      .from(boardMembers)
      .innerJoin(users, eq(boardMembers.userId, users.id))
      .where(eq(boardMembers.boardId, boardId))
      .orderBy(asc(boardMembers.addedAt));

    return rows;
  });

  // POST /boards/:id/members
  app.post<{ Params: { id: string }; Body: AddMemberBody }>(
    "/boards/:id/members",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const user = request.user;
      const boardId = request.params.id;
      const { email } = request.body;

      const role = await checkBoardAccess(boardId, user.id);
      if (!role) return sendError(reply, 404, ErrorCode.boardNotFound, "Board not found");
      if (role !== "owner") {
        return sendError(reply, 403, ErrorCode.memberAddForbidden, "Only the board owner can add members");
      }

      const [board] = await db
        .select({ name: boards.name })
        .from(boards)
        .where(eq(boards.id, boardId))
        .limit(1);

      if (!board.name.endsWith("$")) {
        return sendError(reply, 409, ErrorCode.boardNotShared, "Board is not shared (name must end with '$')");
      }

      const [memberUser] = await db
        .select({ id: users.id, email: users.email })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!memberUser) {
        return sendError(reply, 404, ErrorCode.memberUserNotFound, "User not found");
      }

      if (memberUser.id === user.id) {
        return sendError(reply, 409, ErrorCode.memberSelfAddForbidden, "Cannot add yourself as a member");
      }

      // Check if already a member
      const [existing] = await db
        .select()
        .from(boardMembers)
        .where(and(eq(boardMembers.boardId, boardId), eq(boardMembers.userId, memberUser.id)))
        .limit(1);

      if (existing) {
        return sendError(reply, 409, ErrorCode.memberAlreadyExists, "User is already a member");
      }

      await db.insert(boardMembers).values({
        boardId,
        userId: memberUser.id,
      });

      reply.code(201).send({ id: memberUser.id, email: memberUser.email });
    },
  );

  // DELETE /boards/:id/members/:memberId
  app.delete<{ Params: { id: string; memberId: string } }>(
    "/boards/:id/members/:memberId",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const user = request.user;
      const boardId = request.params.id;
      const memberId = request.params.memberId;

      const role = await checkBoardAccess(boardId, user.id);
      if (!role) return sendError(reply, 404, ErrorCode.boardNotFound, "Board not found");
      if (role !== "owner") {
        return sendError(reply, 403, ErrorCode.memberRemoveForbidden, "Only the board owner can remove members");
      }

      // Verify the target user is a board member before deleting; the Python
      // backend returned 404 when the member did not exist.
      const [existing] = await db
        .select({ userId: boardMembers.userId })
        .from(boardMembers)
        .where(and(eq(boardMembers.boardId, boardId), eq(boardMembers.userId, memberId)))
        .limit(1);
      if (!existing) {
        return sendError(reply, 404, ErrorCode.memberNotFound, "Member not found");
      }

      const delResult = await db
        .delete(boardMembers)
        .where(and(eq(boardMembers.boardId, boardId), eq(boardMembers.userId, memberId)));

      // Also remove from any cards in this board, but only if the membership row
      // was actually removed (mirrors the original cascade-on-removal behavior).
      if (delResult.rowsAffected > 0) {
        const cardRows = await db
          .select({ cardId: cards.id })
          .from(cards)
          .innerJoin(lists, eq(cards.listId, lists.id))
          .where(eq(lists.boardId, boardId));

        for (const cr of cardRows) {
          await db
            .delete(cardMembers)
            .where(and(eq(cardMembers.cardId, cr.cardId), eq(cardMembers.userId, memberId)));
        }
      }

      reply.code(204).send();
    },
  );
}
