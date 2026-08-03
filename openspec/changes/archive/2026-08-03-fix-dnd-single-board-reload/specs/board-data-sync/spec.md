## ADDED Requirements

### Requirement: Single-board refresh after drag-and-drop
The system SHALL refresh only the active board after a card or list drag-and-drop reorder completes, and SHALL NOT reload other boards or reset the global store.

#### Scenario: Card moved within the active board
- **WHEN** a user drags a card and the `card/move` mutation succeeds
- **THEN** the store re-fetches only the active board via `getBoard(activeBoardId)`
- **AND** other boards' data and the active-board selection remain unchanged

#### Scenario: Drag mutation fails
- **WHEN** a card drag mutation fails and a token is present
- **THEN** the store reloads only the active board to reconcile state
- **AND** does not reset or reload all boards

### Requirement: Atomic single-board state replacement
The store SHALL provide a `reloadBoard(boardId)` operation that replaces a single board's lists and cards atomically, without duplicating or clearing unrelated boards.

#### Scenario: Reloading one board
- **WHEN** `reloadBoard(boardId)` is invoked with fresh server data
- **THEN** that board's lists and cards are replaced with the server response
- **AND** lists and cards belonging to other boards are left intact

### Requirement: Full load on initial app start
The system SHALL continue to perform a full load of all boards when the app first mounts or the user authenticates.

#### Scenario: App start
- **WHEN** the app mounts with a valid token
- **THEN** the store loads all boards and selects the preferred or first board
