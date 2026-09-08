import type { FastifyInstance } from "fastify";
import { authenticate, checkBoardAccess } from "../middleware/auth.js";
import { sendError } from "../utils/apiError.js";
import { ErrorCode } from "../types/errors.js";
import { subscribe, issueEventTicket, claimEventStream, releaseEventStreamCapacity } from "../events.js";

interface TicketBody {
  boardId: string;
}

export default async function eventRoutes(app: FastifyInstance) {
  // POST /events/ticket — issues a short-lived opaque ticket for one board's stream
  app.post<{ Body: TicketBody }>(
    "/events/ticket",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { boardId } = request.body ?? {};
      if (!boardId) return sendError(reply, 422, ErrorCode.boardNotFound, "boardId is required");
      // Access check here too: the stream cannot surface its status to the
      // browser, so a revoked user learns it from this endpoint and stops
      if (!(await checkBoardAccess(boardId, request.user.id))) {
        return sendError(reply, 404, ErrorCode.boardNotFound, "Board not found");
      }
      return { ticket: issueEventTicket(request.user.id, boardId) };
    },
  );

  // GET /boards/:id/events — one-way SSE stream; ping-only frames, no payloads.
  // Auth via ticket (browsers cannot set Authorization on EventSource), the
  // ticket must match this board, and the user must still have board access.
  app.get<{ Params: { id: string }; Querystring: { ticket?: string } }>(
    "/boards/:id/events",
    { config: { rateLimit: false } },
    async (request, reply) => {
      const boardId = request.params.id;
      const claim = claimEventStream(request.query.ticket, boardId);
      if (claim === "invalid") return sendError(reply, 401, ErrorCode.authTokenInvalid, "Invalid or expired ticket");
      if (claim === "limited") {
        return sendError(reply, 429, ErrorCode.eventStreamLimitReached, "Too many open event streams");
      }
      const identity = claim;
      if (!(await checkBoardAccess(boardId, identity.userId))) {
        releaseEventStreamCapacity(identity.userId);
        return sendError(reply, 404, ErrorCode.boardNotFound, "Board not found");
      }

      try {
        reply.raw.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        });
        reply.raw.write(": connected\n\n");
        subscribe(boardId, identity.userId, reply.raw, true);
      } catch {
        releaseEventStreamCapacity(identity.userId);
        throw new Error("Failed to establish event stream");
      }
      // the reply is intentionally never completed: the stream stays open until
      // the client disconnects or the server closes the socket
    },
  );
}
