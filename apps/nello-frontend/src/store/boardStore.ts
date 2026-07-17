import { create } from 'zustand'
import type { BoardList, Card, BoardEvent } from '../types'

interface BoardState {
  lists: BoardList[]
  cards: Record<string, Card[]>  // listId → cards
  setLists: (lists: BoardList[]) => void
  setCards: (listId: string, cards: Card[]) => void
  applyEvent: (event: BoardEvent) => void
}

export const useBoardStore = create<BoardState>((set) => ({
  lists: [],
  cards: {},
  setLists: (lists) => set({ lists }),
  setCards: (listId, cards) => set((s) => ({ cards: { ...s.cards, [listId]: cards } })),
  applyEvent: (event) => set((s) => {
    if (event.entityType === 'LIST') {
      const list = event.payload as BoardList
      if (event.type === 'CREATED') return { lists: [...s.lists, list] }
      if (event.type === 'UPDATED') return { lists: s.lists.map(l => l.id === list.id ? list : l) }
      if (event.type === 'DELETED') return { lists: s.lists.filter(l => l.id !== event.payload) }
    }
    if (event.entityType === 'CARD') {
      const card = event.payload as Card
      if (event.type === 'CREATED') {
        const existing = s.cards[card.listId] ?? []
        return { cards: { ...s.cards, [card.listId]: [...existing, card] } }
      }
      if (event.type === 'UPDATED') {
        return { cards: { ...s.cards, [card.listId]: (s.cards[card.listId] ?? []).map(c => c.id === card.id ? card : c) } }
      }
      if (event.type === 'MOVED') {
        const newCards = { ...s.cards }
        for (const lid of Object.keys(newCards)) {
          newCards[lid] = newCards[lid].filter(c => c.id !== card.id)
        }
        newCards[card.listId] = [...(newCards[card.listId] ?? []), card].sort((a, b) => a.position - b.position)
        return { cards: newCards }
      }
      if (event.type === 'DELETED') {
        const newCards = { ...s.cards }
        for (const lid of Object.keys(newCards)) {
          newCards[lid] = newCards[lid].filter(c => c.id !== event.payload)
        }
        return { cards: newCards }
      }
    }
    return s
  }),
}))
