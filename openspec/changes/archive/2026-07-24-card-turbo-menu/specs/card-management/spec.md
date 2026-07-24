## ADDED Requirements

### Requirement: Card action popup
The system SHALL provide a compact action button at the right side of each card tile. Activating the button SHALL open a card action popup with actions for Details, Members, Due date, and Archive.

#### Scenario: Open card action popup
- **WHEN** the user activates the right-side action button on a card
- **THEN** the card action popup opens for that card

#### Scenario: Open details from popup
- **WHEN** the user selects Details from the card action popup
- **THEN** the existing card detail modal opens for that card

#### Scenario: Preserve card body click
- **WHEN** the user clicks the main body of a card tile
- **THEN** the existing card detail modal opens without opening the action popup

#### Scenario: Preserve card dragging
- **WHEN** the user drags a card tile without using the action button or popup
- **THEN** the existing card drag-and-drop behavior is preserved

#### Scenario: Close card action popup
- **WHEN** the user clicks outside the popup or presses Escape
- **THEN** the card action popup closes

### Requirement: Card due date
The system SHALL allow a user with board access to set, change, or clear a date-only due date for a card. The due date MAY be empty.

#### Scenario: Set due date
- **WHEN** the user sets a due date on a card from the card action popup or card detail view
- **THEN** the card stores that due date and displays it when the board reloads

#### Scenario: Change due date
- **WHEN** the user changes an existing card due date
- **THEN** the old due date is replaced by the new due date

#### Scenario: Clear due date
- **WHEN** the user clears a card due date
- **THEN** the card no longer has a due date

#### Scenario: Existing card has no due date
- **WHEN** a card was created before due-date support
- **THEN** it loads with no due date

### Requirement: Card archive
The system SHALL allow a user with board access to archive a card from the card action popup. Archiving a card SHALL hide it from normal board views without deleting the card row or its related data.

#### Scenario: Archive card
- **WHEN** the user selects Archive from a card action popup
- **THEN** the card disappears from its list in the normal board view

#### Scenario: Archived card remains stored
- **WHEN** a card is archived
- **THEN** its title, description, due date, and assigned members remain persisted

#### Scenario: Archived card stays hidden after reload
- **WHEN** the board is reloaded after a card is archived
- **THEN** the archived card is not included in visible list cards

#### Scenario: Archive card idempotently
- **WHEN** the archive operation is submitted more than once for the same card
- **THEN** the card remains archived and no duplicate archive marker is created
