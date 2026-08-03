## Why

Safari can report a card or nested card-drop zone as the closest target while a list is being dragged. This prevents the last list from being reordered because the nested target ID is not present in the board's list order.

## What Changes

- Restrict list-drag collision detection to sortable lists on the active board.
- Preserve the existing card-drag collision targets and behavior.
- Resolve a nested drop target to its owning list before calculating the new list position as a defensive fallback.
- Add regression coverage for list and card collision filtering.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `list-management`: Require list reordering to ignore nested card targets and work when moving the last visible list in Safari.

## Impact

- Frontend drag-and-drop collision detection and list reorder handling.
- Frontend unit tests for board collision targeting.
- No backend API, persistence format, or dependency changes.
