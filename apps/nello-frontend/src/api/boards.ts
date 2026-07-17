import { api } from './client'
import type { Board } from '../types'

export const boardsApi = {
  list: () => api.get<Board[]>('/boards'),
  get:  (id: string) => api.get<Board>(`/boards/${id}`),
  create: (name: string) => api.post<Board>('/boards', { name }),
  share:  (id: string, email: string) => api.post(`/boards/${id}/members`, { email }),
  delete: (id: string) => api.delete(`/boards/${id}`),
}
