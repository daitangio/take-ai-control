## 1. Drag handle element

- [x] 1.1 In `nello/frontend/src/components/ListColumn.tsx`, add a drag handle element (a `<button type="button" className="list-drag-handle">` with a grip glyph) inside `.list-header`.
- [x] 1.2 Spread the `useSortable` `listeners` and `attributes` onto the handle element only (not the `.list-header` container); remove `{...listeners}` from the header container.
- [x] 1.3 Give the handle an `aria-label` identifying it as the list drag affordance and ensure it receives keyboard focus in the normal header tab sequence.
- [x] 1.4 Ensure the handle is rendered only when the list is visible/non-archived (archived lists already never render via `visibleListIds`; confirm the handle code does not assume it always renders).

## 2. Header interaction isolation

- [x] 2.1 Verify the static list title click (rename) no longer starts a drag without relying on `stopPropagation`; remove now-unneeded `stopPropagation` suppression where listeners are no longer present.
- [x] 2.2 Verify the `...` list action menu button and popup menu no longer need `stopPropagation` to avoid starting a list drag (drag trigger is now only the handle).
- [x] 2.3 Confirm card drag (within/between lists) and the empty-list droppable zone are unaffected by the listener relocation.

## 3. Styling

- [x] 3.1 Add `.list-drag-handle` styles in `nello/frontend/src/components/ListColumn.css`: size/hit-target (~24px), cursor `grab` (and `grabbing` while `isDragging`), subtle default appearance with hover/focus affordance.
- [x] 3.2 Verify the handle sits at the leading edge of `.list-header` without breaking the existing flex layout/gap.

## 4. Tests

- [x] 4.1 In `nello/frontend/src/components/ListColumn.test.tsx`, add a test that exactly one drag handle renders per visible list.
- [x] 4.2 Add a test that pressing the `...` action button / list title does not initiate a list drag (drag listeners are not attached to those elements).
- [x] 4.3 Add a test that the handle has the accessible label and is keyboard-focusable.

## 5. Verification

- [x] 5.1 Run `rtk npm run build` in `nello/frontend` and resolve any type/lint/build errors.
- [x] 5.2 Run the frontend test suite (`rtk npm test`) and ensure new and existing tests pass.
- [x] 5.3 Run `rtk openspec validate drag-drop-list-reorder` and fix any reported spec/validation issues.
