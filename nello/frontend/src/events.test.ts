import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as api from './api';
import { subscribeBoardEvents } from './events';

class MockEventSource {
  static instances: MockEventSource[] = [];
  url: string;
  closed = false;
  onmessage: ((ev: MessageEvent) => void) | null = null;
  onerror: ((ev: Event) => void) | null = null;

  constructor(url: string) {
    this.url = url;
    MockEventSource.instances.push(this);
  }

  close() {
    this.closed = true;
  }
}

function frame(data: unknown): MessageEvent {
  return { data: JSON.stringify(data) } as MessageEvent;
}

describe('subscribeBoardEvents', () => {
  beforeEach(() => {
    MockEventSource.instances = [];
    vi.stubGlobal('EventSource', MockEventSource);
    vi.spyOn(api, 'requestEventTicket').mockResolvedValue({ ticket: 'ticket-1' });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  it('fetches a ticket, opens the stream and delivers matching events', async () => {
    const onEvent = vi.fn();
    subscribeBoardEvents('b1', onEvent);
    await vi.waitFor(() => expect(MockEventSource.instances).toHaveLength(1));

    expect(api.requestEventTicket).toHaveBeenCalledWith('b1');
    expect(MockEventSource.instances[0].url).toBe('/api/boards/b1/events?ticket=ticket-1');

    MockEventSource.instances[0].onmessage!(frame({ boardId: 'b1', actorId: 'u', ts: 't' }));
    expect(onEvent).toHaveBeenCalledWith({ boardId: 'b1', actorId: 'u', ts: 't' });

    MockEventSource.instances[0].onmessage!(frame({ boardId: 'other', actorId: 'u', ts: 't' }));
    expect(onEvent).toHaveBeenCalledTimes(1);
  });

  it('reconnects with a fresh ticket after an error, with capped backoff', async () => {
    vi.useFakeTimers();
    subscribeBoardEvents('b1', vi.fn());
    await vi.advanceTimersByTimeAsync(0); // settle the initial ticket fetch
    expect(MockEventSource.instances).toHaveLength(1);

    MockEventSource.instances[0].onerror!(new Event('error'));
    expect(MockEventSource.instances[0].closed).toBe(true);

    await vi.advanceTimersByTimeAsync(1000); // first retry after 1 s
    expect(api.requestEventTicket).toHaveBeenCalledTimes(2);
    expect(MockEventSource.instances).toHaveLength(2);

    MockEventSource.instances[1].onerror!(new Event('error'));
    await vi.advanceTimersByTimeAsync(2000); // backoff doubles
    expect(MockEventSource.instances).toHaveLength(3);

    MockEventSource.instances[2].onerror!(new Event('error'));
    await vi.advanceTimersByTimeAsync(4000);
    expect(MockEventSource.instances).toHaveLength(4);

    MockEventSource.instances[3].onerror!(new Event('error'));
    await vi.advanceTimersByTimeAsync(8000); // capped at 8 s
    expect(MockEventSource.instances).toHaveLength(5);

    MockEventSource.instances[4].onerror!(new Event('error'));
    await vi.advanceTimersByTimeAsync(8000); // stays capped
    expect(MockEventSource.instances).toHaveLength(6);
  });

  it('retries on network errors and recovers', async () => {
    vi.useFakeTimers();
    vi.mocked(api.requestEventTicket).mockRejectedValue(new TypeError('network down'));
    subscribeBoardEvents('b1', vi.fn());
    await vi.advanceTimersByTimeAsync(0);
    expect(api.requestEventTicket).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1000);
    expect(api.requestEventTicket).toHaveBeenCalledTimes(2);

    vi.mocked(api.requestEventTicket).mockResolvedValue({ ticket: 'ticket-2' });
    await vi.advanceTimersByTimeAsync(2000);
    expect(api.requestEventTicket).toHaveBeenCalledTimes(3);
    expect(MockEventSource.instances).toHaveLength(1);
    expect(MockEventSource.instances[0].url).toContain('ticket=ticket-2');
  });

  it.each([401, 404])('stops for good when the ticket endpoint answers %s', async (status) => {
    vi.useFakeTimers();
    vi.mocked(api.requestEventTicket).mockRejectedValue(new api.ApiError('nope', status));
    subscribeBoardEvents('b1', vi.fn());
    await vi.advanceTimersByTimeAsync(30_000);
    expect(api.requestEventTicket).toHaveBeenCalledTimes(1);
    expect(MockEventSource.instances).toHaveLength(0);
  });

  it('unsubscribe closes the stream and stops reconnects', async () => {
    vi.useFakeTimers();
    const unsubscribe = subscribeBoardEvents('b1', vi.fn());
    await vi.advanceTimersByTimeAsync(0);
    expect(MockEventSource.instances).toHaveLength(1);

    unsubscribe();
    expect(MockEventSource.instances[0].closed).toBe(true);

    MockEventSource.instances[0].onerror!(new Event('error')); // late error must not reopen
    await vi.advanceTimersByTimeAsync(10_000);
    expect(api.requestEventTicket).toHaveBeenCalledTimes(1);
    expect(MockEventSource.instances).toHaveLength(1);
  });

  it('no-ops when VITE_EVENTS_ENABLED is off', () => {
    vi.stubEnv('VITE_EVENTS_ENABLED', 'false');
    const unsubscribe = subscribeBoardEvents('b1', vi.fn());
    unsubscribe();
    expect(api.requestEventTicket).not.toHaveBeenCalled();
    expect(MockEventSource.instances).toHaveLength(0);
  });
});
