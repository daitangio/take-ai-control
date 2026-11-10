## 1. Card link data flow

- [x] 1.1 Add the nullable `link` field to the backend card schema and card request/response types; verify TypeScript type checking succeeds.
- [x] 1.2 Extend card PATCH handling to preserve omitted links, persist explicit HTTP(S) links or `null`, and reject unsafe schemes; verify backend route tests cover set, replace, clear, omission, and invalid-scheme cases.
- [x] 1.3 Include the link in card creation, update, and board-detail responses; verify backend tests assert the returned values.

## 2. Frontend editing and display

- [x] 2.1 Carry `link` through frontend API types, store actions, reducer state, and board reload mapping; verify frontend type checking and state/API tests pass.
- [x] 2.2 Add a translated URL input to the card detail modal and include it in dirty checking; verify component tests cover saving a link, clearing it, and closing without changes.
- [x] 2.3 When a changed description has an HTTPS URL and the local link is blank, auto-fill it with the first URL and display a translated brief confirmation; verify component tests cover auto-fill, first-match selection, no overwrite of an existing link, and no message when the link remains unchanged.
- [x] 2.4 Render an accessible external-link control beside a linked card title with safe new-context attributes and isolated pointer/click behavior; verify card-tile tests cover visibility, accessible name, navigation attributes, and preserved modal/drag interactions.

## 3. Integration verification

- [x] 3.1 Run the relevant backend and frontend unit-test suites, then run `rtk npm run build` in `nello/frontend`; verify all commands exit successfully.
- [x] 3.2 Manually edit a card description containing an HTTPS URL while its link is blank, confirm the link field auto-fills and the confirmation appears, then save, reload, activate the tile icon, and clear the link; verify persistence, new-tab navigation, and icon removal without opening the card modal.
- [x] 3.3 Human verification task
