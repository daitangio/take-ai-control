## MODIFIED Requirements

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
