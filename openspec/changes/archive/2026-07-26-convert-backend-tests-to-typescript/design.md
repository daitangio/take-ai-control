## Context

The backend was rewritten to TypeScript/Fastify + `@libsql/client` + Drizzle (change `rewrite-backend-typescript`, archived). The original Python test suite under `nello/backend/tests/` (FastAPI `TestClient` + per-test in-memory `sqlite3`) is now orphaned: it cannot run against the TS backend and exercises an API that no longer exists.

Current TS backend shape (relevant constraints):
- `src/index.ts` builds the Fastify app and calls `app.listen` at **module top-level** → importing it for tests would bind port 6502 as a side effect.
- Every route file (`routes/*.ts`) and `middleware/auth.ts` imports `db` directly from `../db/index.js`. `db` is a **module singleton** — there is no FastAPI-style dependency-injection seam.
- `db` is constructed via `drizzle({ client: createClient({ url }) })`, where `url` defaults to `file:./nello.db`.

The Python suite's isolation model: `conftest.py` provided `in_memory_db`, `client`, `test_user`, `auth_header`, `other_user_token`, `other_auth_header`. Each test got a fresh in-memory SQLite database, schema applied via `SCHEMA_SQL` + `apply_migrations`, with `get_db` dependency-overridden. Tests also did raw SQL assertions (`in_memory_db.execute("SELECT ...")`) to assert archived rows, member counts, editor ids, and legacy null rows.

## Goals / Non-Goals

**Goals:**
- A TypeScript test suite (runnable via `vitest`) that reproduces every assertion and scenario in the five Python test modules.
- Per-test isolation: each test starts from a clean in-memory database — no state leaks between tests, matching the Python `in_memory_db` fixture semantics.
- No public-API behavior changes: tests assert existing contracts; if a test fails, that is a regression (or a port-completeness gap in `rewrite-backend-typescript`), not a feature.
- Single test stack for the backend (TS only) after completion.

**Non-Goals:**
- Rewriting or changing route implementations. If a test reveals a behavior gap vs. the Python backend, that is tracked as a separate fix and is out of scope for *this* change.
- Frontend tests (frontend already has its own build gate via `rtk npm run build`).
- End-to-end / browser tests; coverage thresholds are nice-to-have, not required.
- Refactoring the production `db` singleton to a dependency-injection pattern beyond the minimal extraction described below.

## Decisions

