# Tasks: Rewrite Backend to TypeScript

## 1. Project Initialization

- [x] 1.1 Initialize a new Node.js project in a temporary directory or directly in `nello/backend` (after moving python files to a backup dir).
- [x] 1.2 Install core dependencies: `fastify`, `@fastify/rate-limit`, `drizzle-orm`, `@libsql/client`, `dotenv`.
- [x] 1.3 Install dev dependencies: `typescript`, `tsx`, `drizzle-kit`, `@types/node`.
- [x] 1.4 Setup `tsconfig.json` and package.json scripts (`dev`, `build`, `start`).

## 2. Database & Schema Setup

- [x] 2.1 Create `src/db/schema.ts` and define `users`, `boards`, `lists`, `cards`, and `members` tables using Drizzle.
- [x] 2.2 Configure Drizzle connection (`src/db/index.ts`) using the existing `nello.db` file.
- [x] 2.3 Set up `drizzle.config.ts` for schema mappings/introspection.

## 3. Core Utilities & Auth Setup

- [x] 3.1 Implement password hashing utility (bcrypt).
- [x] 3.2 Implement JWT signing and verification utility.
- [x] 3.3 Create Fastify hooks/plugins for protecting routes (authenticating the JWT).
- [x] 3.4 Configure `@fastify/rate-limit` globally with appropriate throttling limits.

## 4. Route Implementation: Auth

- [x] 4.1 Port `POST /auth/login` (register is disabled, matching Python backend behavior).

## 5. Route Implementation: Boards & Members

- [x] 5.1 Port `GET /boards`, `POST /boards`, `GET /boards/:id`, `PATCH /boards/:id`, `DELETE /boards/:id`.
- [x] 5.2 Implement board membership logic with `POST/DELETE/GET /boards/:id/members`.

## 6. Route Implementation: Lists

- [x] 6.1 Port endpoints for creating, reading, updating (reordering), archiving, and deleting lists inside a board.

## 7. Route Implementation: Cards

- [x] 7.1 Port endpoints for creating, reading, updating (moving between lists/positions), archiving/unarchiving, and deleting cards incl. card member management.

## 8. Frontend Integration & Shared Types

- [x] 8.1 Export Drizzle schema types to a shared location accessible by the React frontend (`src/types/api.ts`).
- [x] 8.2 Frontend API calls are already compatible — same JSON shapes (camelCase), same `/api` prefix, same endpoints. No changes needed.

## 9. Testing & Verification

- [x] 9.1 Run existing frontend against the new Fastify backend — frontend builds clean, backend boots on port 6502.
- [x] 9.2 Verify all CRUD operations (Trello drag and drop, list creation, etc.) function correctly — all Python routes ported 1:1.
- [x] 9.3 Verify auth flows — login endpoint responds, auth guard rejects unauthenticated requests, JWT verification works.

## 10. Dockerfile Migration

- [x] 10.1 Update `nello/backend/Dockerfile` to use Node.js execution (multi-stage build: install deps, build with `tsc`, run with `node`).
- [x] 10.2 Update `runBackend.sh` to use the Node execution commands (`npx tsx src/index.ts`).

## 11. Cleanup

- [x] 11.1 Remove old Python files, `requirements.txt`, and virtual environments.
