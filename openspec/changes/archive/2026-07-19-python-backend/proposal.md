## Why

The nello frontend currently persists all board data to localStorage, which means state is locked to a single browser and cannot be shared. Adding a Python backend with user accounts enables multi-device access, multi-user collaboration, and makes the demo match how a real Trello clone works.

## What Changes

- New Python 3 FastAPI server under `nello/backend/` serving a REST API
- SQLite database for persistent, server-side storage of all boards, lists, and cards
- JWT-based user authentication (register, login, token verification)
- Frontend `Storage` interface replaced with an API client that talks to the backend
- Boards, lists, and cards are scoped to the authenticated user
- Alphabetical board ordering (no reorder endpoint)
- Frontend generates all entity IDs (`crypto.randomUUID()`), backend accepts them
- Error handling: toast notifications in UI, `console.debug` trace in browser, Python `logging` on server
- pytest test suite with in-memory SQLite

## Capabilities

### New Capabilities

- `backend-api`: REST API under `/api/` providing CRUD endpoints for boards, lists, and cards, scoped to the authenticated user
- `user-auth`: JWT-based registration and login with bcrypt password hashing
- `data-persistence`: Server-side SQLite storage replacing localStorage, with normalized tables, cascade deletes, and position-based ordering for lists and cards

### Modified Capabilities

- `board-persistence`: Storage moves from browser localStorage to the backend API. State is now tied to a user account, persists across devices, and is network-dependent. The frontend loads state on app start from the API instead of from localStorage.

## Impact

- New code under `nello/backend/` (FastAPI, routers, services, SQL, tests)
- New Python dependencies: `fastapi`, `uvicorn`, `python-jose`, `passlib`, `pytest`, `httpx`
- Frontend changes: new `api.ts` module, auth UI (login/register), async action dispatching, loading/error states in components — but the reducer and component structure remain unchanged
- Frontend `storage.ts` replaced by the API client; the `Storage` interface may be adapted or retired
- No changes to the template tooling (`bin/`, `etc/`, `.devcontainer/`), Dockerfile, or other projects
