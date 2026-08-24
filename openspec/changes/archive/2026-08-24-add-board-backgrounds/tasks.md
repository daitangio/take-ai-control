## 1. Persisted board background contract

- [x] 1.1 Create `nello/backend/db-init/005-board-background.sql` using SQLite-compatible syntax to add the nullable board-background column with `DEFAULT NULL`.
- [x] 1.2 Map the constrained background identifier in the backend schema.
- [x] 1.3 Extend board create, list, detail, and update response contracts to expose the persisted background, defaulting existing and new boards to None.
- [x] 1.4 Extend board update validation to accept independent name and background updates, reject unknown background values, and preserve the stored value after rejection.
- [x] 1.5 Add backend route tests for default, update, retrieval, shared-board access, and invalid-background rejection behavior.
- [x] 1.6 Human review: inspect `005-board-background.sql` before deployment to confirm it uses SQLite-compatible syntax and safely preserves existing boards with no background selected.

## 2. Board workspace visual experience

- [x] 2.1 Create the locally bundled Mountain, Sea, and Sport decorative SVG background assets.
- [x] 2.2 Extend frontend board/API state hydration and board updates with the nullable background identifier.
- [x] 2.3 Add an accessible Board background menu with None, Mountain, Sea, and Sport labelled previews, selected-state feedback, keyboard operation, and responsive touch targets.
- [x] 2.4 Apply the selected artwork only to the active board workspace, retaining readable and interactive list/card/control surfaces.
- [x] 2.5 Add frontend unit/component tests for menu choices, selection persistence handling, background rendering, and API-error rollback.

## 3. Verification

- [x] 3.1 Run the backend test suite and TypeScript build.
- [x] 3.2 Run the frontend test suite and final frontend production build.
- [x] 3.3 Human test: select each background and None on a personal board, reload and sign in again, then verify the menu, board interactions, contrast, and mobile header layout; also verify the same choice is visible to a shared-board collaborator.
