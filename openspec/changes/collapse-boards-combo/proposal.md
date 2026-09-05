## Why

With many boards, the tab bar in the header becomes crowded and overflows horizontally, hurting usability. When a user has more than 3 boards, the switcher should collapse into a compact combo box that also remains fully usable on mobile devices.

## What Changes

- When the user has more than 3 boards, the board tabs are replaced by a single combo box listing every board, with the active board selected.
- With 3 or fewer boards, the current tab display is unchanged.
- Selecting a board from the combo box switches the active board (existing server-reload behavior applies).
- In combo box mode, the per-board actions of the active board (rename, delete, member management) remain available next to the combo box, so no existing capability is lost.
- The combo box and its dropdown menu SHALL be responsive: operable on touch devices, no horizontal viewport overflow at phone widths, and the dropdown stays within the viewport.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `board-management`: the "Board switching" requirement is extended with display behavior that collapses boards into a combo box when there are more than 3.
- `responsive-user-interface`: new requirement that the collapsed board combo box is reachable, operable on touch, and viewport-safe at phone widths.

## Impact

- `nello/frontend/src/components/BoardSwitcher.tsx` — conditional rendering between tabs and combo box, active-board action buttons in combo mode.
- `nello/frontend/src/components/Board.css` — styles for the combo box, its dropdown, and mobile media-query adjustments.
- `nello/frontend/src/components/BoardSwitcher.test.tsx` — new tests for the collapse threshold, combo interactions, and responsive behavior.
- Possibly small additions to `nello/frontend/src/i18n/resources.ts` for accessibility labels.
- No backend or API changes.
