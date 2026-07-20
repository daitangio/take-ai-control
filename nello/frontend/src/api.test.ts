import { afterEach, describe, expect, it, vi } from 'vitest';
import { getBoards, getToken, setToken, setUnauthorizedHandler } from './api';

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
