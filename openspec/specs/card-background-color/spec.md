# Card Background Color — Spec

## Purpose

Allow users to apply a background color to cards from a fixed pastel palette, providing lightweight visual categorization without adding complexity like full labels or tags.

## Requirements

### Requirement: Card background color palette
The system SHALL support an optional background color on each card, selected from a fixed palette of six pastel colors: Red (`#fecaca`), Orange (`#fed7aa`), Green (`#bbf7d0`), Blue (`#bfdbfe`), Violet (`#ddd6fe`), and Gray (`#e5e7eb`). A card without a set color SHALL display the default white background.

#### Scenario: Card with no color shows default background
- **WHEN** a card has no color set (or the color is cleared)
- **THEN** the card tile displays with the default white background

#### Scenario: Card with a color shows tinted background
- **WHEN** a card has its color set to "blue"
- **THEN** the card tile background displays as `#bfdbfe`

#### Scenario: Card with any palette color is readable
- **WHEN** a card has any of the six palette colors set
- **THEN** the card title and metadata remain readable in dark text without text color changes

### Requirement: Set card color from action popup
The system SHALL display a row of six color swatches as the first item in the card action popup. Selecting a swatch SHALL immediately set that color on the card and persist it to the server.

#### Scenario: Set a color on a card
- **WHEN** the user opens the card action popup and clicks the blue swatch
- **THEN** the card tile background changes to blue and the color is persisted

#### Scenario: Change an existing card color
- **WHEN** a card has color "red" and the user selects "green" from the action popup
- **THEN** the card tile background changes to green and the previous color is replaced

#### Scenario: Color swatches are displayed before other actions
- **WHEN** the user opens the card action popup
- **THEN** the color swatch row appears as the first item, above Details, Members, Due date, and Archive

#### Scenario: Color selection closes the popup
- **WHEN** the user clicks a color swatch in the action popup
- **THEN** the action popup closes

### Requirement: Clear card color
The system SHALL provide a clear (reset) button next to the color swatches in the action popup. Activating the clear button SHALL remove the card's color, reverting it to the default white background.

#### Scenario: Clear a card color
- **WHEN** a card has color "green" and the user clicks the clear button in the action popup
- **THEN** the card tile background reverts to the default white and the color is removed from the persisted card data

#### Scenario: Clear on a card with no color
- **WHEN** a card has no color set and the user clicks the clear button
- **THEN** the card remains with the default white background

### Requirement: Card modal title displays card color
The system SHALL display the card's background color on the title input of the card detail modal. The rest of the modal SHALL retain its default white appearance.

#### Scenario: Colored card opened in modal
- **WHEN** a card with color "blue" is opened in the card detail modal
- **THEN** the modal title input background displays as `#bfdbfe`

#### Scenario: Card with no color opened in modal
- **WHEN** a card with no color set is opened in the card detail modal
- **THEN** the modal title input background remains default white

### Requirement: Color persists across sessions
The system SHALL persist the card color in the database and include it in API responses so that the color is preserved across page reloads and sessions.

#### Scenario: Color persists after page reload
- **WHEN** a card's color is set to "orange" and the page is reloaded
- **THEN** the card tile still displays the orange background

#### Scenario: Color is included in board data
- **WHEN** the board data is loaded from the API
- **THEN** each card response includes its color value (or null if no color is set)

### Requirement: Color is preserved when card is archived
The system SHALL preserve the card's color field when a card is archived, so that if unarchived, the color is restored.

#### Scenario: Archived card retains color
- **WHEN** a card with color "green" is archived and later unarchived
- **THEN** the card displays its green background after unarchiving
