import { api } from './client'
import type { Card } from '../types'

export const cardsApi = {
  getAll: (listId: string) => api.get<Card[]>(`/lists/${listId}/cards`),
  create: (listId: string, title: string) => api.post<Card>(`/lists/${listId}/cards`, { title }),
  update: (listId: string, cardId: string, data: Partial<Card>) =>
    api.patch<Card>(`/lists/${listId}/cards/${cardId}`, data),
  move: (listId: string, cardId: string, targetListId: string, position: number) =>
    api.patch(`/lists/${listId}/cards/${cardId}/move`, { targetListId, position }),
  delete: (listId: string, cardId: string) => api.delete(`/lists/${listId}/cards/${cardId}`),
}
