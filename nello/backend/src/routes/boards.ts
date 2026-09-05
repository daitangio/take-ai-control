import type { FastifyInstance } from "fastify";
import { db } from "../db/index.js";
import { boards, lists, cards,  cardArchive, cardMembers, users, boardMembers, userTiers } from "../db/schema.js";
import { eq, and, isNull, asc, inArray, sql as sqlDrizzle } from "drizzle-orm";
import { authenticate, checkBoardAccess } from "../middleware/auth.js";
import { sendError } from "../utils/apiError.js";
import { ErrorCode } from "../types/errors.js";
import { boardCapacity, boardCapacities, cardCapacity, withCapacityLock } from "../utils/capacity.js";

interface BoardCreateBody {
  id: string;
  name: string;
}

const boardBackgrounds = ["mountain", "sea", "sport"] as const;
type BoardBackground = (typeof boardBackgrounds)[number] | null;

interface BoardUpdateBody {
  name?: string;
  background?: BoardBackground;
}

export default async function boardRoutes(app: FastifyInstance) {
  // GET /boards
  app.get("/boards", { preHandler: [authenticate] }, async (request, reply) => {
    const user = request.user;

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

    const allBoards = [
      ...ownBoards.map(b => ({ board: b, isOwner: true })),
      ...sharedRows.map(r => ({ board: r.board, isOwner: false })),
    ];
    if (allBoards.length === 0) return [];

    const boardIds = allBoards.map(({ board }) => board.id);
    const ownerIds = [...new Set(allBoards.map(({ board }) => board.userId))];

    // Batch the per-board lookups so the per-click refresh stays cheap
    const [listRows, listCountRows, tierRows, boardCountRows] = await Promise.all([
      db.select({ boardId: lists.boardId, id: lists.id })
        .from(lists)
        .where(inArray(lists.boardId, boardIds))
        .orderBy(asc(lists.position)),
      db.select({ boardId: lists.boardId, count: sqlDrizzle<number>`COUNT(*)` })
        .from(lists)
        .where(inArray(lists.boardId, boardIds))
        .groupBy(lists.boardId),
      db.select({ userId: users.id, boardsLimit: userTiers.boardsLimit, listsPerBoardLimit: userTiers.listsPerBoardLimit })
        .from(users)
        .innerJoin(userTiers, eq(users.tierId, userTiers.id))
        .where(inArray(users.id, ownerIds)),
      db.select({ userId: boards.userId, count: sqlDrizzle<number>`COUNT(*)` })
        .from(boards)
        .where(inArray(boards.userId, ownerIds))
        .groupBy(boards.userId),
    ]);

    const listIdsByBoard = new Map<string, string[]>();
    for (const row of listRows) {
      const ids = listIdsByBoard.get(row.boardId);
      if (ids) ids.push(row.id);
      else listIdsByBoard.set(row.boardId, [row.id]);
    }
    const listCountByBoard = new Map(listCountRows.map(r => [r.boardId, Number(r.count)]));
    const tierByOwner = new Map(tierRows.map(r => [r.userId, r]));
    const boardCountByOwner = new Map(boardCountRows.map(r => [r.userId, Number(r.count)]));

    return allBoards.map(({ board, isOwner }) => {
      const tier = tierByOwner.get(board.userId);
      const capacity = tier && tier.boardsLimit != null && tier.listsPerBoardLimit != null
        ? {
            boards: { used: boardCountByOwner.get(board.userId) ?? 0, limit: Number(tier.boardsLimit) },
            lists: { used: listCountByBoard.get(board.id) ?? 0, limit: Number(tier.listsPerBoardLimit) },
          }
        : null;
      return {
        id: board.id,
        name: board.name,
        background: board.background,
        listIds: listIdsByBoard.get(board.id) ?? [],
        isShared: board.name.endsWith("$"),
        isOwner,
        capacity,
      };
    });
  });

  // POST /boards
  app.post<{ Body: BoardCreateBody }>("/boards", { preHandler: [authenticate] }, async (request, reply) => {
    const user = request.user;
    const { id, name } = request.body;

    if (!name || !name.trim()) {
      return sendError(reply, 422, ErrorCode.boardNameRequired, "Board name is required");
    }

    const trimmedName = name.trim();
    const outcome = await withCapacityLock(async () => {
      const capacity = await boardCapacity(db, user.id);
      if (capacity.used >= capacity.limit) return { limited: true as const };

      app.log.info("Board Capacity already used: "+capacity.used+"/"+capacity.limit);
      await db.insert(boards).values({ id, userId: user.id, name: trimmedName });
      return { limited: false as const, capacity: await boardCapacity(db, user.id) };
    });
    if (outcome.limited) return sendError(reply, 409, ErrorCode.boardLimitReached, "Board limit reached");

    reply.code(201).send({
      id,
      name: trimmedName,
      background: null,
      listIds: [] as string[],
      isShared: trimmedName.endsWith("$"),
      isOwner: true,
      capacity: { boards: outcome.capacity, lists: { used: 0, limit: (await boardCapacities(db, id))?.lists.limit ?? 0 } },
    });
  });

  // GET /boards/:id
  app.get<{ Params: { id: string } }>("/boards/:id", { preHandler: [authenticate] }, async (request, reply) => {
    const user = request.user;
    const boardId = request.params.id;

    const role = await checkBoardAccess(boardId, user.id);
    if (!role) return sendError(reply, 404, ErrorCode.boardNotFound, "Board not found");

    const [board] = await db.select().from(boards).where(eq(boards.id, boardId)).limit(1);

    const listRows = await db
      .select({ id: lists.id, name: lists.name })
      .from(lists)      
      .where(eq(lists.boardId, boardId))
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
        if (cr.card.modifiedBy) {
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
        cardCapacity: await cardCapacity(db, lr.id),
      });
    }

    // GG: This API will be used also for the json export, so some extra bits are needed
    // to identify it server side: added just apiVersion for the meantime
    return { 
      apiVersion: "Nello202609",
      id: board.id, name: board.name, background: board.background, lists: listResults, capacity: await boardCapacities(db, boardId) };
  });

  // PATCH /boards/:id
  app.patch<{ Params: { id: string }; Body: BoardUpdateBody }>("/boards/:id", { preHandler: [authenticate] }, async (request, reply) => {
    const user = request.user;
    const boardId = request.params.id;

    const role = await checkBoardAccess(boardId, user.id);
    if (!role) return sendError(reply, 404, ErrorCode.boardNotFound, "Board not found");

    const [current] = await db.select({ name: boards.name, background: boards.background }).from(boards).where(eq(boards.id, boardId)).limit(1);
    const body = request.body ?? {};
    const hasName = body.name !== undefined;
    const hasBackground = Object.hasOwn(body, "background");

    if (!hasName && !hasBackground) {
      return sendError(reply, 422, ErrorCode.boardNameRequired, "Board name or background is required");
    }
    if (hasName && (!body.name || !body.name.trim())) {
      return sendError(reply, 422, ErrorCode.boardNameRequired, "Board name is required");
    }
    if (hasBackground && body.background !== null && !boardBackgrounds.includes(body.background as Exclude<BoardBackground, null>)) {
      return sendError(reply, 422, ErrorCode.boardBackgroundInvalid, "Board background is invalid");
    }

    const newName = hasName ? body.name!.trim() : current.name;
    const newBackground = hasBackground ? body.background! : current.background;
    if (current.name.endsWith("$") && !newName.endsWith("$")) {
      return sendError(reply, 409, ErrorCode.boardSharedSuffixRequired, "Shared boards must keep the '$' suffix");
    }

    await db.update(boards).set({ name: newName, background: newBackground }).where(eq(boards.id, boardId));

    // Fetch listIds for response
    const listRows = await db
      .select({ id: lists.id })
      .from(lists)     
      .where(eq(lists.boardId, boardId))
      .orderBy(asc(lists.position));

    return {
      id: boardId,
      name: newName,
      background: newBackground,
      listIds: listRows.map(l => l.id),
      isShared: newName.endsWith("$"),
      isOwner: role === "owner",
      capacity: await boardCapacities(db, boardId),
    };
  });

  // DELETE /boards/:id
  app.delete<{ Params: { id: string } }>("/boards/:id", { preHandler: [authenticate] }, async (request, reply) => {
    const user = request.user;
    const boardId = request.params.id;

    const role = await checkBoardAccess(boardId, user.id);
    if (!role) return sendError(reply, 404, ErrorCode.boardNotFound, "Board not found");
    if (role !== "owner") return sendError(reply, 403, ErrorCode.boardDeleteForbidden, "Only the board owner can delete the board");

    await db.delete(boards).where(eq(boards.id, boardId));
    reply.code(204).send();
  });

  // GET /boards/:id/archived-cards
  app.get<{ Params: { id: string } }>("/boards/:id/archived-cards", { preHandler: [authenticate] }, async (request, reply) => {
    const user = request.user;
    const boardId = request.params.id;

    const role = await checkBoardAccess(boardId, user.id);
    if (!role) return sendError(reply, 404, ErrorCode.boardNotFound, "Board not found");

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
