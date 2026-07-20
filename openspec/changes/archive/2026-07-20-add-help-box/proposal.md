## Why

Nello exposes useful collaboration features without explaining how to discover them, especially the `$` naming convention for shared boards. Authenticated users need lightweight, in-context guidance that can grow as more help content is provided.

## What Changes

- Add a compact help box fixed to the lower-right corner of the authenticated application.
- Seed the box with guidance for creating a shared board and managing its members.
- Allow users to dismiss the box and remember that preference in the browser.
- Adapt the box to narrow viewports without obscuring the primary board controls.
- Keep help entries separate from presentation so additional information can be added easily.

## Capabilities

### New Capabilities

- `in-app-help`: Authenticated help-box visibility, content, dismissal, persistence, and responsive presentation.

### Modified Capabilities

None.

## Impact

- Frontend only; no backend API or data-model changes.
- Affects the authenticated application shell and its styling.
- Adds browser-local persistence for the dismissed state.
- Adds focused component tests for authenticated visibility, content, dismissal, and unauthenticated behavior.
