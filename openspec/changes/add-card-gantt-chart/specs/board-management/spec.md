## ADDED Requirements

### Requirement: Board Gantt chart command

The system SHALL expose a Gantt chart command for the active board through the board menu. The command SHALL be available regardless of whether the board switcher displays board tabs or a collapsed board selector.

#### Scenario: Gantt command with board tabs

- **WHEN** the user has three or fewer boards and an active board
- **THEN** the board menu exposes the active board's Gantt chart command

#### Scenario: Gantt command with collapsed board selector

- **WHEN** the user has more than three boards and an active board
- **THEN** the board menu exposes the active board's Gantt chart command

#### Scenario: Gantt command follows the active board

- **WHEN** a user switches from board "Work" to board "Home" and opens the board menu
- **THEN** the Gantt chart command opens the Gantt view for "Home"
