# board-persistence — Delta Spec

## ADDED Requirements

### Requirement: State persisted across reloads
The system SHALL persist all boards, lists, cards, their ordering, and the active board selection to browser local storage after every mutation, so that reloading the page restores the same state.

#### Scenario: Reload restores state
- **WHEN** the user creates boards, lists, and cards, then reloads the page
- **THEN** the same boards, lists, cards, ordering, and active board are shown

### Requirement: Versioned storage payload
Persisted data SHALL be stored under a versioned key with an explicit schema version field, enabling future migrations.

#### Scenario: Payload carries schema version
- **WHEN** state is persisted
- **THEN** the stored payload contains a schema version identifying the current data format

### Requirement: Graceful fallback on missing or invalid data
The system SHALL start with an empty initial state, without crashing, when persisted data is absent, unparseable, or fails validation.

#### Scenario: First visit
- **WHEN** the app is opened with no persisted data present
- **THEN** the app starts with the empty "no boards" state

#### Scenario: Corrupt payload
- **WHEN** the persisted payload is not valid JSON or does not match the expected schema
- **THEN** the app starts with the empty initial state instead of crashing
