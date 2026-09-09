# Board Export — Spec

## Purpose

Lets users take the current board's data out of Nello as a portable, downloadable JSON file.

## ADDED Requirements

### Requirement: Export entry in the user menu
The system SHALL show an "Export board" entry in the user menu only when a board is active, and MUST place it immediately before the Logout entry.

#### Scenario: Entry visible with an active board
- **WHEN** a user opens the user menu while a board is active
- **THEN** the menu shows "Export board" immediately before Logout

#### Scenario: Entry hidden without an active board
- **WHEN** a user opens the user menu while no board is active
- **THEN** the menu does not show "Export board"

### Requirement: Board JSON download
The system SHALL download the current board as a JSON file whose content is the board data returned by the boards API for that board, including its lists and cards.

#### Scenario: Export downloads the current board
- **WHEN** a user selects "Export board"
- **THEN** the system downloads a `.json` file containing the current board's data from the boards API

### Requirement: Export file name
The system SHALL name the downloaded file after the board name, replacing whitespace runs with `-` and removing every other non-alphanumeric character. If no alphanumeric character remains, the file name MUST be `board.json`.

#### Scenario: Spaces become dashes
- **WHEN** a board named "Sprint Planning" is exported
- **THEN** the file name is "Sprint-Planning.json"

#### Scenario: Special characters are removed
- **WHEN** a board named "Squad Board$" is exported
- **THEN** the file name is "Squad-Board.json"

#### Scenario: Name without alphanumeric characters
- **WHEN** a board whose name contains no alphanumeric character is exported
- **THEN** the file name is "board.json"

### Requirement: Export in-flight state
The system SHALL disable the "Export board" entry while an export is in flight, and MUST re-enable it when the export completes or fails.

#### Scenario: Entry disabled during export
- **WHEN** an export is in progress
- **THEN** the "Export board" entry is disabled until the export completes or fails

### Requirement: Export failure feedback
When an export fails, the system SHALL show an error notification through the existing toast mechanism and MUST NOT download a file.

#### Scenario: Export fails
- **WHEN** the boards API request for the export fails
- **THEN** the user sees an error toast and no file is downloaded
