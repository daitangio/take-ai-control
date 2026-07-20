import { createContext, useContext, useState, useReducer, useCallback, useRef, type ReactNode } from 'react';
import type { Action, State } from './types';
import { createInitialState } from './types';
import { reducer } from './reducer';
import * as api from '../api';

interface StoreValue {
  state: State;
  dispatch: React.Dispatch<Action>;
  apiDispatch: (action: Action) => Promise<void>;
  loadBoards: () => Promise<void>;
  toast: string | null;
  clearToast: () => void;
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
    case 'list/reorder':
      return api.reorderLists(action.boardId, action.listIds);
    case 'card/create':
      return api.createCard(action.cardId, action.listId, action.title);
    case 'card/edit':
      return api.updateCard(action.cardId, action.title, action.description);
    case 'card/delete':
      return api.deleteCard(action.cardId);
    case 'card/move':
      return api.moveCard(action.cardId, action.toListId, action.index);
    default:
      return Promise.resolve();
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, null, createInitialState);
  const [toast, setToast] = useState<string | null>(null);
  const loadingRef = useRef(false);

  const clearToast = useCallback(() => setToast(null), []);

  const loadBoards = useCallback(async () => {
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
              modifiedBy: card.modifiedBy ?? undefined,
            });
            // Set description if present
            if (card.description) {
              dispatch({
                type: 'card/edit',
                cardId: card.id,
                title: card.title,
                description: card.description,
              });
            }
          }
        }
      }
      // Switch to first board
      const allBoards = Object.values(boards);
      if (allBoards.length > 0) {
        dispatch({ type: 'board/switch', boardId: allBoards[0].id });
      }
    } catch (err) {
      console.debug('[nello:api] loadBoards failed:', err);
      setToast('Failed to load boards');
    } finally {
      loadingRef.current = false;
    }
  }, []);

  const apiDispatch = useCallback(async (action: Action) => {
    dispatch(action);

    if (action.type === 'board/switch') return;

    try {
      await actionToApiCall(action);
    } catch (err) {
      console.debug('[nello:api]', action.type, 'failed:', err);
      setToast(`Failed to ${action.type.replace('/', ' ')}`);
    }
  }, []);

  return (
    <StoreCtx.Provider value={{ state, dispatch, apiDispatch, loadBoards, toast, clearToast }}>
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
