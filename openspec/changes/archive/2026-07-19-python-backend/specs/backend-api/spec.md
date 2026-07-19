# Backend API — Spec

## Purpose

Provide a REST API under `/api/` for CRUD operations on boards, lists, and cards, scoped to the authenticated user. The API mirrors the frontend reducer's action set so each user operation maps to a single HTTP call.

## ADDED Requirements

### Requirement: Board CRUD endpoints

The system SHALL provide endpoints to create, read, update, and delete boards for the authenticated user.

#### Scenario: Create a board

- **WHEN** an authenticated user sends `POST /api/boards` with `{id, name}`
- **THEN** a board is created, scoped to that user, and returned as `{id, name, listIds}` with status 201

#### Scenario: List all boards

- **WHEN** an authenticated user sends `GET /api/boards`
- **THEN** the system returns all boards belonging to that user, sorted alphabetically by name, each as `{id, name, listIds}`

#### Scenario: Get a single board with lists

- **WHEN** an authenticated user sends `GET /api/boards/:id` for a board they own
- **THEN** the system returns `{id, name, lists: [{id, name, cardIds}]}` with status 200

#### Scenario: Rename a board

- **WHEN** an authenticated user sends `PATCH /api/boards/:id` with `{name}` for a board they own
- **THEN** the board name is updated and the updated board is returned with status 200

#### Scenario: Delete a board

- **WHEN** an authenticated user sends `DELETE /api/boards/:id` for a board they own
- **THEN** the board and all its lists and cards are deleted, returning status 204

#### Scenario: Cannot access another user's board

- **WHEN** an authenticated user sends `GET /api/boards/:id` for a board owned by another user
- **THEN** the system returns status 404

### Requirement: List CRUD and reorder endpoints

The system SHALL provide endpoints to create, rename, delete, and reorder lists within a board owned by the authenticated user.

#### Scenario: Create a list

- **WHEN** an authenticated user sends `POST /api/lists` with `{id, boardId, name}` for a board they own
- **THEN** a list is created in that board and returned as `{id, boardId, name, cardIds}` with status 201

#### Scenario: Rename a list

- **WHEN** an authenticated user sends `PATCH /api/lists/:id` with `{name}` for a list in a board they own
- **THEN** the list name is updated and returned with status 200

#### Scenario: Delete a list

- **WHEN** an authenticated user sends `DELETE /api/lists/:id` for a list in a board they own
- **THEN** the list and all its cards are deleted, returning status 204

#### Scenario: Reorder lists

- **WHEN** an authenticated user sends `PUT /api/boards/:id/lists/reorder` with `{listIds: ["id3", "id1", "id2"]}` for a board they own
- **THEN** the lists are reordered to match the given ID sequence and status 200 is returned

### Requirement: Card CRUD and move endpoints

The system SHALL provide endpoints to create, edit, delete, and move cards within and across lists owned by the authenticated user.

#### Scenario: Create a card

- **WHEN** an authenticated user sends `POST /api/cards` with `{id, listId, title}` for a list in a board they own
- **THEN** a card is created in that list and returned as `{id, listId, title, description: ""}` with status 201

#### Scenario: Edit a card

- **WHEN** an authenticated user sends `PATCH /api/cards/:id` with `{title, description}` for a card they own (through its parent list's board)
- **THEN** the card title and description are updated and returned with status 200

#### Scenario: Delete a card

- **WHEN** an authenticated user sends `DELETE /api/cards/:id` for a card they own
- **THEN** the card is deleted, returning status 204

#### Scenario: Move a card

- **WHEN** an authenticated user sends `PUT /api/cards/:id/move` with `{toListId, index}` for lists in boards they own
- **THEN** the card is removed from its current list, inserted at the given index in the target list, and status 200 is returned

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
