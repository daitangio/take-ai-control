export type BoardId = string;
export type ListId = string;
export type CardId = string;
export type BoardBackground = 'mountain' | 'sea' | 'sport' | null;
export interface CapacityUsage { used: number; limit: number; }

export interface Board {
  id: BoardId;
  name: string;
  background?: BoardBackground;
  listIds: ListId[];
  isShared?: boolean;
  isOwner?: boolean;
  capacity?: { boards: CapacityUsage; lists: CapacityUsage } | null;
}

export interface List {
  id: ListId;
  name: string;
  cardIds: CardId[];
  cardCapacity?: CapacityUsage;
}

export interface Card {
  id: CardId;
  title: string;
  description: string;
  dueDate?: string | null;
  color?: string | null;
  members?: Member[];
  modifiedBy?: string;
  modifiedByEmail?: string | null;
  isModifiedByCurrentUser?: boolean | null;
}

export interface Member {
  id: string;
  email: string;
}

export interface State {
  boards: Record<BoardId, Board>;
  lists: Record<ListId, List>;
  cards: Record<CardId, Card>;
  activeBoardId: BoardId | null;
}

/** Creates an empty initial state. */
export function createInitialState(): State {
  return {
    boards: {},
    lists: {},
    cards: {},
    activeBoardId: null,
  };
}

// ── Actions ────────────────────────────────────────────

export type Action =
  // Board
  | { type: 'board/create'; boardId: BoardId; name: string; background?: BoardBackground; isShared?: boolean; isOwner?: boolean; capacity?: Board['capacity'] }
  | { type: 'board/rename'; boardId: BoardId; name: string; background?: BoardBackground; isShared?: boolean; isOwner?: boolean; capacity?: Board['capacity'] }
  | { type: 'board/background'; boardId: BoardId; background: BoardBackground }
  | { type: 'board/delete'; boardId: BoardId }
  | { type: 'board/switch'; boardId: BoardId }
  | { type: 'board/reload'; boardId: BoardId; background?: BoardBackground; capacity?: Board['capacity']; lists: Array<{ id: ListId; name: string; cardCapacity?: CapacityUsage; cards: Card[] }> }
  | { type: 'boards/refresh'; boards: Array<{ id: BoardId; name: string; background?: BoardBackground; isShared?: boolean; isOwner?: boolean; capacity?: Board['capacity'] }> }
  // List
  | { type: 'list/create'; listId: ListId; boardId: BoardId; name: string; cardCapacity?: CapacityUsage }
  | { type: 'list/rename'; listId: ListId; name: string }
  | { type: 'list/delete'; listId: ListId }
  | { type: 'list/archive'; listId: ListId }
  | { type: 'list/reorder'; boardId: BoardId; listIds: ListId[] }
  // Card
  | { type: 'card/create'; cardId: CardId; listId: ListId; title: string; description?: string; dueDate?: string | null; color?: string | null; members?: Member[]; modifiedBy?: string; modifiedByEmail?: string | null; isModifiedByCurrentUser?: boolean | null }
  | { type: 'card/edit'; cardId: CardId; title: string; description: string; dueDate?: string | null; color?: string | null; members?: Member[]; modifiedBy?: string; modifiedByEmail?: string | null; isModifiedByCurrentUser?: boolean | null }
  | { type: 'card/delete'; cardId: CardId }
  | { type: 'card/archive'; cardId: CardId }
  | { type: 'card/member/add'; cardId: CardId; member: Member }
  | { type: 'card/member/remove'; cardId: CardId; memberId: string }
  | { type: 'card/move'; cardId: CardId; fromListId: ListId; toListId: ListId; index: number }
  | { type: 'card/unarchive'; cardId: CardId; targetListId: ListId }
  // Meta
  | { type: 'store/reset' };
