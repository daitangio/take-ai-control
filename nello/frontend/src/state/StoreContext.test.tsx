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
