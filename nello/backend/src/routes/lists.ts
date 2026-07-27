import type { FastifyInstance } from "fastify";
import { db } from "../db/index.js";
import { lists, listArchive, cards } from "../db/schema.js";
import { eq, and, isNull, asc, sql } from "drizzle-orm";
import { authenticate, checkBoardAccess } from "../middleware/auth.js";

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
      return reply.code(422).send({ detail: "List name is required" });
    }

    const role = await checkBoardAccess(boardId, user.id);
    if (!role) return reply.code(404).send({ detail: "Board not found" });

    const trimmedName = name.trim();

    // Get max position
    const [maxRow] = await db
      .select({ mx: sql<number>`COALESCE(MAX(${lists.position}), -1)` })
      .from(lists)
      .leftJoin(listArchive, eq(lists.id, listArchive.listId))
      .where(and(eq(lists.boardId, boardId), isNull(listArchive.listId)));

    await db.insert(lists).values({
      id,
      boardId,
      name: trimmedName,
      position: (maxRow?.mx ?? -1) + 1,
    });

    reply.code(201).send({
      id,
      boardId,
      name: trimmedName,
      cardIds: [],
    });
  });

  // PATCH /lists/:id
  app.patch<{ Params: { id: string }; Body: ListUpdateBody }>("/lists/:id", { preHandler: [authenticate] }, async (request, reply) => {
    const user = request.user;
    const listId = request.params.id;
    const { name } = request.body;

    if (!name || !name.trim()) {
      return reply.code(422).send({ detail: "List name is required" });
    }

    const [listRow] = await db
      .select({ boardId: lists.boardId })
      .from(lists)
      .where(eq(lists.id, listId))
      .limit(1);

    if (!listRow) return reply.code(404).send();

    const role = await checkBoardAccess(listRow.boardId, user.id);
    if (!role) return reply.code(404).send();

    const trimmedName = name.trim();
    await db.update(lists).set({ name: trimmedName }).where(eq(lists.id, listId));

    const cardRows = await db
      .select({ id: lists.id })
      .from(lists)
      .where(eq(lists.id, listId))
      .limit(1);

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

    if (!listRow) return reply.code(404).send();

    const role = await checkBoardAccess(listRow.boardId, user.id);
    if (!role) return reply.code(404).send();

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

    if (!listRow) return reply.code(404).send();

    const role = await checkBoardAccess(listRow.boardId, user.id);
    if (!role) return reply.code(404).send();

    await db
      .insert(listArchive)
      .values({ listId, boardId: listRow.boardId, archivedBy: user.id })
      .onConflictDoNothing();

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
      if (!role) return reply.code(404).send({ detail: "Board not found" });

      // Only update visible (non-archived) lists
      const visibleRows = await db
        .select({ id: lists.id })
        .from(lists)
        .leftJoin(listArchive, eq(lists.id, listArchive.listId))
        .where(and(eq(lists.boardId, boardId), isNull(listArchive.listId)));

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
