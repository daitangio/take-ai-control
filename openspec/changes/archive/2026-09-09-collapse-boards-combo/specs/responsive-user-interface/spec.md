## ADDED Requirements

### Requirement: Responsive collapsed board switcher
The collapsed board combo box SHALL be reachable and operable on touch devices and SHALL not cause horizontal viewport overflow at any supported width. Its dropdown SHALL remain within the viewport and every board option SHALL stay reachable.

#### Scenario: Phone user switches board from the combo box
- **WHEN** a user with more than 3 boards views the app in a viewport narrower than 768px
- **THEN** the combo box is reachable without horizontal scrolling and selecting a board works through touch

#### Scenario: Dropdown stays within the viewport
- **WHEN** the user opens the combo box dropdown on a narrow viewport
- **THEN** the dropdown remains inside the viewport and all board options are reachable, scrolling within the dropdown when necessary

#### Scenario: Combo box fits alongside header controls
- **WHEN** a user with more than 3 boards views the app in a viewport from 768px through 1023px
- **THEN** the combo box and its neighboring header controls fit or reflow without obscuring board navigation
