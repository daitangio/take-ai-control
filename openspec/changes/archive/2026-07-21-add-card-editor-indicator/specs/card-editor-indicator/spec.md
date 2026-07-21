## ADDED Requirements

### Requirement: Other-editor card indicator
The system SHALL show a non-interactive editor icon to the right of a card title when the card was last edited by a user other than the current user and that editor has an email.

#### Scenario: Another user edited the card
- **WHEN** a displayed card was last edited by another user with email `alex@example.com`
- **THEN** an editor icon appears to the right of the card title

#### Scenario: Current user edited the card
- **WHEN** a displayed card was last edited by the current user
- **THEN** no editor icon appears

#### Scenario: Legacy card has no editor
- **WHEN** a displayed card has no editor metadata
- **THEN** no editor icon appears

### Requirement: Editor email tooltip
The editor icon SHALL expose the last editor's email through a tooltip and accessible name.

#### Scenario: User inspects the indicator
- **WHEN** the user hovers over or focuses an editor icon for `alex@example.com`
- **THEN** the editor email is available as tooltip and accessible text
