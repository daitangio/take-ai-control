## 1. StoreContext export helper

- [ ] 1.1 Add `exportBoard(boardId)` to `StoreContext.tsx`: calls `api.getBoard`, on error sets the toast via `toLocalizedErrorMessage` and returns `null`, on success returns the raw `BoardDetail` (pattern of `reloadBoard`). Verify with a new unit test in `StoreContext.test.tsx` asserting the error path sets a toast and returns null — `rtk npm test -- --run StoreContext` passes (in `nello/frontend`).

## 2. UserMenu entry and download

- [ ] 2.1 Add `userMenu.exportBoard` key to all 5 locale blocks in `i18n/resources.ts` (en/it/fr/de/es). Verify `rtk npm test` still passes and no raw-key rendering occurs in dev.
- [ ] 2.2 Add the "Export board" entry to `UserMenu.tsx`: rendered only when `activeBoard` exists, placed immediately before Logout, closes the menu on click, disabled while an export is pending (local `isExporting` state). Verify with render tests in `UserMenu.test.tsx`: hidden without active board, positioned before Logout, disabled state toggles.
- [ ] 2.3 Implement the filename sanitizer (`whitespace` → `-`, strip non-alphanumerics, `board.json` fallback) and the download (`Blob` + `URL.createObjectURL` + anchor click + `revokeObjectURL`). Verify with unit tests covering "Sprint Planning" → `Sprint-Planning.json`, "Squad Board$" → `Squad-Board.json`, and "!!!" → `board.json`.

## 3. Tests

- [ ] 3.1 Extend `UserMenu.test.tsx`: click triggers download with the sanitized file name (stub `URL.createObjectURL`/`revokeObjectURL` via `vi.stubGlobal`, assert anchor `download`/`href`); export failure shows no download attempt. Verify `rtk npm test -- --run UserMenu` passes.
- [ ] 3.2 Run the full frontend suite `rtk npm test` in `nello/frontend` and verify all tests pass.

## 4. Build and human verification

- [ ] 4.1 Run `rtk npm run build` in `nello/frontend` and verify the build succeeds.
- [ ] 4.2 Human test: with the app running, open the user menu on a board named e.g. "Sprint Planning$", select "Export board", and verify a file named `Sprint-Planning.json` downloads whose JSON matches the board shown on screen; also trigger an error (e.g. stop the backend) and verify the error toast appears and no file downloads.
