## ADDED Requirements

### Requirement: Card due date persistence
The system SHALL persist an optional date-only due date for each card.

#### Scenario: Store due date
- **WHEN** a card due date is set
- **THEN** the `card` row stores that date

#### Scenario: Clear due date
- **WHEN** a card due date is cleared
- **THEN** the `card` row stores no due date

### Requirement: Card archive persistence
The system SHALL store card archive state separately from the `card` table so archived cards remain available for future restore or audit behavior.

#### Scenario: Archive marker is stored
- **WHEN** a card is archived
- **THEN** a `card_archive` marker row is stored with the card ID, list ID, archiving user, and archive timestamp

#### Scenario: Archived card row remains
- **WHEN** a card is archived
- **THEN** the original `card` row remains in the database

### Requirement: Card assignment persistence
The system SHALL store card assignments in a many-to-many join table separate from `board_member`. The assignment table SHALL allow multiple users per card and multiple cards per user.

#### Scenario: Multiple users assigned to one card
- **WHEN** two users are assigned to the same card
- **THEN** two assignment rows exist for that card

#### Scenario: One user assigned to multiple cards
- **WHEN** one user is assigned to two different cards
- **THEN** two assignment rows exist for that user

#### Scenario: Duplicate assignment is prevented
- **WHEN** the same user is assigned to the same card more than once
- **THEN** only one assignment row exists for that card and user

#### Scenario: Card deletion removes assignments
- **WHEN** a card is hard-deleted
- **THEN** its assignment rows are deleted by cascade
