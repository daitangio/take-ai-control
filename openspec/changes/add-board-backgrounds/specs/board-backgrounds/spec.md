## Purpose

Give each board a distinctive, readable visual identity through a small, curated set of decorative SVG workspace backgrounds.

## ADDED Requirements

### Requirement: Curated board background choices
The system SHALL offer the fixed board background choices `none`, `mountain`, `sea`, and `sport`. It MUST NOT accept a custom image, SVG markup, URL, or value outside that set.

#### Scenario: Available choices are shown
- **WHEN** a user opens the board-background menu
- **THEN** the menu shows None, Mountain, Sea, and Sport as labelled choices with visual previews

#### Scenario: Invalid background is rejected
- **WHEN** a client attempts to save a background value outside the fixed set
- **THEN** the selection is rejected and the board's existing background remains unchanged

### Requirement: Board background selection
The system SHALL allow an authorized board user to select one of the fixed background choices for the current board. The menu MUST indicate the board's current selection and support keyboard operation with an accessible name.

#### Scenario: User selects a background
- **WHEN** a user selects Sea for the current board
- **THEN** Sea becomes the selected menu option and the current board workspace displays the Sea background

#### Scenario: User clears a background
- **WHEN** a user selects None for a board that has a background
- **THEN** the board workspace uses the default plain background

#### Scenario: Keyboard user changes a background
- **WHEN** a keyboard user focuses and operates the board-background menu
- **THEN** every choice is reachable, named, and selectable without a pointing device

### Requirement: Decorative SVG board rendering
The system SHALL render Mountain, Sea, and Sport as locally bundled SVG artwork behind the board workspace. The artwork MUST remain decorative and MUST NOT reduce the legibility or operability of lists, cards, controls, drag-and-drop, or horizontal scrolling.

#### Scenario: Background is scoped to the active board workspace
- **WHEN** a board has Mountain selected
- **THEN** Mountain appears behind that board's workspace and does not replace the application header or board cards

#### Scenario: Board content remains usable
- **WHEN** a board background is active
- **THEN** users can read and interact with lists, cards, and board controls as normal
