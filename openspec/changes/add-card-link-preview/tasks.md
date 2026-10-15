## 1. Preview window foundation

- [ ] 1.1 Add a single board-level card-link preview state and a floating accessible dialog component with focus entry, Escape/close handling, source-control focus restoration, and responsive bounds; verify dialog component tests cover open, close, replacement, and focus restoration.
- [ ] 1.2 Render the selected validated URL in a conservatively sandboxed iframe together with visible URL and protected external-open action; verify tests assert iframe URL/sandbox and new-context link attributes.

## 2. Card interaction integration

- [ ] 2.1 Change the safe card-tile link control to open the floating preview while preventing card-modal opening and drag initiation; verify tile/board tests cover event isolation and opening the selected URL.
- [ ] 2.2 Add translations and responsive preview styling for all supported locales; verify frontend type checking and component rendering at narrow viewport dimensions.

## 3. Verification

- [ ] 3.1 Run the relevant frontend unit-test suite and `rtk npm run build` in `nello/frontend`; verify both commands exit successfully.
- [ ] 3.2 Human verification task: open a frameable card link, replace it with another, use the external-open action, close with Escape, test a site that blocks framing, and verify phone viewport controls and board interactions remain usable.
