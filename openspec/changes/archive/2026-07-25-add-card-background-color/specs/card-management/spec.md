## MODIFIED Requirements

### Requirement: Card action popup
The system SHALL provide a compact action button at the right side of each card tile. Activating the button SHALL open a card action popup with a row of color swatches as the first item, followed by actions for Details, Members, Due date, and Archive.

#### Scenario: Open card action popup
- **WHEN** the user activates the right-side action button on a card
- **THEN** the card action popup opens for that card with color swatches displayed first

#### Scenario: Open details from popup
- **WHEN** the user selects Details from the card action popup
- **THEN** the existing card detail modal opens for that card

#### Scenario: Preserve card body click
- **WHEN** the user clicks the main body of a card tile
- **THEN** the existing card detail modal opens without opening the action popup

#### Scenario: Preserve card dragging
- **WHEN** the user drags a card tile without using the action button or popup
- **THEN** the existing card drag-and-drop behavior is preserved

#### Scenario: Close card action popup
- **WHEN** the user clicks outside the popup or presses Escape
- **THEN** the card action popup closes

#### Scenario: Set card color from popup
- **WHEN** the user selects a color swatch from the card action popup
- **THEN** the card's background color updates and the popup closes
