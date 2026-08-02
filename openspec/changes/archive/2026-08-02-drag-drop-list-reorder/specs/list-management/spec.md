## MODIFIED Requirements

### Requirement: List reordering
The system SHALL allow the user to change the order of visible, non-archived lists within a board by initiating a drag from the list's dedicated drag handle, and the new order MUST be reflected immediately. Archived lists MUST NOT appear as reorder targets, MUST NOT be restorable by a reorder operation, and MUST NOT render a drag handle. Pointer interactions on list header elements other than the drag handle — including the list title and the list action menu — MUST NOT start a list drag.

#### Scenario: Move a list via the drag handle
- **WHEN** the user grabs list "Done" by its drag handle and drops it from the last position to the first position
- **THEN** "Done" is displayed as the first list and the relative order of the other visible lists is preserved

#### Scenario: Reorder does not restore archived list
- **WHEN** the user reorders visible lists on a board that also contains an archived list
- **THEN** the archived list remains absent from the active board view and no drag handle is rendered for it

#### Scenario: Header controls do not start a drag
- **WHEN** the user presses and drags starting on the list title or the `...` list action button (rather than the drag handle)
- **THEN** no list drag is initiated and the list order is unchanged

## ADDED Requirements

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
