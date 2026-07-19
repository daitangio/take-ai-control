# board-management — Delta Spec

## ADDED Requirements

### Requirement: Board creation
The system SHALL allow the user to create a board by providing a non-empty name. A newly created board SHALL become the active board.

#### Scenario: Create a board
- **WHEN** the user creates a board named "Work"
- **THEN** the board "Work" exists, is shown as active, and contains no lists

#### Scenario: Reject empty board name
- **WHEN** the user submits a board name that is empty or whitespace-only
- **THEN** no board is created and the input remains open for correction

### Requirement: Board renaming
The system SHALL allow the user to rename an existing board. Empty names MUST be rejected, keeping the previous name.

#### Scenario: Rename a board
- **WHEN** the user renames board "Work" to "Work 2026"
- **THEN** the board is displayed as "Work 2026" everywhere it appears

#### Scenario: Reject empty rename
- **WHEN** the user submits an empty name while renaming a board
- **THEN** the board keeps its previous name

### Requirement: Board deletion
The system SHALL allow the user to delete a board after an explicit confirmation. Deleting a board MUST also remove all of its lists and cards.

#### Scenario: Delete a board
- **WHEN** the user deletes board "Work" and confirms
- **THEN** the board and all its lists and cards are removed

#### Scenario: Delete the active board
- **WHEN** the user deletes the currently active board and other boards exist
- **THEN** another existing board becomes active

#### Scenario: Cancel deletion
- **WHEN** the user starts deleting a board but dismisses the confirmation
- **THEN** the board and its contents are unchanged

### Requirement: Board switching
The system SHALL display all existing boards and allow the user to switch the active board.

#### Scenario: Switch active board
- **WHEN** the user selects board "Home" while board "Work" is active
- **THEN** the view shows the lists and cards of "Home"

#### Scenario: No boards yet
- **WHEN** the app is opened and no boards exist
- **THEN** an empty state is shown with a call to action to create the first board
