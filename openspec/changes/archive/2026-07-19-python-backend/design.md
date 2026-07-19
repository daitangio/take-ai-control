## Context

The nello frontend (React + TypeScript) is complete with a normalized reducer store (`{boards, lists, cards}`) and a `Storage` interface currently backed by `localStorage`. This change adds a Python backend to replace client-side persistence with server-side storage. The frontend's `Storage` interface was designed for this swap. The repo mantra is *less is more*: minimal dependencies, compact setup.

**Constraints:**
- Python 3.14 already available; virtualenv at `nello/backend/.venv` already exists
- SQLite is the only database (no external DB process)
- Frontend generates all entity IDs via `crypto.randomUUID()`
- Boards are ordered alphabetically (no manual reorder)
- Multi-user with JWT auth
- Raw SQL (no ORM)

## Goals / Non-Goals

**Goals:**
- Python 3 FastAPI server with REST API for boards, lists, and cards
- JWT-based authentication (register, login, token-protected routes)
- SQLite persistence with normalized tables and cascade deletes
- pytest test suite with in-memory SQLite
- Frontend API client replacing the localStorage adapter
- Toast error feedback + `console.debug` traces in frontend, `logging` traces in backend

**Non-Goals:**
- Real-time sync, WebSockets, or multi-tab coordination
- Email verification, password reset, OAuth
- Card extras (labels, due dates, attachments, comments, checklists)
- Board sharing or multi-user collaboration on a single board
- Deployment or productionization
- ORM (SQLAlchemy, etc.) — raw SQL only

## Decisions

### 1. Framework: FastAPI

