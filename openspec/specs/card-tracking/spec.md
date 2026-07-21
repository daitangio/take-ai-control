# card-tracking Specification

## Purpose
TBD - created by archiving change add-shared-boards. Update Purpose after archive.
## Requirements
### Requirement: Card records last modifier

The system SHALL store the ID of the authenticated user who created or last modified a card. The `modified_by` value SHALL be returned in card API responses.

#### Scenario: Card creation records modifier

- **WHEN** an authenticated user sends `POST /api/cards`
- **THEN** the created card's `modifiedBy` field is set to the authenticated user's ID

#### Scenario: Card update records modifier

- **WHEN** an authenticated user sends `PATCH /api/cards/:id` to edit a card's title or description
- **THEN** the card's `modifiedBy` field is updated to the authenticated user's ID

#### Scenario: Card move records modifier

- **WHEN** an authenticated user sends `PUT /api/cards/:id/move` to move a card
- **THEN** the card's `modifiedBy` field is updated to the authenticated user's ID

#### Scenario: Card response includes modifiedBy

- **WHEN** a card is returned in any API response (create, update, get board detail)
- **THEN** the response includes `modifiedBy` set to the last modifier's user ID, or `null` for cards created before this feature

#### Scenario: Existing cards have null modifiedBy

- **WHEN** a card existed before the `modified_by` column was added
- **THEN** the card's `modifiedBy` is `null` until the card is next modified

