## Why

Nello's desktop-oriented layout does not adapt its header, board controls, dialogs, and touch interactions for phone and tablet screens. Making the frontend responsive lets people reliably view and manage boards from the devices they use away from a desk.

## What Changes

- Add responsive layouts for phone, tablet, and desktop viewports across the authenticated application and login flow.
- Reflow header controls, board navigation, search, forms, dialogs, and help content so controls remain visible and usable on narrow screens.
- Preserve horizontal board navigation while making list and card interactions practical with touch input.
- Define responsive acceptance criteria and viewport-based frontend tests.

## Capabilities

### New Capabilities

- `responsive-user-interface`: Adaptive Nello frontend layouts and touch-friendly controls for phone and tablet viewports.

### Modified Capabilities

- None.

## Impact

- Affected code: `nello/frontend/src/App.tsx`, application and component CSS, board drag-and-drop sensor configuration, and responsive UI tests.
- No backend API, data-model, or dependency changes are expected.
