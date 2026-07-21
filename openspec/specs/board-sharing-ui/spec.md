# board-sharing-ui Specification

## Purpose
TBD - created by archiving change add-shared-boards-frontend. Update Purpose after archive.
## Requirements
### Requirement: Share button on shared boards

The system SHALL show a share button on shared boards where the current user is the owner.

#### Scenario: Share button visible for owned shared board

- **WHEN** the user owns a board whose name ends with `$`
- **THEN** a share button (👤) is visible next to the board tab

#### Scenario: Share button hidden for personal boards

- **WHEN** the user owns a board whose name does not end with `$`
- **THEN** no share button is shown

#### Scenario: Share button hidden for member (not owner)

- **WHEN** the user is a member but not the owner of a shared board
- **THEN** no share button is shown (only the owner can manage members)

### Requirement: Board carries sharing metadata

The system SHALL store `isShared` and `isOwner` flags on each board in the frontend state, populated from the API response.

#### Scenario: Board created with isShared false

- **WHEN** a personal board is created or loaded
- **THEN** `isShared` is `false` and `isOwner` is `true`

#### Scenario: Shared board has correct flags

- **WHEN** a shared board is created or loaded
- **THEN** `isShared` is `true` and `isOwner` reflects whether the current user is the owner

