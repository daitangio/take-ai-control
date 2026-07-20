import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import * as api from './api';
import { HELP_CONTENT_VERSION, HELP_DISMISSAL_KEY } from './components/HelpBox';

const storage = new Map<string, string>();
const mockLocalStorage = {
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, value: string) => { storage.set(key, value); },
  removeItem: (key: string) => { storage.delete(key); },
  clear: () => { storage.clear(); },
};

Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

// Pre-set a token so AuthGuard bypasses the login screen
beforeEach(() => {
  storage.clear();
  api.setToken('test-token');

  // Mock API calls to succeed without a real backend
  vi.spyOn(api, 'getBoards').mockResolvedValue([]);
  vi.spyOn(api, 'getBoard').mockResolvedValue({ id: '', name: '', lists: [] });
  vi.spyOn(api, 'createBoard').mockResolvedValue({ id: 'b-1', name: 'Work', listIds: [], isShared: false, isOwner: true });
  vi.spyOn(api, 'createList').mockResolvedValue({ id: 'l-1', boardId: 'b-1', name: 'To Do', cardIds: [] });
  vi.spyOn(api, 'createCard').mockResolvedValue({ id: 'c-1', listId: 'l-1', title: 'Write specs', description: '', modifiedBy: 'u-1' });
  vi.spyOn(api, 'updateBoard').mockResolvedValue({ id: '', name: '', listIds: [], isShared: false, isOwner: true });
  vi.spyOn(api, 'updateList').mockResolvedValue({ id: '', boardId: '', name: '', cardIds: [] });
  vi.spyOn(api, 'updateCard').mockResolvedValue({ id: '', listId: '', title: '', description: '', modifiedBy: 'u-1' });
  vi.spyOn(api, 'deleteBoard').mockResolvedValue(undefined);
  vi.spyOn(api, 'deleteList').mockResolvedValue(undefined);
  vi.spyOn(api, 'deleteCard').mockResolvedValue(undefined);
  vi.spyOn(api, 'reorderLists').mockResolvedValue(undefined);
  vi.spyOn(api, 'moveCard').mockResolvedValue(undefined);
  vi.spyOn(api, 'login').mockResolvedValue({ access_token: 't', token_type: 'bearer' });
  vi.spyOn(api, 'register').mockResolvedValue({ access_token: 't', token_type: 'bearer' });
});

