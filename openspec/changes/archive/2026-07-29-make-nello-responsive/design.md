## Context

The Nello frontend is a React/Vite single-page application whose current layout targets a desktop viewport: the fixed-height header contains board controls and a 300–460px search input, while boards use fixed-width list columns inside a horizontally scrolling canvas. Existing dialogs, the login form, and the help panel have only limited viewport constraints. `@dnd-kit` already uses a pointer sensor, so it can support touch input, but its activation threshold must avoid intercepting normal horizontal board scrolling.

## Goals / Non-Goals

**Goals:**

- Keep all authenticated UI controls usable at phone, tablet, and desktop widths.
- Preserve the board's horizontal list model while enabling natural touch scrolling and intentional drag-and-drop.
- Keep dialogs, forms, notifications, and help content within the visible viewport without horizontal overflow.
- Cover responsive behavior with focused viewport-level component tests and retain existing desktop behavior.

**Non-Goals:**

- Replacing the board with a single-column or native mobile navigation experience.
- Redesigning Nello's visual identity, changing data/API contracts, or adding a UI framework.
- Supporting offline use, native applications, or new gesture-only functionality.

## Decisions

### Use CSS media queries with a compact mobile header

Use the current component structure and responsive CSS rather than adding a layout library. At narrow widths (below 768px), wrap and reorder header content so the title and logout action remain on the first row, board tabs occupy a horizontally scrollable row, and search takes the available width on its own row. At tablet widths (768px through 1023px), retain the single-row header where space allows while reducing fixed gaps and search width. Desktop styling remains the baseline at 1024px and above.

CSS is already the styling mechanism and has no runtime or bundle-cost impact. A JavaScript viewport hook was considered but rejected because layout is declarative and CSS avoids SSR/resizing state complexity.

### Retain horizontal board columns and protect touch scrolling

Keep list columns at a usable fixed width and retain the board canvas as the horizontal scrolling surface. On phone widths, reduce the column width and board padding enough to show a clear next-column affordance while preserving readable cards. Configure the pointer drag sensor with a touch delay and tolerance (while retaining a small mouse movement distance) so a swipe scrolls the board and a deliberate press-and-drag reorders content.

Stacking every list vertically was considered but rejected because it hides the board workflow and makes cross-list moves cumbersome. Replacing drag-and-drop with dedicated move controls is also out of scope.

### Make overlays and interactive controls viewport-safe

Use responsive sizing for login, empty-state forms, modals, member/archive dialogs, help, menus, and inputs. Modal overlays will use viewport-aware padding and allow the dialog body to scroll. Interactive controls will maintain touch-friendly hit areas and visible focus states without relying on hover alone.

Adding a separate mobile component set was considered but rejected because it duplicates established behavior and increases maintenance risk.

### Test declared breakpoint behavior

Add tests that render the key application components at representative phone and tablet viewport widths and verify the responsive classes/semantics and touch sensor configuration where testable. Use browser/device verification during implementation for actual scrolling and drag gestures, since jsdom cannot faithfully emulate layout or touch interaction.

## Risks / Trade-offs

- [Touch drag can block horizontal scrolling] → Use a delayed touch activation constraint with tolerance and manually verify on a physical or browser-emulated touch device.
- [Long board names or controls can overflow the header] → Use horizontal scrolling for board tabs, flexible widths, and text wrapping/overflow rules where appropriate.
- [Dialog content can exceed short mobile viewports] → Bound dialog height to the viewport and make its content scrollable.
- [CSS breakpoint regressions are hard to detect in jsdom] → Include explicit responsive test coverage and validate phone, tablet, and desktop sizes in a browser before release.
