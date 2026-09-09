## Context

See `proposal.md` for motivation and the change delta specs for behavioral requirements. Nello is a React/TypeScript frontend backed by Fastify, Drizzle, and SQLite. The active board is already loaded with its non-archived lists and cards, and the user menu already hosts active-board controls such as Board background and Export board.

Cards currently persist a nullable `due_date` text value. The database is managed migration-first through ordered SQL files in `nello/backend/db-init`, followed by Drizzle schema synchronization.

## Goals / Non-Goals

**Goals:**

- Add a fractional, positive effort estimate while preserving all existing card workflows and API clients.
- Build Gantt data from the active board already held in frontend state.
- Give the Gantt view predictable local date-only behavior without a new charting dependency.
- Keep the board menu compact and make the Gantt view independently closeable.

**Non-Goals:**

- Dependencies, milestones, critical-path calculation, resource leveling, or progress/completion tracking.
- Editable timeline bars, drag-rescheduling, or changing a due date from the Gantt view.
- Including archived cards or undated cards in the active board chart.
- A separate persisted start-date field or a dedicated Gantt backend endpoint.
- Calendar/workday awareness; effort is elapsed calendar-day duration.

## Decisions

### Persist effort as a non-null SQLite REAL value with default 1

Add `effort_days REAL NOT NULL DEFAULT 1` to the card table through a new ordered `db-init` migration and expose it as a numeric field in the Drizzle schema. Existing rows receive `1` through the database default, while future card creation needs no client payload change to receive the same default.

The card update route accepts an optional `effortDays`. When the field is supplied, it validates it is a JavaScript finite number greater than zero before updating; when omitted, it preserves the database value. `null`, strings, zero, negative values, `NaN`, and infinities are invalid. The response mappers include the current effort in every card representation, including board detail and archived-card records.

A nullable column was rejected because every chartable card needs a duration and it would force another missing-data rule. An integer column was rejected because the confirmed requirement permits fractional estimates.

### Use due date as an inclusive range end

Due dates remain date-only ISO strings and are the inclusive end of a bar. For an effort value `e`, calculate the range start as:

```text
start = dueDate - e + 1 day
end   = dueDate
```

For example, effort `3` due on 2026-08-15 spans 2026-08-13 through 2026-08-15; effort `1` is a same-day bar. Fractional effort creates a fractional width while remaining anchored to the due-date end.

Date-only values will be parsed and manipulated with explicit local/calendar date helpers rather than `new Date("YYYY-MM-DD")`, which is interpreted as UTC and can shift rendered dates in western timezones. Numeric timeline positions use milliseconds/day only after constructing stable local calendar boundaries.

Treating due date as the start was rejected because it changes the meaning already understood as a deadline. Persisting an explicit start date was rejected as redundant input and outside the requested scope.

### Render a lightweight Gantt dialog from active state

Add a `GanttChartDialog` component rendered at the app level, controlled by `AppInner` state. `UserMenu` receives an `onGanttChartClick` callback and displays an active-board-only command; invoking it closes the menu and opens the dialog. The dialog reads the active board and existing normalized store state, filters cards without a due date, and groups remaining rows by board list order and list card order.

The chart uses a horizontally scrollable date grid with a sticky title/list column, a computed visible range from the earliest derived start through the latest due date, and CSS-positioned bars. It does not need an API request because board detail already contains the required data and existing SSE reloads keep it current.

Adding a server-side Gantt endpoint was rejected as duplicated projection logic and an additional authorization/data-sync surface. Introducing a third-party Gantt library was rejected to keep the project compact and avoid dependency, styling, and accessibility overhead.

### Use the existing card modal save behavior

Add a numeric input to `CardModal` for effort days. It initializes from the card response, includes effort in dirty checking, and sends it with the existing `card/edit` action. The frontend type and API builder carry `number` effort values, preserving the API client's existing rule that optional fields are omitted when undefined.

Invalid client input will be surfaced before dispatch where possible, but backend validation remains authoritative. The Gantt view uses server-backed effort values and therefore cannot encounter a saved invalid value.

### Preserve export, archive, and real-time synchronization paths

Because the board export is the existing board-detail response, adding `effortDays` to its card representation automatically includes it in exports. Archiving retains the card row, so effort survives archive/unarchive once the column exists. Existing card update events already cause active viewers to reload board data; the response/store reconciliation path must include effort for immediate local updates.

## Risks / Trade-offs

- [Fractional calendar days can be visually unfamiliar] -> Label each bar with its numeric effort and allow fractional widths while keeping day ticks as the primary scale.
- [Date parsing can shift around timezone and DST boundaries] -> Use explicit calendar-date parsing/formatting helpers and calculate display positions from local date boundaries.
- [Large date spans create excessively wide charts] -> Use horizontal scrolling and a bounded minimum day-column width rather than compressing labels until illegible.
- [Direct API clients may send malformed numeric JSON] -> Validate type, finiteness, and positivity in the backend before writing.
- [Optimistic effort updates can temporarily diverge on rejection] -> Reuse the store's existing API failure reload path to restore server state and show the localized error toast.
- [A `REAL` column can represent binary floating-point artifacts] -> Preserve the submitted numeric value and use display formatting that avoids insignificant trailing digits.

## Migration Plan

1. Add a new ordered SQLite migration that adds `card.effort_days REAL NOT NULL DEFAULT 1`, then run `jjMigrator.sh` according to `MIGRATION.md`.
2. Synchronize the Drizzle schema from the migrated database and update the source schema mapping.
3. Deploy the backend validation and response mapping before or together with the frontend so all loaded cards contain a valid effort value.
4. Deploy frontend model/API/store propagation, card-modal editing, translations, user-menu command, and Gantt dialog.
5. Roll back by hiding the Gantt/menu and effort editor while retaining `effort_days`; the additive column and its values are backward-safe.
