## ADDED Requirements

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

## MODIFIED Requirements

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
- **THEN** all lists belonging to the board, all archived-list records for those lists, and all cards belonging to those lists are also deleted

#### Scenario: Cascade delete from list

- **WHEN** a list is deleted
- **THEN** its archived-list record and all cards belonging to that list are also deleted

#### Scenario: Archive references list

- **WHEN** a list is archived
- **THEN** its archived marker references the original list row through a foreign key
