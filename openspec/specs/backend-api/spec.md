# Backend API — Spec

## Purpose

Provide a REST API under `/api/` for CRUD operations on boards, lists, and cards, scoped to the authenticated user. The API mirrors the frontend reducer's action set so each user operation maps to a single HTTP call.
## Requirements
### Requirement: Board CRUD endpoints

The system SHALL provide endpoints to create, read, update, and delete boards. Boards are scoped to the authenticated user and any shared members. Board summary and detail responses MUST exclude archived lists from `listIds` and `lists`.

#### Scenario: Create a board

- **WHEN** an authenticated user sends `POST /api/boards` with `{id, name}`
- **THEN** a board is created, scoped to that user as owner, and returned as `{id, name, listIds, isShared, isOwner}` with status 201

#### Scenario: List all boards

- **WHEN** an authenticated user sends `GET /api/boards`
- **THEN** the system returns all boards the user owns or is a member of, sorted alphabetically by name, each as `{id, name, listIds, isShared, isOwner}` with archived lists omitted from `listIds`

#### Scenario: Get a single board with lists

- **WHEN** an authenticated user sends `GET /api/boards/:id` for a board they own or are a member of
- **THEN** the system returns `{id, name, lists: [{id, name, cards: [{id, title, description, modifiedBy}]}]}` with status 200 and archived lists omitted

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

### Requirement: List CRUD, archive, and reorder endpoints

The system SHALL provide endpoints to create, rename, delete, archive, and reorder lists within a board accessible by the authenticated user (as owner or member). Create, rename, delete, archive, and reorder operations MUST preserve existing authorization behavior.

#### Scenario: Create a list

- **WHEN** an authenticated user sends `POST /api/lists` with `{id, boardId, name}` for a board they can access
- **THEN** a list is created in that board after the existing visible lists and returned as `{id, boardId, name, cardIds}` with status 201

#### Scenario: Rename a list

- **WHEN** an authenticated user sends `PATCH /api/lists/:id` with `{name}` for a list in a board they can access
- **THEN** the list name is updated and returned with status 200

#### Scenario: Delete a list

- **WHEN** an authenticated user sends `DELETE /api/lists/:id` for a list in a board they can access
- **THEN** the list and all its cards are deleted, returning status 204

#### Scenario: Archive a list

- **WHEN** an authenticated user sends `POST /api/lists/:id/archive` for a list in a board they can access
- **THEN** an archived-list record is created, the original list and cards remain stored, and status 204 is returned

#### Scenario: Archive cannot access another user's list

- **WHEN** an authenticated user sends `POST /api/lists/:id/archive` for a list on a board they cannot access
- **THEN** the system returns status 404

#### Scenario: Reorder lists

- **WHEN** an authenticated user sends `PUT /api/boards/:id/lists/reorder` with `{listIds: ["id3", "id1", "id2"]}` for a board they can access
- **THEN** the visible lists are reordered to match the given ID sequence and status 200 is returned

#### Scenario: Reorder ignores archived lists

- **WHEN** an authenticated user sends a list reorder request for a board that has archived lists
- **THEN** only visible lists are reordered and archived lists remain archived

### Requirement: Card CRUD and move endpoints
The system SHALL provide endpoints to create, edit, delete, and move cards within and across lists owned by the authenticated user. Card create, edit, and board-detail responses SHALL include `modifiedBy`, `modifiedByEmail`, and `isModifiedByCurrentUser` when applicable.

#### Scenario: Create a card
- **WHEN** an authenticated user sends `POST /api/cards` with `{id, listId, title}` for a list in a board they own
- **THEN** a card is created in that list and returned with its editor metadata and status 201

