# Data Persistence — Spec

## Purpose

Persist all boards, lists, cards, and user accounts in a server-side SQLite database. The database replaces browser localStorage as the source of truth, enabling multi-device access and multi-user isolation.

## Requirements

### Requirement: List archival persistence
The system SHALL persist archived list state in a `list_archive` table. Archiving a list MUST NOT delete the original `list` row and MUST NOT delete cards attached to that list.

#### Scenario: Archive marker is recorded
- **WHEN** a list is archived
- **THEN** a `list_archive` row is stored for that list with archive metadata

#### Scenario: Archived list data remains intact
- **WHEN** a list containing cards is archived
- **THEN** the original list row and its card rows remain in the database

#### Scenario: Archived lists are hidden from board reads
- **WHEN** lists are queried for a board through normal board summary or detail reads
- **THEN** lists with a matching `list_archive` row are not returned

### Requirement: SQLite database initialization

The system SHALL create the SQLite database file and run DDL migrations on startup if the required tables do not exist.

#### Scenario: First startup creates tables

- **WHEN** the server starts and the database file does not exist or tables are missing
- **THEN** the `user`, `board`, `list`, `list_archive`, and `card` tables are created with the correct schema

#### Scenario: Subsequent startups leave data intact

- **WHEN** the server starts and all tables already exist
- **THEN** existing data is preserved and no DDL is re-executed

### Requirement: Normalized data model

The system SHALL store data in separate tables for users, boards, lists, archived-list markers, and cards with foreign key relationships and cascade deletes.

#### Scenario: Board references user

- **WHEN** a board is created
- **THEN** it is stored with a `user_id` foreign key referencing the owning user

#### Scenario: Cascade delete from user

- **WHEN** a user account is deleted
- **THEN** all boards, lists, archived-list records, and cards owned by that user are also deleted

#### Scenario: Cascade delete from board

- **WHEN** a board is deleted
- **THEN** all lists belonging to that board, all archived-list records for those lists, and all cards belonging to those lists are also deleted

#### Scenario: Cascade delete from list

- **WHEN** a list is deleted
- **THEN** its archived-list record and all cards belonging to that list are also deleted

#### Scenario: Archive references list

- **WHEN** a list is archived
- **THEN** its archived marker references the original list row through a foreign key

### Requirement: Position-based ordering

The system SHALL store list and card order using an integer `position` column. Reorder and move operations SHALL update position values atomically within a transaction.

#### Scenario: Lists maintain position

- **WHEN** lists are queried for a board
- **THEN** they are returned ordered by their `position` column ascending

#### Scenario: Cards maintain position

- **WHEN** cards are queried for a list
- **THEN** they are returned ordered by their `position` column ascending

#### Scenario: Reorder updates positions in a transaction

- **WHEN** a list reorder request is processed
- **THEN** all position updates for the affected board's lists are applied atomically

### Requirement: User data isolation

The system SHALL ensure that queries for boards, lists, and cards only return data belonging to the authenticated user.

#### Scenario: User sees only their boards

- **WHEN** a user requests their boards and another user has boards in the database
- **THEN** only the requesting user's boards are returned

#### Scenario: Lists and cards are user-scoped through board ownership

- **WHEN** a user requests a list or card
- **THEN** the system verifies board ownership before returning or modifying the data

### Requirement: Debug logging for data operations

The system SHALL log data mutations (INSERT, UPDATE, DELETE) at DEBUG level including the affected table and the authenticated user ID.

#### Scenario: Creation is logged

- **WHEN** a board, list, or card is created via the API
- **THEN** a DEBUG-level log entry is emitted with the table name, operation, and user ID

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
