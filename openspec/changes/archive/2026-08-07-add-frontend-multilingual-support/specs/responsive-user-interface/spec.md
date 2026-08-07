## MODIFIED Requirements

### Requirement: Adaptive application layout
The Nello frontend SHALL present all primary authenticated controls, including the flag-based language selector, and the login form without horizontal viewport overflow at phone, tablet, and desktop viewport widths. The frontend SHALL use a compact, multi-row header below 768px, a space-efficient layout from 768px through 1023px, and retain the desktop layout at 1024px and above. This requirement SHALL hold regardless of the active supported UI locale.

#### Scenario: Phone header presents all primary controls
- **WHEN** an authenticated user views Nello in a viewport narrower than 768px
- **THEN** the title, logout action, board navigation, and filter input remain reachable without horizontal viewport scrolling

#### Scenario: Tablet header preserves usable controls
- **WHEN** an authenticated user views Nello in a viewport from 768px through 1023px
- **THEN** the header controls fit or reflow without obscuring board navigation or the filter input

#### Scenario: Desktop layout remains available
- **WHEN** an authenticated user views Nello in a viewport at least 1024px wide
- **THEN** the application retains its desktop header and board layout

#### Scenario: Localized labels do not break layout
- **WHEN** a user switches to another supported locale
- **THEN** localized header and authentication controls remain reachable without horizontal viewport overflow

#### Scenario: Flag-based language selector remains usable
- **WHEN** a user views the application at a phone or tablet width
- **THEN** the language selector remains visible or reachable, its flags and active state are understandable, and it remains operable without horizontal scrolling
