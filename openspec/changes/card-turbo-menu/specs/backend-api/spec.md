## ADDED Requirements

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
