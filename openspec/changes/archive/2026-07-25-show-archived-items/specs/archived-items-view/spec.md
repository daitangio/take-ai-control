## ADDED Requirements

### Requirement: View archived cards
The system SHALL allow a user with board access to view all archived cards across the board in a modal dialog opened from any list header action menu. Each archived card SHALL display its title, the list it was archived from, who archived it, and when it was archived.

#### Scenario: Open archived items dialog
- **WHEN** the user activates "Show archived items" from a list header action menu
- **THEN** a modal dialog opens showing all archived cards from the board

#### Scenario: Dialog shows archival metadata
- **WHEN** the dialog loads archived cards for a board that contains an archived card "Fix login bug" archived by alice@example.com on 2026-07-20 from list "Backlog"
- **THEN** the card entry displays the title "Fix login bug", the source list "Backlog", the email "alice@example.com", and the date "2026-07-20"

#### Scenario: Empty archived cards
- **WHEN** the dialog loads and the board has no archived cards
- **THEN** the dialog displays a message indicating there are no archived cards

#### Scenario: Archived cards grouped by original list
- **WHEN** the dialog loads archived cards from multiple lists
- **THEN** cards are visually grouped or labeled by the list they were archived from

#### Scenario: Deleted archiving user
- **WHEN** an archived card's `archived_by` user has been deleted
- **THEN** the card displays "Unknown user" as the archiving user

### Requirement: De-archive a card
The system SHALL allow a user to restore an archived card from the archived items dialog. De-archiving a card SHALL place it at the bottom of the list whose header action menu was used to open the dialog, regardless of which list the card was originally archived from.

#### Scenario: De-archive a card to the source list
- **WHEN** the user opens the archived items dialog from list "Doing" and clicks "De-archive" on a card originally archived from list "Backlog"
- **THEN** the card is removed from the archived items list in the dialog and appears at the bottom of list "Doing"

#### Scenario: De-archive multiple cards
- **WHEN** the user de-archives three cards from the dialog without closing it
- **THEN** each de-archived card appears at the bottom of the source list and the dialog remains open showing the remaining archived cards

#### Scenario: De-archive removes card from dialog list
- **WHEN** the user de-archives a card
- **THEN** that card immediately disappears from the archived items dialog

### Requirement: Dialog lifecycle
The archived items dialog SHALL support loading, error, and close states consistent with other modal dialogs in the application.

#### Scenario: Loading state
- **WHEN** the dialog is first opened and archived cards are being fetched
- **THEN** a loading indicator is displayed

#### Scenario: Error state
- **WHEN** the API call to fetch archived cards fails
- **THEN** an error message is displayed in the dialog

#### Scenario: Close on backdrop click
- **WHEN** the user clicks the dark backdrop outside the dialog panel
- **THEN** the dialog closes

#### Scenario: Close on Escape
- **WHEN** the user presses the Escape key while the dialog is open
- **THEN** the dialog closes

#### Scenario: Close via button
- **WHEN** the user clicks the "Close" button in the dialog
- **THEN** the dialog closes
