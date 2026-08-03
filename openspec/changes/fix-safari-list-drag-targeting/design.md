## Context

Each list registers an outer sortable target for list reordering and nested targets for card sorting and empty-list drops. The shared `closestCorners` strategy can select a nested target during a list drag, with Safari exposing the problem consistently when the last column is moved. The reorder handler previously assumed every collision ID was a list ID.

## Goals / Non-Goals

**Goals:**

- Make list collision targets unambiguous across supported browsers.
- Keep card drag-and-drop behavior unchanged.
- Safely resolve an unexpected nested target to its owning list.

**Non-Goals:**

- Replace `@dnd-kit` or change drag sensors.
- Change list persistence or backend reorder APIs.
- Redesign the drag handle.

## Decisions

- Use a drag-type-aware collision strategy. When the active item is a list, pass only sortable list containers belonging to the active board to `closestCorners`; card drags continue using every registered drop target. This fixes the ambiguity at its source without changing card behavior.
- Retain a defensive fallback in the drop handler that uses a target's `listId` metadata when present. This prevents an invalid reorder if a nested target reaches the handler despite collision filtering.
- Keep collision logic in `src/dnd` rather than the React component so it is independently testable and does not create a Fast Refresh warning.

## Risks / Trade-offs

- [Target metadata changes could exclude valid list targets] → Filter on the existing sortable-list `type` and `boardId` contract and cover it with unit tests.
- [Collision filtering could affect card moves] → Bypass filtering unless the active drag type is `list` and test the card path explicitly.
