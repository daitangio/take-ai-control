export interface Card {
  id: string;
  text: string;
}

export interface List {
  id: string;
  title: string;
  cards: Card[];
}

export interface BoardData {
  lists: List[];
}
