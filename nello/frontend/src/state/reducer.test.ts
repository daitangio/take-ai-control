import { describe, it, expect } from 'vitest';
import { reducer } from './reducer';
import { createInitialState } from './types';
import type { State } from './types';

function s(boards = 0, lists = 0, cards = 0): State {
  const state = createInitialState();
  for (let i = 0; i < boards; i++) {
    const bid = `b${i}`;
    state.boards[bid] = { id: bid, name: `Board ${i}`, listIds: [] };
    state.activeBoardId ??= bid;
  }
  for (let i = 0; i < lists; i++) {
    const lid = `l${i}`;
    const bid = `b${Math.floor(i / 2) % Math.max(boards, 1)}`;
    state.lists[lid] = { id: lid, name: `List ${i}`, cardIds: [] };
    if (state.boards[bid]) {
      state.boards[bid].listIds.push(lid);
    }
  }
  for (let i = 0; i < cards; i++) {
    const cid = `c${i}`;
    state.cards[cid] = { id: cid, title: `Card ${i}`, description: '' };
    const lid = `l${i % Math.max(lists, 1)}`;
    if (state.lists[lid]) {
      state.lists[lid].cardIds.push(cid);
    }
  }
  return state;
}

// ── Board actions ──────────────────────────────────────

describe('board/create', () => {
  it('creates a board and sets it active', () => {
    const next = reducer(createInitialState(), {
      type: 'board/create',
      boardId: 'b1',
      name: 'Work',
    });
    expect(next.boards.b1).toEqual({ id: 'b1', name: 'Work', listIds: [] });
    expect(next.activeBoardId).toBe('b1');
  });

  it('rejects empty name', () => {
    const next = reducer(createInitialState(), {
      type: 'board/create',
      boardId: 'b1',
      name: '   ',
    });
    expect(next.boards.b1).toBeUndefined();
  });

  it('rejects whitespace-only name', () => {
    const next = reducer(createInitialState(), {
      type: 'board/create',
      boardId: 'b1',
      name: '\t\n ',
    });
    expect(next.boards.b1).toBeUndefined();
  });

  it('trims name', () => {
    const next = reducer(createInitialState(), {
      type: 'board/create',
      boardId: 'b1',
      name: '  Work  ',
    });
    expect(next.boards.b1?.name).toBe('Work');
  });
});

describe('board/rename', () => {
  it('renames a board', () => {
    const state = s(1);
    const next = reducer(state, {
      type: 'board/rename',
      boardId: 'b0',
      name: 'Work 2026',
    });
    expect(next.boards.b0.name).toBe('Work 2026');
  });

  it('rejects empty name', () => {
    const state = s(1);
    const next = reducer(state, {
      type: 'board/rename',
      boardId: 'b0',
      name: '',
    });
    expect(next.boards.b0.name).toBe('Board 0');
  });

  it('no-ops on unknown board', () => {
    const state = s(1);
    const next = reducer(state, {
      type: 'board/rename',
      boardId: 'missing',
      name: 'X',
    });
    expect(next).toBe(state);
  });
});

describe('board/delete', () => {
  it('deletes a board and cascades lists and cards', () => {
    const state = s(2, 2, 2);
    // l0,l1 belong to b0; l0 has c0, l1 has c1
    const next = reducer(state, { type: 'board/delete', boardId: 'b0' });
    expect(next.boards.b0).toBeUndefined();
    expect(next.lists.l0).toBeUndefined();
    expect(next.lists.l1).toBeUndefined();
    expect(next.cards.c0).toBeUndefined();
    expect(next.cards.c1).toBeUndefined();
    // Other board untouched
    expect(next.boards.b1).toBeDefined();
  });

  it('activates another board when deleting active', () => {
    const state = s(2);
    state.activeBoardId = 'b0';
    const next = reducer(state, { type: 'board/delete', boardId: 'b0' });
    expect(next.activeBoardId).toBe('b1');
  });

  it('sets activeBoardId to null when deleting last board', () => {
    const state = s(1);
    const next = reducer(state, { type: 'board/delete', boardId: 'b0' });
    expect(next.activeBoardId).toBeNull();
  });

  it('no-ops on unknown board', () => {
    const state = s(1);
    const next = reducer(state, { type: 'board/delete', boardId: 'missing' });
    expect(next).toBe(state);
  });
});

