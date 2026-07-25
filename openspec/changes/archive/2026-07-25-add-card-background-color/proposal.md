## Why

Users need a quick visual way to categorize and distinguish cards on a board. Adding a small set of fixed background colors to cards — selectable directly from the card action popup — provides lightweight visual organization without adding complexity like full labels or tags.

## What Changes

- Add a `color` field to cards (nullable string, persisted in SQLite)
- Expose the color field through the backend API (CardUpdate, CardResponse)
- Display a row of 6 fixed-color swatches as the first item in each card's action popup
- Apply the selected color as the card tile's background (pastel variants with dark text)
- Provide a reset option to clear the color back to the default white background
- Color is **only** reflected on the card tile — the card detail modal remains unchanged

Color palette (pastel, always readable with dark text):

| Swatch | Label  | Hex       |
|--------|--------|-----------|
| 🔴     | Red    | `#fecaca` |
| 🟠     | Orange | `#fed7aa` |
| 🟢     | Green  | `#bbf7d0` |
| 🔵     | Blue   | `#bfdbfe` |
| 🟣     | Violet | `#ddd6fe` |
| ⚪     | Gray   | `#e5e7eb` |

## Capabilities

### New Capabilities
- `card-background-color`: Ability to set and persist a background color on a card, selected from a fixed palette via the card action popup

### Modified Capabilities
- `card-management`: Card action popup gains color swatches as the first menu row; card data model gains an optional color field

## Impact

- **Database**: New `color TEXT` column on `card` table (migration)
- **Backend API**: `CardUpdate` and `CardResponse` models gain optional `color` field; `PATCH /cards/{id}` accepts and returns color
- **Frontend state**: `Card` type, `card/create` and `card/edit` actions, reducer, and API bridge all extended with `color`
- **Frontend UI**: `CardTile` popup menu reordered with color swatches as first row; card tile background driven by color value via inline style; `CardModal` title input shows card color as background
- **No impact** on archived cards or drag-and-drop
