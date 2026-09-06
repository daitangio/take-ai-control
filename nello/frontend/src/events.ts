/**
 * SSE subscription client for board change pings.
 *
 * Fetches a fresh ticket per (re)connection, reconnects with capped
 * exponential backoff, stops for good when the ticket endpoint answers
 * 401/404 (access revoked or backend events disabled), and never surfaces
 * errors to the UI. Returns an unsubscribe that closes the stream.
 */
import * as api from './api';

const RETRY_BASE_MS = 1000;
const RETRY_MAX_MS = 8000;

export type BoardEvent = { boardId: string; actorId: string; ts: string };

function eventsEnabled(): boolean {
  return import.meta.env.VITE_EVENTS_ENABLED !== 'false';
}

export function subscribeBoardEvents(boardId: string, onEvent: (event: BoardEvent) => void): () => void {
  if (!eventsEnabled()) return () => {};

  let stream: EventSource | null = null;
  let stopped = false;
  let retryDelay = RETRY_BASE_MS;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const scheduleReopen = () => {
    if (stopped) return;
    timer = setTimeout(() => {
      retryDelay = Math.min(retryDelay * 2, RETRY_MAX_MS);
      void open();
    }, retryDelay);
  };

  const open = async () => {
    let ticket: string;
    try {
      ({ ticket } = await api.requestEventTicket(boardId));
    } catch (err) {
      // 401/404: access revoked or backend events disabled — stop for good.
      // Other failures (network) retry with backoff.
      if (err instanceof api.ApiError && (err.status === 401 || err.status === 404)) return;
      scheduleReopen();
      return;
    }
    if (stopped) return;

    stream = new EventSource(`/api/boards/${boardId}/events?ticket=${ticket}`);
    retryDelay = RETRY_BASE_MS;
    stream.onmessage = (msg) => {
      try {
        const event = JSON.parse(msg.data) as BoardEvent;
        if (event.boardId === boardId) onEvent(event);
      } catch {
        // malformed frame: ignore
      }
    };
    stream.onerror = () => {
      stream?.close();
      stream = null;
      scheduleReopen();
    };
  };

  void open();

  return () => {
    stopped = true;
    if (timer) clearTimeout(timer);
    stream?.close();
    stream = null;
  };
}
