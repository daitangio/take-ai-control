import { afterEach, describe, expect, it, vi } from 'vitest';
import { archiveList, getBoards, getToken, setToken, setUnauthorizedHandler } from './api';

afterEach(() => {
  vi.unstubAllGlobals();
  setToken(null);
  setUnauthorizedHandler(null);
});

describe('API authentication', () => {
  it('invalidates the active session on HTTP 401', async () => {
    const onUnauthorized = vi.fn();
    setToken('expired-token');
    setUnauthorizedHandler(onUnauthorized);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response('expired', { status: 401 }),
    ));

    await expect(getBoards()).rejects.toThrow('failed (401)');

    expect(getToken()).toBeNull();
    expect(onUnauthorized).toHaveBeenCalledOnce();
  });
});

describe('list API', () => {
  it('archives a list through the dedicated endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);
    setToken('test-token');

    await archiveList('list-1');

    expect(fetchMock).toHaveBeenCalledWith('/api/lists/list-1/archive', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token',
      },
    });
  });
});
