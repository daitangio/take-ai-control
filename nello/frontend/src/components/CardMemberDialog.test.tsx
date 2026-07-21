import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CardMemberDialog } from './CardMemberDialog';
import * as api from '../api';

const mockApiDispatch = vi.fn().mockResolvedValue(undefined);
const mockState = {
  boards: {},
  lists: {},
  cards: {} as Record<string, {
    id: string;
    title: string;
    description: string;
    members?: { id: string; email: string }[];
  }>,
  activeBoardId: null,
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

beforeEach(() => {
  mockApiDispatch.mockClear();
  mockState.cards = {
    'c-1': {
      id: 'c-1',
      title: 'Task',
      description: '',
      members: [{ id: 'u-1', email: 'one@example.com' }],
    },
  };
  vi.spyOn(api, 'listCardMemberOptions').mockResolvedValue([
    { id: 'u-1', email: 'one@example.com' },
    { id: 'u-2', email: 'two@example.com' },
  ]);
});

describe('CardMemberDialog', () => {
  it('loads eligible members and marks assigned members', async () => {
    render(<CardMemberDialog cardId="c-1" onClose={() => {}} />);

    expect(await screen.findByText('one@example.com')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Remove' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByText('two@example.com')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Add' }).getAttribute('aria-pressed')).toBe('false');
  });

  it('adds and removes members through store actions', async () => {
    const user = userEvent.setup();
    render(<CardMemberDialog cardId="c-1" onClose={() => {}} />);

    await screen.findByText('two@example.com');
    await user.click(screen.getByRole('button', { name: 'Add' }));
    await user.click(screen.getByRole('button', { name: 'Remove' }));

    await waitFor(() => {
      expect(mockApiDispatch).toHaveBeenCalledWith({
        type: 'card/member/add',
        cardId: 'c-1',
        member: { id: 'u-2', email: 'two@example.com' },
      });
    });
    expect(mockApiDispatch).toHaveBeenCalledWith({
      type: 'card/member/remove',
      cardId: 'c-1',
      memberId: 'u-1',
    });
  });
});
