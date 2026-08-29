import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BoardSwitcher } from './BoardSwitcher';

const mockSelectBoard = vi.fn().mockResolvedValue(undefined);
const mockDispatch = vi.fn();
const mockApiDispatch = vi.fn().mockResolvedValue(undefined);

const mockState = {
  boards: {} as Record<string, { id: string; name: string; background: 'mountain' | 'sea' | 'sport' | null; listIds: string[]; isShared?: boolean; isOwner?: boolean }>,
  lists: {},
  cards: {},
  activeBoardId: 'b-1' as string | null,
};

vi.mock('../state/StoreContext', () => ({
  useStore: () => ({
    state: mockState,
    dispatch: mockDispatch,
    apiDispatch: mockApiDispatch,
    selectBoard: mockSelectBoard,
    toast: null,
    clearToast: vi.fn(),
  }),
}));

beforeEach(() => {
  mockSelectBoard.mockClear();
  mockDispatch.mockClear();
  mockState.activeBoardId = 'b-1';
  mockState.boards = {
    'b-1': { id: 'b-1', name: 'Board One', background: null, listIds: [], isOwner: true, isShared: false },
    'b-2': { id: 'b-2', name: 'Board Two', background: null, listIds: [], isOwner: true, isShared: false },
  };
});

describe('BoardSwitcher select on switch', () => {
  it('calls selectBoard when switching to a different board', () => {
    render(<BoardSwitcher />);

    const boardTwoBtn = screen.getByText('Board Two');
    fireEvent.click(boardTwoBtn);

    expect(mockSelectBoard).toHaveBeenCalledWith('b-2');
  });

  it('does NOT call selectBoard when clicking the already-active board', () => {
    render(<BoardSwitcher />);

    const boardOneBtn = screen.getByText('Board One');
    fireEvent.click(boardOneBtn);

    expect(mockSelectBoard).not.toHaveBeenCalled();
  });

});
