import { describe, it, expect, beforeEach } from 'vitest';
import { localStorageAdapter } from './storage';
import { createInitialState } from './types';

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

describe('localStorage adapter', () => {
  it('round-trips state', () => {
    const state = createInitialState();
    state.boards.b1 = { id: 'b1', name: 'Work', listIds: ['l1'] };
    state.lists.l1 = { id: 'l1', name: 'To Do', cardIds: ['c1'] };
    state.cards.c1 = { id: 'c1', title: 'Task', description: '' };
    state.activeBoardId = 'b1';

    localStorageAdapter.save(state);
    const loaded = localStorageAdapter.load();

    expect(loaded).not.toBeNull();
    expect(loaded!.boards.b1).toEqual(state.boards.b1);
    expect(loaded!.lists.l1).toEqual(state.lists.l1);
    expect(loaded!.cards.c1).toEqual(state.cards.c1);
    expect(loaded!.activeBoardId).toBe('b1');
  });

  it('returns null on first visit (empty localStorage)', () => {
    const loaded = localStorageAdapter.load();
    expect(loaded).toBeNull();
  });

  it('returns null on corrupt JSON', () => {
    store.set('nello:v1', '{not valid');
    const loaded = localStorageAdapter.load();
    expect(loaded).toBeNull();
  });

  it('returns null on wrong version', () => {
    store.set('nello:v1', JSON.stringify({ version: 99, state: {} }));
    const loaded = localStorageAdapter.load();
    expect(loaded).toBeNull();
  });

  it('returns null on missing state field', () => {
    store.set('nello:v1', JSON.stringify({ version: 1 }));
    const loaded = localStorageAdapter.load();
    expect(loaded).toBeNull();
  });

  it('returns null on non-object payload', () => {
    store.set('nello:v1', '"just a string"');
    const loaded = localStorageAdapter.load();
    expect(loaded).toBeNull();
  });
});
