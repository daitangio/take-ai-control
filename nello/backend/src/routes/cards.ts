import type { FastifyInstance } from "fastify";
import { db } from "../db/index.js";
import { cards, lists, cardArchive, cardMembers, users, boards as boardsTable, boardMembers } from "../db/schema.js";
import { eq, ne, and, asc, sql } from "drizzle-orm";
import { authenticate, checkBoardAccess } from "../middleware/auth.js";

interface CardCreateBody {
  id: string;
  listId: string;
  title: string;
}

interface CardUpdateBody {
  title: string;
  description?: string;
  dueDate?: string | null;
  color?: string | null;
}

interface CardMoveBody {
  toListId: string;
  index: number;
}

interface CardMemberBody {
  userId: string;
}

interface CardUnarchiveBody {
  targetListId: string;
}

function _editorMetadata(modifiedBy: string | null, requesterId: string) {
  return {
    modifiedByEmail: null as string | null,
    isModifiedByCurrentUser: modifiedBy ? modifiedBy === requesterId : null,
  };
}

async function _cardMembers(cardId: string) {
  const rows = await db
    .select({ id: users.id, email: users.email })
    .from(cardMembers)
    .innerJoin(users, eq(cardMembers.userId, users.id))
    .where(eq(cardMembers.cardId, cardId))
    .orderBy(asc(cardMembers.assignedAt), asc(users.email));
  return rows;
}

async function _cardBoardId(cardId: string): Promise<string | null> {
  const [row] = await db
    .select({ boardId: lists.boardId })
    .from(cards)
    .innerJoin(lists, eq(cards.listId, lists.id))
    .where(eq(cards.id, cardId))
    .limit(1);
  return row?.boardId ?? null;
}

async function _listBoardId(listId: string): Promise<string | null> {
  const [row] = await db
    .select({ boardId: lists.boardId })
    .from(lists)
    .where(eq(lists.id, listId))
    .limit(1);
  return row?.boardId ?? null;
}

async function _cardRow(cardId: string) {
  const [row] = await db
    .select()
    .from(cards)
    .where(eq(cards.id, cardId))
    .limit(1);
  return row ?? null;
}

async function _cardResponse(requesterId: string, card: typeof cards.$inferSelect) {
  const meta = _editorMetadata(card.modifiedBy, requesterId);
  let modifiedByEmail: string | null = null;
  if (card.modifiedBy && card.modifiedBy !== requesterId) {
    const [u] = await db.select({ email: users.email }).from(users).where(eq(users.id, card.modifiedBy)).limit(1);
    modifiedByEmail = u?.email ?? null;
  }
  return {
    id: card.id,
    listId: card.listId,
    title: card.title,
    description: card.description,
    dueDate: card.dueDate,
    color: card.color,
    members: await _cardMembers(card.id),
    modifiedBy: card.modifiedBy,
    modifiedByEmail,
    isModifiedByCurrentUser: meta.isModifiedByCurrentUser,
  };
}

