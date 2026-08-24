## MODIFIED Requirements

### Requirement: State persisted across sessions and devices

The system SHALL persist all boards, including each board's selected background, lists, cards, their ordering, and the active board selection to the backend API, scoped to the authenticated user, so that logging in from any device restores the same state. The frontend SHALL clear all in-memory state and repopulate from the API on each login, with no duplication of entities.

#### Scenario: Login restores state

- **WHEN** the user logs in after creating boards, lists, and cards in a previous session
- **THEN** the same boards, lists, cards, ordering, and selected board backgrounds are shown with no duplicated entities

#### Scenario: Reload restores state

- **WHEN** the user creates boards, lists, and cards, selects Sea for a board, then reloads the page
- **THEN** the same boards, lists, cards, ordering, and Sea selection are shown with no duplicated entities

#### Scenario: Re-login does not duplicate entities

- **WHEN** the user logs out and logs back in with the same account
- **THEN** each list appears exactly once per board and each card appears exactly once per list

#### Scenario: Concurrent load does not duplicate entities

- **WHEN** `loadBoards()` is invoked concurrently (e.g., React StrictMode double-effect, rapid token changes)
- **THEN** only one invocation populates the store and no entity IDs appear more than once in parent ID arrays

#### Scenario: State is per-user

- **WHEN** user A logs in on device 1 and user B logs in on device 2
- **THEN** each user sees only their own boards, lists, cards, and board-background selections

#### Scenario: New board defaults to no background

- **WHEN** a user creates a board
- **THEN** its persisted background selection is None
