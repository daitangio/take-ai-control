# board-data-sync Specification

## Purpose

Define how board data is loaded and refreshed while preserving unrelated board state.

## Requirements

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

### Requirement: Initial load fetches board list and selected board only
When the app mounts or the user authenticates, the system SHALL fetch the brief board list and the content of only the preferred (or first) board, and SHALL NOT fetch other boards' lists and cards.

#### Scenario: App start
- **WHEN** the app mounts with a valid token
- **THEN** the store fetches the board list and the content of the preferred or first board
- **AND** it does not fetch lists or cards of any other board

### Requirement: Board switch refreshes the list and loads the selected board
When the user clicks a board tab, the system SHALL refresh the brief board list, fetch only the selected board's content, and make it active, without resetting the store or reloading other boards.

#### Scenario: Switch to another board
- **WHEN** the user clicks a board tab different from the active one
- **THEN** the store re-fetches the board list and fetches only the clicked board's content from the board detail endpoint
- **AND** the clicked board becomes active
- **AND** lists and cards already loaded for other boards are not re-fetched

#### Scenario: Click the already active board
- **WHEN** the user clicks the active board's tab
- **THEN** no board content is re-fetched

#### Scenario: Selected board fetch fails
- **WHEN** fetching the selected board's content fails
- **THEN** an error toast is shown
- **AND** the previously active board remains active with its loaded content intact

### Requirement: Board list refresh preserves loaded state
The store SHALL provide an operation that refreshes the brief board list and updates board metadata (name, background, sharing flags, capacity) in place, preserving already loaded lists and cards and the active board selection.

#### Scenario: List refresh after a metadata change
- **WHEN** the board list is refreshed from the server
- **THEN** board metadata is updated in place
- **AND** loaded lists and cards are kept
- **AND** the active board selection is unchanged

### Requirement: Mutation failure recovery is single-board
When a mutation fails and a token is present, the system SHALL reconcile by refreshing the board list and reloading the active board, and SHALL NOT reset the store or reload other boards.

#### Scenario: Card edit mutation fails
- **WHEN** a card mutation fails and a token is present
- **THEN** the store refreshes the board list and reloads the active board
- **AND** other boards' data and the active-board selection remain unchanged
