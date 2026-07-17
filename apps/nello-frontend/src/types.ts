export interface User {
  id: string
  email: string
}

export interface Board {
  id: string
  name: string
  owner: User
  createdAt: string
}

export interface BoardList {
  id: string
  boardId: string
  name: string
  position: number
}

export interface Card {
  id: string
  listId: string
  title: string
  description?: string
  dueDate?: string
  assignee?: User
  position: number
  createdAt: string
}

export type BoardEventType = 'CREATED' | 'UPDATED' | 'DELETED' | 'MOVED' | 'SHARED'
export type EntityType = 'BOARD' | 'LIST' | 'CARD'

export interface BoardEvent {
  type: BoardEventType
  entityType: EntityType
  payload: unknown
}
