import { createInitialState, type Action, type State } from './types';

function isBlank(s: string): boolean {
  return s.trim().length === 0;
}

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    // ── Board ──────────────────────────────
    case 'board/create': {
      if (isBlank(action.name)) return state;
      const { boardId, name } = action;
      const board = {
        id: boardId,
        name: name.trim(),
        background: action.background ?? null,
        listIds: [] as string[],
        ...(action.isShared !== undefined ? { isShared: action.isShared } : {}),
        ...(action.isOwner !== undefined ? { isOwner: action.isOwner } : {}),
        ...(action.capacity !== undefined ? { capacity: action.capacity } : {}),
      };
      return {
        ...state,
        boards: { ...state.boards, [boardId]: board },
        activeBoardId: boardId,
      };
    }

    case 'board/rename': {
      if (isBlank(action.name)) return state;
      const b = state.boards[action.boardId];
      if (!b) return state;
      return {
        ...state,
        boards: {
          ...state.boards,
          [action.boardId]: {
            ...b,
            name: action.name.trim(),
            background: action.background !== undefined ? action.background : b.background,
            isShared: action.isShared ?? b.isShared,
            isOwner: action.isOwner ?? b.isOwner,
            capacity: action.capacity ?? b.capacity,
          },
        },
      };
    }

    case 'board/background': {
      const board = state.boards[action.boardId];
      if (!board) return state;
      return { ...state, boards: { ...state.boards, [action.boardId]: { ...board, background: action.background } } };
    }

    case 'board/delete': {
      const board = state.boards[action.boardId];
      if (!board) return state;

      // Collect all card IDs to delete
      const cardIdsToDelete = new Set<string>();
      for (const listId of board.listIds) {
        const list = state.lists[listId];
        if (list) {
          for (const cardId of list.cardIds) cardIdsToDelete.add(cardId);
        }
      }

      // Remove lists and cards
      const nextLists = { ...state.lists };
      for (const listId of board.listIds) delete nextLists[listId];
      const nextCards = { ...state.cards };
      for (const cardId of cardIdsToDelete) delete nextCards[cardId];

      // Remove board
      const nextBoards = { ...state.boards };
      delete nextBoards[action.boardId];

      // Pick new active board if needed
      let nextActive = state.activeBoardId;
      if (state.activeBoardId === action.boardId) {
        const remaining = Object.keys(nextBoards);
        nextActive = remaining.length > 0 ? remaining[0] : null;
      }

      return {
        ...state,
        boards: nextBoards,
        lists: nextLists,
        cards: nextCards,
        activeBoardId: nextActive,
      };
    }

    case 'board/switch': {
      if (!state.boards[action.boardId]) return state;
      return { ...state, activeBoardId: action.boardId };
    }

    case 'board/reload': {
      const board = state.boards[action.boardId];
      if (!board) return state;

      // Remove the board's existing lists and their cards
      const nextLists = { ...state.lists };
      const nextCards = { ...state.cards };
      for (const listId of board.listIds) {
        const list = state.lists[listId];
        if (list) {
          for (const cardId of list.cardIds) delete nextCards[cardId];
        }
        delete nextLists[listId];
      }

      // Insert the fresh lists and cards
      const nextListIds: string[] = [];
      for (const list of action.lists) {
        const cardIds: string[] = [];
        for (const card of list.cards) {
          nextCards[card.id] = card;
          cardIds.push(card.id);
        }
        nextLists[list.id] = { id: list.id, name: list.name, cardIds, cardCapacity: list.cardCapacity };
        nextListIds.push(list.id);
      }

      return {
        ...state,
        lists: nextLists,
        cards: nextCards,
        boards: {
          ...state.boards,
          [action.boardId]: { ...board, listIds: nextListIds, background: action.background !== undefined ? action.background : board.background, capacity: action.capacity ?? board.capacity },
        },
      };
    }

    // ── List ────────────────────────────────
    case 'list/create': {
      if (isBlank(action.name)) return state;
      const board = state.boards[action.boardId];
      if (!board) return state;
      const { listId, name } = action;
      const list = { id: listId, name: name.trim(), cardIds: [] as string[], cardCapacity: action.cardCapacity };
      // Idempotent: don't append if already present (prevents duplicates from concurrent loadBoards)
      const nextListIds = board.listIds.includes(listId)
        ? board.listIds
        : [...board.listIds, listId];
      return {
        ...state,
        lists: { ...state.lists, [listId]: list },
        boards: {
          ...state.boards,
          [action.boardId]: {
            ...board,
            listIds: nextListIds,
          },
        },
      };
    }

    case 'list/rename': {
      if (isBlank(action.name)) return state;
      const list = state.lists[action.listId];
      if (!list) return state;
      return {
        ...state,
        lists: {
          ...state.lists,
          [action.listId]: { ...list, name: action.name.trim() },
        },
      };
    }

    case 'list/delete': {
      const list = state.lists[action.listId];
      if (!list) return state;

      // Remove the list's cards
      const nextCards = { ...state.cards };
      for (const cardId of list.cardIds) delete nextCards[cardId];

      // Remove the list
      const nextLists = { ...state.lists };
      delete nextLists[action.listId];

      // Remove list from board
      const board = Object.values(state.boards).find((b) =>
        b.listIds.includes(action.listId),
      );
      let nextBoards = state.boards;
      if (board) {
        nextBoards = {
          ...state.boards,
          [board.id]: {
            ...board,
            listIds: board.listIds.filter((id) => id !== action.listId),
          },
        };
      }

      return {
        ...state,
        lists: nextLists,
        cards: nextCards,
        boards: nextBoards,
      };
    }

    case 'list/archive': {
      if (!state.lists[action.listId]) return state;

      const board = Object.values(state.boards).find((b) =>
        b.listIds.includes(action.listId),
      );
      if (!board) return state;

      return {
        ...state,
        boards: {
          ...state.boards,
          [board.id]: {
            ...board,
            listIds: board.listIds.filter((id) => id !== action.listId),
          },
        },
      };
    }

    case 'list/reorder': {
      const board = state.boards[action.boardId];
      if (!board) return state;
      return {
        ...state,
        boards: {
          ...state.boards,
          [action.boardId]: { ...board, listIds: action.listIds },
        },
      };
    }

    // ── Card ────────────────────────────────
    case 'card/create': {
      if (isBlank(action.title)) return state;
      const list = state.lists[action.listId];
      if (!list) return state;
      const { cardId, title } = action;
      const card = {
        id: cardId,
        title: title.trim(),
        description: action.description ?? '',
        ...(action.dueDate !== undefined ? { dueDate: action.dueDate } : {}),
        ...(action.color !== undefined ? { color: action.color } : {}),
        ...(action.members !== undefined ? { members: action.members } : {}),
        modifiedBy: action.modifiedBy,
        modifiedByEmail: action.modifiedByEmail,
        isModifiedByCurrentUser: action.isModifiedByCurrentUser,
      };
      // Idempotent: don't append if already present (prevents duplicates from concurrent loadBoards)
      const nextCardIds = list.cardIds.includes(cardId)
        ? list.cardIds
        : [...list.cardIds, cardId];
      return {
        ...state,
        cards: { ...state.cards, [cardId]: card },
        lists: {
          ...state.lists,
          [action.listId]: {
            ...list,
            cardIds: nextCardIds,
          },
        },
      };
    }

    case 'card/edit': {
      if (isBlank(action.title)) return state;
      const card = state.cards[action.cardId];
      if (!card) return state;
      return {
        ...state,
        cards: {
          ...state.cards,
          [action.cardId]: {
            ...card,
            title: action.title.trim(),
            description: action.description,
            ...(action.dueDate !== undefined ? { dueDate: action.dueDate } : {}),
            ...(action.color !== undefined ? { color: action.color } : {}),
            ...(action.members !== undefined ? { members: action.members } : {}),
            modifiedBy: action.modifiedBy ?? card.modifiedBy,
            modifiedByEmail: action.modifiedByEmail !== undefined ? action.modifiedByEmail : card.modifiedByEmail,
            isModifiedByCurrentUser: action.isModifiedByCurrentUser !== undefined ? action.isModifiedByCurrentUser : card.isModifiedByCurrentUser,
          },
        },
      };
    }

    case 'card/archive': {
      if (!state.cards[action.cardId]) return state;
      const nextLists = { ...state.lists };
      for (const listId of Object.keys(state.lists)) {
        const list = state.lists[listId];
        if (list.cardIds.includes(action.cardId)) {
          nextLists[listId] = {
            ...list,
            cardIds: list.cardIds.filter((id) => id !== action.cardId),
          };
        }
      }
      return { ...state, lists: nextLists };
    }

    case 'card/member/add': {
      const card = state.cards[action.cardId];
      if (!card) return state;
      const members = card.members ?? [];
      const nextMembers = members.some((member) => member.id === action.member.id)
        ? members
        : [...members, action.member];
      return {
        ...state,
        cards: {
          ...state.cards,
          [action.cardId]: { ...card, members: nextMembers },
        },
      };
    }

    case 'card/member/remove': {
      const card = state.cards[action.cardId];
      if (!card) return state;
      return {
        ...state,
        cards: {
          ...state.cards,
          [action.cardId]: {
            ...card,
            members: (card.members ?? []).filter((member) => member.id !== action.memberId),
          },
        },
      };
    }

    case 'card/delete': {
      const card = state.cards[action.cardId];
      if (!card) return state;

      // Remove from its list
      const nextLists = { ...state.lists };
      for (const listId of Object.keys(state.lists)) {
        const list = state.lists[listId];
        if (list.cardIds.includes(action.cardId)) {
          nextLists[listId] = {
            ...list,
            cardIds: list.cardIds.filter((id) => id !== action.cardId),
          };
        }
      }

      const nextCards = { ...state.cards };
      delete nextCards[action.cardId];

      return { ...state, lists: nextLists, cards: nextCards };
    }

    case 'card/move': {
      const card = state.cards[action.cardId];
      if (!card) return state;

      const { fromListId, toListId, index } = action;

      // Remove from source list
      const fromList = state.lists[fromListId];
      const nextLists = { ...state.lists };
      if (fromList) {
        nextLists[fromListId] = {
          ...fromList,
          cardIds: fromList.cardIds.filter((id) => id !== action.cardId),
        };
      }

      // Add to destination list at position
      const toList = nextLists[toListId];
      if (toList) {
        const newCardIds = [...toList.cardIds];
        const clampedIndex = Math.max(0, Math.min(index, newCardIds.length));
        newCardIds.splice(clampedIndex, 0, action.cardId);
        nextLists[toListId] = { ...toList, cardIds: newCardIds };
      }

      return { ...state, lists: nextLists };
    }

    case 'card/unarchive':
      // No-op in reducer — StoreContext handles API call + board refetch
      return state;

    case 'store/reset':
      return createInitialState();

    default:
      return state;
  }
}
