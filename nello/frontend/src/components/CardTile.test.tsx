import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CardTile } from './CardTile';

// Mock StoreContext
const mockState = {
  boards: {},
  lists: {},
  cards: {} as Record<string, { id: string; title: string; description: string; modifiedBy?: string; modifiedByEmail?: string | null; isModifiedByCurrentUser?: boolean | null }>,
  activeBoardId: null,
};

vi.mock('../state/StoreContext', () => ({
  useStore: () => ({ state: mockState, dispatch: vi.fn(), apiDispatch: vi.fn(), loadBoards: vi.fn(), toast: null, clearToast: vi.fn() }),
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
