# list-management — Delta Spec

## ADDED Requirements

### Requirement: List creation
The system SHALL allow the user to add a list with a non-empty name to the active board. New lists MUST be appended after existing lists.

#### Scenario: Add a list
- **WHEN** the user adds a list named "To Do" to the active board
- **THEN** the list "To Do" appears as the last list of the board with no cards

#### Scenario: Reject empty list name
- **WHEN** the user submits an empty or whitespace-only list name
- **THEN** no list is created

### Requirement: List renaming
The system SHALL allow the user to rename a list in place. Empty names MUST be rejected, keeping the previous name.

#### Scenario: Rename a list
- **WHEN** the user renames list "To Do" to "Backlog"
- **THEN** the list header shows "Backlog" and its cards are unchanged

### Requirement: List deletion
The system SHALL allow the user to delete a list after an explicit confirmation. Deleting a list MUST also remove all cards it contains.

#### Scenario: Delete a list with cards
- **WHEN** the user deletes list "Backlog" containing 3 cards and confirms
- **THEN** the list and its 3 cards are removed and other lists keep their order

### Requirement: List reordering
The system SHALL allow the user to change the order of lists within a board, and the new order MUST be reflected immediately.

#### Scenario: Move a list
- **WHEN** the user drags list "Done" from the last position to the first position
- **THEN** "Done" is displayed as the first list and the relative order of the other lists is preserved
