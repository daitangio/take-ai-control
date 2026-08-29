import type { FastifyInstance } from "fastify";
import { db } from "../db/index.js";
import { lists, cards } from "../db/schema.js";
import { eq, and,  asc, sql } from "drizzle-orm";
import { authenticate, checkBoardAccess } from "../middleware/auth.js";
import { sendError } from "../utils/apiError.js";
import { ErrorCode } from "../types/errors.js";
import { listCapacity, withCapacityLock } from "../utils/capacity.js";

interface ListCreateBody {
  id: string;
  boardId: string;
  name: string;
}

interface ListUpdateBody {
  name: string;
}

interface ReorderBody {
  listIds: string[];
}

export default async function listRoutes(app: FastifyInstance) {
  // POST /lists
  app.post<{ Body: ListCreateBody }>("/lists", { preHandler: [authenticate] }, async (request, reply) => {
    const user = request.user;
    const { id, boardId, name } = request.body;

    if (!name || !name.trim()) {
      return sendError(reply, 422, ErrorCode.listNameRequired, "List name is required");
    }

    const role = await checkBoardAccess(boardId, user.id);
    if (!role) return sendError(reply, 404, ErrorCode.boardNotFound, "Board not found");

    const trimmedName = name.trim();

    const outcome = await withCapacityLock(async () => {
      const capacity = await listCapacity(db, boardId);
      if (capacity.used >= capacity.limit) return { limited: true as const };
      const [maxRow] = await db
        .select({ mx: sql<number>`COALESCE(MAX(${lists.position}), -1)` })
        .from(lists)        
        .where(eq(lists.boardId, boardId));
      await db.insert(lists).values({ id, boardId, name: trimmedName, position: (maxRow?.mx ?? -1) + 1 });
      return { limited: false as const, capacity: await listCapacity(db, boardId) };
    });
    if (outcome.limited) return sendError(reply, 409, ErrorCode.listLimitReached, "List limit reached");

    reply.code(201).send({
      id,
      boardId,
      name: trimmedName,
      cardIds: [],
      capacity: outcome.capacity,
    });
  });

  // PATCH /lists/:id
  app.patch<{ Params: { id: string }; Body: ListUpdateBody }>("/lists/:id", { preHandler: [authenticate] }, async (request, reply) => {
    const user = request.user;
    const listId = request.params.id;
    const { name } = request.body;

    if (!name || !name.trim()) {
      return sendError(reply, 422, ErrorCode.listNameRequired, "List name is required");
    }

    const [listRow] = await db
      .select({ boardId: lists.boardId })
      .from(lists)
      .where(eq(lists.id, listId))
      .limit(1);

    if (!listRow) return sendError(reply, 404, ErrorCode.listNotFound, "List not found");

    const role = await checkBoardAccess(listRow.boardId, user.id);
    if (!role) return sendError(reply, 404, ErrorCode.listNotFound, "List not found");

    const trimmedName = name.trim();
    await db.update(lists).set({ name: trimmedName }).where(eq(lists.id, listId));


    // Fetch card IDs for this list
    const cardIdRows = await db
      .select({ id: cards.id })
      .from(cards)
      .where(eq(cards.listId, listId))
      .orderBy(asc(cards.position));

    return {
      id: listId,
      boardId: listRow.boardId,
      name: trimmedName,
      cardIds: cardIdRows.map(c => c.id),
    };
  });

  // DELETE /lists/:id
  app.delete<{ Params: { id: string } }>("/lists/:id", { preHandler: [authenticate] }, async (request, reply) => {
    const user = request.user;
    const listId = request.params.id;

    const [listRow] = await db
      .select({ boardId: lists.boardId })
      .from(lists)
      .where(eq(lists.id, listId))
      .limit(1);

    if (!listRow) return sendError(reply, 404, ErrorCode.listNotFound, "List not found");

    const role = await checkBoardAccess(listRow.boardId, user.id);
    if (!role) return sendError(reply, 404, ErrorCode.listNotFound, "List not found");

    await db.delete(lists).where(eq(lists.id, listId));
    reply.code(204).send();
  });

  // POST /lists/:id/archive
  app.post<{ Params: { id: string } }>("/lists/:id/archive", { preHandler: [authenticate] }, async (request, reply) => {
    const user = request.user;
    const listId = request.params.id;

    const [listRow] = await db
      .select({ boardId: lists.boardId })
      .from(lists)
      .where(eq(lists.id, listId))
      .limit(1);

    if (!listRow) return sendError(reply, 404, ErrorCode.listNotFound, "List not found");

    const role = await checkBoardAccess(listRow.boardId, user.id);
    if (!role) return sendError(reply, 404, ErrorCode.listNotFound, "List not found");

    // Delete the list and the cards: there is a on cascade relation so the first delete is not needed,
    // but lets do anyway for more robust design
    await db.delete(cards).where(eq(cards.listId,listId))    
    await db.delete(lists).where(eq(lists.id,listId))
  
    reply.code(204).send();
  });

  // PUT /boards/:boardId/lists/reorder
  app.put<{ Params: { boardId: string }; Body: ReorderBody }>(
    "/boards/:boardId/lists/reorder",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const user = request.user;
      const boardId = request.params.boardId;
      const { listIds } = request.body;

      const role = await checkBoardAccess(boardId, user.id);
      if (!role) return sendError(reply, 404, ErrorCode.boardNotFound, "Board not found");

      // OLD: Only update visible (non-archived) lists
      // GG Removed archive concept
      const visibleRows = await db
        .select({ id: lists.id })
        .from(lists)        
        .where(eq(lists.boardId, boardId));

      const visibleIds = new Set(visibleRows.map(r => r.id));

      for (let i = 0; i < listIds.length; i++) {
        if (visibleIds.has(listIds[i])) {
          await db
            .update(lists)
            .set({ position: i })
            .where(and(eq(lists.id, listIds[i]), eq(lists.boardId, boardId)));
        }
      }

      return { status: "ok" };
    },
  );
}
