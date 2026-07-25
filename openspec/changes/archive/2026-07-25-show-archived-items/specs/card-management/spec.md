## ADDED Requirements

### Requirement: Card unarchive
The system SHALL allow a user with board access to unarchive a previously archived card. Unarchiving a card SHALL remove the archive marker and move the card to a specified target list at the bottom position. The system SHALL accept a target list ID so the card can be restored to a list different from the one it was archived from.

#### Scenario: Unarchive a card to a target list
- **WHEN** a user unarchives card "Fix login bug" (archived from "Backlog") with target list "Doing"
- **THEN** the archive marker for that card is removed and the card appears at the bottom of list "Doing"

#### Scenario: Unarchive a card to its original list
- **WHEN** a user unarchives card "Update docs" (archived from "Doing") with target list "Doing"
- **THEN** the archive marker is removed and the card appears at the bottom of list "Doing"

#### Scenario: Unarchive non-existent card
- **WHEN** a user attempts to unarchive a card that does not exist or is not archived
- **THEN** the system responds with a 404 error

#### Scenario: Unarchive to non-existent list
- **WHEN** a user attempts to unarchive a card with a target list ID that does not exist
- **THEN** the system responds with a 404 error

#### Scenario: Unarchive requires board access
- **WHEN** a user without access to the target list's board attempts to unarchive a card
- **THEN** the system responds with a 404 error

#### Scenario: Unarchive idempotently
- **WHEN** the unarchive operation is submitted more than once for the same card
- **THEN** the first request succeeds and subsequent requests respond with 404

### Requirement: List archived cards for a board
The system SHALL provide an endpoint to list all archived cards for a given board, including archival metadata: the card's original list ID, the user who archived it, and the archive timestamp.

#### Scenario: List archived cards for a board with archived cards
- **WHEN** a user requests archived cards for a board that has 3 archived cards
- **THEN** the response contains 3 card objects, each with id, title, description, due date, original list ID, archived by user ID and email, and archive timestamp

#### Scenario: List archived cards for a board with no archived cards
- **WHEN** a user requests archived cards for a board that has no archived cards
- **THEN** the response contains an empty array

#### Scenario: List archived cards requires board access
- **WHEN** a user without board access requests archived cards
- **THEN** the system responds with a 404 error

#### Scenario: Archived cards are ordered by archive date
- **WHEN** a user requests archived cards for a board
- **THEN** the response lists cards in descending order of archive timestamp (most recently archived first)
