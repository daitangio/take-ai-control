# Design: TypeScript Backend Rewrite

## Architecture Overview

The backend will be a lightweight TypeScript Node.js application. The stack components are:

*   **Web Framework:** Fastify (Chosen for speed and minimal overhead compared to Express).
*   **Database:** SQLite3 (Local file-based, zero configuration).
*   **ORM:** Drizzle ORM (Provides SQL-like query building with 100% type safety and zero heavy rust binaries like Prisma).
*   **Execution (Dev):** `tsx` or Node 22+ native `--strip-types` to run `.ts` files on the fly.
*   **Execution (Prod):** `tsc` to compile `.ts` into a lightweight `.js` bundle, run directly with Node.js.

## Data Model & ORM (Drizzle)

The current SQL schema from `demo-data.sql` will be ported to a `schema.ts` file using Drizzle.

*   `User`: id, email, password (bcrypt), created_at.
*   `Board`: id, user_id, name, created_at.
*   `List`: id, board_id, name, position, created_at.
*   `Card`: id, list_id, title, description, position.
*   `Member`: (Assumed from typical Trello structure, linking users to boards).

Drizzle will export types (e.g., `type User = typeof users.$inferSelect`) that can be safely shared with the React frontend.

## Security

*   **SQL Injection:** Mitigated entirely by Drizzle's parameterized queries.
*   **Auth:** Passwords will continue to be hashed using `bcrypt` (via `bcryptjs` or native node crypto if suitable). JWT will be used for session tokens, mirroring the current FastAPI `deps.py` and `auth` approach.
*   **DDoS & Rate Limiting:** We will use `@fastify/rate-limit` to provide application-level protection against request bursts and basic brute-force/DDoS attempts.

## Directory Structure

```text
nello/backend/
├── src/
│   ├── index.ts          # Fastify app initialization
│   ├── db/
│   │   ├── index.ts      # DB connection setup
│   │   └── schema.ts     # Drizzle schema definitions
│   ├── routes/
│   │   ├── auth.ts       # Auth endpoints
│   │   ├── boards.ts     # Board endpoints
│   │   ├── lists.ts      # List endpoints
│   │   └── cards.ts      # Card endpoints
│   ├── types/            # Shared types (exported for frontend)
│   └── utils/            # JWT, password hashing, etc.
├── package.json
└── tsconfig.json
```