#### Scenario: Edit a card
- **WHEN** an authenticated user sends `PATCH /api/cards/:id` with `{title, description}` for a card they own (through its parent list's board)
- **THEN** the card title and description are updated and returned with editor metadata and status 200

#### Scenario: Board detail includes editor metadata
- **WHEN** an authenticated user retrieves a board containing cards last edited by another user
- **THEN** each applicable card includes that editor's email and `isModifiedByCurrentUser: false`

#### Scenario: Delete a card
- **WHEN** an authenticated user sends `DELETE /api/cards/:id` for a card they own
- **THEN** the card is deleted, returning status 204

#### Scenario: Move a card
- **WHEN** an authenticated user sends `PUT /api/cards/:id/move` with `{toListId, index}` for lists in boards they own
- **THEN** the card is removed from its current list, inserted at the given index in the target list, and status 200 is returned

### Requirement: Card responses include due date and members
The system SHALL include `dueDate` and `members` on card create, card update, and board-detail card responses. `dueDate` SHALL be a date-only string or null. `members` SHALL be a list of assigned member summaries containing user ID and email.

#### Scenario: Board detail includes card metadata
- **WHEN** an authenticated user retrieves a board containing a card with a due date and assigned members
- **THEN** the card response includes `dueDate` and `members`

#### Scenario: Existing card metadata defaults
- **WHEN** an authenticated user retrieves a card created before this change
- **THEN** the card response includes `dueDate: null` and `members: []`

### Requirement: Card due date API
The system SHALL allow an authenticated user with access to a card's parent board to set, change, or clear the card due date.

#### Scenario: Update due date
- **WHEN** an authenticated user updates a card with a valid date-only due date
- **THEN** the API persists the due date and returns the updated card response

#### Scenario: Clear due date
- **WHEN** an authenticated user updates a card with a null due date
- **THEN** the API clears the card due date and returns `dueDate: null`

#### Scenario: Reject inaccessible due date update
- **WHEN** an authenticated user updates the due date for a card in a board they cannot access
- **THEN** the API returns 404

### Requirement: Card archive API
The system SHALL provide `POST /api/cards/:id/archive` for non-destructive card archive. The endpoint SHALL require board access and return 204 when the archive marker exists after the request.

#### Scenario: Archive accessible card
- **WHEN** an authenticated user archives a card in a board they can access
- **THEN** the API returns 204 and hides the card from later board-detail responses

#### Scenario: Archive inaccessible card
- **WHEN** an authenticated user archives a card in a board they cannot access
- **THEN** the API returns 404

#### Scenario: Archive already archived card
- **WHEN** an authenticated user archives the same card again
- **THEN** the API returns 204 and stores only one archive marker

### Requirement: Card member assignment API
The system SHALL provide endpoints to list, add, and remove assigned members for a card. These endpoints SHALL require access to the card's parent board and SHALL only allow assigning users who have access to that board.

#### Scenario: List card members
- **WHEN** an authenticated user with board access requests a card's assigned members
- **THEN** the API returns the assigned members as `{id, email}` entries

#### Scenario: Add card member
- **WHEN** an authenticated user assigns an eligible board user to a card
- **THEN** the API stores the assignment and returns the assigned member summary

#### Scenario: Remove card member
- **WHEN** an authenticated user removes an assigned member from a card
- **THEN** the API deletes that assignment and returns 204

#### Scenario: Reject assignment outside board
- **WHEN** an authenticated user attempts to assign a user who is not the owner or member of the card's parent board
- **THEN** the API rejects the request and does not create an assignment

### Requirement: All entity routes require authentication

The system SHALL reject requests to board, list, and card endpoints that do not include a valid JWT token in the `Authorization` header.

#### Scenario: No token provided

- **WHEN** a request is sent to any `/api/boards`, `/api/lists`, or `/api/cards` endpoint without an `Authorization` header
- **THEN** the system returns status 401

#### Scenario: Invalid or expired token

- **WHEN** a request is sent with an expired or malformed JWT token
- **THEN** the system returns status 401

### Requirement: CORS configuration

The system SHALL include CORS middleware allowing requests from the frontend dev server origin.

#### Scenario: Preflight request

- **WHEN** the frontend sends an `OPTIONS` preflight request to any `/api/` endpoint
- **THEN** the system responds with appropriate `Access-Control-Allow-*` headers

### Requirement: Server-side logging

The system SHALL log each incoming request with method, path, status, and duration at the INFO level, and log errors with full tracebacks at the ERROR level.

#### Scenario: Successful request logging

- **WHEN** a request completes successfully
- **THEN** a log line is emitted with method, path, status code, and duration in milliseconds

#### Scenario: Error request logging

- **WHEN** a request results in an unhandled exception
- **THEN** the full traceback is logged at ERROR level

### Requirement: Member management endpoints

The system SHALL provide endpoints for the board owner to add, remove, and list members on a shared board.

#### Scenario: Add member

- **WHEN** the board owner sends `POST /api/boards/:id/members` with `{email}`
- **THEN** the user is added as a member and returned as `{id, email}` with status 201

#### Scenario: Remove member

- **WHEN** the board owner sends `DELETE /api/boards/:id/members/:user_id`
- **THEN** the member is removed and status 204 is returned

#### Scenario: List members

- **WHEN** an authenticated user with access to the board sends `GET /api/boards/:id/members`
- **THEN** a list of `{id, email}` is returned with status 200

