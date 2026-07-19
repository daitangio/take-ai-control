import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// Mock localStorage
const store = new Map<string, string>();
const mockLocalStorage = {
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, val: string) => { store.set(key, val); },
  removeItem: (key: string) => { store.delete(key); },
  clear: () => { store.clear(); },
};

Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

beforeEach(() => {
  store.clear();
});

describe('App smoke tests', () => {
  it('shows empty state on first visit', () => {
    render(<App />);
    expect(screen.getByText(/No boards yet/)).toBeDefined();
  });

  it('create board → list → card flow', async () => {
    const user = userEvent.setup();
    render(<App />);

    // 1. Create a board
    const boardInput = screen.getByPlaceholderText('Board name');
    await user.type(boardInput, 'Work');
    await user.click(screen.getByText('Create Board'));

    // Board should now be active — we see the board tab
    expect(screen.getByText('Work')).toBeDefined();

    // 2. Create a list
    await user.click(screen.getByText('+ Add List'));
    const listInput = screen.getByPlaceholderText('List name');
    await user.type(listInput, 'To Do');
    await user.click(screen.getByText('Add List'));

    // 3. Create a card
    await user.click(screen.getByText('+ Add Card'));
    const cardInput = screen.getByPlaceholderText('Enter card title...');
    await user.type(cardInput, 'Write specs');
    await user.click(screen.getByText('Add Card'));

    // Card should be visible
    expect(screen.getByText('Write specs')).toBeDefined();
  });

  it('persistence: state survives reload', async () => {
    const user = userEvent.setup();

    // Create a board
    const { unmount } = render(<App />);
    const boardInput = screen.getByPlaceholderText('Board name');
    await user.type(boardInput, 'Persisted');
    await user.click(screen.getByText('Create Board'));

    // Add a list and card
    await user.click(screen.getByText('+ Add List'));
    const listInput = screen.getByPlaceholderText('List name');
    await user.type(listInput, 'L1');
    await user.click(screen.getByText('Add List'));

    await user.click(screen.getByText('+ Add Card'));
    const cardInput = screen.getByPlaceholderText('Enter card title...');
    await user.type(cardInput, 'C1');
    await user.click(screen.getByText('Add Card'));

    // Let debounced save settle
    await new Promise((r) => setTimeout(r, 300));

    unmount();

    // Reload
    render(<App />);

    // State should be restored
    expect(screen.getByText('Persisted')).toBeDefined();
    expect(screen.getByText('L1')).toBeDefined();
    expect(screen.getByText('C1')).toBeDefined();
  });
});
