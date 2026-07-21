# Board Sharing — Spec

## Purpose

Enable multi-user collaboration on boards. Boards whose name ends with `$` are shared. The board creator (owner) can invite other users by email. Members can read the board and CRUD lists and cards, but cannot delete the board or manage members.

## ADDED Requirements

### Requirement: Shared board signal via `$` suffix

A board whose name ends with `$` SHALL be considered a shared board. The `$` suffix SHALL be permanent — once set, the board cannot be renamed to remove it.

#### Scenario: Create a shared board

- **WHEN** an authenticated user sends `POST /api/boards` with `{id, name: "Team Board$"}`
- **THEN** the board is created with `isShared: true` and `isOwner: true` in the response

#### Scenario: Create a personal board

- **WHEN** an authenticated user sends `POST /api/boards` with `{id, name: "Personal"}`
- **THEN** the board is created with `isShared: false` and `isOwner: true` in the response

#### Scenario: Cannot remove `$` from shared board

- **WHEN** the owner sends `PATCH /api/boards/:id` with `{name: "Team Board"}` (removing the `$`) for a board whose current name ends with `$`
- **THEN** the system returns status 409 with an error message

#### Scenario: Rename shared board keeping `$`

- **WHEN** the owner sends `PATCH /api/boards/:id` with `{name: "New Team$"}` for a board whose current name ends with `$`
- **THEN** the board is renamed and the `$` is preserved

### Requirement: Board member management

The system SHALL allow the board owner to add and remove members by email. Only the owner MAY manage members.

#### Scenario: Add a member by email

- **WHEN** the board owner sends `POST /api/boards/:id/members` with `{email: "other@example.com"}` for a shared board
- **THEN** the user is added as a member and returned as `{id, email}` with status 201

#### Scenario: Add member to non-shared board

- **WHEN** the owner sends `POST /api/boards/:id/members` for a board whose name does not end with `$`
- **THEN** the system returns status 400

#### Scenario: Add non-existent user

- **WHEN** the owner sends `POST /api/boards/:id/members` with an email that does not match any user
- **THEN** the system returns status 404

#### Scenario: Add self as member

- **WHEN** the owner sends `POST /api/boards/:id/members` with their own email
- **THEN** the system returns status 409

#### Scenario: Add duplicate member

- **WHEN** the owner sends `POST /api/boards/:id/members` with an email already a member
- **THEN** the system returns status 409

#### Scenario: Non-owner cannot add members

- **WHEN** a board member sends `POST /api/boards/:id/members`
- **THEN** the system returns status 403

#### Scenario: Remove a member

- **WHEN** the board owner sends `DELETE /api/boards/:id/members/:user_id`
- **THEN** the member is removed and status 204 is returned

#### Scenario: Remove non-existent member

- **WHEN** the board owner sends `DELETE /api/boards/:id/members/:user_id` for a user not on the board
- **THEN** the system returns status 404

#### Scenario: Non-owner cannot remove members

- **WHEN** a board member sends `DELETE /api/boards/:id/members/:user_id`
- **THEN** the system returns status 403

#### Scenario: List members of a shared board

- **WHEN** an authenticated user with access to the board sends `GET /api/boards/:id/members`
- **THEN** the system returns a list of `{id, email}` for all members

### Requirement: Members can access shared boards

Members of a shared board SHALL have read and write access to the board and its lists and cards, equivalent to the owner, except for board deletion and member management.

#### Scenario: Member sees shared boards in listing

- **WHEN** a user who is a member of a shared board sends `GET /api/boards`
- **THEN** the shared board appears in the listing with `isShared: true` and `isOwner: false`

#### Scenario: Member can read shared board details

- **WHEN** a board member sends `GET /api/boards/:id` for a shared board
- **THEN** the full board with lists and cards is returned with status 200

#### Scenario: Member can create lists on shared board

- **WHEN** a board member sends `POST /api/lists` with `{id, boardId, name}` for the shared board
- **THEN** the list is created with status 201

#### Scenario: Member can CRUD cards on shared board

- **WHEN** a board member sends `POST /api/cards` with `{id, listId, title}` for a list in the shared board
- **THEN** the card is created with status 201

#### Scenario: Member cannot delete shared board

- **WHEN** a board member sends `DELETE /api/boards/:id` for a shared board
- **THEN** the system returns status 403

#### Scenario: Non-member cannot access shared board

- **WHEN** an authenticated user who is neither owner nor member sends `GET /api/boards/:id` for a shared board
- **THEN** the system returns status 404
