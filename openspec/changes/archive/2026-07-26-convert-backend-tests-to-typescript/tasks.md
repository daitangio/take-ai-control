## 1. App extraction & test wiring

- [x] 1.1 Extract app assembly from `src/index.ts` into a new `src/app.ts` exporting `buildApp(): Promise<FastifyInstance>` (cors + rate-limit + all route registrations + `/api/health`); no `listen` call inside `buildApp`
- [x] 1.2 Simplify `src/index.ts` to `const app = await buildApp(); await app.listen({ port, host })`; keep existing port/default behavior
- [x] 1.3 Add `vitest` to `nello/backend/package.json` `devDependencies`; add `"test": "vitest run"` and `"test:watch": "vitest"` scripts
- [x] 1.4 Add `vitest.config.ts` (ESM, tsx/native, `include: ["tests/**/*.test.ts"]`, node environment)
- [x] 1.5 Verify `rtk npm run build` still passes and backend boots on port 6502 after the extraction

## 2. Test helpers (conftest replacement)

- [x] 2.1 Create `tests/helpers.ts`: `vi.mock("../src/db/index.js")` factory returning a per-file in-memory libsql (`:memory:`) Drizzle `db` plus passthrough of `Db` type
- [x] 2.2 Add `applySchema(db)` helper that creates all 8 tables from the production `src/db/schema.ts` definitions into the in-memory client (DDL via drizzle-kit/migrations artifact or generated statements)
- [x] 2.3 Add `buildTestApp()` returning `{ app, db }`: calls `buildApp()` with rate-limit configured effectively unlimited for tests; asserts `db` mock is in effect
- [x] 2.4 Add `registerUser(db, email, password)`, `loginUser(app, email, password)` (asserts `200`, returns token), `authHeader(token)`, `authHeadersFor(app, email, password)`
- [x] 2.5 Add `raw(db, sql, params)` raw-SQL accessor backed by the in-memory libsql client `execute`, returning rows keyed by column name (replaces `sqlite3.Row` keyed access)
- [x] 2.6 Add a smoke test asserting the mock is actually wired (write/read a board round-trip via `app.inject`) so a bypassed mock fails loudly

## 3. Auth tests

- [x] 3.1 Create `tests/auth.test.ts`; `describe("Login")`: login success (200, `access_token` present, `token_type==="bearer"`), wrong password `401`, unknown email `401`, missing fields `422`
- [x] 3.2 `describe("Token")`: invalid token to `/api/boards` → `401`; absent token → `401`

## 4. Board tests

- [x] 4.1 Create `tests/boards.test.ts`; `describe("CreateBoard")`: create `201` (`name`, `listIds=[]`), whitespace-name `422`, no-auth `401`
- [x] 4.2 `describe("ListBoards")`: sorted by name, empty returns `[]`, per-user isolation
- [x] 4.3 `describe("GetBoard")`: with lists, not-found `404`, other-user `404`
- [x] 4.4 `describe("UpdateBoard")`: rename, rename other-user `404`
- [x] 4.5 `describe("DeleteBoard")`: cascade (board gone after `204`), delete other-user `404`
- [x] 4.6 `describe("BoardResponse")`: `isShared`/`isOwner` fields (personal false/true, shared with `$` true/true); cannot-remove-`$` from shared board `409`; rename keeping `$` `200`

## 5. List tests

- [x] 5.1 Create `tests/lists.test.ts`; `describe("CreateList")`: create `201`, other-user board `404`, no-auth `401`
- [x] 5.2 `describe("UpdateList")`: rename, rename other-user `404`
- [x] 5.3 `describe("DeleteList")`: cascade-to-cards (board shows 0 lists)
- [x] 5.4 `describe("ArchiveList")`: hides list + raw-SQL rows persist + `list_archive` fields; idempotent (one archive row); other-user `404`
- [x] 5.5 `describe("ReorderLists")`: reorder order matches; reordering ignores archived lists

## 6. Card tests

- [x] 6.1 Create `tests/cards.test.ts`; `describe("CreateCard")`: create `201` (title, `description===""`, `dueDate===null`, `members==[]`, `listId`), whitespace-title `422`, other-user list `404`
- [x] 6.2 `describe("UpdateCard")`: edit title+description; set dueDate; clear dueDate (send `null`); omit dueDate preserves existing; empty-title `422`
- [x] 6.3 `describe("DeleteCard")`: `204` and list's `cards==[]`
- [x] 6.4 `describe("ArchiveCard")`: hides card + raw-SQL rows persist (title/description/due_date) + `card_member` preserved; idempotent (one `card_archive` row); other-user `404`
- [x] 6.5 `describe("CardMembers")`: multi-assign + duplicate dedup (`201` for all duplicates, exactly two `card_member` rows), member-options include owner + board members, reject outsider assignment `409`, remove member `204` (listing empty)
- [x] 6.6 `describe("MoveCard")`: within same list index 0 → `["c-3","c-1","c-2"]`; cross-list; to-empty-list
- [x] 6.7 `describe("EditorMetadata")`: own-create (`isModifiedByCurrentUser===true`, `modifiedByEmail===null`), own in board detail (`modifiedByEmail==="test@example.com"`), other-editor in board detail (`isModifiedByCurrentUser===false`, `modifiedByEmail==="other@example.com"`), legacy null-`modified_by` card (both `null`)

## 7. Member tests

- [x] 7.1 Create `tests/members.test.ts`; `describe("AddMember")`: success `201` (email, `id`), non-shared board `409`, nonexistent user `404`, self `409`, duplicate `409`, non-owner `403` (and non-member `404` for board access)
- [x] 7.2 `describe("RemoveMember")`: `204`; clears `card_member` rows (raw SQL count `0`); nonexistent `404`; non-owner `403`
- [x] 7.3 `describe("ListMembers")`: list one, empty `[]`, non-member `404`
- [x] 7.4 `describe("SharedBoardAccess")`: shared board appears in member listing (`isShared===true`, `isOwner===false`); member cannot delete shared board `403`; member can CRUD cards on shared board (create `201`, `modifiedBy` not null, board detail name); `$` rename rule coverage if not already in boards suite

## 8. Cleanup & verification

- [x] 8.1 Run full `npm test` (or `vitest run`) and confirm green; fix port/completeness gaps surfaced, tracking any genuine behavior diffs as separate fixes (out of scope here)
- [x] 8.2 Run `rtk npm run build` to confirm no TS regressions from `src/app.ts` extraction
- [x] 8.3 Delete obsolete Python test files: `tests/__init__.py`, `conftest.py`, `test_auth.py`, `test_boards.py`, `test_cards.py`, `test_lists.py`, `test_members.py`
- [x] 8.4 Update `nello/NELLO-DIARY.md` (or `LOG.md` WIP entry per CLAUDE.md) with the port result, model used, and what remains; include the run-command for the suite