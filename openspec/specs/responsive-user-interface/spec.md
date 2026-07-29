## Purpose

Define responsive layout and interaction requirements for the Nello frontend.

## Requirements

### Requirement: Adaptive application layout
The Nello frontend SHALL present all primary authenticated controls and the login form without horizontal viewport overflow at phone, tablet, and desktop viewport widths. The frontend SHALL use a compact, multi-row header below 768px, a space-efficient layout from 768px through 1023px, and retain the desktop layout at 1024px and above.

#### Scenario: Phone header presents all primary controls
- **WHEN** an authenticated user views Nello in a viewport narrower than 768px
- **THEN** the title, logout action, board navigation, and filter input remain reachable without horizontal viewport scrolling

#### Scenario: Tablet header preserves usable controls
- **WHEN** an authenticated user views Nello in a viewport from 768px through 1023px
- **THEN** the header controls fit or reflow without obscuring board navigation or the filter input

#### Scenario: Desktop layout remains available
- **WHEN** an authenticated user views Nello in a viewport at least 1024px wide
- **THEN** the application retains its desktop header and board layout

### Requirement: Responsive board interaction
The frontend SHALL preserve horizontally navigable board columns at every viewport width. On touch-capable devices, horizontal swipes on the board SHALL scroll columns without starting a drag, while a deliberate press-and-drag SHALL continue to support list and card reordering.

#### Scenario: Phone user navigates board columns
- **WHEN** a user swipes horizontally across a board at a viewport narrower than 768px
- **THEN** the board scrolls horizontally to reveal adjacent list columns

#### Scenario: Phone user starts a deliberate drag
- **WHEN** a user performs the configured press-and-drag gesture on a card or list at a viewport narrower than 768px
- **THEN** the applicable card or list drag operation starts without requiring a mouse

### Requirement: Viewport-safe overlays and forms
The frontend SHALL size dialogs, panels, forms, menus, notifications, and help content to remain visible and operable within the viewport. Content that exceeds available vertical space SHALL be scrollable within its container.

#### Scenario: User opens a dialog on a phone
- **WHEN** a user opens a card, member, or archive dialog in a viewport narrower than 768px
- **THEN** the dialog fits within the viewport with accessible controls and scrollable content when necessary

#### Scenario: User views the login form on a narrow device
- **WHEN** an unauthenticated user views the login form in a viewport narrower than 768px
- **THEN** the form and submission control fit the viewport without horizontal overflow

#### Scenario: User opens help on a narrow device
- **WHEN** a user opens the help panel in a viewport narrower than 768px
- **THEN** the panel remains within the viewport and its close control remains reachable
