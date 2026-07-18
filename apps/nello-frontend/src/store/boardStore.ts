import { create } from "zustand";
import type { Board, BoardEvent, BoardList, Card } from "../types";

interface BoardState {
  board: Board | null;
  lists: BoardList[];
  cards: Record<string, Card[]>;
  setBoard: (board: Board | null) => void;
  setLists: (lists: BoardList[]) => void;
  setCards: (listId: string, cards: Card[]) => void;
  addCard: (card: Card) => void;
  updateCard: (card: Card) => void;
  removeCard: (cardId: string) => void;
  addList: (list: BoardList) => void;
  updateList: (list: BoardList) => void;
  removeList: (listId: string) => void;
  handleBoardEvent: (event: BoardEvent) => void;
}

const sortCards = (cards: Card[]) => [...cards].sort((a, b) => a.position - b.position);
const sortLists = (lists: BoardList[]) => [...lists].sort((a, b) => a.position - b.position);

const upsertCardMap = (cardsMap: Record<string, Card[]>, card: Card) => {
  const next: Record<string, Card[]> = {};
  for (const [listId, cards] of Object.entries(cardsMap)) {
    next[listId] = cards.filter((item) => item.id !== card.id);
  }
  next[card.list.id] = sortCards([...(next[card.list.id] ?? []), card]);
  return next;
};

export const useBoardStore = create<BoardState>((set) => ({
  board: null,
  lists: [],
  cards: {},
  setBoard: (board) => set({ board }),
  setLists: (lists) => set({ lists: sortLists(lists) }),
  setCards: (listId, cards) =>
    set((state) => ({ cards: { ...state.cards, [listId]: sortCards(cards) } })),
  addCard: (card) => set((state) => ({ cards: upsertCardMap(state.cards, card) })),
  updateCard: (card) => set((state) => ({ cards: upsertCardMap(state.cards, card) })),
  removeCard: (cardId) =>
    set((state) => ({
      cards: Object.fromEntries(
        Object.entries(state.cards).map(([listId, cards]) => [listId, cards.filter((card) => card.id !== cardId)])
      )
    })),
  addList: (list) =>
    set((state) => ({
      lists: sortLists([...state.lists.filter((item) => item.id !== list.id), list]),
      cards: state.cards[list.id] ? state.cards : { ...state.cards, [list.id]: [] }
    })),
  updateList: (list) =>
    set((state) => ({
      lists: sortLists(state.lists.map((item) => (item.id === list.id ? list : item)))
    })),
  removeList: (listId) =>
    set((state) => {
      const { [listId]: _removed, ...rest } = state.cards;
      return { lists: state.lists.filter((item) => item.id !== listId), cards: rest };
    }),
  handleBoardEvent: (event) =>
    set((state) => {
      const payload = event.payload as Record<string, unknown> | null;

      if (event.entityType === "LIST" && payload) {
        if (event.type === "CREATED") {
          const list = payload as unknown as BoardList;
          return {
            lists: sortLists([...state.lists.filter((item) => item.id !== list.id), list]),
            cards: state.cards[list.id] ? state.cards : { ...state.cards, [list.id]: [] }
          };
        }
        if (event.type === "UPDATED" || event.type === "MOVED") {
          const list = payload as unknown as BoardList;
          return { lists: sortLists(state.lists.map((item) => (item.id === list.id ? list : item))) };
        }
        if (event.type === "DELETED" && typeof payload.id === "string") {
          const { [payload.id]: _removed, ...rest } = state.cards;
          return { lists: state.lists.filter((item) => item.id !== payload.id), cards: rest };
        }
      }

      if (event.entityType === "CARD" && payload) {
        if (event.type === "CREATED" || event.type === "UPDATED" || event.type === "MOVED") {
          const card = payload as unknown as Card;
          return { cards: upsertCardMap(state.cards, card) };
        }
        if (event.type === "DELETED" && typeof payload.id === "string") {
          return {
            cards: Object.fromEntries(
              Object.entries(state.cards).map(([listId, cards]) => [
                listId,
                cards.filter((card) => card.id !== payload.id)
              ])
            )
          };
        }
      }

      return state;
    })
}));
