## Context

The nello app is a Trello-like kanban board with a React frontend and FastAPI + SQLite backend. Cards currently support title, description, due date, and member assignment. The card action popup (the "turbo menu" accessed via a `...` button on each card tile) provides quick access to Details, Members, Due date, and Archive actions.

Users want to visually categorize cards with background colors. This design covers adding an optional color field to cards end-to-end, following the same full-stack pattern used by `dueDate`.

## Goals / Non-Goals

**Goals:**
- Add an optional `color` field to the card data model (DB, API, state)
- Expose 6 fixed pastel colors (Red, Orange, Green, Blue, Violet, Gray) as swatches in the card action popup
- Place color swatches as the **first** row in the popup, above all other actions
- Apply the selected color as the card tile's background via inline style
- Allow clearing the color to revert to the default white background
- Follow existing patterns exactly (optimistic update, API reconcile, same migration approach as `dueDate`)

**Non-Goals:**
- Custom colors or hex input
- Color displayed on the card detail modal as the title input background
- Color-based filtering or search
- Color displayed on archived cards
- Full label/tag system — this is a single color per card only

## Decisions

### 1. Store color as a friendly name string

**Decision**: Store values like `"red"`, `"blue"` in the database, not hex codes.

**Rationale**: The palette is fixed. Friendly names are self-documenting and constrained by the frontend — the backend doesn't need to validate specific values beyond accepting any string or null. If the palette ever changes, the names remain stable identifiers.

**Alternatives considered**:
- *Hex codes in DB*: More flexible but unnecessary for a fixed palette. Couples data to exact visual values.
- *Integer enum (0-5)*: Opaque in the database, harder to inspect manually.

### 2. Follow the dueDate full-stack pattern

**Decision**: Thread `color` through every layer using the exact same pattern as `dueDate` — optional field, DB migration via `_add_column_if_missing`, conditional inclusion in API calls, optimistic reducer update, server reconciliation on response.

**Rationale**: `dueDate` is the most recently added optional card field and established a clean, proven pattern. Every layer (migration, Pydantic model, API bridge, reducer, UI) already has a template to follow.

### 3. Inline color swatches in the popup (not a submenu)

**Decision**: Render 6 colored circle buttons directly in the popup as the first row, with a separator below them. No "Color" label, no submenu expansion.

**Rationale**: This is the most direct interaction — one click to set a color. The Due date pattern has an expandable sub-editor because it needs a date picker, but color selection is just 6 discrete choices. Showing them inline is more efficient and visually appealing. The user explicitly requested color be first in the menu.

**Alternatives considered**:
- *"Color" menu item that expands inline (like Due date)*: Adds an unnecessary click for every color change.
- *Flyout submenu to the right*: More complex positioning, heavier implementation.

### 4. Inline style for card background

**Decision**: Apply the color via a `style` prop on the card tile div (`style={{ background: hexColor }}`), not via CSS classes.

**Rationale**: The color-to-hex mapping lives in a constant object. Using inline styles avoids generating dynamic CSS classes and keeps the mapping in one place. The CSS file already has `background: #fff` as a default — the inline style overrides it naturally.

### 5. Pastel colors with dark text — no dynamic text color

**Decision**: Use light/pastel hex values for all six colors so the existing dark text (`color: var(--color-text)`) remains readable without any text color switching.

| Label  | Hex       |
|--------|-----------|
| Red    | `#fecaca` |
| Orange | `#fed7aa` |
| Green  | `#bbf7d0` |
| Blue   | `#bfdbfe` |
| Violet | `#ddd6fe` |
| Gray   | `#e5e7eb` |

**Rationale**: Pastel backgrounds ensure WCAG AA contrast with dark text. No need to compute or hardcode per-color text colors. Simple and safe.

**Alternative considered**:
- *Saturated colors + white text on dark backgrounds*: Would require per-color text color logic, increasing complexity for no clear benefit given the user chose pastels.

### 6. Reset via a dedicated "clear" button next to the swatches

**Decision**: A small `✕` button after the 6 swatches clears the color back to `null` (white background).

**Rationale**: A visible, always-available reset is more discoverable than "click the active color again to toggle off."

## Risks / Trade-offs

- **Existing cards get no color**: Color is `null` by default and the CSS fallback is `#fff`. No migration of existing data needed. Cards simply stay white.
- **Color is shown on the modal title input**: The card's color is reflected as the background of the title input in the card detail modal, providing a visual connection between the tile and the detail view. The rest of the modal stays white.
- **No color validation on backend**: The backend accepts any string, not just the 6 known colors. If a bug or direct API call sets an unrecognized color, the frontend won't map it to a hex (treated as null → white). This is acceptable for an internal app.