describe('App smoke tests', () => {
  it('shows shared-board help after authentication', async () => {
    render(<App />);

    expect(await screen.findByRole('complementary', { name: 'Nello non-invasive help' })).toBeDefined();
    expect(screen.getByText(/ending its name with \$/)).toBeDefined();
    expect(screen.getByText(/use the 👤 button/)).toBeDefined();
  });

  it('dismisses help for the current content version', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);

    await user.click(await screen.findByRole('button', { name: 'Dismiss help' }));
    expect(screen.queryByRole('complementary', { name: 'Nello non-invasive help' })).toBeNull();
    expect(localStorage.getItem(HELP_DISMISSAL_KEY)).toBe(HELP_CONTENT_VERSION);

    unmount();
    render(<App />);
    expect(screen.queryByRole('complementary', { name: 'Nello non-invasive help' })).toBeNull();
  });

  it('shows help again when the saved version is outdated', async () => {
    localStorage.setItem(HELP_DISMISSAL_KEY, 'older-version');
    render(<App />);

    expect(await screen.findByRole('complementary', { name: 'Nello non-invasive help' })).toBeDefined();
  });

  it('keeps help dismissed when local storage cannot be written', async () => {
    const user = userEvent.setup();
    const setItem = vi.spyOn(mockLocalStorage, 'setItem').mockImplementation(() => {
      throw new Error('storage unavailable');
    });
    render(<App />);

    await user.click(await screen.findByRole('button', { name: 'Dismiss help' }));
    expect(screen.queryByRole('complementary', { name: 'Nello non-invasive help' })).toBeNull();
    setItem.mockRestore();
  });

  it('shows empty state when no boards exist', async () => {
    render(<App />);
    // Wait for the async loadBoards effect to complete
    await screen.findByText(/No boards yet/);
    expect(screen.getByText(/No boards yet/)).toBeDefined();
  });

  it('create board via UI', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Type a board name
    const boardInput = screen.getByPlaceholderText('Board name');
    await user.type(boardInput, 'Work');
    await user.click(screen.getByText('Create Board'));

    // The board should be created (optimistic update appears immediately)
    expect(screen.getByText('Work')).toBeDefined();
  });

  it('creates consecutive cards from a list-body click without mouse interaction', async () => {
    const user = userEvent.setup();
    vi.mocked(api.createCard).mockImplementation(async (id, listId, title) => ({
      id,
      listId,
      title,
      description: '',
      modifiedBy: 'u-1',
    }));
    render(<App />);

    await user.type(screen.getByPlaceholderText('Board name'), 'Work');
    await user.click(screen.getByText('Create Board'));
    await user.click(await screen.findByRole('button', { name: '+ Add List' }));
    await user.type(screen.getByPlaceholderText('List name'), 'To Do');
    await user.click(screen.getByRole('button', { name: 'Add List' }));

    const listBody = document.querySelector('.card-list');
    if (!listBody) throw new Error('Expected card list body');
    await user.click(listBody);

    const composer = screen.getByPlaceholderText('Enter card title...');
    expect(document.activeElement).toBe(composer);
    await user.type(composer, 'Card1{enter}Card2{enter}');

    expect(await screen.findByText('Card1')).toBeDefined();
    expect(await screen.findByText('Card2')).toBeDefined();
    expect((composer as HTMLTextAreaElement).value).toBe('');
    expect(document.activeElement).toBe(composer);

    await user.type(composer, 'Line one');
    await user.keyboard('{Shift>}{Enter}{/Shift}Line two');
    expect((composer as HTMLTextAreaElement).value).toBe('Line one\nLine two');
    expect(api.createCard).toHaveBeenCalledTimes(2);

    await user.clear(composer);
    await user.keyboard('{Enter}');
    expect(api.createCard).toHaveBeenCalledTimes(2);
  });

  it('keeps card and list-title clicks separate from list-body activation', async () => {
    const user = userEvent.setup();
    vi.mocked(api.createCard).mockImplementation(async (id, listId, title) => ({
      id,
      listId,
      title,
      description: '',
      modifiedBy: 'u-1',
    }));
    render(<App />);

    await user.type(screen.getByPlaceholderText('Board name'), 'Work');
    await user.click(screen.getByText('Create Board'));
    await user.click(await screen.findByRole('button', { name: '+ Add List' }));
    await user.type(screen.getByPlaceholderText('List name'), 'To Do');
    await user.click(screen.getByRole('button', { name: 'Add List' }));

    const listBody = document.querySelector('.card-list');
    if (!listBody) throw new Error('Expected card list body');
    await user.click(listBody);
    const composer = screen.getByPlaceholderText('Enter card title...');
    await user.type(composer, 'Card1{enter}{escape}');

    await user.click(screen.getByRole('button', { name: 'Card1' }));
    expect(screen.getByDisplayValue('Card1')).toBeDefined();
    expect(screen.queryByPlaceholderText('Enter card title...')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Close' }));
    await user.click(screen.getByText('To Do'));
    expect(screen.getByDisplayValue('To Do')).toBeDefined();
    expect(screen.queryByPlaceholderText('Enter card title...')).toBeNull();
  });

  it('login form appears when no token is set', () => {
    api.setToken(null);
    render(<App />);
    // With no token, user sees the login form instead of boards
    expect(screen.getByText(/Sign in to your boards/)).toBeDefined();
    expect(screen.queryByRole('complementary', { name: 'Nello non-invasive help' })).toBeNull();
  });

  it('uses API metadata after creating a shared board', async () => {
    const user = userEvent.setup();
    vi.mocked(api.createBoard).mockImplementation(async (id, name) => ({
      id,
      name,
      listIds: [],
      isShared: true,
      isOwner: true,
    }));
    render(<App />);

    await user.type(screen.getByPlaceholderText('Board name'), 'Team$');
    await user.click(screen.getByText('Create Board'));

    expect(await screen.findByTitle('Manage members')).toBeDefined();
  });

  it('restores server state after a failed optimistic mutation', async () => {
    const user = userEvent.setup();
    vi.mocked(api.createBoard).mockRejectedValueOnce(new Error('rejected'));
    render(<App />);

    await user.type(screen.getByPlaceholderText('Board name'), 'Rejected');
    await user.click(screen.getByText('Create Board'));

    expect(await screen.findByText('Failed to board create')).toBeDefined();
    expect(screen.queryByRole('button', { name: 'Rejected' })).toBeNull();
  });

  it('hides owner-only board deletion from members', async () => {
    vi.mocked(api.getBoards).mockResolvedValueOnce([{
      id: 'b-shared',
      name: 'Team$',
      listIds: [],
      isShared: true,
      isOwner: false,
    }]);
    render(<App />);

    expect(await screen.findByText('Team$')).toBeDefined();
    expect(screen.queryByTitle('Delete board')).toBeNull();
  });
});