export default async function cardRoutes(app: FastifyInstance) {
  // POST /cards
  app.post<{ Body: CardCreateBody }>("/cards", { preHandler: [authenticate] }, async (request, reply) => {
    const user = request.user;
    const { id, listId, title } = request.body;

    if (!title || !title.trim()) {
      return reply.code(422).send({ detail: "Card title is required" });
    }

    const boardId = await _listBoardId(listId);
    if (!boardId || !(await checkBoardAccess(boardId, user.id))) {
      return reply.code(404).send({ detail: "List not found" });
    }

    const [maxRow] = await db
      .select({ mx: sql<number>`COALESCE(MAX(${cards.position}), -1)` })
      .from(cards)
      .where(eq(cards.listId, listId));

    await db.insert(cards).values({
      id,
      listId,
      title: title.trim(),
      position: (maxRow?.mx ?? -1) + 1,
      modifiedBy: user.id,
    });

    const created = await _cardRow(id);
    reply.code(201).send(await _cardResponse(user.id, created!));
  });

  // PATCH /cards/:id
  app.patch<{ Params: { id: string }; Body: CardUpdateBody }>(
    "/cards/:id",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const user = request.user;
      const cardId = request.params.id;

      const card = await _cardRow(cardId);
      if (!card) return reply.code(404).send();

      const boardId = await _cardBoardId(cardId);
      if (!boardId || !(await checkBoardAccess(boardId, user.id))) {
        return reply.code(404).send();
      }

      const { title, description = "", dueDate, color } = request.body;
      if (!title || !title.trim()) {
        return reply.code(422).send({ detail: "Card title is required" });
      }
      const hasBody = request.body as any;
      const hasDueDate = "dueDate" in hasBody;
      const hasColor = "color" in hasBody;

      const updateData: Record<string, any> = {
        title: title.trim(),
        description,
        modifiedBy: user.id,
      };
      if (hasDueDate) updateData.dueDate = dueDate;
      if (hasColor) updateData.color = color;

      await db.update(cards).set(updateData).where(eq(cards.id, cardId));

      const updated = await _cardRow(cardId);
      return await _cardResponse(user.id, updated!);
    },
  );

  // DELETE /cards/:id
  app.delete<{ Params: { id: string } }>("/cards/:id", { preHandler: [authenticate] }, async (request, reply) => {
    const user = request.user;
    const cardId = request.params.id;
    const boardId = await _cardBoardId(cardId);
    if (!boardId || !(await checkBoardAccess(boardId, user.id))) {
      return reply.code(404).send();
    }
    await db.delete(cards).where(eq(cards.id, cardId));
    reply.code(204).send();
  });

  // POST /cards/:id/archive
  app.post<{ Params: { id: string } }>("/cards/:id/archive", { preHandler: [authenticate] }, async (request, reply) => {
    const user = request.user;
    const cardId = request.params.id;

    const card = await _cardRow(cardId);
    if (!card) return reply.code(404).send();

    const boardId = await _cardBoardId(cardId);
    if (!boardId || !(await checkBoardAccess(boardId, user.id))) {
      return reply.code(404).send();
    }

    await db
      .insert(cardArchive)
      .values({ cardId, listId: card.listId, archivedBy: user.id })
      .onConflictDoNothing();

    reply.code(204).send();
  });

  // POST /cards/:id/unarchive
  app.post<{ Params: { id: string }; Body: CardUnarchiveBody }>(
    "/cards/:id/unarchive",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const user = request.user;
      const cardId = request.params.id;
      const { targetListId } = request.body;

      const [archiveRow] = await db
        .select()
        .from(cardArchive)
        .where(eq(cardArchive.cardId, cardId))
        .limit(1);

      if (!archiveRow) return reply.code(404).send();

      const targetBoardId = await _listBoardId(targetListId);
      if (!targetBoardId || !(await checkBoardAccess(targetBoardId, user.id))) {
        return reply.code(404).send();
      }

      await db.delete(cardArchive).where(eq(cardArchive.cardId, cardId));

      const [maxRow] = await db
        .select({ mx: sql<number>`COALESCE(MAX(${cards.position}), -1)` })
        .from(cards)
        .where(eq(cards.listId, targetListId));

      await db
        .update(cards)
        .set({ listId: targetListId, position: (maxRow?.mx ?? -1) + 1, modifiedBy: user.id })
        .where(eq(cards.id, cardId));

      reply.code(204).send();
    },
  );

  // GET /cards/:id/members
  app.get<{ Params: { id: string } }>("/cards/:id/members", { preHandler: [authenticate] }, async (request, reply) => {
    const user = request.user;
    const cardId = request.params.id;
    const boardId = await _cardBoardId(cardId);
    if (!boardId || !(await checkBoardAccess(boardId, user.id))) {
      return reply.code(404).send();
    }
    return await _cardMembers(cardId);
  });

  // GET /cards/:id/member-options
  app.get<{ Params: { id: string } }>(
    "/cards/:id/member-options",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const user = request.user;
      const cardId = request.params.id;
      const boardId = await _cardBoardId(cardId);
      if (!boardId || !(await checkBoardAccess(boardId, user.id))) {
        return reply.code(404).send();
      }

      const rows = await db
        .select({ id: users.id, email: users.email })
        .from(boardsTable)
        .innerJoin(users, eq(users.id, boardsTable.userId))
        .where(eq(boardsTable.id, boardId))
        .union(
          db
            .select({ id: users.id, email: users.email })
            .from(boardMembers)
            .innerJoin(users, eq(users.id, boardMembers.userId))
            .where(eq(boardMembers.boardId, boardId)),
        )
        .orderBy(asc(sql`email`));

      return rows;
    },
  );

  // POST /cards/:id/members
  app.post<{ Params: { id: string }; Body: CardMemberBody }>(
    "/cards/:id/members",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const user = request.user;
      const cardId = request.params.id;
      const { userId: memberId } = request.body;

      const boardId = await _cardBoardId(cardId);
      if (!boardId || !(await checkBoardAccess(boardId, user.id))) {
        return reply.code(404).send();
      }
      if (!(await checkBoardAccess(boardId, memberId))) {
        return reply.code(409).send({ detail: "User does not have access to this board" });
      }

      await db
        .insert(cardMembers)
        .values({ cardId, userId: memberId, assignedBy: user.id })
        .onConflictDoNothing();

      const [member] = await db
        .select({ id: users.id, email: users.email })
        .from(users)
        .where(eq(users.id, memberId))
        .limit(1);

      if (!member) return reply.code(404).send();
      reply.code(201).send(member);
    },
  );

  // DELETE /cards/:id/members/:memberId
  app.delete<{ Params: { id: string; memberId: string } }>(
    "/cards/:id/members/:memberId",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const user = request.user;
      const cardId = request.params.id;
      const memberId = request.params.memberId;

      const boardId = await _cardBoardId(cardId);
      if (!boardId || !(await checkBoardAccess(boardId, user.id))) {
        return reply.code(404).send();
      }

      await db
        .delete(cardMembers)
        .where(and(eq(cardMembers.cardId, cardId), eq(cardMembers.userId, memberId)));

      reply.code(204).send();
    },
  );

  // PUT /cards/:id/move
  app.put<{ Params: { id: string }; Body: CardMoveBody }>(
    "/cards/:id/move",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const user = request.user;
      const cardId = request.params.id;
      const { toListId, index } = request.body;

      const card = await _cardRow(cardId);
      if (!card) return reply.code(404).send();

      const fromBoardId = await _cardBoardId(cardId);
      if (!fromBoardId || !(await checkBoardAccess(fromBoardId, user.id))) {
        return reply.code(404).send();
      }

      const toBoardId = await _listBoardId(toListId);
      if (!toBoardId || !(await checkBoardAccess(toBoardId, user.id))) {
        return reply.code(404).send();
      }

      // Get old list's cards
      const oldCards = await db
        .select({ id: cards.id })
        .from(cards)
        .where(eq(cards.listId, card.listId))
        .orderBy(asc(cards.position));

      // Reorder old list (excluding the moved card)
      let pos = 0;
      for (const cr of oldCards) {
        if (cr.id !== cardId) {
          await db.update(cards).set({ position: pos }).where(eq(cards.id, cr.id));
          pos++;
        } else {
          await db.update(cards).set({ position: -1 }).where(eq(cards.id, cr.id));
        }
      }

      // Get target list's cards
      const targetCards = await db
        .select({ id: cards.id })
        .from(cards)
        .where(and(eq(cards.listId, toListId), ne(cards.id, cardId)))
        .orderBy(asc(cards.position));

      const ids = targetCards.map(tc => tc.id);
      const clamped = Math.max(0, Math.min(index, ids.length));
      ids.splice(clamped, 0, cardId);

      await db.update(cards).set({ listId: toListId, modifiedBy: user.id }).where(eq(cards.id, cardId));
      for (let i = 0; i < ids.length; i++) {
        await db.update(cards).set({ position: i }).where(eq(cards.id, ids[i]));
      }

      return { status: "ok" };
    },
  );
}
