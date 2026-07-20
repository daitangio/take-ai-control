## MODIFIED Requirements

### Requirement: Board switch reloads data from server
The system SHALL reload board data from the server when the user switches from one board to another. This ensures the displayed data reflects the latest server state.

#### Scenario: User switches to a different board
- **WHEN** the user clicks on a different board tab in the BoardSwitcher
- **THEN** the system fetches fresh board data from the API and displays the selected board with up-to-date lists and cards

#### Scenario: User clicks on the already-active board
- **WHEN** the user clicks on the board tab that is already active
- **THEN** no reload is triggered (no-op)
