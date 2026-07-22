import { createContext, useContext, useState, useReducer, useCallback, useRef, type ReactNode } from 'react';
import type { Action, State } from './types';
import { createInitialState } from './types';
import { reducer } from './reducer';
import * as api from '../api';

interface StoreValue {
  state: State;
  dispatch: React.Dispatch<Action>;
  apiDispatch: (action: Action) => Promise<void>;
  loadBoards: (preferredBoardId?: string | null) => Promise<void>;
  toast: string | null;
  clearToast: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const StoreCtx = createContext<StoreValue | null>(null);

function actionToApiCall(action: Action): Promise<unknown> {
  switch (action.type) {
    case 'board/create':
      return api.createBoard(action.boardId, action.name);
    case 'board/rename':
      return api.updateBoard(action.boardId, action.name);
    case 'board/delete':
      return api.deleteBoard(action.boardId);
    case 'board/switch':
      return Promise.resolve();
    case 'list/create':
      return api.createList(action.listId, action.boardId, action.name);
    case 'list/rename':
      return api.updateList(action.listId, action.name);
    case 'list/delete':
      return api.deleteList(action.listId);
    case 'list/archive':
      return api.archiveList(action.listId);
    case 'list/reorder':
      return api.reorderLists(action.boardId, action.listIds);
    case 'card/create':
      return api.createCard(action.cardId, action.listId, action.title);
    case 'card/edit':
      return api.updateCard(action.cardId, action.title, action.description, action.dueDate);
    case 'card/delete':
      return api.deleteCard(action.cardId);
    case 'card/archive':
      return api.archiveCard(action.cardId);
    case 'card/member/add':
      return api.addCardMember(action.cardId, action.member.id);
    case 'card/member/remove':
      return api.removeCardMember(action.cardId, action.memberId);
    case 'card/move':
      return api.moveCard(action.cardId, action.toListId, action.index);
    default:
      return Promise.resolve();
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, null, createInitialState);
  const [toast, setToast] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const loadingRef = useRef(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  const clearToast = useCallback(() => setToast(null), []);

  const loadBoards = useCallback(async (preferredBoardId?: string | null) => {
    // Guard against concurrent invocations (e.g. React StrictMode double-effect)
    if (loadingRef.current) return;
    loadingRef.current = true;

    // Clear any stale state before repopulating
    dispatch({ type: 'store/reset' });

    try {
      const boards = await api.getBoards();
      for (const board of boards) {
        dispatch({ type: 'board/create', boardId: board.id, name: board.name, isShared: board.isShared, isOwner: board.isOwner });
        const detail = await api.getBoard(board.id);
        for (const list of detail.lists) {
          dispatch({ type: 'list/create', listId: list.id, boardId: board.id, name: list.name });
          for (const card of list.cards) {
            dispatch({
              type: 'card/create',
              cardId: card.id,
              listId: list.id,
              title: card.title,
              description: card.description,
              dueDate: card.dueDate,
              members: card.members,
              modifiedBy: card.modifiedBy ?? undefined,
              modifiedByEmail: card.modifiedByEmail,
              isModifiedByCurrentUser: card.isModifiedByCurrentUser,
            });
          }
        }
      }
      const nextActive = boards.find((board) => board.id === preferredBoardId) ?? boards[0];
      if (nextActive) {
        dispatch({ type: 'board/switch', boardId: nextActive.id });
      }
    } catch (err) {
      console.debug('[nello:api] loadBoards failed:', err);
      setToast('Failed to load boards');
    } finally {
      loadingRef.current = false;
    }
  }, []);

  const apiDispatch = useCallback(async (action: Action) => {
    const activeBefore = stateRef.current.activeBoardId;
    dispatch(action);

    if (action.type === 'board/switch') return;

    try {
      const result = await actionToApiCall(action);
      if (action.type === 'board/create' || action.type === 'board/rename') {
        const board = result as api.BoardBrief;
        dispatch({
          type: 'board/rename',
          boardId: board.id,
          name: board.name,
          isShared: board.isShared,
          isOwner: board.isOwner,
        });
      } else if (action.type === 'card/create' || action.type === 'card/edit') {
        const card = result as api.CardResponse;
        dispatch({
          type: 'card/edit',
          cardId: card.id,
          title: card.title,
          description: card.description,
          dueDate: card.dueDate,
          members: card.members,
          modifiedBy: card.modifiedBy ?? undefined,
          modifiedByEmail: card.modifiedByEmail,
          isModifiedByCurrentUser: card.isModifiedByCurrentUser,
        });
      } else if (action.type === 'card/member/add') {
        const member = result as api.MemberResponse;
        dispatch({ type: 'card/member/add', cardId: action.cardId, member });
      } else if (action.type === 'card/move') {
        await loadBoards(activeBefore);
      }
    } catch (err) {
      console.debug('[nello:api]', action.type, 'failed:', err);
      setToast(`Failed to ${action.type.replace('/', ' ')}`);
      if (api.getToken()) await loadBoards(activeBefore);
    }
  }, [loadBoards]);

  return (
    <StoreCtx.Provider value={{ state, dispatch, apiDispatch, loadBoards, toast, clearToast, searchQuery, setSearchQuery }}>
      {children}
    </StoreCtx.Provider>
  );
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreCtx);
  if (!ctx) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return ctx;
}
