## MODIFIED Requirements

### Requirement: Board CRUD endpoints

The system SHALL provide endpoints to create, read, update, and delete boards. Boards are scoped to the authenticated user and any shared members. Board summary and detail responses MUST exclude archived lists from `listIds` and `lists`, and MUST include the applicable board and active-list capacity usage and limits.

#### Scenario: Create a board

- **WHEN** an authenticated user sends `POST /api/boards` with `{id, name}` within their capacity
- **THEN** a board is created, scoped to that user as owner, and returned as `{id, name, listIds, isShared, isOwner}` with status 201

#### Scenario: List all boards

- **WHEN** an authenticated user sends `GET /api/boards`
- **THEN** the system returns all boards the user owns or is a member of, sorted alphabetically by name, each with archived lists omitted from `listIds` and the applicable board and list capacity usage and limits

#### Scenario: Get a single board with lists

- **WHEN** an authenticated user sends `GET /api/boards/:id` for a board they own or are a member of
- **THEN** the system returns the board with non-archived lists, each list's active-card capacity usage and limit, and the board and active-list capacity usage and limits, with status 200

#### Scenario: Rename a board

- **WHEN** an authenticated user sends `PATCH /api/boards/:id` with `{name}` for a board they own or are a member of
- **THEN** the board name is updated and the updated board is returned with status 200

#### Scenario: Rename shared board without `$` suffix

- **WHEN** an authenticated user sends `PATCH /api/boards/:id` with a name not ending in `$` for a board whose current name ends in `$`
- **THEN** the system returns status 409

#### Scenario: Delete a board

- **WHEN** an authenticated user sends `DELETE /api/boards/:id` for a board they own
- **THEN** the board and all its lists, archived-list records, and cards are deleted, returning status 204

#### Scenario: Member cannot delete board

- **WHEN** an authenticated user who is a member (not owner) sends `DELETE /api/boards/:id`
- **THEN** the system returns status 403

#### Scenario: Cannot access another user's board

- **WHEN** an authenticated user sends `GET /api/boards/:id` for a board they neither own nor are a member of
- **THEN** the system returns status 404

### Requirement: Capacity-limit API errors

The API SHALL return status 409 and a distinct stable `error_code` when an operation is refused because it would exceed a board, list, or card capacity limit.

#### Scenario: Capacity rejection is localizable

- **WHEN** a create, restore, or move operation would exceed an applicable capacity limit
- **THEN** the API returns status 409 with a stable error code identifying the exhausted resource type

### Requirement: Capacity usage in successful API responses

Board, list, card, card-move, and card-restore responses SHALL include the usage and limit needed to render an immediate capacity warning for the affected resource.

#### Scenario: Successful mutation reports updated capacity

- **WHEN** a board, list, or card mutation succeeds
- **THEN** its response includes the affected resource's post-operation capacity usage and limit
