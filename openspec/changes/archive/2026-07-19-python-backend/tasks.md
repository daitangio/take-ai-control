## 1. Backend scaffold

- [x] 1.1 Create `nello/backend/requirements.txt` with dependencies: `fastapi`, `uvicorn[standard]`, `python-jose[cryptography]`, `passlib[bcrypt]`, `pytest`, `httpx`
- [x] 1.2 Install dependencies into `nello/backend/.venv`
- [x] 1.3 Create `nello/backend/src/__init__.py`
- [x] 1.4 Create `nello/backend/src/config.py` with settings: `DATABASE_PATH`, `JWT_SECRET`, `JWT_ALGORITHM`, `JWT_EXPIRATION_HOURS`
- [x] 1.5 Create `nello/backend/src/db.py` with `get_db` dependency (connection per request), `init_db` function that runs DDL on startup
- [x] 1.6 Create `nello/backend/src/main.py` with FastAPI app, CORS middleware, router registration, startup event to call `init_db`

## 2. Auth module

- [x] 2.1 Create `nello/backend/src/auth/__init__.py`
- [x] 2.2 Create `nello/backend/src/auth/models.py` with Pydantic schemas: `RegisterRequest`, `LoginRequest`, `TokenResponse`, `UserResponse`
- [x] 2.3 Create `nello/backend/src/auth/service.py` with `register_user`, `authenticate_user`, `create_token`, `verify_token` functions using raw SQL
- [x] 2.4 Create `nello/backend/src/auth/router.py` with `POST /api/auth/register` and `POST /api/auth/login` endpoints
- [x] 2.5 Create JWT dependency `get_current_user` (FastAPI `Depends` that extracts and verifies the Bearer token, returns user dict)

## 3. Boards module

- [x] 3.1 Create `nello/backend/src/boards/__init__.py`
- [x] 3.2 Create `nello/backend/src/boards/models.py` with Pydantic schemas: `BoardCreate`, `BoardUpdate`, `BoardResponse` (with `listIds`), `BoardDetailResponse` (with nested lists)
- [x] 3.3 Create `nello/backend/src/boards/service.py` with `create_board`, `get_boards`, `get_board`, `update_board`, `delete_board` using raw SQL
- [x] 3.4 Create `nello/backend/src/boards/router.py` with all board endpoints (`GET/POST /api/boards`, `GET/PATCH/DELETE /api/boards/:id`)

## 4. Lists module

- [x] 4.1 Create `nello/backend/src/lists/__init__.py`
- [x] 4.2 Create `nello/backend/src/lists/models.py` with Pydantic schemas: `ListCreate`, `ListUpdate`, `ListResponse` (with `cardIds`), `ReorderRequest`
- [x] 4.3 Create `nello/backend/src/lists/service.py` with `create_list`, `update_list`, `delete_list`, `reorder_lists` using raw SQL (reorder runs in a transaction)
- [x] 4.4 Create `nello/backend/src/lists/router.py` with all list endpoints (`POST /api/lists`, `PATCH/DELETE /api/lists/:id`, `PUT /api/boards/:id/lists/reorder`)

## 5. Cards module

- [x] 5.1 Create `nello/backend/src/cards/__init__.py`
- [x] 5.2 Create `nello/backend/src/cards/models.py` with Pydantic schemas: `CardCreate`, `CardUpdate`, `CardResponse`, `CardMoveRequest`
- [x] 5.3 Create `nello/backend/src/cards/service.py` with `create_card`, `update_card`, `delete_card`, `move_card` using raw SQL (move runs in a transaction, renumbers positions)
- [x] 5.4 Create `nello/backend/src/cards/router.py` with all card endpoints (`POST /api/cards`, `PATCH/DELETE /api/cards/:id`, `PUT /api/cards/:id/move`)

## 6. Backend tests

- [x] 6.1 Create `nello/backend/tests/conftest.py` with fixtures: `client` (TestClient with in-memory DB override), `auth_header` (pre-built JWT header for a test user)
- [x] 6.2 Create `nello/backend/tests/test_auth.py` covering: register, duplicate email, empty password, login success, wrong password, unknown email, invalid token
- [x] 6.3 Create `nello/backend/tests/test_boards.py` covering: create, list sorted by name, get with lists, rename, delete cascades to lists/cards, 404 for other user's board, 401 without token
- [x] 6.4 Create `nello/backend/tests/test_lists.py` covering: create, rename, delete cascades to cards, reorder updates positions, 404 for other user's data, 401 without token
- [x] 6.5 Create `nello/backend/tests/test_cards.py` covering: create, edit title+description, delete, move within list, move across lists, move to empty list, 404 for other user's data, 401 without token

## 7. Frontend API client

- [x] 7.1 Create `nello/frontend/src/api.ts` with typed functions for all endpoints (`createBoard`, `getBoards`, `createCard`, `moveCard`, etc.) and a shared `fetchWithAuth` helper that attaches the JWT Bearer token
- [x] 7.2 Add auth state management: `AuthContext` or a simple module holding the current token and user info
- [x] 7.3 Create `nello/frontend/src/components/LoginForm.tsx` with email/password fields, login/register toggle, and error display
- [x] 7.4 Create `nello/frontend/src/components/AuthGuard.tsx` that shows `LoginForm` when not authenticated, children when authenticated

## 8. Frontend integration

- [x] 8.1 Wire `AuthGuard` into `App.tsx` so unauthenticated users see login before boards
- [x] 8.2 On successful login/register, call `GET /api/boards` to populate the reducer store and set the active board
- [x] 8.3 Replace localStorage `Storage` adapter calls with API calls: on each reducer dispatch that mutates state, call the corresponding API endpoint
- [x] 8.4 Add error handling to all API call sites: `console.debug("[nello:api] <operation> failed:", err)` and toast notification on failure
- [x] 8.5 Remove the `usePersistedReducer` hook and `localStorageAdapter` (or keep them behind a flag for demo purposes)

## 9. End-to-end verification

- [x] 9.1 Start backend with `cd nello/backend && .venv/bin/uvicorn src.main:app --reload` and verify OpenAPI docs at `/docs`
- [ ] 9.2 Start frontend with `cd nello/frontend && npm run dev` and verify login flow, board creation, list/card CRUD, drag-and-drop, and persistence across reload
- [x] 9.3 Run backend tests with `cd nello/backend && .venv/bin/pytest` — all tests pass
- [x] 9.4 Run frontend tests with `cd nello/frontend && npm test` — all existing tests still pass (or are updated)
- [x] 9.5 Run `cd nello/frontend && npm run build` — TypeScript compilation clean, production build succeeds
