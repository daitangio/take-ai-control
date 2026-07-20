## MODIFIED Requirements

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
