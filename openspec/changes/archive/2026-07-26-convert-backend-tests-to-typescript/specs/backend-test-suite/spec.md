## ADDED Requirements

### Requirement: Backend test suite runs against the TypeScript backend
The backend SHALL provide an automated TypeScript test suite under `nello/backend/tests/` (one `.test.ts` file per API module: auth, boards, lists, cards, members) runnable via `npm test` (avitest configuration). The suite SHALL execute without binding a TCP port, using Fastify in-process request injection (`app.inject`), and each test SHALL run against a fresh in-memory database so that no test state leaks between cases.

#### Scenario: Test suite passes from a clean checkout
- **WHEN** a developer runs `npm test` (or `vitest run`) in `nello/backend/`
- **THEN** all tests in `tests/*.test.ts` execute and pass against the TS/Fastify backend against an in-memory database, with zero shared state between tests

#### Scenario: Running tests does not bind a port
- **WHEN** the test suite runs
- **THEN** no test calls `app.listen`; requests are issued via `app.inject(...)` and port 6502 is not touched

### Requirement: Auth tests reproduce Python test_auth behavior
The suite SHALL cover the authentication contract: successful login returns `{ access_token, token_type: "bearer" }`; login with wrong password, unknown email, or missing fields returns `401`/`422` respectively; requests with an invalid or absent `Authorization: Bearer` token to `/api/boards` return `401`.

#### Scenario: Login success returns a bearer token
- **WHEN** a registered user posts valid credentials to `/api/auth/login`
- **THEN** the response is `200` with `access_token` present and `token_type` equal to `"bearer"`

#### Scenario: Login rejected for wrong password
- **WHEN** a registered user posts a wrong password
- **THEN** the response is `401`

#### Scenario: Login rejected for unknown email
- **WHEN** login is attempted with an unregistered email
- **THEN** the response is `401`

#### Scenario: Login rejected for missing fields
- **WHEN** login is posted with an empty body
- **THEN** the response is `422`

#### Scenario: Invalid token is rejected
- **WHEN** `/api/boards` is requested with `Authorization: Bearer invalid-token-here`
- **THEN** the response is `401`

#### Scenario: Absent token is rejected
- **WHEN** `/api/boards` is requested with no `Authorization` header
- **THEN** the response is `401`

### Requirement: Board tests reproduce Python test_boards behavior
The suite SHALL cover board lifecycle and sharing-visibility contracts: create (incl. whitespace-name `422` and unauthenticated `401`), list sorted by name, list empty, per-user isolation, get with lists, get not-found `404`, get other-user board `404`, rename, rename other-user `404`, delete cascade (`204`, board gone), delete other-user `404`, and `BoardResponse` fields (`isShared`, `isOwner`). Shared-board `$`-suffix ownership rules SHALL be covered: removing the `$` returns `409`; renaming while keeping `$` returns `200`.

#### Scenario: Create board
- **WHEN** an authenticated user creates a board
- **THEN** the response is `201` with the board's `name` echoed and `listIds` equal to `[]`

#### Scenario: Whitespace board name is rejected
- **WHEN** a board is created with a whitespace-only name
- **THEN** the response is `422`

#### Scenario: Boards listed sorted by name
- **WHEN** a user creates boards named `Zebra`, `Alpha`, `Middle` and lists them
- **THEN** the response order is `["Alpha", "Middle", "Zebra"]`

#### Scenario: Board listing isolated per user
- **WHEN** two users each create a board and one of them lists boards
- **THEN** only that user's boards are returned

### Requirement: List tests reproduce Python test_lists behavior
The suite SHALL cover list lifecycle and ordering contracts: create (incl. other-user-board `404` and unauthenticated `401`), rename, rename other-user `404`, delete cascade-to-cards, archive (hides lists without deleting rows, idempotent, other-user `404`), reorder, and reorder ignoring archived lists. Archive tests SHALL assert via raw SQL that list/card rows persist and `list_archive` rows are present.

#### Scenario: Delete list cascades to its cards
- **WHEN** a list containing a card is deleted
- **THEN** the response is `204` and fetching the board shows zero lists

#### Scenario: Archive list hides it but keeps rows and is idempotent
- **WHEN** a list with a card is archived twice
- **THEN** both archive responses are `204`, the board/detail/list responses no longer include the list, and raw SQL shows the `list`/`card` rows still exist and exactly one `list_archive` row exists

### Requirement: Card tests reproduce Python test_cards behavior
The suite SHALL cover card lifecycle, archive, members, move, and editor-metadata contracts: create (incl. whitespace-title `422` and other-user-list `404`), edit title/description, set/clear/preserve `dueDate`, empty-title `422`, delete, archive (hides without deleting rows, idempotent, other-user `404`, member assignments preserved), card members (multi-assign with duplicate dedup so `201` for duplicates but only distinct rows in DB, member-options include owner + board members, reject assignment for user outside the board with `409`, remove member), move (same-list index, cross-list, to-empty-list), and editor metadata (`isModifiedByCurrentUser`/`modifiedByEmail` for own-create, own in board detail, other-editor, and legacy null-`modified_by` card).

#### Scenario: Multiple card member assignments dedup to distinct rows
- **WHEN** two distinct members and a duplicate assignment are added to a card
- **THEN** both distinct adds and the duplicate return `201`, the listing shows the two members in order, and raw SQL shows exactly two `card_member` rows

#### Scenario: Card move reorders within the same list
- **WHEN** the third card is moved to index 0 within its list
- **THEN** the board detail shows card ids `["c-3", "c-1", "c-2"]` for that list

#### Scenario: Legacy card with null modified_by exposes no editor metadata
- **WHEN** a card row is inserted directly with no `modified_by`
- **THEN** the board-detail card shows `isModifiedByCurrentUser` as `null` and `modifiedByEmail` as `null`

### Requirement: Member tests reproduce Python test_members behavior
The suite SHALL cover board-member management and shared-board access contracts: add (non-shared board `409`, nonexistent user `404`, self-add `409`, duplicate `409`, non-owner `403`), remove (clears `card_member` rows, nonexistent `404`, non-owner `403`), list (empty, non-member `404`), and shared access (shared board appears in member listing with `isShared` true and `isOwner` false, member cannot delete shared board `403`, member can CRUD cards on shared board, board response fields).

#### Scenario: Removing a board member clears that member's card assignments
- **WHEN** a board member assigned to a card is removed
- **THEN** the response is `204` and raw SQL shows zero `card_member` rows for that card

#### Scenario: Non-owner member cannot add or remove members
- **WHEN** a non-owner board member attempts to add or remove a member
- **THEN** those operations return `403`

### Requirement: Test helpers mirror the Python conftest fixtures
The suite SHALL provide a test helper module exposing equivalents of the Python `conftest.py` fixtures: a fresh per-test in-memory database + app stack, direct user registration against the DB, login returning a token, and an `Authorization: Bearer <token>` header factory. These helpers SHALL be the only way tests obtain apps/clients and auth headers, ensuring uniform isolation.

#### Scenario: Helper provides a fresh database and authenticated client per test
- **WHEN** a test initializes via `buildTestApp()` and `loginUser(app, ...)`
- **THEN** the test sees an empty in-memory database, an authenticated `app.inject` target, and a usable `Authorization` header