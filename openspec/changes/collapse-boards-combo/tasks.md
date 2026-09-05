## 1. Combo box rendering

- [x] 1.1 Add `COLLAPSE_THRESHOLD = 3` and conditionally render a native `<select>` with all boards (active one selected) when `boards.length > 3`, keeping the tab rendering otherwise. Verify `rtk npm run test` shows existing BoardSwitcher tests still passing.
- [x] 1.2 Wire the `<select>` change handler to `selectBoard(id)`, skipping the no-op when the chosen board is already active. Verify with a new unit test that changing the select calls `selectBoard` and that re-selecting the active board does not.
- [x] 1.3 Render the active board's delete/rename/member-management buttons next to the `<select>` (same conditions as the tabs) and show the existing rename input in place of the `<select>` while `editingId` is set. Verify with unit tests for the action buttons in collapsed mode.

## 2. Accessibility and localization

- [x] 2.1 Add a `board.switcher` label key to all 4 locales (en, it, fr, de) in `nello/frontend/src/i18n/resources.ts` and use it as the `<select>` `aria-label`. Verify `rtk npm run build` succeeds and the key exists in each locale.

## 3. Styling

- [x] 3.1 Add `.board-combo` styles to `nello/frontend/src/components/Board.css` (shared CSS variables, `max-width` so it coexists with header controls) and extend the existing `@media (max-width: 767px)` block with a 36px min-height touch target. Verify visually at phone, tablet, and desktop widths and with `rtk npm run build`.

## 4. Unit tests

- [x] 4.1 Extend `BoardSwitcher.test.tsx` with collapsed-mode tests: with 4 boards a `<select>` with 4 options is rendered and the active board is selected; with 3 boards tabs are rendered; crossing the threshold (4th board added) switches presentation. Verify `rtk npm run test` passes.

## 5. Final verification

- [ ] 5.1 Human test: run the app, create a 4th board and confirm the combo box appears on desktop and in a phone-sized viewport; switch, rename, delete, and manage members through it; delete boards down to 3 and confirm tabs return. Finish with `rtk npm run build` as the last step.
