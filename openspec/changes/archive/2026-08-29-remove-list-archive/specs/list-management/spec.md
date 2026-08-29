## MODIFIED Requirements

### Requirement: List archival
The system SHALL allow the user to archive a list from the list action menu. Archiving a list MUST remove it from the active board view and delete the list together with all its cards.

#### Scenario: Archive a list with cards
- **WHEN** the user archives list "Backlog" containing 3 cards
- **THEN** the list "Backlog" no longer appears on the active board
- **AND** the list record and its 3 cards are deleted

#### Scenario: Archive menu closes after action
- **WHEN** the user chooses `Archive` from a list action menu
- **THEN** the popup menu closes
