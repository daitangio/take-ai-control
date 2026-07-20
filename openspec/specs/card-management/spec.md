# Card Management — Spec

## Purpose

Allow users to create, edit, delete, and move cards within and across lists, including drag & drop and keyboard-based movement.

## Requirements

### Requirement: Card creation
The system SHALL allow the user to add a card with a non-empty title to any list of the active board. New cards MUST be appended at the end of the list. The user SHALL be able to open the card composer by clicking unused space in a list body. When the composer title field is focused, Enter without Shift SHALL create a non-empty card, clear the title field, and retain composer focus for the next title; Shift+Enter SHALL insert a newline instead.

#### Scenario: Add a card
- **WHEN** the user adds a card titled "Write specs" to list "To Do"
- **THEN** "Write specs" appears as the last card of "To Do"

#### Scenario: Start composition from a list
- **WHEN** the user clicks unused space in the body of list "To Do"
- **THEN** the card composer opens with focus in its title field

#### Scenario: Add consecutive cards with the keyboard
- **WHEN** the user enters "Card1", presses Enter, enters "Card2", and presses Enter in the focused composer for "To Do"
- **THEN** "Card1" and "Card2" are appended to "To Do" and the composer remains focused with an empty title field

#### Scenario: Enter a multiline title
- **WHEN** the user presses Shift+Enter in the focused card composer
- **THEN** a newline is inserted and no card is created

#### Scenario: Reject empty card title
- **WHEN** the user submits an empty or whitespace-only card title
- **THEN** no card is created

#### Scenario: Preserve existing list interactions
- **WHEN** the user clicks a card or the title of a list
- **THEN** the card opens or the list title enters rename mode respectively, without opening the card composer

### Requirement: Card editing
The system SHALL allow the user to open a card and edit its title and description. The title MUST remain non-empty; the description MAY be empty. The system SHALL only send a PATCH request to the server when the card title or description has been modified by the user. Opening and closing a card without changes MUST NOT trigger any API call.

#### Scenario: Edit card title and description
- **WHEN** the user opens card "Write specs", changes the title to "Write delta specs" and saves a description
- **THEN** the card shows the new title in its list and the description is retained when reopened

#### Scenario: Card opened and closed without edits
- **WHEN** the user opens a card modal and closes it without changing title or description
- **THEN** no PATCH request is sent to the server

#### Scenario: Card title edited and saved
- **WHEN** the user opens a card modal, changes the title, and closes the modal
- **THEN** a PATCH request is sent with the updated title and current description

#### Scenario: Card description edited and saved
- **WHEN** the user opens a card modal, changes the description, and blurs the textarea
- **THEN** a PATCH request is sent with the current title and updated description

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
