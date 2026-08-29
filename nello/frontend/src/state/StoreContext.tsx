import { createContext, useContext, useState, useReducer, useCallback, useRef, type ReactNode } from 'react';
import type { Action, State } from './types';
import { createInitialState } from './types';
import { reducer } from './reducer';
import * as api from '../api';
import i18n from '../i18n';
import { toLocalizedErrorMessage } from '../i18n/backendErrors';

interface StoreValue {
  state: State;
  dispatch: React.Dispatch<Action>;
  apiDispatch: (action: Action) => Promise<void>;
  loadBoards: (preferredBoardId?: string | null) => Promise<void>;
  reloadBoard: (boardId: string) => Promise<void>;
  selectBoard: (boardId: string) => Promise<void>;
  refreshBoardList: () => Promise<void>;
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
      return api.updateBoard(action.boardId, { name: action.name });
    case 'board/background':
      return api.updateBoard(action.boardId, { background: action.background });
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
      return api.updateCard(action.cardId, action.title, action.description, action.dueDate, action.color);
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
    case 'card/unarchive':
      return api.unarchiveCard(action.cardId, action.targetListId);
    default:
      return Promise.resolve();
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, null, createInitialState);
  const [toast, setToast] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const loadingRef = useRef(false);
  const latestSelectRef = useRef<string | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  const clearToast = useCallback(() => setToast(null), []);

  const refreshBoardList = useCallback(async () => {
    const boards = await api.getBoards();
    dispatch({ type: 'boards/refresh', boards });
  }, []);

  const fetchBoardDetail = useCallback(async (boardId: string) => {
    const detail = await api.getBoard(boardId);
    dispatch({
      type: 'board/reload',
      boardId,
      background: detail.background,
      capacity: detail.capacity,
      lists: detail.lists.map((list) => ({
        id: list.id,
        name: list.name,
        cardCapacity: list.cardCapacity,
        cards: list.cards.map((card) => ({
          id: card.id,
          title: card.title,
          description: card.description,
          dueDate: card.dueDate,
          color: card.color,
          members: card.members,
          modifiedBy: card.modifiedBy ?? undefined,
          modifiedByEmail: card.modifiedByEmail,
          isModifiedByCurrentUser: card.isModifiedByCurrentUser,
        })),
      })),
    });
  }, []);

  const reloadBoard = useCallback(async (boardId: string) => {
    try {
      await fetchBoardDetail(boardId);
    } catch (err) {
      console.debug('[nello:api] reloadBoard failed:', err);
      setToast(toLocalizedErrorMessage(i18n.t.bind(i18n), err, 'errors.apiReloadBoard'));
    }
  }, [fetchBoardDetail]);

  // Load one board's content and make it active; the latest request wins.
  const selectBoardContent = useCallback(async (boardId: string) => {
    latestSelectRef.current = boardId;
    try {
      await fetchBoardDetail(boardId);
    } catch (err) {
      if (latestSelectRef.current !== boardId) return; // superseded by a newer click
      console.debug('[nello:api] selectBoard failed:', err);
      setToast(toLocalizedErrorMessage(i18n.t.bind(i18n), err, 'errors.apiReloadBoard'));
      return;
    }
    if (latestSelectRef.current === boardId) {
      dispatch({ type: 'board/switch', boardId });
    }
  }, [fetchBoardDetail]);

  const selectBoard = useCallback(async (boardId: string) => {
    try {
      await refreshBoardList();
    } catch (err) {
      console.debug('[nello:api] selectBoard list refresh failed:', err);
      setToast(toLocalizedErrorMessage(i18n.t.bind(i18n), err, 'errors.apiLoadBoards'));
      return;
    }
    await selectBoardContent(boardId);
  }, [refreshBoardList, selectBoardContent]);

  const loadBoards = useCallback(async (preferredBoardId?: string | null) => {
    // Guard against concurrent invocations (e.g. React StrictMode double-effect)
    if (loadingRef.current) return;
    loadingRef.current = true;

    // A click during the list fetch picks its own board; don't override it.
    latestSelectRef.current = null;

    try {
      const boards = await api.getBoards();
      dispatch({ type: 'boards/refresh', boards });
      const target = boards.find((board) => board.id === preferredBoardId) ?? boards[0];
      if (target && latestSelectRef.current === null) {
        await selectBoardContent(target.id);
      }
    } catch (err) {
      console.debug('[nello:api] loadBoards failed:', err);
      setToast(toLocalizedErrorMessage(i18n.t.bind(i18n), err, 'errors.apiLoadBoards'));
    } finally {
      loadingRef.current = false;
    }
  }, [selectBoardContent]);

  const apiDispatch = useCallback(async (action: Action) => {
    const activeBefore = stateRef.current.activeBoardId;
    dispatch(action);

    if (action.type === 'board/switch') return;

    try {
      const result = await actionToApiCall(action);
      if (action.type === 'board/create' || action.type === 'board/rename' || action.type === 'board/background') {
        const board = result as api.BoardBrief;
        dispatch({
          type: 'board/rename',
          boardId: board.id,
          name: board.name,
          background: board.background,
          isShared: board.isShared,
          isOwner: board.isOwner,
          capacity: board.capacity,
        });
      } else if (action.type === 'card/create' || action.type === 'card/edit') {
        const card = result as api.CardResponse;
        dispatch({
          type: 'card/edit',
          cardId: card.id,
          title: card.title,
          description: card.description,
          dueDate: card.dueDate,
          color: card.color,
          members: card.members,
          modifiedBy: card.modifiedBy ?? undefined,
          modifiedByEmail: card.modifiedByEmail,
          isModifiedByCurrentUser: card.isModifiedByCurrentUser,
        });
      } else if (action.type === 'card/member/add') {
        const member = result as api.MemberResponse;
        dispatch({ type: 'card/member/add', cardId: action.cardId, member });
      } else if (action.type === 'card/move') {
        if (activeBefore) await reloadBoard(activeBefore);
      } else if (action.type === 'board/delete') {
        await loadBoards();
      }
    } catch (err) {
      console.debug('[nello:api]', action.type, 'failed:', err);
      if (err instanceof api.ApiError) {
        setToast(toLocalizedErrorMessage(i18n.t.bind(i18n), err, 'errors.generic'));
      } else {
        setToast(i18n.t('errors.apiActionFailed', { action: action.type.replace('/', ' ') }));
      }
      if (api.getToken()) {
        await refreshBoardList();
        if (activeBefore) await reloadBoard(activeBefore);
      }
    }
  }, [loadBoards, reloadBoard, refreshBoardList]);

  return (
    <StoreCtx.Provider value={{ state, dispatch, apiDispatch, loadBoards, reloadBoard, selectBoard, refreshBoardList, toast, clearToast, searchQuery, setSearchQuery }}>
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
