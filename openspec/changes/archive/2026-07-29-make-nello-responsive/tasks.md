## 1. Responsive foundation

- [x] 1.1 Define shared responsive viewport and touch-target styles in the frontend global stylesheet.
- [x] 1.2 Reflow the application header, board tabs, logout action, and filter input for phone and tablet breakpoints.
- [x] 1.3 Make login and empty-state forms fit narrow viewports without horizontal overflow.

## 2. Board and interaction adaptation

- [x] 2.1 Adapt board canvas padding and list/add-list widths for phone and tablet viewports while retaining horizontal column navigation.
- [x] 2.2 Configure drag sensors so touch swipes scroll the board and deliberate touch gestures initiate drag-and-drop.
- [x] 2.3 Adapt card, list, and board controls for touch-friendly sizing and focus visibility.

## 3. Viewport-safe overlays

- [x] 3.1 Make card, member, and archived-item dialogs viewport-bounded with scrollable content on narrow screens.
- [x] 3.2 Adapt action menus, toast notifications, and help content for narrow and short viewports.

## 4. Verification

- [x] 4.1 Add or update responsive frontend tests for phone and tablet header, form, board, and overlay behavior.
- [x] 4.2 Manually verify touch scrolling and deliberate drag behavior at representative phone, tablet, and desktop viewport sizes.
- [x] 4.3 Run the frontend test suite and finish with `rtk npm run build` from `nello/frontend`.
