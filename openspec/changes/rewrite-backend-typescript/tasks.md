# Tasks: Rewrite Backend to TypeScript

## 1. Project Initialization

- [ ] 1.1 Initialize a new Node.js project in a temporary directory or directly in `nello/backend` (after moving python files to a backup dir).
- [ ] 1.2 Install core dependencies: `fastify`, `@fastify/rate-limit`, `drizzle-orm`, `better-sqlite3` (or `node:sqlite`), `dotenv`.
- [ ] 1.3 Install dev dependencies: `typescript`, `tsx`, `drizzle-kit`, `@types/node`.
- [ ] 1.4 Setup `tsconfig.json` and package.json scripts (`dev`, `build`, `start`).

## 2. Database & Schema Setup

- [ ] 2.1 Create `src/db/schema.ts` and define `users`, `boards`, `lists`, `cards`, and `members` tables using Drizzle.
- [ ] 2.2 Configure Drizzle connection (`src/db/index.ts`) using the existing `nello.db` file.
- [ ] 2.3 Set up `drizzle.config.ts` for schema mappings/introspection.

## 3. Core Utilities & Auth Setup

- [ ] 3.1 Implement password hashing utility (bcrypt).
- [ ] 3.2 Implement JWT signing and verification utility.
- [ ] 3.3 Create Fastify hooks/plugins for protecting routes (authenticating the JWT).
- [ ] 3.4 Configure `@fastify/rate-limit` globally with appropriate throttling limits.

## 4. Route Implementation: Auth

- [ ] 4.1 Port `POST /auth/register` and `POST /auth/login`.

## 5. Route Implementation: Boards & Members

- [ ] 5.1 Port `GET /boards`, `POST /boards`, `GET /boards/:id`, `DELETE /boards/:id`.
- [ ] 5.2 Implement board membership logic if present.

## 6. Route Implementation: Lists

- [ ] 6.1 Port endpoints for creating, reading, updating (reordering), and deleting lists inside a board.

## 7. Route Implementation: Cards

- [ ] 7.1 Port endpoints for creating, reading, updating (moving between lists/positions), and deleting cards.

## 8. Frontend Integration & Shared Types

- [ ] 8.1 Export Drizzle schema types to a shared location accessible by the React frontend.
- [ ] 8.2 Update frontend API calls to ensure compatibility with Fastify payload formats (if they differ from FastAPI).

## 9. Testing & Verification

- [ ] 9.1 Run existing frontend against the new Fastify backend.
- [ ] 9.2 Verify all CRUD operations (Trello drag and drop, list creation, etc.) function correctly.
- [ ] 9.3 Verify auth flows.

## 10. Dockerfile Migration

- [ ] 10.1 Update `nello/backend/Dockerfile` to use Node.js execution (multi-stage build: install deps, build with `tsc`, run with `node`).
- [ ] 10.2 Update `runBackend.sh` (if used) to use the Node execution commands.

## 11. Cleanup

- [ ] 11.1 Remove old Python files, `requirements.txt`, and virtual environments.
