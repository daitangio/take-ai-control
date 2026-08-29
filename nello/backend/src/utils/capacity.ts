import { and, eq, isNull, sql } from "drizzle-orm";
import { boards, cards, cardArchive, lists, users, userTiers } from "../db/schema.js";

export type Capacity = { used: number; limit: number };

let mutationQueue = Promise.resolve();

/** Serialize count-and-mutate work on this single-process SQLite backend. */
export async function withCapacityLock<T>(operation: () => Promise<T>): Promise<T> {
  let release!: () => void;
  const previous = mutationQueue;
  mutationQueue = new Promise<void>((resolve) => { release = resolve; });
  await previous;
  try {
    return await operation();
  } finally {
    release();
  }
}

type OwnerTier = {
  userId: string;
  boardsLimit: number;
  listsPerBoardLimit: number;
  cardsPerListLimit: number;
};

async function count(db: any, query: any): Promise<number> {
  const [row] = await query;
  return Number(row?.count ?? 0);
}

async function ownerTier(db: any, boardId: string): Promise<OwnerTier | null> {
  const [row] = await db
    .select({
      userId: boards.userId,
      boardsLimit: userTiers.boardsLimit,
      listsPerBoardLimit: userTiers.listsPerBoardLimit,
      cardsPerListLimit: userTiers.cardsPerListLimit,
    })
    .from(boards)
    .innerJoin(users, eq(boards.userId, users.id))
    .innerJoin(userTiers, eq(users.tierId, userTiers.id))
    .where(eq(boards.id, boardId))
    .limit(1);
  if (!row || row.boardsLimit == null || row.listsPerBoardLimit == null || row.cardsPerListLimit == null) return null;
  return { ...row, boardsLimit: Number(row.boardsLimit), listsPerBoardLimit: Number(row.listsPerBoardLimit), cardsPerListLimit: Number(row.cardsPerListLimit) };
}

export async function boardCapacity(db: any, userId: string): Promise<Capacity> {
  const [tier] = await db.select({ limit: userTiers.boardsLimit }).from(users).innerJoin(userTiers, eq(users.tierId, userTiers.id)).where(eq(users.id, userId)).limit(1);
  const used = await count(db, db.select({ count: sql<number>`COUNT(*)` }).from(boards).where(eq(boards.userId, userId)));
  return { used, limit: Number(tier?.limit ?? 0) };
}

export async function listCapacity(db: any, boardId: string): Promise<Capacity> {
  const tier = await ownerTier(db, boardId);
  const used = await count(db, db.select({ count: sql<number>`COUNT(*)` }).from(lists).where(eq(lists.boardId, boardId)));
  return { used, limit: tier?.listsPerBoardLimit ?? 0 };
}

export async function cardCapacity(db: any, listId: string): Promise<Capacity> {
  const [list] = await db.select({ boardId: lists.boardId }).from(lists).where(eq(lists.id, listId)).limit(1);
  const tier = list ? await ownerTier(db, list.boardId) : null;
  const used = await count(db, db.select({ count: sql<number>`COUNT(*)` }).from(cards).leftJoin(cardArchive, eq(cards.id, cardArchive.cardId)).where(and(eq(cards.listId, listId), isNull(cardArchive.cardId))));
  return { used, limit: tier?.cardsPerListLimit ?? 0 };
}

export async function boardCapacities(db: any, boardId: string) {
  const tier = await ownerTier(db, boardId);
  if (!tier) return null;
  return { boards: await boardCapacity(db, tier.userId), lists: await listCapacity(db, boardId) };
}
