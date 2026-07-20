## Why

Creating several cards currently requires reopening the card composer with the mouse after every submission. Fast task capture should let a user select a list once and enter a sequence of cards entirely from the keyboard.

## What Changes

- Open the card composer and focus its title field when the user clicks unused space in a list.
- Keep the composer open and focused after Enter creates a non-empty card, ready for the next title.
- Preserve existing card opening, list-title renaming, drag-and-drop, multiline title, and cancel interactions.
- Give empty lists a comfortably sized click target for starting card entry.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `card-management`: Card creation gains click-to-compose and consecutive keyboard entry behavior.

## Impact

- Frontend only; no API, persistence, or backend changes.
- Affects `ListColumn` interaction state and card-composer styling.
- Adds UI coverage for sequential card creation and protected existing interactions.
