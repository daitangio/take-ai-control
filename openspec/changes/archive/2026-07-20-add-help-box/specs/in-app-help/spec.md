## ADDED Requirements

### Requirement: Authenticated help visibility

The system SHALL show the current help box to an authenticated user who has not dismissed the current help-content version, and SHALL NOT show it on the login screen.

#### Scenario: Help appears after authentication

- **WHEN** an authenticated user opens the application without a dismissal for the current help-content version
- **THEN** the help box is visible in the authenticated application

#### Scenario: Help is absent before authentication

- **WHEN** an unauthenticated user opens the application
- **THEN** the login form is shown without the help box

### Requirement: Shared-board guidance

The help box SHALL explain that a board is created as shared by ending its name with `$`, that the suffix cannot later be removed, and that an owner can use the member control on a shared board to manage members.

#### Scenario: User reads initial guidance

- **WHEN** the help box is visible
- **THEN** it contains instructions for creating a shared board and accessing owner member management

### Requirement: Persistent versioned dismissal

The system SHALL allow the user to dismiss the help box and SHALL persist the dismissed help-content version in browser-local storage.

#### Scenario: User dismisses current help

- **WHEN** the user activates the help box close control
- **THEN** the box closes and the current help-content version is recorded as dismissed

#### Scenario: Dismissed help remains hidden

- **WHEN** an authenticated user returns and the stored dismissed version matches the current help-content version
- **THEN** the help box remains hidden

#### Scenario: Updated help appears again

- **WHEN** the current help-content version differs from the stored dismissed version
- **THEN** the help box is visible so the user can see the updated information

#### Scenario: Persistence is unavailable

- **WHEN** browser-local storage cannot be read or written and the user dismisses the help box
- **THEN** the box closes for the current component lifetime without blocking other application behavior

### Requirement: Responsive fixed presentation

The help box SHALL remain anchored to the lower-right viewport corner independently of board scrolling and SHALL fit within narrow viewports using safe horizontal insets.

#### Scenario: Board content scrolls horizontally

- **WHEN** an authenticated user scrolls the board content horizontally
- **THEN** the help box retains its viewport position

#### Scenario: Help is shown on a narrow viewport

- **WHEN** the viewport is narrower than the desktop help-box layout
- **THEN** the box fits between the viewport's left and right safe insets without horizontal overflow

### Requirement: Accessible controls

The help box SHALL expose a labelled help region and an accessible name for its close control.

#### Scenario: Assistive technology reads the help box

- **WHEN** an assistive-technology user navigates to the help box
- **THEN** the help region and close control have meaningful accessible names
