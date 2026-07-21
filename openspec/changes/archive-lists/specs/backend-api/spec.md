## MODIFIED Requirements

### Requirement: Board CRUD endpoints
The system SHALL provide endpoints to create, read, update, and delete boards for the authenticated user. Board summary and detail responses MUST exclude archived lists from `listIds` and `lists`.

#### Scenario: Create a board
- **WHEN** an authenticated user sends `POST /api/boards` with `{id, name}`
- **THEN** a board is created, scoped to that user, and returned as `{id, name, listIds}` with status 201

#### Scenario: List all boards
- **WHEN** an authenticated user sends `GET /api/boards`
- **THEN** the system returns all boards belonging to that user, sorted alphabetically by name, each as `{id, name, listIds}` with archived lists omitted from `listIds`

#### Scenario: Get a single board with lists
- **WHEN** an authenticated user sends `GET /api/boards/:id` for a board they own
- **THEN** the system returns `{id, name, lists: [{id, name, cardIds}]}` with status 200 and archived lists omitted

#### Scenario: Rename a board
- **WHEN** an authenticated user sends `PATCH /api/boards/:id` with `{name}` for a board they own
- **THEN** the board name is updated and the updated board is returned with status 200

#### Scenario: Delete a board
- **WHEN** an authenticated user sends `DELETE /api/boards/:id` for a board they own
- **THEN** the board and all its lists, archived-list records, and cards are deleted, returning status 204

#### Scenario: Cannot access another user's board
- **WHEN** an authenticated user sends `GET /api/boards/:id` for a board owned by another user
- **THEN** the system returns status 404

### Requirement: List CRUD and reorder endpoints
The system SHALL provide endpoints to create, rename, delete, archive, and reorder lists within a board owned by or shared with the authenticated user. Create, rename, delete, archive, and reorder operations MUST preserve existing authorization behavior.

#### Scenario: Create a list
- **WHEN** an authenticated user sends `POST /api/lists` with `{id, boardId, name}` for a board they own
- **THEN** a list is created in that board after the existing visible lists and returned as `{id, boardId, name, cardIds}` with status 201

#### Scenario: Rename a list
- **WHEN** an authenticated user sends `PATCH /api/lists/:id` with `{name}` for a list in a board they own
- **THEN** the list name is updated and returned with status 200

#### Scenario: Delete a list
- **WHEN** an authenticated user sends `DELETE /api/lists/:id` for a list in a board they own
- **THEN** the list and all its cards are deleted, returning status 204

#### Scenario: Archive a list
- **WHEN** an authenticated user sends `POST /api/lists/:id/archive` for a list in a board they can access
- **THEN** an archived-list record is created, the original list and cards remain stored, and status 204 is returned

#### Scenario: Archive cannot access another user's list
- **WHEN** an authenticated user sends `POST /api/lists/:id/archive` for a list on a board they cannot access
- **THEN** the system returns status 404

#### Scenario: Reorder lists
- **WHEN** an authenticated user sends `PUT /api/boards/:id/lists/reorder` with `{listIds: ["id3", "id1", "id2"]}` for a board they own
- **THEN** the visible lists are reordered to match the given ID sequence and status 200 is returned

#### Scenario: Reorder ignores archived lists
- **WHEN** an authenticated user sends a list reorder request for a board that has archived lists
- **THEN** only visible lists are reordered and archived lists remain archived
