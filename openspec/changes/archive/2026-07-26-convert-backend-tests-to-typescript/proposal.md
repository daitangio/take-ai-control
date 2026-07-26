## Why

The backend was rewritten from Python/FastAPI to TypeScript/Fastify+Drizzle (change `rewrite-backend-typescript`, archived), but its unit tests stayed behind in Python under `nello/backend/tests/`. The backend now has **no executable test suite in the TS project**: the Python tests assert against a FastAPI `TestClient` and an in-memory `sqlite3` connection that no longer exist, so `npm run build` green-lights code that the original suite protected. The TypeScript port left out its tests, and we should port them so the rewrite is actually covered.

## What Changes

- Add a TypeScript test suite under `nello/backend/tests/` (`.test.ts`) mirroring the five existing Python modules: `test_auth`, `test_boards`, `test_lists`, `test_cards`, `test_members`.
- Add test tooling: `vitest` (runner + `fastify.inject` for in-process HTTP) plus an in-memory libsql/Drizzle DB isolated per test.
- Introduce a small set of test helpers (`buildApp`, register/login user, auth header factory) to replicate the Python `conftest.py` fixtures (`client`, `in_memory_db`, `test_user`, `auth_header`, `other_user_token`, `other_auth_header`).
- Preserve every existing assertion and edge case: empty/whitespace validation (`422`), auth (`401`), cross-user isolation (`404`), shared-board `$`-name ownership rules (`403`/`409`), card move/reorder orderings, archive cascade + idempotency, card member dedup, editor metadata (`modifiedByEmail`/`isModifiedByCurrentUser`), legacy-card null-editor behavior.
- Add a `test` script to `package.json` and document the run command.
- **Remove** the obsolete Python test files (`tests/__init__.py`, `conftest.py`, `test_*.py`) once the TS equivalents are green, so the backend ships one test stack.
- **BREAKING** (test-only): nothing user-facing changes; the only removal is the abandoned Python test authoring format.

## Capabilities

### New Capabilities
- `backend-test-suite`: Automated TypeScript unit/integration tests for the Nello backend API covering auth, boards, lists, cards, members, archive, move/reorder, card members, and editor metadata — run via `vitest` against an isolated in-memory database.

### Modified Capabilities
<!-- No spec-level behavior changes: the tests assert existing contracts, they do not redefine them. -->

## Impact

- **Code**: new files under `nello/backend/tests/` (TS), test helper module, removal of legacy Python tests.
- **Dependencies**: adds `vitest` (and `@vitest/coverage-v8` if coverage desired) to `nello/backend/package.json` `devDependencies`; no runtime dependency changes.
- **Build/CI**: new `npm test` / `vitest run` step; `rtk npm run build` (per CLAUDE.md) stays the last gate for frontend, while `npm test` becomes the backend gate.
- **APIs**: none — the suite only exercises existing routes; no route signatures change.
- **Risk**: the in-memory DB isolation strategy must keep tests independent (Drizzle `db` is a module singleton, so isolation requires per-test app+client instantiation rather than FastAPI-style dependency overrides).