### D1 — Test runner: Vitest (with `fastify.inject`)
**Decision:** Use `vitest` as runner/asserter. Exercise HTTP via `app.inject(...)` (Fastify's in-process request injection) rather than binding a real port.
**Why over alternatives:**

- *Pytest* → not viable (TS backend). Vitest is the idiomatic, fast, ESM-native runner for TS and matches the ESM `module: "ESNext"` tsconfig.
- *Jest* → heavier ESM config friction; vitest needs zero babel/ts-jest plumbing under native ESM + `tsx`.
- *Supertest against a listening server* → unnecessary: `fastify.inject` returns a full response without socket I/O, and is the documented Fastify testing primitive. Avoids port contention / flakiness.
**Assertions:** use vitest's built-in `expect` (e.g. `expect(res.statusCode).toBe(201)`), mapping each Python `assert resp.status_code == X` / `assert data["k"] == v` one-to-one.

### D2 — Per-test in-memory DB via `vi.mock` of the `db` module
**Decision:** Replace the `db` module in tests with a per-test Drizzle instance backed by an in-memory libsql client (`:memory:`), using vitest's `vi.mock("../db/index.js", ...)` (hoisted factory). Each test file's `beforeEach` resets/creates the schema.
**Why over alternatives:**
- *Mutate the shared file DB + truncate per test* → cross-test ordering risk; truncation timing is error-prone; conflicts with the real `nello.db` on disk.
- *Refactor production handlers to accept `db` as a parameter* → large blast radius touching every route signature and `app.register` callsite; out of scope for a test port. Mocking is surgical and keeps production code untouched except D3.
- *Run each test in a separate worker/process* → vitest isolates files by default; `vi.mock` scoped per test file + `beforeEach` reset gives the isolated-freshness guarantee the Python `in_memory_db` fixture gave, without process-per-test cost.
**Mechanics:**
- `createClient({ url: ":memory:" })` → `drizzle({ client, schema })`. libsql supports `:memory:` URLs; a fresh client per test file gives a fresh database.
- Apply the production schema to the mocked DB at setup. The authoritative schema source is `src/db/schema.ts` (Drizzle table definitions). To seed it, prefer Drizzle's migrations so the in-memory DB matches what `migrations/` produces on disk; alternatively emit DDL via `drizzle-kit push`-style statements. (See Open Questions.)
- The mock returns `{ db, ...rest }` where `db` is the Drizzle instance; everything else (`Db` type) re-exports passthrough.
- Tests that previously used raw SQL assertions (`SELECT ... FROM card WHERE id = ?`) use a `raw(sql, params)` helper backed by the mocked client's `client.execute(...)` (libsql supports parameterized `execute`), returning rows for field/key access — replacing Python `sqlite3.Row` keyed access.

### D3 — Factor app assembly out of `src/index.ts` into a reusable builder
**Decision:** Extract app construction (cors + rate-limit + route registration + health) into `src/app.ts` exporting `buildApp(): Promise<FastifyInstance>` (no `listen`). `src/index.ts` becomes: `const app = await buildApp(); await app.listen(...)`.
**Why:** tests need a fully wired app but **must not call `listen`**. A shared builder avoids duplicating the ~10-line registration list in test helpers and keeps prod and test apps identical. Without this, the alternative is a parallel app-assembly function inside the tests directory that drifts from production — a maintenance hazard.
**Trade-off:** a small production-code edit. It is behavior-preserving (same plugins, same order, same prefix) and improves testability long-term. Required for D1/D2 to work cleanly.

### D4 — Test helper module replaces `conftest.py`
**Decision:** Create `tests/helpers.ts` (or `tests/setup.ts`) exporting equivalents of the Python fixtures, consumed via vitest-style helper functions (not pytest fixtures). Concretely:
- `buildTestApp()` → fresh `{ app, db }` with mocked in-memory DB + schema applied.
- `registerUser(db, email, password)` → mirrors `src.auth.service.register_user` direct-insertion in the Python `in_memory_db` fixture; tests that need a pre-registered user register `test@example.com` / `secret123` at setup.
- `loginUser(app, email, password)` → `POST /api/auth/login`, returns the token (asserts 200). Replaces `test_user`/`other_user_token`.
- `authHeader(token)` / `authHeadersFor(app, email, password)` → returns `{ Authorization: "Bearer <token>" }`. Replaces `auth_header` / `other_auth_header`.
- `raw(db, sql, params)` → raw SQL accessor (D2).
These are plain async functions invoked inside tests, since vitest's fixture model differs from pytest's; tests call them at the top of each case (mirroring the explicit fixture arguments the Python tests listed).

### D5 — One `.test.ts` file per Python module, scenarios as `it()` blocks
**Decision:** Map each Python `class TestX` → a `describe("X", ...)`, each `test_*` method → an `it("...", async () => ...)`. Keep the same grouping and test names (snake→kebab/phrase) so the suite reads as a faithful port.
**Coverage parity checklist** (must each have a matching test):
- **auth:** login success / wrong password / unknown email / missing fields (422) / invalid token 401 / no token 401.
- **boards:** create (incl. empty-name 422, no-auth 401), list sorted by name, list empty, list per-user isolation, get with lists, get not-found 404, get other-user 404, rename, rename other-user 404, delete cascade, delete other-user 404, response `isShared`/`isOwner` fields, shared-$ rename rules (409 / keep-$ ok).
- **lists:** create (incl. other-user board 404, no-auth 401), rename, rename other-user 404, delete cascade-to-cards, archive hides+keeps rows+idempotent+other-user 404, reorder, reorder ignores archived.
- **cards:** create (incl. empty-title 422, other-user list 404), edit title+desc, set/clear/preserve dueDate, empty-title 422, delete, archive (hides+keeps rows+idempotent+other-user 404 + member preservation), card members (multi-assign+dedup, member-options include owner+board members, reject outsider-detective 409, remove member), move (same-list, cross-list, to-empty-list), editor metadata (own-create, own in board detail, other-editor email, legacy null-editor).
- **members:** add (non-shared board 409, nonexistent user 404, self 409, duplicate 409, non-owner 403), remove (clears card_member rows, nonexistent 404, non-owner 403), list (empty, non-member 404), shared access (appears in member listing with isShared/isOwner, member cannot delete 403, member can CRUD cards, board response fields).

### D6 — Removal of Python tests once green
**Decision:** After the TS suite is fully green and supervised, delete `tests/__init__.py`, `conftest.py`, `test_auth.py`, `test_boards.py`, `test_cards.py`, `test_lists.py`, `test_members.py`. Update `LOG.md` WIP entry noting the port + model.
**Why:** one test stack; the Python files are dead weight that implies a non-existent runtime.

## Risks / Trade-offs

- [Mock fragility] `vi.mock("../db/index.js")` is keyed to the exact relative path used by handlers; if a handler ever imports via an alias/barrel, the mock won't intercept. → Mitigation: keep the documented import path; add a single smoke test (`can write & read a board via mocked db`) that fails loudly if the mock is bypassed.
- [Schema drift] in-memory DB must match production migrations; if `drizzle-kit` migrations diverge from `schema.ts`, tests pass against a DB that differs from prod. → Mitigation: seed from the same migrations artifact prod uses; if a migrations dir is absent (TS backend uses plain `schema.ts`), apply DDL generated from `schema.ts` and add a test asserting `schema.ts` round-trips.
- [Fastify `inject` + rate-limit + cors interactions] `inject` skips network but plugins still run; rate-limit's in-memory bucket could throttle across tests by default. → Mitigation: in `buildTestApp`, register `@fastify/rate-limit` with a high/no limit for the test configuration (or skip it) without altering prod config.
- [Raw-SQL field casing] Drizzle/libsql row keys vs Python `sqlite3.Row` may differ (snake_case columns). → Mitigation: `raw()` returns rows as records keyed by column name; assert on documented column names (`due_date`, `modified_by`, etc.).
- [Top-level `listen` regression risk in D3] → Mitigation: extraction is behavior-preserving; `rtk npm run build` + `npm test` gate it. Backend boot on port 6502 revalidated manually (per CLAUDE.md).
- [Token/validation timing] JWT expiry in tests. → Mitigation: test tokens generated via the real `createToken`; all test interactions are immediate, so default expiry is a non-issue; do not mock JWT.