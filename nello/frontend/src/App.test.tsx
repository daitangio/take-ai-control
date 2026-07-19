import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import * as api from './api';

// Pre-set a token so AuthGuard bypasses the login screen
beforeEach(() => {
  api.setToken('test-token');

  // Mock API calls to succeed without a real backend
  vi.spyOn(api, 'getBoards').mockResolvedValue([]);
  vi.spyOn(api, 'getBoard').mockResolvedValue({ id: '', name: '', lists: [] });
  vi.spyOn(api, 'createBoard').mockResolvedValue({ id: 'b-1', name: 'Work', listIds: [] });
  vi.spyOn(api, 'createList').mockResolvedValue({ id: 'l-1', boardId: 'b-1', name: 'To Do', cardIds: [] });
  vi.spyOn(api, 'createCard').mockResolvedValue({ id: 'c-1', listId: 'l-1', title: 'Write specs', description: '' });
  vi.spyOn(api, 'updateBoard').mockResolvedValue({ id: '', name: '', listIds: [] });
  vi.spyOn(api, 'updateList').mockResolvedValue({ id: '', boardId: '', name: '', cardIds: [] });
  vi.spyOn(api, 'updateCard').mockResolvedValue({ id: '', listId: '', title: '', description: '' });
  vi.spyOn(api, 'deleteBoard').mockResolvedValue(undefined);
  vi.spyOn(api, 'deleteList').mockResolvedValue(undefined);
  vi.spyOn(api, 'deleteCard').mockResolvedValue(undefined);
  vi.spyOn(api, 'reorderLists').mockResolvedValue(undefined);
  vi.spyOn(api, 'moveCard').mockResolvedValue(undefined);
  vi.spyOn(api, 'login').mockResolvedValue({ access_token: 't', token_type: 'bearer' });
  vi.spyOn(api, 'register').mockResolvedValue({ access_token: 't', token_type: 'bearer' });
});

describe('App smoke tests', () => {
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

  it('login form appears when no token is set', () => {
    api.setToken(null);
    render(<App />);
    // With no token, user sees the login form instead of boards
    expect(screen.getByText(/Sign in to your boards/)).toBeDefined();
  });
});
