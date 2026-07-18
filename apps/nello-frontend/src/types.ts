export interface Board {
  id: string;
  name: string;
  owner: { email: string };
  createdAt: string;
}

export interface BoardList {
  id: string;
  name: string;
  position: number;
}

export interface Card {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  assignee?: { email: string };
  position: number;
  list: { id: string };
  createdAt: string;
}

export interface BoardEvent {
  type: string;
  entityType: string;
  payload: unknown;
}
