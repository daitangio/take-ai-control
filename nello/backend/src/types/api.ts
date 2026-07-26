// Shared types for the nello application.
// These match the API response shapes and can be imported by the frontend.

export interface MemberBrief {
  id: string;
  email: string;
}


export interface CardBrief {
  id: string;
  title: string;
  description: string;
  dueDate: string | null;
  color: string | null;
  members: MemberBrief[];
  modifiedBy: string | null;
  modifiedByEmail: string | null;
  isModifiedByCurrentUser: boolean | null;
}

export interface ListBrief {
  id: string;
  name: string;
  cards: CardBrief[];
}

export interface BoardBrief {
  id: string;
  name: string;
  listIds: string[];
  isShared: boolean;
  isOwner: boolean;
}

export interface BoardDetail {
  id: string;
  name: string;
  lists: ListBrief[];
}

export interface ListResponse {
  id: string;
  boardId: string;
  name: string;
  cardIds: string[];
}

export interface CardResponse {
  id: string;
  listId: string;
  title: string;
  description: string;
  dueDate: string | null;
  color: string | null;
  members: MemberBrief[];
  modifiedBy: string | null;
  modifiedByEmail: string | null;
  isModifiedByCurrentUser: boolean | null;
}

export interface ArchivedCard {
  id: string;
  title: string;
  description: string;
  dueDate: string | null;
  originalListId: string;
  archivedBy: string | null;
  archivedByEmail: string | null;
  archivedAt: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}
