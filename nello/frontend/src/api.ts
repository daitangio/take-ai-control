/**
 * API client for the nello backend.
 *
 * All entity endpoints require a JWT Bearer token set via `setToken()`.
 * On auth failures the global token is cleared automatically.
 */

const BASE_URL = "/api";

let token: string | null = null;
let unauthorizedHandler: (() => void) | null = null;

type ApiErrorPayload = {
  detail?: string;
  error_code?: string;
};

export class ApiError extends Error {
  status: number;
  errorCode: string | null;

  constructor(message: string, status: number, errorCode: string | null = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errorCode = errorCode;
  }
}

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
    const rawBody = await res.text();
    let payload: ApiErrorPayload | null = null;
    try {
      payload = rawBody ? (JSON.parse(rawBody) as ApiErrorPayload) : null;
    } catch {
      payload = null;
    }

    const detail = payload?.detail ?? rawBody ?? "Request failed";
    const err = new ApiError(
      detail,
      res.status,
      payload?.error_code ?? null,
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

export function register(email: string, keyPass: string, password: string) {
  return fetchWithAuth<TokenResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, keyPass, password }),
  });
}

export function login(email: string, password: string) {
  return fetchWithAuth<TokenResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function changePassword(currentPassword: string, newPassword: string) {
  return fetchWithAuth<{ detail: string }>("/auth/password", {
    method: "PUT",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

// ── Boards ──────────────────────────────────────────

export interface BoardBrief {
  id: string;
  name: string;
  listIds: string[];
  isShared: boolean;
  isOwner: boolean;
  capacity?: { boards: CapacityUsage; lists: CapacityUsage } | null;
}

export interface CapacityUsage { used: number; limit: number; }

export interface CardBrief {
  id: string;
  title: string;
  description: string;
  dueDate: string | null;
  color: string | null;
  members: MemberResponse[];
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
  cardCapacity?: CapacityUsage;
}

export interface BoardDetail {
  id: string;
  name: string;
  lists: ListBrief[];
  capacity?: { boards: CapacityUsage; lists: CapacityUsage } | null;
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
  return fetchWithAuth<void>(`/boards/${boardId}`, { method: "DELETE", body: JSON.stringify({ boardId }) });
}

// ── Lists ───────────────────────────────────────────

export interface ListResponse {
  id: string;
  boardId: string;
  name: string;
  cardIds: string[];
  capacity?: CapacityUsage;
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
  return fetchWithAuth<void>(`/lists/${listId}`, { method: "DELETE", body: JSON.stringify({listId}) });
}

export function archiveList(listId: string) {
  return fetchWithAuth<void>(`/lists/${listId}/archive`, { method: "POST", body: JSON.stringify({listId}) });
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
  dueDate: string | null;
  color: string | null;
  members: MemberResponse[];
  modifiedBy: string | null;
  modifiedByEmail: string | null;
  isModifiedByCurrentUser: boolean | null;
  capacity?: { cards: CapacityUsage };
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
  dueDate?: string | null,
  color?: string | null,
) {
  const body: { title: string; description: string; dueDate?: string | null; color?: string | null } = { title, description };
  if (dueDate !== undefined) body.dueDate = dueDate;
  if (color !== undefined) body.color = color;
  return fetchWithAuth<CardResponse>(`/cards/${cardId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deleteCard(cardId: string) {
  return fetchWithAuth<void>(`/cards/${cardId}`, { method: "DELETE",  body: JSON.stringify({ cardId }) });
}

export function archiveCard(cardId: string) {
  return fetchWithAuth<void>(`/cards/${cardId}/archive`, { method: "POST", body: JSON.stringify({ cardId }) });
}

export function moveCard(cardId: string, toListId: string, index: number) {
  return fetchWithAuth<void>(`/cards/${cardId}/move`, {
    method: "PUT",
    body: JSON.stringify({ toListId, index }),
  });
}

export function listCardMembers(cardId: string) {
  return fetchWithAuth<MemberResponse[]>(`/cards/${cardId}/members`);
}

export function listCardMemberOptions(cardId: string) {
  return fetchWithAuth<MemberResponse[]>(`/cards/${cardId}/member-options`);
}

export function addCardMember(cardId: string, userId: string) {
  return fetchWithAuth<MemberResponse>(`/cards/${cardId}/members`, {
    method: "POST",
    body: JSON.stringify({ userId }),
  });
}

export function removeCardMember(cardId: string, memberId: string) {
  return fetchWithAuth<void>(`/cards/${cardId}/members/${memberId}`, {
    method: "DELETE",
  });
}

// ── Archived Cards ───────────────────────────────────

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

export function getArchivedCards(boardId: string) {
  return fetchWithAuth<ArchivedCard[]>(`/boards/${boardId}/archived-cards`);
}

export function unarchiveCard(cardId: string, targetListId: string) {
  return fetchWithAuth<void>(`/cards/${cardId}/unarchive`, {
    method: "POST",
    body: JSON.stringify({ targetListId }),
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
    body: JSON.stringify({ memberId }) 
  });
}

export function listMembers(boardId: string) {
  return fetchWithAuth<MemberResponse[]>(`/boards/${boardId}/members`);
}
