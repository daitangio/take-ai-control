/**
 * API client for the nello backend.
 *
 * All entity endpoints require a JWT Bearer token set via `setToken()`.
 * On auth failures the global token is cleared automatically.
 */

const BASE_URL = "/api";

let token: string | null = null;
let unauthorizedHandler: (() => void) | null = null;

export function setToken(t: string | null) {
  token = t;
}

export function getToken(): string | null {
  return token;
}

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

async function fetchWithAuth<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    if (res.status === 401) {
      setToken(null);
      unauthorizedHandler?.();
    }
    const body = await res.text();
    const err = new Error(
      `API ${options.method || "GET"} ${path} failed (${res.status}): ${body}`,
    );
    console.debug("[nello:api]", err.message);
    throw err;
  }

  if (res.status === 204) return undefined as T;
  return res.json() as T;
}

// ── Auth ────────────────────────────────────────────

interface TokenResponse {
  access_token: string;
  token_type: string;
}

export function register(email: string, password: string) {
  return fetchWithAuth<TokenResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function login(email: string, password: string) {
  return fetchWithAuth<TokenResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

// ── Boards ──────────────────────────────────────────

export interface BoardBrief {
  id: string;
  name: string;
  listIds: string[];
  isShared: boolean;
  isOwner: boolean;
}

export interface CardBrief {
  id: string;
  title: string;
  description: string;
  modifiedBy: string | null;
  modifiedByEmail: string | null;
  isModifiedByCurrentUser: boolean | null;
}

export interface MemberResponse {
  id: string;
  email: string;
}

export interface ListBrief {
  id: string;
  name: string;
  cards: CardBrief[];
}

export interface BoardDetail {
  id: string;
  name: string;
  lists: ListBrief[];
}

export function getBoards() {
  return fetchWithAuth<BoardBrief[]>("/boards");
}

export function createBoard(id: string, name: string) {
  return fetchWithAuth<BoardBrief>("/boards", {
    method: "POST",
    body: JSON.stringify({ id, name }),
  });
}

export function getBoard(boardId: string) {
  return fetchWithAuth<BoardDetail>(`/boards/${boardId}`);
}

export function updateBoard(boardId: string, name: string) {
  return fetchWithAuth<BoardBrief>(`/boards/${boardId}`, {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
}

export function deleteBoard(boardId: string) {
  return fetchWithAuth<void>(`/boards/${boardId}`, { method: "DELETE" });
}

// ── Lists ───────────────────────────────────────────

export interface ListResponse {
  id: string;
  boardId: string;
  name: string;
  cardIds: string[];
}

export function createList(id: string, boardId: string, name: string) {
  return fetchWithAuth<ListResponse>("/lists", {
    method: "POST",
    body: JSON.stringify({ id, boardId, name }),
  });
}

export function updateList(listId: string, name: string) {
  return fetchWithAuth<ListResponse>(`/lists/${listId}`, {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
}

export function deleteList(listId: string) {
  return fetchWithAuth<void>(`/lists/${listId}`, { method: "DELETE" });
}

export function reorderLists(boardId: string, listIds: string[]) {
  return fetchWithAuth<void>(`/boards/${boardId}/lists/reorder`, {
    method: "PUT",
    body: JSON.stringify({ listIds }),
  });
}

// ── Cards ───────────────────────────────────────────

export interface CardResponse {
  id: string;
  listId: string;
  title: string;
  description: string;
  modifiedBy: string | null;
  modifiedByEmail: string | null;
  isModifiedByCurrentUser: boolean | null;
}

export function createCard(id: string, listId: string, title: string) {
  return fetchWithAuth<CardResponse>("/cards", {
    method: "POST",
    body: JSON.stringify({ id, listId, title }),
  });
}

export function updateCard(
  cardId: string,
  title: string,
  description: string,
) {
  return fetchWithAuth<CardResponse>(`/cards/${cardId}`, {
    method: "PATCH",
    body: JSON.stringify({ title, description }),
  });
}

export function deleteCard(cardId: string) {
  return fetchWithAuth<void>(`/cards/${cardId}`, { method: "DELETE" });
}

export function moveCard(cardId: string, toListId: string, index: number) {
  return fetchWithAuth<void>(`/cards/${cardId}/move`, {
    method: "PUT",
    body: JSON.stringify({ toListId, index }),
  });
}

// ── Members ──────────────────────────────────────────

export function addMember(boardId: string, email: string) {
  return fetchWithAuth<MemberResponse>(`/boards/${boardId}/members`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function removeMember(boardId: string, memberId: string) {
  return fetchWithAuth<void>(`/boards/${boardId}/members/${memberId}`, {
    method: "DELETE",
  });
}

export function listMembers(boardId: string) {
  return fetchWithAuth<MemberResponse[]>(`/boards/${boardId}/members`);
}
