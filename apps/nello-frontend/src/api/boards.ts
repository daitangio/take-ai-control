import type { Board } from "../types";
import { apiFetch } from "./client";

export const getBoards = () => apiFetch<Board[]>("/boards");

export const createBoard = (name: string) =>
  apiFetch<Board>("/boards", {
    method: "POST",
    body: JSON.stringify({ name })
  });

export const getBoard = (boardId: string) => apiFetch<Board>(`/boards/${boardId}`);

export const renameBoard = (boardId: string, name: string) =>
  apiFetch<Board>(`/boards/${boardId}`, {
    method: "PATCH",
    body: JSON.stringify({ name })
  });

export const deleteBoard = (boardId: string) =>
  apiFetch<null>(`/boards/${boardId}`, { method: "DELETE" });

export const addBoardMember = (boardId: string, email: string) =>
  apiFetch<null>(`/boards/${boardId}/members`, {
    method: "POST",
    body: JSON.stringify({ email })
  });

export const removeBoardMember = (boardId: string, memberEmail: string) =>
  apiFetch<null>(`/boards/${boardId}/members/${encodeURIComponent(memberEmail)}`, {
    method: "DELETE"
  });
