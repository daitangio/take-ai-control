## ADDED Requirements

### Requirement: List archive deletion
The system SHALL delete a list and all its cards when the list is archived. Archiving a list MUST NOT leave the list row or any of its card rows in the database.

#### Scenario: Archiving a list deletes it with its cards
- **WHEN** a list containing cards is archived
- **THEN** the list row and its card rows are deleted from the database

## REMOVED Requirements

### Requirement: List archival persistence

## MODIFIED Requirements

### Requirement: SQLite database initialization

The system SHALL create the SQLite database file and run DDL migrations on startup if the required tables do not exist.

#### Scenario: First startup creates tables

- **WHEN** the server starts and the database file does not exist or tables are missing
- **THEN** the `user`, `board`, `list`, `card`, and `card_archive` tables are created with the correct schema

#### Scenario: Subsequent startups leave data intact

- **WHEN** the server starts and all tables already exist
- **THEN** existing data is preserved and no DDL is re-executed

### Requirement: Normalized data model

The system SHALL store data in separate tables for users, boards, lists, cards, and archived-card markers with foreign key relationships and cascade deletes.

#### Scenario: Board references user

- **WHEN** a board is created
- **THEN** it is stored with a `user_id` foreign key referencing the owning user

#### Scenario: Cascade delete from user

- **WHEN** a user account is deleted
- **THEN** all boards, lists, and cards owned by that user are also deleted

#### Scenario: Cascade delete from board

- **WHEN** a board is deleted
- **THEN** all lists belonging to that board and all cards belonging to those lists are also deleted

#### Scenario: Cascade delete from list

- **WHEN** a list is deleted or archived
- **THEN** all cards belonging to that list are also deleted

#### Scenario: Archive references list

- **WHEN** a list is archived
- **THEN** the list row and all its card rows are deleted
