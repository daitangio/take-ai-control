## Context

`004-limits.sql` already defines `user_tier` and assigns all users a tier, but the runtime Drizzle schemas and routes do not map or query either. Board, list, and card mutations are implemented in separate Fastify route modules; cards can also enter a list through move and unarchive flows. The frontend already has a stable-error-code localization path and refreshes local board state from API responses.

## Goals / Non-Goals

**Goals:**

- Enforce tier limits consistently for every path that creates or activates an entity.
- Give the frontend authoritative usage/limit values so warnings update immediately after mutations and on load.
- Preserve existing authorization, archive behavior, and response data while extending it compatibly.

**Non-Goals:**

- Tier purchase, upgrade, or administration UI.
- Changing the tier values defined by the existing migration.
- Restoring archived lists; no such API exists today.

## Decisions

### Apply limits to ownership and active entities

Boards count only against their owner. Lists and cards use the board owner's tier even when a shared-board member performs the mutation. A list or card with an archive marker is excluded from the respective count.

This matches the persisted model—only boards have an owner—and lets archive free capacity. Counting all historical rows was rejected because it would make archive unable to free space despite the product treating archived items as hidden/inactive.

### Centralize capacity reads and use a compact API shape

Create a backend capacity helper that retrieves owner-tier limits and active counts. It will return `{ used, limit }` for boards, lists, and cards. Board summaries/details expose board and list capacity; each active list in board detail exposes card capacity. Successful create, move, and unarchive responses expose the affected post-operation capacity so the UI can warn without a follow-up request.

Adding a dedicated limits endpoint was rejected: the information is contextual to existing screens, requires another round trip, and does not update local state after a mutation.

### Serialize every capacity-changing path

The single-process backend serializes capacity-changing operations: it reads the applicable active count, rejects at limit, and performs the mutation before allowing the next capacity operation. Card unarchive and cross-list move check the target list only when it differs from the current active list; a same-list reorder does not consume capacity.

The initial transaction design was not compatible with the project's in-memory LibSQL test client, which executes transactions on a separate connection. A shared mutation lock provides the same count-and-mutate atomicity for Nello's single backend process while retaining reliable test behavior.

### Use three resource-specific conflict codes

Define `BOARD_LIMIT_REACHED`, `LIST_LIMIT_REACHED`, and `CARD_LIMIT_REACHED`, each returned with HTTP 409. Resource-specific codes allow concise localized messages while preserving the established error-code contract.

### Present warnings in existing creation surfaces and board view

Add a reusable capacity warning component shown when `used / limit >= 0.75`. It is non-blocking and displays the resource label plus `used/limit`. Board warnings appear in the board switcher/create surface; list and card warnings appear in the active board view alongside their relevant creation controls. Capacity errors use the existing localized API-error presentation.

Passive banners were chosen over disabling controls at 75%, because users must remain able to use the remaining capacity. Controls become effectively blocked only by the server at 100%, which avoids stale-client enforcement.

## Risks / Trade-offs

- [Existing databases may have `004-limits.sql` applied but application types missing] → Run the established migration process against a copy and introspect/update Drizzle mappings before deployment.
- [Capacity metadata expands response payloads] → Only return compact numeric objects on currently used board/list/card responses.
- [Archived card counting requires joins] → Use indexed foreign-key joins and scope counts to a single list or owner; limits are small by design.
- [Tier changes can make existing data exceed a new limit] → Existing entities remain readable and editable; only operations that add active capacity are rejected.

## Migration Plan

1. Back up the production SQLite database.
2. Apply the existing limits migration to databases that lack the tier schema, using the project migration process; verify all users resolve to the free tier.
3. Deploy the backend and frontend together so the API capacity metadata and localized errors have consumers.
4. Verify free-tier boundary cases (3 boards, 12 active lists, 48 active cards) and a shared board using the owner's tier.
5. Roll back application code if necessary; the additive tier tables/column remain safe and unused by the prior version.
