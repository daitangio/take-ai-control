import type { BoardList } from "../types";
import { apiFetch } from "./client";

export const getLists = (boardId: string) => apiFetch<BoardList[]>(`/boards/${boardId}/lists`);

export const createList = (boardId: string, name: string) =>
  apiFetch<BoardList>(`/boards/${boardId}/lists`, {
    method: "POST",
    body: JSON.stringify({ name })
  });

export const updateList = (boardId: string, listId: string, body: { name?: string; position?: number }) =>
  apiFetch<BoardList>(`/boards/${boardId}/lists/${listId}`, {
    method: "PATCH",
    body: JSON.stringify(body)
  });

export const deleteList = (boardId: string, listId: string) =>
  apiFetch<null>(`/boards/${boardId}/lists/${listId}`, { method: "DELETE" });
