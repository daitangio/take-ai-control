## Why

Boards currently use the same plain workspace background, giving users no way to make a board visually distinctive. A small, curated set of accessible SVG backgrounds lets each board feel personal without compromising the clarity of lists and cards.

## What Changes

- Add a per-board background setting with four fixed choices: no background, Mountain, Sea, and Sport.
- Provide a proper board-background menu with labelled visual previews and a clear selected state.
- Apply the selected background only to its board workspace and preserve the choice across sessions and devices.
- Add the three locally hosted, decorative SVG assets; no user-uploaded images or arbitrary URLs are supported.

## Capabilities

### New Capabilities

- `board-backgrounds`: Select, display, and persist one curated SVG background per board.

### Modified Capabilities

- `board-persistence`: Persist each board's selected background with the rest of the board state.

## Impact

- Frontend board state, API client, board workspace, translations, and focused UI tests.
- Backend board schema, board routes, response contracts, and route tests.
- A database migration and three frontend SVG assets; no new runtime dependency or external asset host.
