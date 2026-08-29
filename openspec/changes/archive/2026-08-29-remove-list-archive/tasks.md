## 1. Remove the list archive concept from the backend

- [x] 1.1 Remove the `listArchive` table from `src/db/schema.ts` and from the generated drizzle schema/relations.
- [x] 1.2 Simplify `listCapacity` in `src/utils/capacity.ts` to count all lists of the board without the `list_archive` join.
- [x] 1.3 Remove the leftover commented `list_archive` joins in the board routes.
- [x] 1.4 Add `db-init/006-drop-list-archive.sql` to delete legacy archived lists and drop the `list_archive` table, keeping a compatibility `CREATE TABLE IF NOT EXISTS` in `001-schema1.sql` so the migration also runs on fresh databases.
- [x] 1.5 Update list archive route tests to assert that archiving a list deletes the list and its cards (no `list` or `card` rows remain).
- [x] 1.6 Remove `list_archive` from the test table cleanup list in `tests/helpers.ts`.

## 2. Verification

- [x] 2.1 Run the backend test suite (`npm test` in `nello/backend`).
- [x] 2.2 Run the backend TypeScript build (`npm run build`).
- [x] 2.3 Run the frontend test suite and final frontend production build.
- [x] 2.4 Human review: inspect `006-drop-list-archive.sql` before deployment to confirm legacy archived lists are deleted with their cards and the table is dropped.
