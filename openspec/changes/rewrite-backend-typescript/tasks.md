# Tasks: Rewrite Backend to TypeScript

1. [ ] **Project Initialization**
   - Initialize a new Node.js project in a temporary directory or directly in `nello/backend` (after moving python files to a backup dir).
   - Install core dependencies: `fastify`, `@fastify/rate-limit`, `drizzle-orm`, `better-sqlite3` (or `node:sqlite`), `dotenv`.
   - Install dev dependencies: `typescript`, `tsx`, `drizzle-kit`, `@types/node`.
   - Setup `tsconfig.json` and package.json scripts (`dev`, `build`, `start`).

2. [ ] **Database & Schema Setup**
   - Create `src/db/schema.ts` and define `users`, `boards`, `lists`, `cards`, and `members` tables using Drizzle.
   - Configure Drizzle connection (`src/db/index.ts`) using the existing `nello.db` file.
   - Set up `drizzle.config.ts` for schema migrations/introspection.

3. [ ] **Core Utilities & Auth Setup**
   - Implement password hashing utility (bcrypt).
   - Implement JWT signing and verification utility.
   - Create Fastify hooks/plugins for protecting routes (authenticating the JWT).
   - Configure `@fastify/rate-limit` globally with appropriate throttling limits.

4. [ ] **Route Implementation: Auth**
   - Port `POST /auth/register` and `POST /auth/login`.

5. [ ] **Route Implementation: Boards & Members**
   - Port `GET /boards`, `POST /boards`, `GET /boards/:id`, `DELETE /boards/:id`.
   - Implement board membership logic if present.

6. [ ] **Route Implementation: Lists**
   - Port endpoints for creating, reading, updating (reordering), and deleting lists inside a board.

7. [ ] **Route Implementation: Cards**
   - Port endpoints for creating, reading, updating (moving between lists/positions), and deleting cards.

8. [ ] **Frontend Integration & Shared Types**
   - Export Drizzle schema types to a shared location accessible by the React frontend.
   - Update frontend API calls to ensure compatibility with Fastify payload formats (if they differ from FastAPI).

9. [ ] **Testing & Verification**
   - Run existing frontend against the new Fastify backend.
   - Verify all CRUD operations (Trello drag and drop, list creation, etc.) function correctly.
   - Verify auth flows.

10. [ ] **Cleanup**
    - Remove old Python files, `requirements.txt`, and virtual environments.
    - Update Dockerfile / `runBackend.sh` to use the Node execution commands.
