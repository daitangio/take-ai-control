import { randomBytes } from "node:crypto";

// Env config, read once at module load (same pattern as utils/jwt.ts)
export const EVENTS_ENABLED = process.env.NELLO_EVENTS_ENABLED == "true";
export const EVENTS_INTERVAL_SECONDS = Number(process.env.NELLO_EVENTS_INTERVAL_SECONDS || 3);

const TICKET_TTL_MS = 120_000;
const TICKET_SWEEP_INTERVAL_MS = 60_000;
const HEARTBEAT_INTERVAL_MS = 15_000;

/** Minimal socket surface: a fastify `reply.raw` (ServerResponse) satisfies it. */
export type EventSocket = {
  on(event: "close", listener: () => void): unknown;
  write(data: string): unknown;
  end(): unknown;
  destroyed?: boolean;
};

type TicketEntry = { userId: string; boardId: string; expiresAt: number };

// boardId -> userId -> sockets (per-user so streams can be closed on access revocation)
const subscribers = new Map<string, Map<string, Set<EventSocket>>>();
// boardId -> latest pending event (coalesced to at most one per flush interval)
const dirtyBoards = new Map<string, { actorId: string; ts: string }>();
const tickets = new Map<string, TicketEntry>();

let flushTimer: ReturnType<typeof setInterval> | undefined;
let heartbeatTimer: ReturnType<typeof setInterval> | undefined;
let ticketSweepTimer: ReturnType<typeof setInterval> | undefined;

export function subscribe(boardId: string, userId: string, socket: EventSocket): void {
  if (!EVENTS_ENABLED) return;
  let byUser = subscribers.get(boardId);
  if (!byUser) {
    byUser = new Map();
    subscribers.set(boardId, byUser);
  }
  let sockets = byUser.get(userId);
  if (!sockets) {
    sockets = new Set();
    byUser.set(userId, sockets);
  }
  sockets.add(socket);
  socket.on("close", () => unsubscribe(boardId, userId, socket));
}

export function unsubscribe(boardId: string, userId: string, socket: EventSocket): void {
  const byUser = subscribers.get(boardId);
  const sockets = byUser?.get(userId);
  if (!sockets || !sockets.delete(socket)) return;
  if (sockets.size === 0) byUser!.delete(userId);
  if (byUser!.size === 0) subscribers.delete(boardId);
}

/** Mark a board dirty; the flush ticker delivers one event per dirty board. */
export function emitBoardChange(boardId: string, actorId: string): void {
  if (!EVENTS_ENABLED) return;
  dirtyBoards.set(boardId, { actorId, ts: new Date().toISOString() });
}

/** Close all streams of a board, or only one user's streams when userId is given. */
export function closeBoardStreams(boardId: string, userId?: string): void {
  const byUser = subscribers.get(boardId);
  if (!byUser) return;
  const targets = userId ? [byUser.get(userId)] : [...byUser.values()];
  for (const sockets of targets) {
    if (!sockets) continue;
    for (const socket of sockets) safeEnd(socket);
  }
  if (userId) {
    byUser.delete(userId);
    if (byUser.size === 0) subscribers.delete(boardId);
  } else {
    subscribers.delete(boardId);
  }
}

/** Close every open stream (shutdown). */
export function closeAllEventStreams(): void {
  for (const byUser of subscribers.values()) {
    for (const sockets of byUser.values()) {
      for (const socket of sockets) safeEnd(socket);
    }
  }
  subscribers.clear();
}

/** Write one event per dirty board to its subscribers, then clear. */
export function flushBoardEvents(): void {
  for (const [boardId, event] of dirtyBoards) {
    dirtyBoards.delete(boardId);
    const byUser = subscribers.get(boardId);
    if (!byUser || byUser.size === 0) continue;
    const frame = `data: ${JSON.stringify({ boardId, actorId: event.actorId, ts: event.ts })}\n\n`;
    for (const sockets of byUser.values()) {
      for (const socket of sockets) safeWrite(boardId, event.actorId, socket, frame);
    }
  }
}

function heartbeat(): void {
  for (const [boardId, byUser] of subscribers) {
    for (const [userId, sockets] of byUser) {
      for (const socket of sockets) safeWrite(boardId, userId, socket, ": ping\n\n");
    }
  }
}

function safeWrite(boardId: string, userId: string, socket: EventSocket, frame: string): void {
  if (socket.destroyed) {
    unsubscribe(boardId, userId, socket);
    return;
  }
  try {
    socket.write(frame);
  } catch {
    safeEnd(socket);
    unsubscribe(boardId, userId, socket);
  }
}

function safeEnd(socket: EventSocket): void {
  try {
    socket.end();
  } catch {
    // already gone
  }
}

/**
 * Start the flush + heartbeat + ticket-sweep timers (single process; app.ts
 * stops them in the onClose hook, following the auditCleanupTimer pattern).
 */
export function startEventTimers(): void {
  if (!EVENTS_ENABLED || flushTimer) return;
  flushTimer = setInterval(flushBoardEvents, EVENTS_INTERVAL_SECONDS * 1000);
  flushTimer.unref?.();
  heartbeatTimer = setInterval(heartbeat, HEARTBEAT_INTERVAL_MS);
  heartbeatTimer.unref?.();
  ticketSweepTimer = setInterval(purgeExpiredEventTickets, TICKET_SWEEP_INTERVAL_MS);
  ticketSweepTimer.unref?.();
}

export function stopEventTimers(): void {
  if (flushTimer) clearInterval(flushTimer);
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  if (ticketSweepTimer) clearInterval(ticketSweepTimer);
  flushTimer = heartbeatTimer = ticketSweepTimer = undefined;
}

/** Issue an opaque ticket valid only for the given board (120 s TTL). */
export function issueEventTicket(userId: string, boardId: string): string {
  purgeExpiredEventTickets();
  const ticket = randomBytes(32).toString("hex");
  tickets.set(ticket, { userId, boardId, expiresAt: Date.now() + TICKET_TTL_MS });
  return ticket;
}

/** Consume-on-connect: returns the user for a valid ticket matching the board. */
export function consumeEventTicket(ticket: string | undefined, boardId: string): { userId: string } | null {
  if (!ticket) return null;
  const entry = tickets.get(ticket);
  if (!entry) return null;
  tickets.delete(ticket);
  if (entry.expiresAt < Date.now() || entry.boardId !== boardId) return null;
  return { userId: entry.userId };
}

export function purgeExpiredEventTickets(): void {
  const now = Date.now();
  for (const [ticket, entry] of tickets) {
    if (entry.expiresAt < now) tickets.delete(ticket);
  }
}
