import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { StoreProvider, useStore } from './StoreContext';
import * as api from '../api';

function wrapper({ children }: { children: ReactNode }) {
  return <StoreProvider>{children}</StoreProvider>;
}

describe('apiDispatch card/move', () => {
  beforeEach(() => {
    vi.spyOn(api, 'getToken').mockReturnValue('t');
    vi.spyOn(api, 'getBoards').mockResolvedValue([
      { id: 'b0', name: 'Board 0', listIds: [], isShared: false, isOwner: true },
    ]);
    vi.spyOn(api, 'getBoard').mockResolvedValue({
      id: 'b0',
      name: 'Board 0',
      lists: [
        {
          id: 'l1',
          name: 'To Do',
          cards: [
            { id: 'c0', title: 'Card 0', description: '', dueDate: null, color: null, members: [], modifiedBy: null, modifiedByEmail: null, isModifiedByCurrentUser: null },
          ],
        },
        { id: 'l0', name: 'Doing', cards: [] },
      ],
    });
    vi.spyOn(api, 'moveCard').mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reloads only the active board via getBoard, not loadBoards', async () => {
    const { result } = renderHook(() => useStore(), { wrapper });

    // Seed a single board with two lists and one card, and make it active.
    act(() => {
      result.current.dispatch({ type: 'board/create', boardId: 'b0', name: 'Board 0' });
      result.current.dispatch({ type: 'list/create', listId: 'l0', boardId: 'b0', name: 'To Do' });
      result.current.dispatch({ type: 'list/create', listId: 'l1', boardId: 'b0', name: 'Doing' });
      result.current.dispatch({ type: 'card/create', cardId: 'c0', listId: 'l0', title: 'Card 0' });
      result.current.dispatch({ type: 'board/switch', boardId: 'b0' });
    });

    const getBoardsCalls = vi.mocked(api.getBoards).mock.calls.length;

    await act(async () => {
      await result.current.apiDispatch({
        type: 'card/move',
        cardId: 'c0',
        fromListId: 'l0',
        toListId: 'l1',
        index: 0,
      });
    });

    expect(api.moveCard).toHaveBeenCalledWith('c0', 'l1', 0);
    // Single-board reload: getBoard called for the active board...
    expect(api.getBoard).toHaveBeenCalledWith('b0');
    // ...and loadBoards (which calls getBoards) was NOT triggered.
    expect(vi.mocked(api.getBoards).mock.calls.length).toBe(getBoardsCalls);

    // Server-authoritative ordering reconciled onto the active board only.
    await waitFor(() => {
      expect(result.current.state.boards.b0.listIds).toEqual(['l1', 'l0']);
    });
    expect(result.current.state.lists.l1.cardIds).toEqual(['c0']);
    expect(result.current.state.activeBoardId).toBe('b0');
  });
});

describe('apiDispatch board/delete', () => {
  beforeEach(() => {
    vi.spyOn(api, 'getToken').mockReturnValue('t');
    vi.spyOn(api, 'deleteBoard').mockResolvedValue(undefined);
    vi.spyOn(api, 'getBoards').mockResolvedValue([
      { id: 'b1', name: 'Board 1', listIds: [], isShared: false, isOwner: true, capacity: { boards: { used: 2, limit: 3 }, lists: { used: 0, limit: 12 } } },
    ]);
    vi.spyOn(api, 'getBoard').mockResolvedValue({
      id: 'b1', name: 'Board 1', lists: [], capacity: { boards: { used: 2, limit: 3 }, lists: { used: 0, limit: 12 } },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reloads board capacity after deletion to clear a stale warning', async () => {
    const { result } = renderHook(() => useStore(), { wrapper });
    act(() => {
      result.current.dispatch({ type: 'board/create', boardId: 'b0', name: 'Board 0', capacity: { boards: { used: 3, limit: 3 }, lists: { used: 0, limit: 12 } } });
      result.current.dispatch({ type: 'board/create', boardId: 'b1', name: 'Board 1', capacity: { boards: { used: 3, limit: 3 }, lists: { used: 0, limit: 12 } } });
      result.current.dispatch({ type: 'board/switch', boardId: 'b0' });
    });

    await act(async () => {
      await result.current.apiDispatch({ type: 'board/delete', boardId: 'b0' });
    });

    expect(api.deleteBoard).toHaveBeenCalledWith('b0');
    await waitFor(() => {
      expect(result.current.state.boards).toEqual(expect.objectContaining({
        b1: expect.objectContaining({ capacity: expect.objectContaining({ boards: { used: 2, limit: 3 } }) }),
      }));
    });
  });
});

describe('apiDispatch board/background', () => {
  beforeEach(() => {
    vi.spyOn(api, 'getToken').mockReturnValue('t');
    vi.spyOn(api, 'getBoards').mockResolvedValue([
      { id: 'b0', name: 'Board 0', background: 'mountain', listIds: [], isShared: false, isOwner: true },
    ]);
    vi.spyOn(api, 'getBoard').mockResolvedValue({ id: 'b0', name: 'Board 0', background: 'mountain', lists: [] });
    vi.spyOn(api, 'updateBoard').mockRejectedValue(new Error('rejected'));
  });

  afterEach(() => vi.restoreAllMocks());

  it('restores the server background after a failed optimistic selection', async () => {
    const { result } = renderHook(() => useStore(), { wrapper });
    await act(async () => { await result.current.loadBoards(); });

    await act(async () => {
      await result.current.apiDispatch({ type: 'board/background', boardId: 'b0', background: 'sea' });
    });

    expect(api.updateBoard).toHaveBeenCalledWith('b0', { background: 'sea' });
    expect(result.current.state.boards.b0.background).toBe('mountain');
  });
});
