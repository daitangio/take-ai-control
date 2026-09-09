## Context

Motivation is in proposal.md. Relevant current state:

- `nello/frontend/src/components/BoardSwitcher.tsx` renders one tab per board (`boards.map(...)`) plus a create control; each tab carries name, delete (owner only), rename, and member-management (shared boards) buttons.
- Styling lives in `nello/frontend/src/components/Board.css`, including an existing `@media (max-width: 767px)` block.
- The store exposes `state.boards`, `state.activeBoardId`, and `selectBoard(id)`; switching reloads from the server (spec: board-management "Board switching").
- i18n: `board.*` keys exist in 4 locales (en, it, fr, de) in `i18n/resources.ts`.
- Tests: `BoardSwitcher.test.tsx` mocks `StoreContext` and drives the UI with `@testing-library/react`.

## Goals / Non-Goals

**Goals:**
- Same behavior contract as the tabs (switch, rename, delete, members, create), reorganized behind a combo box when `boards.length > 3`.
- Zero backend changes.

**Non-Goals:**
- Changing the switching/reload logic itself.
- Reordering boards, board search, or keyboard navigation beyond native `<select>` behavior.
- Changing behavior when 3 or fewer boards exist.

## Decisions

1. **Threshold constant `COLLAPSE_THRESHOLD = 3`, collapse when `boards.length > 3`.**
   - Rationale: matches the request "more than 3". A named constant keeps the boundary explicit and testable.
   - Alternative: make it configurable — rejected, no requirement for it.

2. **Use a native `<select>` as the combo box.**
   - Rationale: minimal code, native touch/keyboard behavior, and native dropdown handling that never overflows the viewport on mobile — which directly satisfies the responsive requirement. Fits the project's "less is more" mantra.
   - Alternative: custom dropdown consistent with `board-background-menu` styling — rejected: more code (outside-click handling, viewport clamping, focus management) for no functional gain at this scale.

3. **Per-board actions live next to the combo box and act on the active board.**
   - In collapsed mode, the delete (×), rename (✎), and member-management (👤) buttons that today sit on each tab render beside the `<select>`, reusing the existing handlers with `activeBoard`.
   - Rationale: actions must stay reachable (spec) without duplicating them inside the dropdown.
   - Alternative: actions inside the dropdown — rejected, native `<select>` cannot host buttons.

4. **Rename in collapsed mode reuses the existing editing pattern.**
   - When `editingId` is set in collapsed mode, the `<select>` is replaced by the existing `.board-tab-input` until rename commits or Esc cancels.
   - Rationale: no new state or flow.

5. **Responsive handling via existing CSS breakpoint.**
   - The combo box gets a `max-width` (e.g. `min(200px, 40vw)`) so it coexists with the header controls; the 767px block bumps its min-height to 36px, matching the touch-target pattern already used for `.board-tab`.
   - Rationale: reuses the established mobile pattern; native `<select>` handles the rest.

6. **New i18n key `board.switcher` for the `<select>` `aria-label`**, added to all 4 locales.
   - Rationale: the control needs an accessible name; existing keys don't cover it.

## Risks / Trade-offs

- [Native `<select>` styling differs from the app's custom controls] → Accepted trade-off for simplicity; visual consistency within the header is kept via shared CSS variables (border, color, radius).
- [Tests rendering the combo box with 4 boards] → Extend `BoardSwitcher.test.tsx` with a helper that builds 4 boards; verify `<select>` presence, option count, `selectBoard` call on change, and per-board action buttons targeting the active board.
- [Existing tests assume tab text is always present] → They use 2 boards, so they keep passing unchanged; new tests cover the collapsed branch.
- [Locale completeness] → Adding `board.switcher` to all 4 locales keeps parity; missing key falls back to `en` via i18n config.

## Migration Plan

- Frontend-only change; deploy with the usual frontend build (`npm run build`). Rollback is a revert of the component/CSS/i18n/test files. No data or API migration.
