## ADDED Requirements

### Requirement: Card effort estimate

The system SHALL store an effort estimate in days for every card. The effort value SHALL be a positive, finite numeric value and SHALL permit fractional days. Newly created cards and cards that existed before effort support SHALL have an effort value of `1` day. A user with board access SHALL be able to set or change the effort from the card detail view.

#### Scenario: New card has default effort

- **WHEN** a user creates a card without specifying effort
- **THEN** the card is returned with `effortDays` equal to `1`

#### Scenario: Existing card receives default effort

- **WHEN** a card created before effort support is loaded after the database migration
- **THEN** the card has `effortDays` equal to `1`

#### Scenario: Set a fractional effort estimate

- **WHEN** a user changes a card's effort to `1.5`
- **THEN** the card stores and returns `effortDays` equal to `1.5`

#### Scenario: Reject zero or negative effort

- **WHEN** a user submits an effort value less than or equal to `0`
- **THEN** the system rejects the update and retains the card's previous effort

#### Scenario: Reject non-finite effort

- **WHEN** a user submits an effort value that is not a finite number
- **THEN** the system rejects the update and retains the card's previous effort

#### Scenario: Preserve effort when omitted from an update

- **WHEN** a card update omits the effort field
- **THEN** the card retains its existing effort value

### Requirement: Card responses and exports include effort

The system SHALL include `effortDays` in card responses returned by card creation, card update, and board-detail retrieval. Board exports SHALL include each card's `effortDays` value.

#### Scenario: Card update response includes effort

- **WHEN** a user updates a card
- **THEN** the response includes the card's current `effortDays` value

#### Scenario: Board detail includes effort

- **WHEN** a user retrieves a board containing cards
- **THEN** every returned card includes its `effortDays` value

#### Scenario: Board export includes effort

- **WHEN** a user exports a board containing cards
- **THEN** every exported card includes its `effortDays` value

## MODIFIED Requirements

### Requirement: Card archive

The system SHALL allow a user with board access to archive a card from the card action popup. Archiving a card SHALL hide it from normal board views without deleting the card row or its related data.

#### Scenario: Archive card

- **WHEN** the user selects Archive from a card action popup
- **THEN** the card disappears from its list in the normal board view

#### Scenario: Archived card remains stored

- **WHEN** a card is archived
- **THEN** its title, description, due date, effort estimate, and assigned members remain persisted

#### Scenario: Archived card stays hidden after reload

- **WHEN** the board is reloaded after a card is archived
- **THEN** the archived card is not included in visible list cards

#### Scenario: Archive card idempotently

- **WHEN** the archive operation is submitted more than once for the same card
- **THEN** the card remains archived and no duplicate archive marker is created
