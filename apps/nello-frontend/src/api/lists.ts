import { api } from './client'
import type { BoardList } from '../types'

export const listsApi = {
  getAll: (boardId: string) => api.get<BoardList[]>(`/boards/${boardId}/lists`),
  create: (boardId: string, name: string) => api.post<BoardList>(`/boards/${boardId}/lists`, { name }),
  rename: (boardId: string, listId: string, name: string) =>
    api.patch<BoardList>(`/boards/${boardId}/lists/${listId}`, { name }),
  delete: (boardId: string, listId: string) => api.delete(`/boards/${boardId}/lists/${listId}`),
}
