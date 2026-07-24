# List Management — Spec

## Purpose

Allow users to create, rename, delete, and reorder lists (columns) within a board.

## Requirements

### Requirement: List header action menu
The system SHALL show a compact list action menu trigger in each list header instead of a direct delete button. The trigger MUST be labeled as list actions for assistive technology and MUST open a popup menu containing list lifecycle actions.

#### Scenario: Open list action menu
- **WHEN** the user activates the `...` list action button in a list header
- **THEN** a popup menu opens for that list and includes an `Archive` action

#### Scenario: Menu interactions do not start list dragging
- **WHEN** the user clicks or uses the keyboard on the list action button or popup menu
- **THEN** the list does not start a drag interaction

### Requirement: List archival
The system SHALL allow the user to archive a list from the list action menu. Archiving a list MUST remove it from the active board view without deleting the list record or its cards.

#### Scenario: Archive a list with cards
- **WHEN** the user archives list "Backlog" containing 3 cards
- **THEN** the list "Backlog" no longer appears on the active board
- **AND** the archived list record and its 3 cards remain persisted

#### Scenario: Archive menu closes after action
- **WHEN** the user chooses `Archive` from a list action menu
- **THEN** the popup menu closes

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
The system SHALL support hard deletion of a list after an explicit confirmation where that destructive operation is exposed. Deleting a list MUST also remove all cards it contains. The primary list header lifecycle action SHALL be archive, not direct deletion.

#### Scenario: Delete a list with cards
- **WHEN** the user deletes list "Backlog" containing 3 cards and confirms
- **THEN** the list and its 3 cards are removed and other lists keep their order

### Requirement: List reordering
The system SHALL allow the user to change the order of visible, non-archived lists within a board, and the new order MUST be reflected immediately. Archived lists MUST NOT appear as reorder targets and MUST NOT be restored by a reorder operation.

#### Scenario: Move a list
- **WHEN** the user drags list "Done" from the last position to the first position
- **THEN** "Done" is displayed as the first list and the relative order of the other visible lists is preserved

#### Scenario: Reorder does not restore archived list
- **WHEN** the user reorders visible lists on a board that also contains an archived list
- **THEN** the archived list remains absent from the active board view
