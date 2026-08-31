# Data Persistence — Spec

## Purpose

Persist all boards, lists, cards, and user accounts in a server-side SQLite database. The database replaces browser localStorage as the source of truth, enabling multi-device access and multi-user isolation.

## Requirements

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

- **WHEN** a list is deleted
- **THEN** all cards belonging to that list are also deleted

#### Scenario: Delete-all references list

- **WHEN** a list is removed via delete-all
- **THEN** the list row and all its card rows are deleted

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

### Requirement: Request and response audit persistence

The system SHALL persist one audit record for every completed Fastify request in the `audit_log` table. Each record SHALL contain the request URL, HTTP method, a JSON `request` payload, a JSON `response` payload, the authenticated user's email in `user_email` when available, and the database-generated log time. The `user_email` column SHALL be `NULL` when the request has no authenticated user. The request and response payloads MUST be recursively redacted before persistence so credentials, invitation keys, bearer tokens, access tokens, and password values are never stored. The system SHALL automatically delete audit records older than four weeks.

#### Scenario: JSON request and response are audited

- **WHEN** a request with a JSON body completes with a JSON response
- **THEN** one `audit_log` row is stored with its URL and method, plus JSON representations of the request body and response body

#### Scenario: Sensitive values are redacted

- **WHEN** a request or response contains sensitive data at any nesting level
- **THEN** the stored JSON retains its structure but replaces the sensitive value with a redacted marker

#### Scenario: Request has no body or response body

- **WHEN** a completed request or response has no body
- **THEN** the corresponding audit column stores the JSON value `null`

#### Scenario: Non-JSON content is not captured raw

- **WHEN** a request or response body is not JSON
- **THEN** the corresponding audit column stores a JSON-safe omission marker rather than the raw content

#### Scenario: Rejected requests are audited

- **WHEN** a request completes with an authentication, validation, rate-limit, or not-found response
- **THEN** an audit record is persisted for that completed request

#### Scenario: Authenticated user email is audited

- **WHEN** a request completes after authentication has assigned a user to the request
- **THEN** the audit record stores that user's email in `user_email`

#### Scenario: No authenticated user email is available

- **WHEN** a request completes without an authenticated user, including a rejected authentication request
- **THEN** the audit record stores `NULL` in `user_email`

#### Scenario: Expired audit records are removed

- **WHEN** audit cleanup runs
- **THEN** audit records whose `log_time` is older than four weeks are deleted and newer records are retained

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

### Requirement: List delete-all
The system SHALL delete a list and all its cards via the delete-all endpoint. Delete-all MUST NOT leave the list row or any of its card rows in the database.

#### Scenario: Delete-all deletes a list with its cards
- **WHEN** a list containing cards is deleted via delete-all
- **THEN** the list row and its card rows are deleted from the database
