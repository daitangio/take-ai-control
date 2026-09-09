## Purpose

Provide an active-board Gantt chart so users can inspect scheduled card durations, due dates, and overlapping work across their Kanban lists.

## ADDED Requirements

### Requirement: Open the active board Gantt chart

The system SHALL provide a Gantt chart command in the active board menu whenever an active board exists. Activating the command SHALL open a Gantt view for that board, and users SHALL be able to close the view and return to the unchanged board.

#### Scenario: Open Gantt chart from the board menu

- **WHEN** a user with an active board selects the Gantt chart command from the board menu
- **THEN** the system displays the Gantt view for the active board

#### Scenario: Close Gantt chart

- **WHEN** a user closes the Gantt view
- **THEN** the Gantt view is dismissed and the active Kanban board remains visible and unchanged

#### Scenario: No active board

- **WHEN** the user has no active board
- **THEN** the board menu does not present a Gantt chart command

### Requirement: Render scheduled cards on a date timeline

The Gantt view SHALL render every non-archived card of the active board that has a due date. Cards SHALL be grouped by their list and retain the board's list order and each list's card order. The chart SHALL identify each rendered card, its due date, and its effort in days.

#### Scenario: Render cards from multiple lists

- **WHEN** the active board has dated cards in lists "To Do" and "Doing"
- **THEN** the Gantt view displays rows grouped as "To Do" followed by "Doing", with each list's dated cards in their existing order

#### Scenario: Exclude cards without due dates

- **WHEN** an active-board card has no due date
- **THEN** the card is not rendered as a bar or row in the Gantt timeline

#### Scenario: Exclude archived cards

- **WHEN** a card is archived
- **THEN** it is not rendered in the active board Gantt view

### Requirement: Derive Gantt ranges from due date and effort

The system SHALL treat a card's date-only due date as the inclusive end of its Gantt range. The range start SHALL equal the due date minus the card's effort value plus one day. The timeline SHALL represent fractional effort values proportionally.

#### Scenario: Render a one-day card

- **WHEN** a card has effort `1` and due date `2026-08-15`
- **THEN** its Gantt range starts and ends on `2026-08-15`

#### Scenario: Render a multi-day card

- **WHEN** a card has effort `3` and due date `2026-08-15`
- **THEN** its Gantt range spans `2026-08-13` through `2026-08-15`, inclusive

#### Scenario: Render a fractional-day card

- **WHEN** a card has effort `1.5` and due date `2026-08-15`
- **THEN** its Gantt bar ends on `2026-08-15` and represents a duration of one and a half days proportionally on the timeline

### Requirement: Indicate an unscheduled board

The Gantt view SHALL present a clear empty state when the active board has no non-archived cards with due dates.

#### Scenario: Board has no dated cards

- **WHEN** every non-archived card on the active board has no due date
- **THEN** the Gantt view displays an empty-state message instead of an empty timeline