describe('board/switch', () => {
  it('switches active board', () => {
    const state = s(2);
    state.activeBoardId = 'b0';
    const next = reducer(state, { type: 'board/switch', boardId: 'b1' });
    expect(next.activeBoardId).toBe('b1');
  });

  it('no-ops on unknown board', () => {
    const state = s(1);
    const next = reducer(state, { type: 'board/switch', boardId: 'missing' });
    expect(next).toBe(state);
  });
});

// ── List actions ───────────────────────────────────────

describe('list/create', () => {
  it('appends a list to a board', () => {
    const state = s(1);
    const next = reducer(state, {
      type: 'list/create',
      listId: 'l0',
      boardId: 'b0',
      name: 'To Do',
    });
    expect(next.lists.l0).toEqual({ id: 'l0', name: 'To Do', cardIds: [] });
    expect(next.boards.b0.listIds).toEqual(['l0']);
  });

  it('rejects empty name', () => {
    const state = s(1);
    const next = reducer(state, {
      type: 'list/create',
      listId: 'l0',
      boardId: 'b0',
      name: '',
    });
    expect(next.lists.l0).toBeUndefined();
  });

  it('no-ops on unknown board', () => {
    const next = reducer(createInitialState(), {
      type: 'list/create',
      listId: 'l0',
      boardId: 'missing',
      name: 'X',
    });
    expect(next.lists.l0).toBeUndefined();
  });
});

describe('list/rename', () => {
  it('renames a list', () => {
    const state = s(1, 1);
    const next = reducer(state, {
      type: 'list/rename',
      listId: 'l0',
      name: 'Backlog',
    });
    expect(next.lists.l0.name).toBe('Backlog');
  });

  it('rejects empty name', () => {
    const state = s(1, 1);
    const next = reducer(state, {
      type: 'list/rename',
      listId: 'l0',
      name: '   ',
    });
    expect(next.lists.l0.name).toBe('List 0');
  });
});

describe('list/delete', () => {
  it('deletes a list and its cards', () => {
    const state = s(1, 1, 3);
    // l0 has c0,c1,c2
    const next = reducer(state, { type: 'list/delete', listId: 'l0' });
    expect(next.lists.l0).toBeUndefined();
    expect(next.cards.c0).toBeUndefined();
    expect(next.cards.c1).toBeUndefined();
    expect(next.cards.c2).toBeUndefined();
    expect(next.boards.b0.listIds).toEqual([]);
  });

  it('removes list from its board', () => {
    const state = s(1, 2);
    const next = reducer(state, { type: 'list/delete', listId: 'l0' });
    expect(next.boards.b0.listIds).toEqual(['l1']);
  });
});

describe('list/archive', () => {
  it('removes a list from its board without deleting list or cards from state', () => {
    const state = s(1, 1, 3);
    const next = reducer(state, { type: 'list/archive', listId: 'l0' });

    expect(next.boards.b0.listIds).toEqual([]);
    expect(next.lists.l0).toEqual(state.lists.l0);
    expect(next.cards.c0).toEqual(state.cards.c0);
    expect(next.cards.c1).toEqual(state.cards.c1);
    expect(next.cards.c2).toEqual(state.cards.c2);
  });

  it('no-ops on unknown list', () => {
    const state = s(1, 1);
    const next = reducer(state, { type: 'list/archive', listId: 'missing' });

    expect(next).toBe(state);
  });
});

describe('list/reorder', () => {
  it('reorders lists within a board', () => {
    const state = s(1, 3); // l0, l1, l2
    const next = reducer(state, {
      type: 'list/reorder',
      boardId: 'b0',
      listIds: ['l2', 'l0', 'l1'],
    });
    expect(next.boards.b0.listIds).toEqual(['l2', 'l0', 'l1']);
  });
});

// ── Card actions ───────────────────────────────────────

