## Why

Boards already track card due dates, but users cannot see the schedule implied by those dates across a board. Adding a per-card effort estimate and a board-level Gantt chart makes workload duration, overlaps, and upcoming deadlines visible without changing the Kanban workflow.

## What Changes

- Add an `effortDays` card field, editable as a positive numeric value that permits fractional days and defaults to `1`.
- Persist and return effort values through card creation, updates, board loading, archival data, and board export while preserving compatibility for existing cards.
- Define each card's due date as the inclusive end of its Gantt bar; derive its start from `dueDate - effortDays + 1 day`.
- Add a **Gantt chart** command to the active board menu.
- Add a board-level Gantt dialog that groups active cards by list and visualizes cards with due dates on a date-based timeline.
- Omit cards without due dates from the timeline and show an empty state when no active card can be scheduled.

## Capabilities

### New Capabilities

- `gantt-chart`: Open and close the active board's Gantt view, construct card ranges from effort and due-date data, and render an accessible timeline and empty state.

### Modified Capabilities

- `card-management`: Cards gain a validated, persisted fractional effort-days value alongside due dates, including API, archive, and export behavior.
- `board-management`: The active board menu exposes the Gantt chart command.

## Impact

- **Frontend:** user-menu command, new Gantt dialog and styling, translations, card editor, state types/actions/reducer, API client mappings, and component/API tests.
- **Backend:** SQLite schema migration, Drizzle schema, card update validation and response mapping, archived-card response/export mapping, and route tests.
- **Synchronization:** existing optimistic updates and board-change events continue to distribute modified card effort data; no separate Gantt API endpoint is required.
