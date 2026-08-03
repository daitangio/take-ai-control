# List Management — Spec

## Purpose

Allow users to create, rename, delete, and reorder lists (columns) within a board.

## Requirements

### Requirement: List header action menu
The system SHALL show a compact list action menu trigger in each list header instead of a direct delete button. The trigger MUST be labeled as list actions for assistive technology and MUST open a popup menu containing list lifecycle actions including archive and viewing archived items.

#### Scenario: Open list action menu
- **WHEN** the user activates the `...` list action button in a list header
- **THEN** a popup menu opens for that list and includes a `Show archived items` action and an `Archive` action

#### Scenario: Menu interactions do not start list dragging
- **WHEN** the user clicks or uses the keyboard on the list action button or popup menu
- **THEN** the list does not start a drag interaction

#### Scenario: Open archived items from menu
- **WHEN** the user selects `Show archived items` from the list action menu
- **THEN** the menu closes and an archived items dialog opens showing all archived cards across the board

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
The system SHALL allow the user to change the order of visible, non-archived lists within a board by initiating a drag from the list's dedicated drag handle, and the new order MUST be reflected immediately. During a list drag, nested card and card-drop targets MUST NOT replace sortable lists as reorder targets. Archived lists MUST NOT appear as reorder targets, MUST NOT be restorable by a reorder operation, and MUST NOT render a drag handle. Pointer interactions on list header elements other than the drag handle — including the list title and the list action menu — MUST NOT start a list drag.

#### Scenario: Move a list via the drag handle
- **WHEN** the user grabs list "Done" by its drag handle and drops it from the last position to the first position
- **THEN** "Done" is displayed as the first list and the relative order of the other visible lists is preserved

#### Scenario: Reorder does not restore archived list
- **WHEN** the user reorders visible lists on a board that also contains an archived list
- **THEN** the archived list remains absent from the active board view and no drag handle is rendered for it

#### Scenario: Header controls do not start a drag
- **WHEN** the user presses and drags starting on the list title or the `...` list action button (rather than the drag handle)
- **THEN** no list drag is initiated and the list order is unchanged

#### Scenario: Nested card targets do not block list reordering
- **WHEN** the browser reports a card or card-drop zone while the user moves the last visible list by its drag handle
- **THEN** the system targets the owning sortable list and persists the requested list order

### Requirement: List drag handle
Each visible, non-archived list SHALL render a single graphic drag handle in its header as the sole trigger for starting a list drag. The handle SHALL have an accessible label identifying it as the drag affordance and SHALL be operable via the keyboard drag support provided by the drag-and-drop library. The handle SHALL visually communicate its drag affordance on hover and focus.

#### Scenario: Drag handle is visible on every visible list
- **WHEN** a board is rendered with visible lists
- **THEN** each visible list header shows exactly one drag handle affordance

#### Scenario: Archived lists have no drag handle
- **WHEN** a list is archived
- **THEN** that list is not shown on the board and no drag handle is rendered for it

#### Scenario: Drag handle is keyboard-focusable and labeled
- **WHEN** the user traverses list header controls with the keyboard
- **THEN** the drag handle receives focus in sequence and exposes an accessible label describing it as the list drag affordance
