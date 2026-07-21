# card-tracking-ui Specification

## Purpose
TBD - created by archiving change add-shared-boards-frontend. Update Purpose after archive.
## Requirements
### Requirement: Card shows last modifier

The system SHALL show the ID of the user who last modified a card in the card detail modal, when available.

#### Scenario: Modified card shows last modifier

- **WHEN** the user opens a card that has been modified (has `modifiedBy` set)
- **THEN** the modal shows "Last modified by: `<user_id>`" below the description

#### Scenario: Pre-existing card shows no modifier

- **WHEN** the user opens a card created before the `modified_by` feature (`modifiedBy` is `null`)
- **THEN** no "Last modified by" line is shown

### Requirement: Card carries modifiedBy in state

The system SHALL store `modifiedBy` on each card in the frontend state, populated from the API response.

#### Scenario: Card created via API has modifiedBy

- **WHEN** a card is created or loaded from the API
- **THEN** `modifiedBy` is set to the last modifier's user ID in the frontend state

