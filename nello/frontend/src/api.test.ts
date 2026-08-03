import { afterEach, describe, expect, it, vi } from 'vitest';
import { archiveCard, archiveList, addCardMember, getBoards, getToken, register, removeCardMember, setToken, setUnauthorizedHandler, updateCard } from './api';

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
      body: JSON.stringify({ listId: 'list-1' }),
    });
  });
});

describe('card API', () => {
  it('archives a card through the dedicated endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);
    setToken('test-token');

    await archiveCard('card-1');

    expect(fetchMock).toHaveBeenCalledWith('/api/cards/card-1/archive', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token',
      },
      body: JSON.stringify({ cardId: 'card-1' }),
    });
  });

  it('sends dueDate only when provided during card update', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      id: 'card-1',
      listId: 'list-1',
      title: 'Task',
      description: '',
      dueDate: '2026-08-15',
      members: [],
      modifiedBy: 'u-1',
      modifiedByEmail: null,
      isModifiedByCurrentUser: true,
    }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    setToken('test-token');

    await updateCard('card-1', 'Task', '', '2026-08-15');

    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      title: 'Task',
      description: '',
      dueDate: '2026-08-15',
    });
  });

  it('adds and removes card members through card endpoints', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 'u-2', email: 'other@example.com' }), { status: 201 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);
    setToken('test-token');

    await addCardMember('card-1', 'u-2');
    await removeCardMember('card-1', 'u-2');

    expect(fetchMock.mock.calls[0][0]).toBe('/api/cards/card-1/members');
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ userId: 'u-2' });
    expect(fetchMock.mock.calls[1][0]).toBe('/api/cards/card-1/members/u-2');
    expect(fetchMock.mock.calls[1][1].method).toBe('DELETE');
  });
});

describe('register API', () => {
  it('sends email, keyPass, and password in the request body', async () => {
    const tokenResponse = { access_token: 'new-token', token_type: 'bearer' };
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(tokenResponse), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await register('new@acme.com', 'INVITE-2026', 'securepassword123');

    expect(fetchMock).toHaveBeenCalledWith('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'new@acme.com', keyPass: 'INVITE-2026', password: 'securepassword123' }),
    });
  });

  it('returns the token response on success', async () => {
    const tokenResponse = { access_token: 'new-token', token_type: 'bearer' };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(tokenResponse), { status: 200 })));

    const result = await register('test@example.com', 'KEY', 'password123456');
    expect(result).toEqual(tokenResponse);
  });
});
