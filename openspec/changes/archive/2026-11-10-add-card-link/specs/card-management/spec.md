## ADDED Requirements

### Requirement: Card link

The system SHALL allow a user with board access to set, replace, or clear an optional HTTP or HTTPS link from a card's detail view. A blank link value SHALL be stored as `null`. The system MUST return the current link value in card-creation, card-update, and board-detail responses.

#### Scenario: Set a card link

- **WHEN** a user enters `https://example.com/design` for a card and saves it
- **THEN** the card retains that link after the board reloads

#### Scenario: Replace a card link

- **WHEN** a user changes a card link from one HTTP or HTTPS URL to another and saves it
- **THEN** the new URL replaces the old URL

#### Scenario: Clear a card link

- **WHEN** a user removes the link value and saves the card
- **THEN** the card link is `null` after the board reloads

#### Scenario: Existing card has no link

- **WHEN** a card with no stored link is loaded
- **THEN** its detail view shows an empty link field and its tile shows no link icon

#### Scenario: Extract a link from the description

- **WHEN** a user edits a card description containing one or more HTTPS URLs while the link field is blank
- **THEN** the system sets the link field to the first HTTPS URL and shows the user a brief confirmation message

#### Scenario: Preserve an explicitly set link

- **WHEN** a user edits a card description containing an HTTPS URL while the link field already has a value
- **THEN** the system does not replace the existing link or show an auto-fill confirmation

#### Scenario: Reject an unsafe link scheme

- **WHEN** a user submits a link that is not an HTTP or HTTPS URL
- **THEN** the system rejects the update and retains the previously stored link

### Requirement: Card link access

The system SHALL display an accessible external-link control beside a card tile's title when the card has a link. Activating the control MUST open the stored HTTP or HTTPS URL in a separate browsing context and MUST NOT open the card detail view or start card dragging.

#### Scenario: Open a linked card resource

- **WHEN** a user activates the link control on a card with a stored link
- **THEN** the linked resource opens in a separate browsing context

#### Scenario: Card with no link

- **WHEN** a card link is `null`
- **THEN** no link control is displayed on its tile

#### Scenario: Preserve tile interactions

- **WHEN** a user activates the link control on a card tile
- **THEN** the card detail view remains closed and drag-and-drop is not initiated
