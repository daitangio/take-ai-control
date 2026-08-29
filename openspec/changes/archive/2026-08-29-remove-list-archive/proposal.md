## Why

The `list_archive` table is a leftover of the old archive model, where archiving a list kept the list row hidden behind an archive marker. The archive endpoint was later changed to delete the list together with its cards, so the marker table is never written anymore. It still lingers in the schema, capacity queries, DDL, and tests as dead weight.

## What Changes

- Remove the `list_archive` table from the backend schema and drop it from existing databases with a new migration. Legacy archived lists are deleted together with their cards.
- Simplify list capacity counting: every list on the board counts toward the limit, since lists can no longer be archived.
- Keep `POST /lists/:id/archive`; archiving a list deletes the list and all its cards (foreign-key cascade plus explicit card delete).
- Remove `list_archive` from the test schema setup and align the list archive tests with delete semantics.

## Capabilities

### Modified Capabilities

- `backend-api`: List archive returns 204 after deleting the list and its cards; no archived-list records exist.
- `list-management`: Archiving a list removes it from the board and deletes it with its cards.
- `data-persistence`: Drop the list archive marker persistence; a list archive deletes the list row and its cards.
- `backend-test-suite`: Archive tests assert deletion of list/card rows instead of hidden persisted rows.

## Impact

- Backend schema, capacity utility, db-init DDL and migration, and route tests.
- No frontend or API-contract change: `POST /lists/:id/archive` keeps its 204 status.
