import { afterEach, describe, expect, it, vi } from 'vitest';
import { archiveCard, archiveList, addCardMember, getBoards, getToken, removeCardMember, setToken, setUnauthorizedHandler, updateCard } from './api';

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
