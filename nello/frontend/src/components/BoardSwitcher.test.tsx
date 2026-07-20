import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BoardSwitcher } from './BoardSwitcher';

const mockLoadBoards = vi.fn().mockResolvedValue(undefined);
const mockDispatch = vi.fn();
const mockApiDispatch = vi.fn().mockResolvedValue(undefined);

const mockState = {
  boards: {} as Record<string, { id: string; name: string; listIds: string[]; isShared?: boolean; isOwner?: boolean }>,
  lists: {},
  cards: {},
  activeBoardId: 'b-1' as string | null,
};

vi.mock('../state/StoreContext', () => ({
  useStore: () => ({
    state: mockState,
    dispatch: mockDispatch,
    apiDispatch: mockApiDispatch,
    loadBoards: mockLoadBoards,
    toast: null,
    clearToast: vi.fn(),
  }),
}));

beforeEach(() => {
  mockLoadBoards.mockClear();
  mockDispatch.mockClear();
  mockState.activeBoardId = 'b-1';
  mockState.boards = {
    'b-1': { id: 'b-1', name: 'Board One', listIds: [], isOwner: true, isShared: false },
    'b-2': { id: 'b-2', name: 'Board Two', listIds: [], isOwner: true, isShared: false },
  };
});

describe('BoardSwitcher reload on switch', () => {
  it('calls loadBoards when switching to a different board', () => {
    render(<BoardSwitcher />);

    const boardTwoBtn = screen.getByText('Board Two');
    fireEvent.click(boardTwoBtn);

    expect(mockLoadBoards).toHaveBeenCalledWith('b-2');
  });

  it('does NOT call loadBoards when clicking the already-active board', () => {
    render(<BoardSwitcher />);

    const boardOneBtn = screen.getByText('Board One');
    fireEvent.click(boardOneBtn);

    expect(mockLoadBoards).not.toHaveBeenCalled();
  });
});
