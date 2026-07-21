# Board Management — Spec (Delta)

## MODIFIED Requirements

### Requirement: Board creation

The system SHALL allow the user to create a board by providing a non-empty name. A board whose name ends with `$` is a shared board. A newly created board SHALL become the active board.

#### Scenario: Create a board

- **WHEN** the user creates a board named "Work"
- **THEN** the board "Work" exists, is shown as active, contains no lists, and is not shared

#### Scenario: Create a shared board

- **WHEN** the user creates a board named "Team$"
- **THEN** the board "Team$" exists, is shown as active, is shared, and the user is the owner

#### Scenario: Reject empty board name

- **WHEN** the user submits a board name that is empty or whitespace-only
- **THEN** no board is created and the input remains open for correction

### Requirement: Board renaming

The system SHALL allow the user to rename an existing board. Empty names MUST be rejected, keeping the previous name. If the board is shared (name ends with `$`), the new name MUST also end with `$`.

#### Scenario: Rename a board

- **WHEN** the user renames board "Work" to "Work 2026"
- **THEN** the board is displayed as "Work 2026" everywhere it appears

#### Scenario: Rename a shared board

- **WHEN** the owner renames board "Team$" to "Team 2026$"
- **THEN** the board is displayed as "Team 2026$" everywhere it appears

#### Scenario: Reject rename that removes `$` suffix

- **WHEN** the owner renames board "Team$" to "Team" (removing the `$`)
- **THEN** the rename is rejected and the board keeps its previous name

#### Scenario: Reject empty rename

- **WHEN** the user submits an empty name while renaming a board
- **THEN** the board keeps its previous name