describe('card/create', () => {
  it('appends a card to a list', () => {
    const state = s(1, 1);
    const next = reducer(state, {
      type: 'card/create',
      cardId: 'c0',
      listId: 'l0',
      title: 'Write specs',
    });
    expect(next.cards.c0).toEqual({
      id: 'c0',
      title: 'Write specs',
      description: '',
    });
    expect(next.lists.l0.cardIds).toEqual(['c0']);
  });

  it('appends at end of list', () => {
    const state = s(1, 1, 2); // l0 has c0, c1
    const next = reducer(state, {
      type: 'card/create',
      cardId: 'c2',
      listId: 'l0',
      title: 'New',
    });
    expect(next.lists.l0.cardIds).toEqual(['c0', 'c1', 'c2']);
  });

  it('rejects empty title', () => {
    const state = s(1, 1);
    const next = reducer(state, {
      type: 'card/create',
      cardId: 'c0',
      listId: 'l0',
      title: '',
    });
    expect(next.cards.c0).toBeUndefined();
  });
});

describe('card/edit', () => {
  it('edits title and description', () => {
    const state = s(1, 1, 1);
    const next = reducer(state, {
      type: 'card/edit',
      cardId: 'c0',
      title: 'Updated',
      description: 'desc',
    });
    expect(next.cards.c0.title).toBe('Updated');
    expect(next.cards.c0.description).toBe('desc');
  });

  it('rejects empty title', () => {
    const state = s(1, 1, 1);
    const next = reducer(state, {
      type: 'card/edit',
      cardId: 'c0',
      title: '   ',
      description: '',
    });
    expect(next.cards.c0.title).toBe('Card 0');
  });

  it('edits due date and members when provided', () => {
    const state = s(1, 1, 1);
    const next = reducer(state, {
      type: 'card/edit',
      cardId: 'c0',
      title: 'Updated',
      description: 'desc',
      dueDate: '2026-08-15',
      members: [{ id: 'u-1', email: 'a@example.com' }],
    });

    expect(next.cards.c0.dueDate).toBe('2026-08-15');
    expect(next.cards.c0.members).toEqual([{ id: 'u-1', email: 'a@example.com' }]);
  });
});

describe('card/delete', () => {
  it('deletes a card and removes from its list', () => {
    const state = s(1, 1, 2);
    const next = reducer(state, { type: 'card/delete', cardId: 'c0' });
    expect(next.cards.c0).toBeUndefined();
    expect(next.lists.l0.cardIds).toEqual(['c1']);
  });
});

describe('card/archive', () => {
  it('removes a card from its list without deleting the card from state', () => {
    const state = s(1, 1, 2);
    const next = reducer(state, { type: 'card/archive', cardId: 'c0' });

    expect(next.lists.l0.cardIds).toEqual(['c1']);
    expect(next.cards.c0).toEqual(state.cards.c0);
  });
});

describe('card/member actions', () => {
  it('adds a member idempotently', () => {
    const state = s(1, 1, 1);
    const once = reducer(state, {
      type: 'card/member/add',
      cardId: 'c0',
      member: { id: 'u-1', email: 'a@example.com' },
    });
    const twice = reducer(once, {
      type: 'card/member/add',
      cardId: 'c0',
      member: { id: 'u-1', email: 'a@example.com' },
    });

    expect(twice.cards.c0.members).toEqual([{ id: 'u-1', email: 'a@example.com' }]);
  });

  it('removes a member', () => {
    const state = s(1, 1, 1);
    state.cards.c0.members = [
      { id: 'u-1', email: 'a@example.com' },
      { id: 'u-2', email: 'b@example.com' },
    ];

    const next = reducer(state, { type: 'card/member/remove', cardId: 'c0', memberId: 'u-1' });

    expect(next.cards.c0.members).toEqual([{ id: 'u-2', email: 'b@example.com' }]);
  });
});

