## Context

`BoardView` wraps the board in a `DndContext` + `SortableContext` (horizontal strategy) over `visibleListIds`, and each `ListColumn` calls `useSortable({ id: listId, data: { type: 'list', boardId } })` from `@dnd-kit/sortable`. `handleDragEnd` already handles the `type === 'list'` branch and dispatches `list/reorder` with the reordered `listIds`. Card drag/`DropOverlay` already works and is unaffected.

The problem is purely the **drag trigger surface**: `ListColumn` spreads `{...listeners}` onto the entire `.list-header` container. Every pointer interaction on the header — including aiming for the static title (rename) or the `...` action menu button — can begin a drag. Today this is mitigated with `stopPropagation()` on the title span, the rename `<input>`, and the action-button area, but there is no visible cue that the list is draggable, and the stop-propagation layering is fragile (e.g. hovering empty header padding still drags).

We are not changing reordering logic, data flow, or persistence — only which element receives the listeners and what it looks like.

## Goals / Non-Goals

**Goals:**
- Expose a single, discoverable graphic drag handle in each visible (non-archived) list header that is the sole trigger for starting a list drag.
- Stop binding drag `listeners` to the whole `.list-header`; the title rename and `...` action menu must never start a drag (removing reliance on `stopPropagation` as the primary guard).
- Keep the handle accessible and keyboard-operable via `@dnd-kit`'s existing `attributes`/`listeners`.

**Non-Goals:**
- No change to the `list/reorder` action, reducer, or persistence.
- No change to card drag-and-drop or the `card/move` path.
- No cross-board list moves.
- No new third-party drag dependency — continue using `@dnd-kit/sortable`.
- No reordering of archived lists (they remain absent from the view and never render a handle).

## Decisions

### Decision 1: Dedicated handle element, listeners moved off the header
Render a new `<button className="list-drag-handle">` inside `.list-header` and spread the `useSortable` `listeners` + `attributes` onto **only** that element. Remove `{...listeners}` from the `.list-header` container.

**Rationale:** Isolates the drag gesture to a single, visible affordance. The header's other controls (title rename, `...` menu) become plain click targets with no need for `stopPropagation` to suppress a drag, which is more robust than the current layering.

**Alternative considered:** Keep whole-header dragging and merely add a visual grip icon as a hint. Rejected — it does not fix the accidental-drag problem and keeps the `stopPropagation` fragility.

### Decision 2: Use a `<button>` element with an accessible label
The handle is a `<button type="button" aria-label="Drag list">` containing a grip glyph (e.g. `⠿` / two stacked dots), styled to look non-interactive until hover/focus. `@dnd-kit`'s `attributes` (which include `role`, `tabIndex`, and `aria-*` for keyboard drag) are spread onto it. The single static `aria-label` describes the affordance.

**Rationale:** A button gives us native focus + keyboard semantics on top of `@dnd-kit`'s keyboard drag, and is the right pattern for a "grab grip." Using a `<button>` (not a bare `<div>`) means space/enter don't also bubble to listeners unexpectedly; `@dnd-kit` listeners handle pointer + keyboard drag initiation directly.

**Alternative considered:** A bare `<div>` with `aria-roledescription`. Rejected — less ergonomic and loses native focusability without extra attributes.

### Decision 3: Handle hidden for archived lists
`ListColumn` already returns early on a missing list; archived lists are filtered out of `visibleListIds` in `BoardView` and therefore never render. To be defensive, the handle is suppressed (or the listeners omitted) when a list is in an archived state. Since archived lists never appear in `visibleListIds`, in practice they never render — no extra gating is strictly needed, but the handle code must not assume it always renders.

**Rationale:** Keeps the rule "archived lists are never reorder targets" mechanically true.

### Decision 4: Minimal layout/CSS changes
Add a `.list-drag-handle` rule (rest, `:hover`, `:focus-visible`, and an `isDragging`-driven "grabbing" cursor) and place it at the leading edge of `.list-header`. The existing flex layout already has a `gap` so a new fixed-width child slots in without restructuring.

## Risks / Trade-offs

- **Risk:** Removing whole-header dragging changes muscle memory for existing users who drag from anywhere on the header. → **Mitigation:** The handle is large, always-present, and visually cues draggability; this is an intended UX improvement, not a regression in capability.
- **Risk:** Whole-header area used to cover the empty space, so list reordering was tolerant. → **Mitigation:** The handle has a comfortable hit target (~24px) and is positioned at the leading edge where the grip already visually belongs.
- **Risk:** `stopPropagation` removal could resurrect a drag on the rename input. → **Mitigation:** With listeners no longer on `.list-header`, the rename `<input>` and title span no longer need `stopPropagation` to avoid dragging; they simply aren't drag sources. Keep any retention that prevents accidental text-selection-triggered drags minimal.
- **Trade-off:** Slightly more markup per list (one button). Negligible for board sizes here.

## Migration Plan

- Pure frontend change; deploy with the next frontend build. No data migration, no backend coordination.
- Rollback: revert `ListColumn.tsx`/`ListColumn.css`; reordering continues to work via whole-header drag. No persisted state depends on the handle.

## Open Questions

- Final glyph choice for the grip (`⠿` vs an inline SVG) — small visual detail to confirm during implementation; SVG is preferred for crispness at all zoom levels.
