# Card Management — Spec

## Purpose

Allow users to create, edit, delete, and move cards within and across lists, including drag & drop and keyboard-based movement.

## Requirements

### Requirement: Card creation
The system SHALL allow the user to add a card with a non-empty title to any list of the active board. New cards MUST be appended at the end of the list.

#### Scenario: Add a card
- **WHEN** the user adds a card titled "Write specs" to list "To Do"
- **THEN** "Write specs" appears as the last card of "To Do"

#### Scenario: Reject empty card title
- **WHEN** the user submits an empty or whitespace-only card title
- **THEN** no card is created

### Requirement: Card editing
The system SHALL allow the user to open a card and edit its title and description. The title MUST remain non-empty; the description MAY be empty.

#### Scenario: Edit card title and description
- **WHEN** the user opens card "Write specs", changes the title to "Write delta specs" and saves a description
- **THEN** the card shows the new title in its list and the description is retained when reopened

### Requirement: Card deletion
The system SHALL allow the user to delete a card from its detail view after an explicit confirmation.

#### Scenario: Delete a card
- **WHEN** the user deletes card "Write delta specs" and confirms
- **THEN** the card no longer appears in any list

### Requirement: Card movement
The system SHALL allow the user to move a card via drag & drop, both reordering within a list and moving across lists at a chosen position. Card movement SHALL also be operable via keyboard.

#### Scenario: Reorder within a list
- **WHEN** the user drags the last card of "To Do" above the first card of "To Do"
- **THEN** that card becomes the first card and the order of the other cards is preserved

#### Scenario: Move across lists
- **WHEN** the user drags card "Write specs" from "To Do" onto position 2 of "Doing"
- **THEN** the card is removed from "To Do" and appears at position 2 of "Doing"

#### Scenario: Move to an empty list
- **WHEN** the user drags a card onto a list that has no cards
- **THEN** the card becomes the only card of that list

#### Scenario: Keyboard move
- **WHEN** the user focuses a card and uses the keyboard drag sensor to move it
- **THEN** the card is moved to the chosen position without using a pointer
