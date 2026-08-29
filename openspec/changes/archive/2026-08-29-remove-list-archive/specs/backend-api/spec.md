## MODIFIED Requirements

### Requirement: Board CRUD endpoints

The system SHALL provide endpoints to create, read, update, and delete boards. Boards are scoped to the authenticated user and any shared members. Board summary and detail responses MUST include only the lists currently stored for the board, since lists cannot be archived.

#### Scenario: Create a board

- **WHEN** an authenticated user sends `POST /api/boards` with `{id, name}`
- **THEN** a board is created, scoped to that user as owner, and returned as `{id, name, listIds, isShared, isOwner}` with status 201

#### Scenario: List all boards

- **WHEN** an authenticated user sends `GET /api/boards`
- **THEN** the system returns all boards the user owns or is a member of, sorted alphabetically by name, each as `{id, name, listIds, isShared, isOwner}`

#### Scenario: Get a single board with lists

- **WHEN** an authenticated user sends `GET /api/boards/:id` for a board they own or are a member of
- **THEN** the system returns `{id, name, lists: [{id, name, cards: [{id, title, description, modifiedBy}]}]}` with status 200

#### Scenario: Rename a board

- **WHEN** an authenticated user sends `PATCH /api/boards/:id` with `{name}` for a board they own or are a member of
- **THEN** the board name is updated and the updated board is returned with status 200

#### Scenario: Rename shared board without `$` suffix

- **WHEN** an authenticated user sends `PATCH /api/boards/:id` with a name not ending in `$` for a board whose current name ends in `$`
- **THEN** the system returns status 409

#### Scenario: Delete a board

- **WHEN** an authenticated user sends `DELETE /api/boards/:id` for a board they own
- **THEN** the board and all its lists and cards are deleted, returning status 204

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
- **THEN** a list is created in that board after the existing lists and returned as `{id, boardId, name, cardIds}` with status 201

#### Scenario: Rename a list

- **WHEN** an authenticated user sends `PATCH /api/lists/:id` with `{name}` for a list in a board they can access
- **THEN** the list name is updated and returned with status 200

#### Scenario: Delete a list

- **WHEN** an authenticated user sends `DELETE /api/lists/:id` for a list in a board they can access
- **THEN** the list and all its cards are deleted, returning status 204

#### Scenario: Archive a list

- **WHEN** an authenticated user sends `POST /api/lists/:id/archive` for a list in a board they can access
- **THEN** the list and all its cards are deleted and status 204 is returned

#### Scenario: Archive cannot access another user's list

- **WHEN** an authenticated user sends `POST /api/lists/:id/archive` for a list on a board they cannot access
- **THEN** the system returns status 404

#### Scenario: Reorder lists

- **WHEN** an authenticated user sends `PUT /api/boards/:id/lists/reorder` with `{listIds: ["id3", "id1", "id2"]}` for a board they can access
- **THEN** the lists currently on the board are reordered to match the given ID sequence and status 200 is returned

#### Scenario: Reorder ignores archived lists

- **WHEN** an authenticated user sends a list reorder request whose `listIds` includes ids of lists that are not on the board (e.g. already archived lists)
- **THEN** only the lists currently on the board are reordered and status 200 is returned
