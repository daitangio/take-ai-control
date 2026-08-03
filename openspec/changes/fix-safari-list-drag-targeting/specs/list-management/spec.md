## MODIFIED Requirements

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
