## MODIFIED Requirements

### Requirement: Card edit triggers API update only when data changes
The system SHALL only send a PATCH request to `/api/cards/:id` when the card title or description has been modified by the user. Opening and closing a card without changes MUST NOT trigger any API call.

#### Scenario: Card opened and closed without edits
- **WHEN** the user opens a card modal and closes it without changing title or description
- **THEN** no PATCH request is sent to `/api/cards/:id`

#### Scenario: Card title edited and saved
- **WHEN** the user opens a card modal, changes the title, and closes the modal
- **THEN** a PATCH request is sent to `/api/cards/:id` with the updated title and current description

#### Scenario: Card description edited and saved
- **WHEN** the user opens a card modal, changes the description, and blurs the textarea
- **THEN** a PATCH request is sent to `/api/cards/:id` with the current title and updated description
