## MODIFIED Requirements

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
