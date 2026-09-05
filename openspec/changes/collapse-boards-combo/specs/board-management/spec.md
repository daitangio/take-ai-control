## MODIFIED Requirements

### Requirement: Board switching
The system SHALL display all existing boards and allow the user to switch the active board. When the user has more than 3 boards, the boards SHALL be collapsed into a combo box that lists every board, with the active board selected; with 3 or fewer boards the boards SHALL be shown as tabs. Switching to a different board SHALL reload board data from the server to ensure the displayed data reflects the latest state. In collapsed mode, the rename, delete, and member-management actions SHALL remain available for the active board.

#### Scenario: Switch active board
- **WHEN** the user selects board "Home" while board "Work" is active
- **THEN** the system fetches fresh board data from the API and displays the lists and cards of "Home"

#### Scenario: User clicks on the already-active board
- **WHEN** the user clicks on the board tab that is already active, or selects the already-active board in the combo box
- **THEN** no reload is triggered

#### Scenario: No boards yet
- **WHEN** the app is opened and no boards exist
- **THEN** an empty state is shown with a call to action to create the first board

#### Scenario: Boards collapse into a combo box
- **WHEN** the user has more than 3 boards
- **THEN** all boards are presented in a combo box with the active board selected, and the tab display is not used

#### Scenario: Tabs remain with few boards
- **WHEN** the user has 3 or fewer boards
- **THEN** the boards are presented as tabs, exactly as before

#### Scenario: Switch board from the combo box
- **WHEN** the user picks a different board from the combo box
- **THEN** that board becomes active and its fresh data is fetched from the server

#### Scenario: Cross the threshold by creating a board
- **WHEN** the user with 3 boards creates a fourth board
- **THEN** the switcher switches to the combo box presentation, showing all 4 boards

#### Scenario: Active board actions remain available in collapsed mode
- **WHEN** the switcher is in combo box mode
- **THEN** the rename, delete, and member-management actions for the active board remain reachable next to the combo box
