import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
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

describe('BoardSwitcher collapsed mode', () => {
  const makeBoard = (id: string, name: string) => ({
    id, name, background: null, listIds: [], isOwner: true, isShared: false,
  });
  const fourBoards = {
    'b-1': makeBoard('b-1', 'Board One'),
    'b-2': makeBoard('b-2', 'Board Two'),
    'b-3': makeBoard('b-3', 'Board Three'),
    'b-4': makeBoard('b-4', 'Board Four'),
  };

  beforeEach(() => {
    mockState.activeBoardId = 'b-1';
    mockState.boards = { ...fourBoards };
  });

  it('renders a combo box with all boards when there are more than 3', () => {
    render(<BoardSwitcher />);

    const select = screen.getByRole('combobox');
    expect(within(select).getAllByRole('option')).toHaveLength(4);
    expect((select as HTMLSelectElement).value).toBe('b-1');
  });

  it('keeps tabs when there are 3 or fewer boards', () => {
    mockState.boards = { 'b-1': fourBoards['b-1'], 'b-2': fourBoards['b-2'], 'b-3': fourBoards['b-3'] };
    render(<BoardSwitcher />);

    expect(screen.queryByRole('combobox')).toBeNull();
    expect(screen.getByText('Board Three')).toBeTruthy();
  });

  it('switches to the combo box when the 4th board is added', () => {
    mockState.boards = { 'b-1': fourBoards['b-1'], 'b-2': fourBoards['b-2'], 'b-3': fourBoards['b-3'] };
    const { rerender } = render(<BoardSwitcher />);
    expect(screen.queryByRole('combobox')).toBeNull();

    mockState.boards = { ...fourBoards };
    rerender(<BoardSwitcher />);
    expect(screen.getByRole('combobox')).toBeTruthy();
  });

  it('calls selectBoard when changing the select', () => {
    render(<BoardSwitcher />);

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'b-3' } });

    expect(mockSelectBoard).toHaveBeenCalledWith('b-3');
  });

  it('does NOT call selectBoard when re-selecting the active board', () => {
    render(<BoardSwitcher />);

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'b-1' } });

    expect(mockSelectBoard).not.toHaveBeenCalled();
  });

  it('shows delete and rename actions for the active board next to the combo box', () => {
    render(<BoardSwitcher />);

    expect(screen.getByTitle('Delete board')).toBeTruthy();
    expect(screen.getByTitle('Rename board')).toBeTruthy();
  });

  it('shows the members action for a shared owned active board', () => {
    mockState.boards['b-1'] = { ...fourBoards['b-1'], isShared: true };
    render(<BoardSwitcher />);

    expect(screen.getByTitle('Manage members')).toBeTruthy();
  });

  it('replaces the combo box with the rename input while editing', () => {
    render(<BoardSwitcher />);

    fireEvent.click(screen.getByTitle('Rename board'));
    expect(screen.queryByRole('combobox')).toBeNull();

    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.getByRole('combobox')).toBeTruthy();
  });
});
