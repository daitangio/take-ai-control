import type { FastifyInstance } from "fastify";
import type { AuthUser } from "../middleware/auth.js";
import { db } from "../db/index.js";
import { boards, lists, cards, listArchive, cardArchive, cardMembers, users, boardMembers } from "../db/schema.js";
import { eq, and, isNull, asc, sql as sqlDrizzle } from "drizzle-orm";
import { authenticate, checkBoardAccess } from "../middleware/auth.js";

interface BoardCreateBody {
  id: string;
  name: string;
}

interface BoardUpdateBody {
  name: string;
}

export default async function boardRoutes(app: FastifyInstance) {
  // GET /boards
  app.get("/boards", { preHandler: [authenticate] }, async (request, reply) => {
    const user = (request as any).user as AuthUser;

    // Own boards
    const ownBoards = await db
      .select()
      .from(boards)
      .where(eq(boards.userId, user.id))
      .orderBy(asc(boards.name));

    // Shared boards
    const sharedRows = await db
      .select({ board: boards })
      .from(boards)
      .innerJoin(boardMembers, eq(boards.id, boardMembers.boardId))
      .where(eq(boardMembers.userId, user.id))
      .orderBy(asc(boards.name));

    const allBoards: { id: string; name: string; isOwner: boolean }[] = [
      ...ownBoards.map(b => ({ id: b.id, name: b.name, isOwner: true })),
      ...sharedRows.map(r => ({ id: r.board.id, name: r.board.name, isOwner: false })),
    ];

    const result = [];
    for (const board of allBoards) {
      const listRows = await db
        .select({ id: lists.id })
        .from(lists)
        .leftJoin(listArchive, eq(lists.id, listArchive.listId))
        .where(and(eq(lists.boardId, board.id), isNull(listArchive.listId)))
        .orderBy(asc(lists.position));

      result.push({
        id: board.id,
        name: board.name,
        listIds: listRows.map(l => l.id),
        isShared: board.name.endsWith("$"),
        isOwner: board.isOwner,
      });
    }

    return result;
  });

  // POST /boards
  app.post<{ Body: BoardCreateBody }>("/boards", { preHandler: [authenticate] }, async (request, reply) => {
    const user = (request as any).user as AuthUser;
    const { id, name } = request.body;

    if (!name || !name.trim()) {
      return reply.code(422).send({ detail: "Board name is required" });
    }

    const trimmedName = name.trim();
    await db.insert(boards).values({ id, userId: user.id, name: trimmedName });

    reply.code(201).send({
      id,
      name: trimmedName,
      listIds: [] as string[],
      isShared: trimmedName.endsWith("$"),
      isOwner: true,
    });
  });

  // GET /boards/:id
  app.get<{ Params: { id: string } }>("/boards/:id", { preHandler: [authenticate] }, async (request, reply) => {
    const user = (request as any).user as AuthUser;
    const boardId = request.params.id;

    const role = await checkBoardAccess(boardId, user.id);
    if (!role) return reply.code(404).send();

    const [board] = await db.select().from(boards).where(eq(boards.id, boardId)).limit(1);

    const listRows = await db
      .select({ id: lists.id, name: lists.name })
      .from(lists)
      .leftJoin(listArchive, eq(lists.id, listArchive.listId))
      .where(and(eq(lists.boardId, boardId), isNull(listArchive.listId)))
      .orderBy(asc(lists.position));

    const listResults = [];
    for (const lr of listRows) {
      const cardRows = await db
        .select()
        .from(cards)
        .leftJoin(cardArchive, eq(cards.id, cardArchive.cardId))
        .where(and(eq(cards.listId, lr.id), isNull(cardArchive.cardId)))
        .orderBy(asc(cards.position));

      const cardResults = [];
      for (const cr of cardRows) {
        const memberRows = await db
          .select({ id: users.id, email: users.email })
          .from(cardMembers)
          .innerJoin(users, eq(cardMembers.userId, users.id))
          .where(eq(cardMembers.cardId, cr.card.id));

        let modifiedByEmail: string | null = null;
        if (cr.card.modifiedBy && cr.card.modifiedBy !== user.id) {
          const [u] = await db.select({ email: users.email }).from(users).where(eq(users.id, cr.card.modifiedBy)).limit(1);
          modifiedByEmail = u?.email ?? null;
        }

        cardResults.push({
          id: cr.card.id,
          title: cr.card.title,
          description: cr.card.description,
          dueDate: cr.card.dueDate,
          color: cr.card.color,
          members: memberRows,
          modifiedBy: cr.card.modifiedBy,
          modifiedByEmail,
          isModifiedByCurrentUser: cr.card.modifiedBy ? cr.card.modifiedBy === user.id : null,
        });
      }

      listResults.push({
        id: lr.id,
        name: lr.name,
        cards: cardResults,
      });
    }

    return { id: board.id, name: board.name, lists: listResults };
  });

  // PATCH /boards/:id
  app.patch<{ Params: { id: string }; Body: BoardUpdateBody }>("/boards/:id", { preHandler: [authenticate] }, async (request, reply) => {
    const user = (request as any).user as AuthUser;
    const boardId = request.params.id;

    const role = await checkBoardAccess(boardId, user.id);
    if (!role) return reply.code(404).send();

    const [current] = await db.select({ name: boards.name }).from(boards).where(eq(boards.id, boardId)).limit(1);
    const newName = request.body.name.trim();

    if (current.name.endsWith("$") && !newName.endsWith("$")) {
      return reply.code(409).send({ detail: "Shared boards must keep the '$' suffix" });
    }

    await db.update(boards).set({ name: newName }).where(eq(boards.id, boardId));

    // Fetch listIds for response
    const listRows = await db
      .select({ id: lists.id })
      .from(lists)
      .leftJoin(listArchive, eq(lists.id, listArchive.listId))
      .where(and(eq(lists.boardId, boardId), isNull(listArchive.listId)))
      .orderBy(asc(lists.position));

    return {
      id: boardId,
      name: newName,
      listIds: listRows.map(l => l.id),
      isShared: newName.endsWith("$"),
      isOwner: role === "owner",
    };
  });

  // DELETE /boards/:id
  app.delete<{ Params: { id: string } }>("/boards/:id", { preHandler: [authenticate] }, async (request, reply) => {
    const user = (request as any).user as AuthUser;
    const boardId = request.params.id;

    const role = await checkBoardAccess(boardId, user.id);
    if (!role) return reply.code(404).send();
    if (role !== "owner") return reply.code(403).send({ detail: "Only the board owner can delete the board" });

    await db.delete(boards).where(eq(boards.id, boardId));
    reply.code(204).send();
  });

  // GET /boards/:id/archived-cards
  app.get<{ Params: { id: string } }>("/boards/:id/archived-cards", { preHandler: [authenticate] }, async (request, reply) => {
    const user = (request as any).user as AuthUser;
    const boardId = request.params.id;

    const role = await checkBoardAccess(boardId, user.id);
    if (!role) return reply.code(404).send();

    const rows = await db
      .select({
        id: cards.id,
        title: cards.title,
        description: cards.description,
        dueDate: cards.dueDate,
        originalListId: cardArchive.listId,
        archivedBy: cardArchive.archivedBy,
        archivedByEmail: users.email,
        archivedAt: cardArchive.archivedAt,
      })
      .from(cards)
      .innerJoin(cardArchive, eq(cards.id, cardArchive.cardId))
      .innerJoin(lists, eq(lists.id, cardArchive.listId))
      .leftJoin(users, eq(cardArchive.archivedBy, users.id))
      .where(eq(lists.boardId, boardId))
      .orderBy(sqlDrizzle`${cardArchive.archivedAt} DESC`);

    return rows.map(r => ({
      id: r.id,
      title: r.title,
      description: r.description,
      dueDate: r.dueDate,
      originalListId: r.originalListId,
      archivedBy: r.archivedBy,
      archivedByEmail: r.archivedByEmail,
      archivedAt: r.archivedAt,
    }));
  });
}
