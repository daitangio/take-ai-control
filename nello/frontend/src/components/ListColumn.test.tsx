import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ListColumn } from './ListColumn';

const dndMocks = vi.hoisted(() => ({
  onPointerDown: vi.fn(),
}));

const mockApiDispatch = vi.fn().mockResolvedValue(undefined);
const mockState = {
  boards: {} as Record<string, { id: string; name: string; background?: 'mountain' | 'sea' | 'sport' | null; listIds: string[] }>,
  lists: {} as Record<string, { id: string; name: string; cardIds: string[] }>,
  cards: {},
  activeBoardId: 'b-1' as string | null,
};

vi.mock('../state/StoreContext', () => ({
  useStore: () => ({
    state: mockState,
    dispatch: vi.fn(),
    apiDispatch: mockApiDispatch,
    loadBoards: vi.fn(),
    toast: null,
    clearToast: vi.fn(),
  }),
}));

vi.mock('./CardTile', () => ({
  CardTile: ({ cardId, onClick }: { cardId: string; onClick: () => void }) => (
    <button type="button" onClick={onClick}>{cardId}</button>
  ),
}));

vi.mock('@dnd-kit/core', () => ({
  useDroppable: () => ({
    setNodeRef: vi.fn(),
    isOver: false,
  }),
}));

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: ReactNode }) => <>{children}</>,
  verticalListSortingStrategy: vi.fn(),
  useSortable: () => ({
    attributes: {},
    listeners: { onPointerDown: dndMocks.onPointerDown },
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

vi.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: () => undefined } },
}));

beforeEach(() => {
  vi.stubGlobal('confirm', vi.fn(() => true));
  mockApiDispatch.mockClear();
  dndMocks.onPointerDown.mockClear();
  mockState.boards = {
    'b-1': { id: 'b-1', name: 'Board', listIds: ['l-1'] },
  };
  mockState.lists = {
    'l-1': { id: 'l-1', name: 'Todo', cardIds: ['c-1'] },
  };
});

describe('ListColumn action menu', () => {
  it('shows an archive action behind the list actions button', async () => {
    const user = userEvent.setup();
    render(<ListColumn listId="l-1" boardId="b-1" onCardClick={() => {}} onCardMembersClick={() => {}} onCardArchived={() => {}} />);

    expect(screen.queryByTitle('Delete list')).toBeNull();
    expect(screen.queryByRole('button', { name: /delete list/i })).toBeNull();

    await user.click(screen.getByRole('button', { name: 'List actions for Todo' }));

    expect(screen.getByRole('menu', { name: 'Actions for Todo' })).toBeDefined();
    expect(screen.getByRole('menuitem', { name: 'Delete everything' })).toBeDefined();
  });

  it('archives the list and closes the menu', async () => {
    const user = userEvent.setup();
    render(<ListColumn listId="l-1" boardId="b-1" onCardClick={() => {}} onCardMembersClick={() => {}} onCardArchived={() => {}} />);

    await user.click(screen.getByRole('button', { name: 'List actions for Todo' }));
    await user.click(screen.getByRole('menuitem', { name: 'Delete everything' }));

    expect(mockApiDispatch).toHaveBeenCalledWith({ type: 'list/archive', listId: 'l-1' });
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('does not include board background selection in the list action menu', async () => {
    const user = userEvent.setup();
    render(<ListColumn listId="l-1" boardId="b-1" onCardClick={() => {}} onCardMembersClick={() => {}} onCardArchived={() => {}} />);

    await user.click(screen.getByRole('button', { name: 'List actions for Todo' }));
    expect(screen.queryByRole('menuitem', { name: 'Board background' })).toBeNull();
  });

  it('closes the menu on Escape and outside click', async () => {
    const user = userEvent.setup();
    render(<ListColumn listId="l-1" boardId="b-1" onCardClick={() => {}} onCardMembersClick={() => {}} onCardArchived={() => {}} />);

    await user.click(screen.getByRole('button', { name: 'List actions for Todo' }));
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'List actions for Todo' }));
    expect(screen.getByRole('menu')).toBeDefined();
    await user.click(document.body);
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('does not let menu pointer interactions start list dragging', async () => {
    const user = userEvent.setup();
    render(<ListColumn listId="l-1" boardId="b-1" onCardClick={() => {}} onCardMembersClick={() => {}} onCardArchived={() => {}} />);

    await user.click(screen.getByRole('button', { name: 'List actions for Todo' }));
    await user.click(screen.getByRole('menuitem', { name: 'Delete everything' }));

    expect(dndMocks.onPointerDown).not.toHaveBeenCalled();
  });
});

describe('ListColumn drag handle', () => {
  it('renders exactly one drag handle per visible list', () => {
    mockState.boards = {
      'b-1': { id: 'b-1', name: 'Board', listIds: ['l-1', 'l-2'] },
    };
    mockState.lists = {
      'l-1': { id: 'l-1', name: 'Todo', cardIds: [] },
      'l-2': { id: 'l-2', name: 'Done', cardIds: [] },
    };

    render(
      <>
        <ListColumn listId="l-1" boardId="b-1" onCardClick={() => {}} onCardMembersClick={() => {}} onCardArchived={() => {}} />
        <ListColumn listId="l-2" boardId="b-1" onCardClick={() => {}} onCardMembersClick={() => {}} onCardArchived={() => {}} />
      </>,
    );

    const handles = screen.getAllByRole('button', { name: 'Drag list' });
    expect(handles).toHaveLength(2);
  });

  it('does not start a list drag from the title or the action menu button', async () => {
    const user = userEvent.setup();
    render(<ListColumn listId="l-1" boardId="b-1" onCardClick={() => {}} onCardMembersClick={() => {}} onCardArchived={() => {}} />);

    // Interacting with the static title (triggers rename mode) must not start a list drag.
    await user.click(screen.getByText('Todo'));
    expect(dndMocks.onPointerDown).not.toHaveBeenCalled();

    // Interacting with the `...` action menu button must not start a list drag either.
    await user.click(screen.getByRole('button', { name: 'List actions for Todo' }));
    expect(dndMocks.onPointerDown).not.toHaveBeenCalled();
  });

  it('exposes an accessible label and is keyboard-focusable', async () => {
    const user = userEvent.setup();
    render(<ListColumn listId="l-1" boardId="b-1" onCardClick={() => {}} onCardMembersClick={() => {}} onCardArchived={() => {}} />);

    const handle = screen.getByRole('button', { name: 'Drag list' });
    expect(handle).toBeDefined();

    await user.tab();
    expect(document.activeElement).toBe(handle);
  });
});
