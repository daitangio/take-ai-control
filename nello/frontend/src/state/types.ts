export type BoardId = string;
export type ListId = string;
export type CardId = string;

export interface Board {
  id: BoardId;
  name: string;
  listIds: ListId[];
}

export interface List {
  id: ListId;
  name: string;
  cardIds: CardId[];
}

export interface Card {
  id: CardId;
  title: string;
  description: string;
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
  | { type: 'board/create'; boardId: BoardId; name: string }
  | { type: 'board/rename'; boardId: BoardId; name: string }
  | { type: 'board/delete'; boardId: BoardId }
  | { type: 'board/switch'; boardId: BoardId }
  // List
  | { type: 'list/create'; listId: ListId; boardId: BoardId; name: string }
  | { type: 'list/rename'; listId: ListId; name: string }
  | { type: 'list/delete'; listId: ListId }
  | { type: 'list/reorder'; boardId: BoardId; listIds: ListId[] }
  // Card
  | { type: 'card/create'; cardId: CardId; listId: ListId; title: string }
  | { type: 'card/edit'; cardId: CardId; title: string; description: string }
  | { type: 'card/delete'; cardId: CardId }
  | { type: 'card/move'; cardId: CardId; fromListId: ListId; toListId: ListId; index: number };
