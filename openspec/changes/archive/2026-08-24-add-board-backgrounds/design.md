## Context

The board workspace is rendered by the frontend while boards are read and updated through the existing authenticated board API. Board data currently has no visual-background field. See proposal.md for motivation and the delta specs for user-visible behavior.

## Goals / Non-Goals

**Goals:**

- Persist a compact, safe background identifier per board.
- Offer a polished, accessible selection menu with lightweight previews.
- Keep board content legible over every theme and preserve existing board interactions.

**Non-Goals:**

- Custom uploads, arbitrary remote images, a background editor, or animated artwork.
- Different per-user backgrounds for the same shared board.
- Changing card or list background-color behavior.

## Decisions

### Store a constrained identifier, not artwork

Add a nullable `background` field to boards, with `null` representing None and `mountain`, `sea`, and `sport` as the accepted persisted values. The API returns this field in board summary/detail responses and accepts it through the existing board update route.

This keeps the database compact, makes invalid values rejectable, and prevents untrusted SVG/remote-resource loading. Storing an uploaded data URI or arbitrary CSS URL was rejected for security, validation, and migration complexity.

### Keep one background per shared board

The background is board data, so it is shared by everyone who can access that board and is updated under the existing board-update access policy. Per-user preferences were rejected because they would be surprising for a board-level customization and require a separate preference model.

### Use locally bundled, static SVG assets

Create one non-interactive SVG per named option and map the persisted identifier to that asset in the frontend. Artwork is applied to the workspace container as a decorative background layer, with a subdued fallback color/overlay beneath opaque list and card surfaces.

Inline arbitrary SVG markup and external asset hosting were rejected: bundled assets have predictable rendering, no network dependency, and a small reviewable surface.

### Use a compact header control

Place a Board background control inside user menu, above Settings. It opens a menu of four labelled, keyboard-accessible options; each option includes a thumbnail and the current selection has a visible selected state. A native select is an acceptable implementation if it can present both the label and selected value accessibly; otherwise use the project's existing button/menu interaction pattern.

### Preserve update compatibility

Extend the board update contract so name and background can be updated independently. Existing rename flows continue sending a name, while a background change sends only the background. The backend validates supplied fields before writing and returns the complete board response.

## Risks / Trade-offs

- [Artwork reduces contrast] → Keep graphics muted, add a light overlay where needed, and retain existing solid list/card backgrounds.
- [Slow persistence makes the UI feel unresponsive] → Optimistically show the selected background and revert with the existing API-error feedback path if saving fails.
- [Background menu crowds the mobile header] → Use the existing responsive header wrapping pattern and ensure a 36px minimum touch target.
- [Older rows have no field] → Treat `NULL` or absent response values as None during migration and frontend hydration.

## Migration Plan

1. Put a SQLite-compatible SQL migration inside `nello/backend/db-init/005-board-background.sql` that adds a nullable `background` column with `DEFAULT NULL`; existing boards therefore render as None.
2. Create a human migration-review task.
3. Deploy backend validation and response mapping before or with the frontend.
4. Deploy the frontend asset map, menu, persistence handling, and tests.
5. Roll back by removing the frontend control and ignoring the nullable field; stored selections are harmless and can be retained for a later re-enable.