FastAPI provides automatic request validation via Pydantic models, auto-generated OpenAPI docs, async support, and a lightweight feel that matches the "less is more" mantra. Alternatives: Flask (requires more manual plumbing for validation and docs), Django (heavy for a demo, brings an ORM we don't want), Litestar (good but less ecosystem momentum).

### 2. Database: SQLite with raw SQL

SQLite is zero-config, ships with Python's stdlib, and fits the single-process demo. In-memory mode (`:memory:`) enables fast isolated tests. Raw SQL avoids ORM overhead — the data model is small enough (4 tables) that hand-written queries stay readable. A single `db.py` module provides a `get_db` FastAPI dependency that yields a connection per request.

### 3. Auth: JWT access tokens

Stateless tokens mean no session table. FastAPI's dependency injection makes a `get_current_user` dependency that extracts and verifies the token from the `Authorization: Bearer <token>` header. Passwords hashed with `passlib[bcrypt]`. Tokens encoded with `python-jose`. No refresh tokens in v1 — the access token has a generous expiry (24h). Alternatives: session cookies (require state on server, more complex CORS config), API keys (not great for a web UI).

### 4. Database schema: position columns for ordering

Lists and cards use an integer `position` column for ordering within their parent. The API's `reorder` and `move` endpoints accept ordered ID arrays or target positions and update `position` values in a single transaction. This avoids storing JSON arrays in a text column and makes positional queries simple (`ORDER BY position`). Boards use alphabetical ordering (`ORDER BY name ASC`) — no position column needed.

**Schema:**

```sql
CREATE TABLE user (
    id          TEXT PRIMARY KEY,
    email       TEXT UNIQUE NOT NULL,
    password    TEXT NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE board (
    id          TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE list (
    id          TEXT PRIMARY KEY,
    board_id    TEXT NOT NULL REFERENCES board(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    position    INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE card (
    id          TEXT PRIMARY KEY,
    list_id     TEXT NOT NULL REFERENCES list(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    position    INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### 5. API design: RESTful, user-scoped

All entity endpoints are protected by the JWT dependency. Every query includes a `WHERE user_id = ?` clause (joined through board for lists and cards). The API surface:

| Method | Path | Body | Response |
|--------|------|------|----------|
| `POST` | `/api/auth/register` | `{email, password}` | `{access_token}` |
| `POST` | `/api/auth/login` | `{email, password}` | `{access_token}` |
| `GET` | `/api/boards` | — | `[{id, name, listIds}]` |
| `POST` | `/api/boards` | `{id, name}` | `{id, name, listIds}` |
| `GET` | `/api/boards/:id` | — | `{id, name, lists: [...]}` |
| `PATCH` | `/api/boards/:id` | `{name}` | `{id, name}` |
| `DELETE` | `/api/boards/:id` | — | `204` |
| `POST` | `/api/lists` | `{id, boardId, name}` | `{id, boardId, name, cardIds}` |
| `PATCH` | `/api/lists/:id` | `{name}` | `{id, name}` |
| `DELETE` | `/api/lists/:id` | — | `204` |
| `PUT` | `/api/boards/:id/lists/reorder` | `{listIds: [...]}` | `200` |
| `POST` | `/api/cards` | `{id, listId, title}` | `{id, listId, title, description}` |
| `PATCH` | `/api/cards/:id` | `{title, description}` | `{id, title, description}` |
| `DELETE` | `/api/cards/:id` | — | `204` |
| `PUT` | `/api/cards/:id/move` | `{toListId, index}` | `200` |

### 6. Project layout: domain-sliced flat

```
nello/backend/
├── .venv/                    ← already exists
├── requirements.txt
├── src/
│   ├── __init__.py
│   ├── main.py               ← FastAPI app, CORS, router mounting
│   ├── config.py              ← settings (DATABASE_PATH, JWT_SECRET, ...)
│   ├── db.py                  ← get_db dependency, schema init
│   ├── auth/
│   │   ├── __init__.py
│   │   ├── models.py          ← Pydantic request/response schemas
│   │   ├── service.py         ← register, login, verify_token
│   │   └── router.py          ← /api/auth/*
│   ├── boards/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── service.py
│   │   └── router.py
│   ├── lists/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── service.py
│   │   └── router.py
│   └── cards/
│       ├── __init__.py
│       ├── models.py
│       ├── service.py
│       └── router.py
└── tests/
    ├── conftest.py            ← fixtures: test client, in-memory DB, auth header
    ├── test_auth.py
    ├── test_boards.py
    ├── test_lists.py
    └── test_cards.py
```

Each domain follows the same pattern: `models.py` (Pydantic schemas), `service.py` (business logic + raw SQL), `router.py` (FastAPI route handlers calling services). The `db.py` module creates the schema on startup if tables don't exist.

### 7. Frontend integration: async API client replaces Storage

A new `nello/frontend/src/api.ts` module wraps `fetch` with auth headers and JSON parsing. The reducer stays pure — components dispatch actions optimistically and call the API in parallel. On failure, a toast shows the error, `console.debug` logs the trace, and the component can optionally roll back the optimistic update.

**Auth flow:**
- Login/register form → POST `/api/auth/*` → store token in memory + `Authorization` header for subsequent requests
- App start → `GET /api/boards` → populate store
- If token is missing/invalid → show login screen

**Error handling pattern:**
```
try {
  await api.createCard(...)
} catch (err) {
  toast("Failed to create card")
  console.debug("[nello:api] createCard failed:", err)
  // rollback: dispatch(card/delete, cardId)
}
```

### 8. Testing: pytest + in-memory SQLite

Each test gets a fresh in-memory SQLite database. `conftest.py` provides fixtures:
- `client` — FastAPI `TestClient` with overridden `get_db` dependency pointing to `:memory:`
- `auth_header(user)` — pre-built `Authorization` header for a test user

Tests cover: auth (register, login, invalid credentials), board/list/card CRUD (create, read, update, delete with correct user scoping), reorder (list reorder updates positions), move (card across lists), cascade deletes (deleting a board removes its lists and cards), and authorization (user A cannot access user B's boards).

## Risks / Trade-offs

- [SQLite concurrent writes] → SQLite serializes writes; fine for a demo with limited users, but would bottleneck at scale. Mitigation: acceptable for the demo scope.
- [No optimistic rollback in v1] → If an API call fails after an optimistic dispatch, the UI briefly shows invalid state. Mitigation: toast + reload button; full rollback logic can be added later.
- [JWT stored in browser memory] → Token is lost on page refresh, requiring re-login. Mitigation: store token in `localStorage` or `sessionStorage` (common practice for SPAs; accept the XSS risk for demo purposes).
- [Frontend changes touch many components] → Adding auth state and async API calls will touch the store provider, App component, and every CRUD action site. Mitigation: changes are mechanical; the reducer and component structure stay intact.
- [Raw SQL string maintenance] → Without an ORM, schema changes require updating multiple query strings. Mitigation: 4 tables, small surface area; raw SQL is readable and debuggable for this scale.

## Open Questions

- None. All decisions resolved during exploration.