describe('card/move', () => {
  it('reorders within the same list', () => {
    const state = s(1, 1, 3); // l0 has c0, c1, c2
    const next = reducer(state, {
      type: 'card/move',
      cardId: 'c2',
      fromListId: 'l0',
      toListId: 'l0',
      index: 0,
    });
    expect(next.lists.l0.cardIds).toEqual(['c2', 'c0', 'c1']);
  });

  it('moves across lists', () => {
    // Manually construct: l0 has c0,c1,c2, l1 is empty
    const st = createInitialState();
    st.boards.b0 = { id: 'b0', name: 'B', listIds: ['l0', 'l1'] };
    st.activeBoardId = 'b0';
    st.lists.l0 = { id: 'l0', name: 'L0', cardIds: ['c0', 'c1', 'c2'] };
    st.lists.l1 = { id: 'l1', name: 'L1', cardIds: [] };
    st.cards.c0 = { id: 'c0', title: 'C0', description: '' };
    st.cards.c1 = { id: 'c1', title: 'C1', description: '' };
    st.cards.c2 = { id: 'c2', title: 'C2', description: '' };
    const next = reducer(st, {
      type: 'card/move',
      cardId: 'c1',
      fromListId: 'l0',
      toListId: 'l1',
      index: 0,
    });
    expect(next.lists.l0.cardIds).toEqual(['c0', 'c2']);
    expect(next.lists.l1.cardIds).toEqual(['c1']);
  });

  it('moves into an empty list', () => {
    const st = createInitialState();
    st.boards.b0 = { id: 'b0', name: 'B', listIds: ['l0', 'l1'] };
    st.activeBoardId = 'b0';
    st.lists.l0 = { id: 'l0', name: 'L0', cardIds: ['c0'] };
    st.lists.l1 = { id: 'l1', name: 'L1', cardIds: [] };
    st.cards.c0 = { id: 'c0', title: 'C0', description: '' };
    const next = reducer(st, {
      type: 'card/move',
      cardId: 'c0',
      fromListId: 'l0',
      toListId: 'l1',
      index: 0,
    });
    expect(next.lists.l0.cardIds).toEqual([]);
    expect(next.lists.l1.cardIds).toEqual(['c0']);
  });

  it('clamps index to valid range', () => {
    const state = s(1, 1, 2); // l0: [c0, c1]
    const next = reducer(state, {
      type: 'card/move',
      cardId: 'c0',
      fromListId: 'l0',
      toListId: 'l0',
      index: 99,
    });
    // Should be placed at end (index 1, since c0 was removed and there's now just [c1])
    expect(next.lists.l0.cardIds).toEqual(['c1', 'c0']);
  });
});

// ── Meta actions ───────────────────────────────────────

describe('store/reset', () => {
  it('clears all boards, lists, cards, and activeBoardId', () => {
    const state = s(2, 3, 4);
    state.activeBoardId = 'b0';
    const next = reducer(state, { type: 'store/reset' });
    expect(next.boards).toEqual({});
    expect(next.lists).toEqual({});
    expect(next.cards).toEqual({});
    expect(next.activeBoardId).toBeNull();
  });
});

// ── Idempotency guards ─────────────────────────────────

describe('list/create idempotency', () => {
  it('does not append duplicate listId to board.listIds', () => {
    // First create adds the list
    const state = s(1);
    const a = reducer(state, {
      type: 'list/create',
      listId: 'l0',
      boardId: 'b0',
      name: 'To Do',
    });
    expect(a.boards.b0.listIds).toEqual(['l0']);

    // Second create with same listId should be idempotent
    const b = reducer(a, {
      type: 'list/create',
      listId: 'l0',
      boardId: 'b0',
      name: 'To Do',
    });
    expect(b.boards.b0.listIds).toEqual(['l0']);
  });
});

describe('card/create idempotency', () => {
  it('does not append duplicate cardId to list.cardIds', () => {
    const state = s(1, 1);
    const a = reducer(state, {
      type: 'card/create',
      cardId: 'c0',
      listId: 'l0',
      title: 'Task',
    });
    expect(a.lists.l0.cardIds).toEqual(['c0']);

    // Second create with same cardId should be idempotent
    const b = reducer(a, {
      type: 'card/create',
      cardId: 'c0',
      listId: 'l0',
      title: 'Task',
    });
    expect(b.lists.l0.cardIds).toEqual(['c0']);
  });
});
