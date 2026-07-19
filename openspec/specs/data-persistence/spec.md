# Data Persistence — Spec

## Purpose

Persist all boards, lists, cards, and user accounts in a server-side SQLite database. The database replaces browser localStorage as the source of truth, enabling multi-device access and multi-user isolation.

## Requirements

### Requirement: SQLite database initialization

The system SHALL create the SQLite database file and run DDL migrations on startup if the required tables do not exist.

#### Scenario: First startup creates tables

- **WHEN** the server starts and the database file does not exist or tables are missing
- **THEN** the `user`, `board`, `list`, and `card` tables are created with the correct schema

#### Scenario: Subsequent startups leave data intact

- **WHEN** the server starts and all tables already exist
- **THEN** existing data is preserved and no DDL is re-executed

### Requirement: Normalized data model

The system SHALL store data in separate tables for users, boards, lists, and cards with foreign key relationships and cascade deletes.

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

- **WHEN** a list is deleted
- **THEN** all cards belonging to that list are also deleted

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
