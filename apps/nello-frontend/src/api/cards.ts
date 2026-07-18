import type { Card } from "../types";
import { apiFetch } from "./client";

export const getCards = (boardId: string, listId: string) =>
  apiFetch<Card[]>(`/boards/${boardId}/lists/${listId}/cards`);

export const createCard = (boardId: string, listId: string, title: string) =>
  apiFetch<Card>(`/boards/${boardId}/lists/${listId}/cards`, {
    method: "POST",
    body: JSON.stringify({ title })
  });

export interface UpdateCardInput {
  title?: string;
  description?: string | null;
  dueDate?: string | null;
  assigneeEmail?: string | null;
}

export const updateCard = (boardId: string, listId: string, cardId: string, body: UpdateCardInput) =>
  apiFetch<Card>(`/boards/${boardId}/lists/${listId}/cards/${cardId}`, {
    method: "PATCH",
    body: JSON.stringify(body)
  });

export const moveCard = (
  boardId: string,
  listId: string,
  cardId: string,
  targetListId: string,
  position: number
) =>
  apiFetch<Card>(`/boards/${boardId}/lists/${listId}/cards/${cardId}/move`, {
    method: "POST",
    body: JSON.stringify({ targetListId, position })
  });

export const deleteCard = (boardId: string, listId: string, cardId: string) =>
  apiFetch<null>(`/boards/${boardId}/lists/${listId}/cards/${cardId}`, { method: "DELETE" });
