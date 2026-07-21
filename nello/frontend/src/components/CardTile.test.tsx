import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CardTile } from './CardTile';

const mockApiDispatch = vi.fn().mockResolvedValue(undefined);

// Mock StoreContext
const mockState = {
  boards: {},
  lists: {},
  cards: {} as Record<string, { id: string; title: string; description: string; dueDate?: string | null; members?: { id: string; email: string }[]; modifiedBy?: string; modifiedByEmail?: string | null; isModifiedByCurrentUser?: boolean | null }>,
  activeBoardId: null,
};

vi.mock('../state/StoreContext', () => ({
  useStore: () => ({ state: mockState, dispatch: vi.fn(), apiDispatch: mockApiDispatch, loadBoards: vi.fn(), toast: null, clearToast: vi.fn() }),
}));

// Mock dnd-kit sortable
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
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
  mockApiDispatch.mockClear();
  mockState.cards = {};
});

describe('CardTile editor indicator', () => {
  it('shows editor icon when card was edited by another user', () => {
    mockState.cards['c-1'] = {
      id: 'c-1',
      title: 'Task A',
      description: '',
      modifiedBy: 'other-user',
      modifiedByEmail: 'alex@example.com',
      isModifiedByCurrentUser: false,
    };

    render(<CardTile cardId="c-1" listId="l-1" onClick={() => {}} />);

    const icon = screen.getByLabelText('Edited by alex@example.com');
    expect(icon).toBeDefined();
    expect(icon.getAttribute('title')).toBe('alex@example.com');
  });

  it('does not show editor icon when card was edited by current user', () => {
    mockState.cards['c-2'] = {
      id: 'c-2',
      title: 'My Task',
      description: '',
      modifiedBy: 'me',
      modifiedByEmail: null,
      isModifiedByCurrentUser: true,
    };

    render(<CardTile cardId="c-2" listId="l-1" onClick={() => {}} />);

    expect(screen.queryByLabelText(/Edited by/)).toBeNull();
  });

  it('does not show editor icon for legacy cards with no editor metadata', () => {
    mockState.cards['c-3'] = {
      id: 'c-3',
      title: 'Legacy',
      description: '',
      modifiedBy: undefined,
      modifiedByEmail: null,
      isModifiedByCurrentUser: null,
    };

    render(<CardTile cardId="c-3" listId="l-1" onClick={() => {}} />);

    expect(screen.queryByLabelText(/Edited by/)).toBeNull();
  });

  it('exposes editor email through tooltip', () => {
    mockState.cards['c-4'] = {
      id: 'c-4',
      title: 'Shared card',
      description: '',
      modifiedBy: 'u-other',
      modifiedByEmail: 'bob@team.io',
      isModifiedByCurrentUser: false,
    };

    render(<CardTile cardId="c-4" listId="l-1" onClick={() => {}} />);

    const icon = screen.getByTitle('bob@team.io');
    expect(icon).toBeDefined();
  });
});

describe('CardTile turbo menu', () => {
  beforeEach(() => {
    mockState.cards['c-1'] = {
      id: 'c-1',
      title: 'Task A',
      description: 'Desc',
      dueDate: null,
      members: [],
    };
  });

  it('keeps card body click separate from action button click', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<CardTile cardId="c-1" listId="l-1" onClick={onClick} />);

    await user.click(screen.getByRole('button', { name: 'Task A' }));
    expect(onClick).toHaveBeenCalledOnce();

    await user.click(screen.getByRole('button', { name: 'Card actions for Task A' }));
    expect(onClick).toHaveBeenCalledOnce();
    expect(screen.getByRole('menu', { name: 'Actions for Task A' })).toBeDefined();
  });

  it('opens details from the action menu', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<CardTile cardId="c-1" listId="l-1" onClick={onClick} />);

    await user.click(screen.getByRole('button', { name: 'Card actions for Task A' }));
    await user.click(screen.getByRole('menuitem', { name: 'Details' }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('opens the member popup callback from the action menu', async () => {
    const user = userEvent.setup();
    const onMembersClick = vi.fn();
    render(<CardTile cardId="c-1" listId="l-1" onClick={() => {}} onMembersClick={onMembersClick} />);

    await user.click(screen.getByRole('button', { name: 'Card actions for Task A' }));
    await user.click(screen.getByRole('menuitem', { name: 'Members' }));

    expect(onMembersClick).toHaveBeenCalledOnce();
  });

  it('edits due date from the action menu', async () => {
    const user = userEvent.setup();
    render(<CardTile cardId="c-1" listId="l-1" onClick={() => {}} />);

    await user.click(screen.getByRole('button', { name: 'Card actions for Task A' }));
    await user.click(screen.getByRole('menuitem', { name: 'Due date' }));
    await user.type(screen.getByLabelText('Due date for Task A'), '2026-08-15');

    expect(mockApiDispatch).toHaveBeenLastCalledWith({
      type: 'card/edit',
      cardId: 'c-1',
      title: 'Task A',
      description: 'Desc',
      dueDate: '2026-08-15',
    });
  });

  it('archives from the action menu', async () => {
    const user = userEvent.setup();
    const onArchived = vi.fn();
    render(<CardTile cardId="c-1" listId="l-1" onClick={() => {}} onArchived={onArchived} />);

    await user.click(screen.getByRole('button', { name: 'Card actions for Task A' }));
    await user.click(screen.getByRole('menuitem', { name: 'Archive' }));

    expect(mockApiDispatch).toHaveBeenCalledWith({ type: 'card/archive', cardId: 'c-1' });
    expect(onArchived).toHaveBeenCalledOnce();
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('closes the action menu on Escape and outside click', async () => {
    const user = userEvent.setup();
    render(<CardTile cardId="c-1" listId="l-1" onClick={() => {}} />);

    await user.click(screen.getByRole('button', { name: 'Card actions for Task A' }));
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Card actions for Task A' }));
    expect(screen.getByRole('menu')).toBeDefined();
    await user.click(document.body);
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('closes an open menu when another card is clicked', async () => {
    const user = userEvent.setup();
    mockState.cards['c-2'] = {
      id: 'c-2',
      title: 'Task B',
      description: '',
    };

    render(
      <>
        <CardTile cardId="c-1" listId="l-1" onClick={() => {}} />
        <CardTile cardId="c-2" listId="l-1" onClick={() => {}} />
      </>,
    );

    await user.click(screen.getByRole('button', { name: 'Card actions for Task A' }));
    expect(screen.getByRole('menu', { name: 'Actions for Task A' })).toBeDefined();

    await user.click(screen.getByRole('button', { name: 'Task B' }));

    expect(screen.queryByRole('menu', { name: 'Actions for Task A' })).toBeNull();
  });

  it('closes another card menu before opening the next one', async () => {
    const user = userEvent.setup();
    mockState.cards['c-2'] = {
      id: 'c-2',
      title: 'Task B',
      description: '',
    };

    render(
      <>
        <CardTile cardId="c-1" listId="l-1" onClick={() => {}} />
        <CardTile cardId="c-2" listId="l-1" onClick={() => {}} />
      </>,
    );

    await user.click(screen.getByRole('button', { name: 'Card actions for Task A' }));
    await user.click(screen.getByRole('button', { name: 'Card actions for Task B' }));

    expect(screen.queryByRole('menu', { name: 'Actions for Task A' })).toBeNull();
    expect(screen.getByRole('menu', { name: 'Actions for Task B' })).toBeDefined();
  });
});
