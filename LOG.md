# Work In Progress Log

- 2026-07-05: First setup of the Take-AI-Control-Back repository (GG)

## Archive Safari List-Drag Targeting Fix

- 2026-08-03: Re-synced `fix-safari-list-drag-targeting`; the operation was idempotent because the main `list-management` spec already exactly contained the modified reorder requirement and Safari nested-target scenario.
- Strict validation passed for both the change and main spec. Archived the completed 6/6-task change at `openspec/changes/archive/2026-08-03-fix-safari-list-drag-targeting/`.
- Nothing remaining for this change.
Model: Codex / GPT-5

## Invitation-Key Registration (in progress)

- 2026-08-03: Implemented invitation-key registration feature (change: `invitation-key-register`).
  - Backend: Added UNIQUE on `register_key.key_pass`, extracted `validatePassword()`, added `POST /api/auth/register` with race-safe decrement, regexp matching in TypeScript.
  - Backend tests: 9 new registration tests, all 21 auth tests pass.
  - Frontend: Updated `register()` in api.ts, `AuthContext`, created `RegisterForm.tsx`, added login/register toggle in `AuthGuard` and `LoginForm`.
  - Frontend tests: 2 new register API tests, 5 RegisterForm component tests, all 113 tests pass.
  - Build: Clean.
  - Remaining: Human test (task 10.2) — insert a `register_key` row manually and register through the UI.
Model: DeepSeek v4 Pro [1m]

## Add DDoS Hardening OpenSpec Change

- 2026-08-05: Implemented the OpenSpec change `add-ddos-hardening` for backend abuse protection using only `@fastify/rate-limit` and `@fastify/under-pressure`.
- Backend now has a global rate limit, stricter auth-route limits, under-pressure shedding, near-threshold warning logs, and a `loadTest.sh` helper.
- Added backend tests for 429 and 503 behavior; `rtk npm run build` and `rtk npm test` passed.
- Manual verification: `loadTest.sh` produced 119 `200` and 31 `429` responses; a temporary unhealthy instance returned `503` on `/api/health`.
- Model: GPT-5.4 mini [v1.0.78]

## Archive add-ddos-hardening

- 2026-08-05: Archived OpenSpec change `add-ddos-hardening` to `openspec/changes/archive/2026-08-05-add-ddos-hardening/`.
- Completed pre-archive checks: artifacts all done, tasks all complete (10/10), delta spec sync required and executed.
- Synced main spec by creating `openspec/specs/backend-abuse-protection/spec.md` with the finalized requirements and scenarios from the change delta.
- Remaining: none for this archive operation.
- Model: GPT-5.3-Codex

## Archive invitation-key-register

- 2026-08-06: Archived OpenSpec change `invitation-key-register` to `openspec/changes/archive/2026-08-06-invitation-key-register/`.
- Completed pre-archive checks: artifacts all done, tasks all complete (18/18), delta spec sync required and executed.
- Synced main specs by creating `openspec/specs/invitation-registration/spec.md` and updating `openspec/specs/user-auth/spec.md` registration requirement to the invitation-key flow.
- Remaining: none for this archive operation.
- Model: GPT-5.3-Codex [v1.0.78]

## add-frontend-multilingual-support (planning ready)

- 2026-08-06: Created OpenSpec change `add-frontend-multilingual-support` with all required planning artifacts completed.
- Added proposal, design, and tasks plus delta specs for `multilingual-support` (new) and `responsive-user-interface` (modified).
- Scope includes adding an i18n library, Italian translations, locale persistence/switching, and authoring `nello/frontend/doc/multilingual-support.md` during implementation.
- Remaining: implementation phase (`/opsx:apply`) and task execution.
- Model: GPT-5.3-Codex [v1.0.78]

## add-frontend-multilingual-support (updated goals)

- 2026-08-06: Updated planning artifacts to include backend error localization via stable `error_code` values.
- Revised `proposal.md`, `specs/multilingual-support/spec.md`, `design.md`, and `tasks.md` to cover backend/frontend error-code mapping, tests, and validation.
- Remaining: add the missing delta spec file for modified capability `backend-api` (deferred in update mode), then run implementation.
- Model: GPT-5.3-Codex [v1.0.78]

## add-frontend-multilingual-support (coherence follow-up)

- 2026-08-06: Added missing delta spec file `specs/backend-api/spec.md` under the change to align with the newly declared modified capability `backend-api`.
- Added requirements for stable backend `error_code` responses and contract stability for client localization.
- Remaining: implementation phase with `/opsx:apply`.
- Model: GPT-5.3-Codex [v1.0.78]

## add-frontend-multilingual-support (implementation in progress)

- 2026-08-06: Implemented multilingual infrastructure in `nello/frontend` with `i18next` + `react-i18next`, locale persistence, runtime language selector, and English/Italian resources.
- Localized major frontend UI surfaces and wired backend `error_code` localization with generic fallback for unknown codes.
- Added backend `error_code` contract implementation and representative backend tests across auth/list/member/card/pressure paths.
- Added contributor docs at `nello/frontend/doc/multilingual-support.md` including language onboarding and backend error-code mapping conventions.
- Added frontend i18n tests covering runtime language switch and translation fallback behavior; frontend and targeted backend tests pass.
- Remaining: manual human verification task 5.6 (switch languages + trigger representative backend errors in running app).
- Model: GPT-5.3-Codex [v1.0.78]

## add-frontend-multilingual-support (flag selector refinement)

- 2026-08-07: Updated the change artifacts to require a polished flag-based language selector with active-language indication, accessible naming, keyboard usability, and responsive behavior.
- Revised `specs/multilingual-support/spec.md`, `design.md`, `tasks.md`, and `specs/responsive-user-interface/spec.md`.
- Implemented the flag-based selector in `nello/frontend/src/components/LanguageSelector.tsx` with responsive styling in `App.css`; frontend tests pass (15 files, 116 tests).
- Refined the selector into a native accessible dropdown with flag-prefixed English/Italian options.
- Browser-level human verification remains pending because the in-app browser surface was unavailable in this session.
- Remaining: human verification task 5.6.
- Model: Codex / GPT-5

## add-frontend-multilingual-support (spec sync)

- 2026-08-07: Synced the change deltas into the main `backend-api`, new `multilingual-support`, and `responsive-user-interface` specs.
- Affected specs validate successfully individually. Repository-wide strict validation still reports the unrelated existing `card-assignment` spec failure.
- The change remains active; archive after the pending human verification is completed.
- Model: Codex / GPT-5

## Archive add-frontend-multilingual-support

- 2026-08-07: Archived the completed OpenSpec change to `openspec/changes/archive/2026-08-07-add-frontend-multilingual-support/`.
- All 19 tasks and all planning artifacts were complete; affected main specs were synced and validated.
- Model: Codex / GPT-5

## Audit request and response logging (exploration)

- 2026-08-15: Updated the `data-persistence` OpenSpec with the audit-log contract: every completed Fastify request records URL, method, redacted JSON request payload, and redacted JSON response payload in `audit_log`.
- The existing database DDL includes the new `response` column. No application code was changed while in explore mode.
- Remaining: create a change proposal and implement the global audit hook and its tests.
- Model: Codex / GPT-5

## Request and response audit logging

- 2026-08-15: Created and implemented OpenSpec change `add-request-response-audit-log`.
- Added a global Fastify audit path that stores URL, method, recursively redacted JSON request payload, and recursively redacted JSON response payload in `audit_log`; non-JSON payloads are omitted safely and audit writes are best-effort.
- Added audit schema mapping and reset cleanup, plus four focused tests. `rtk npm test` passed (97 tests) and `rtk npm run build` passed.
- Human-tested an isolated temporary backend: `GET /api/health` produced an `audit_log` row with `request: "null"` and `response: {"status":"ok"}`. The temporary server and database were removed.
- Remaining: none; the change is ready for OpenSpec archive.
- Model: Codex / GPT-5

## Request and response audit retention (planning)

- 2026-08-15: Updated `add-request-response-audit-log` planning artifacts and the main `data-persistence` spec with four-week audit retention.
- Planned best-effort cleanup at backend startup and every 24 hours, with focused automated and human retention checks.
- Remaining: apply the four retention tasks to the backend implementation.
- Model: Codex / GPT-5 Terra

## Request and response audit retention (implementation)

- 2026-08-15: Implemented four-week audit retention for `add-request-response-audit-log`.
- Backend now removes `audit_log` rows older than 28 days at startup and every 24 hours; the timer is unref'd and cleared on shutdown.
- Added retention coverage proving a 29-day-old row is removed while a 27-day-old row remains. `rtk npm test` passed (98 tests) and `rtk npm run build` passed.
- Human-tested startup cleanup with an isolated temporary database; only the 27-day-old audit record remained. The temporary server and database were removed.
- Remaining: none; the change is ready for OpenSpec archive.
- Model: Codex / GPT-5 Terra

## Request and response audit user email (planning update)

- 2026-08-16: Updated OpenSpec change `add-request-response-audit-log` to persist the authenticated user's email in the existing `audit_log.user_email` column.
- Confirmed `nello/backend/db-init/003-audit-log.sql` already defines `user_email`; no database migration is needed.
- Added requirements and scenarios for authenticated and unauthenticated requests, the trusted `request.user?.email` design decision, and two unchecked implementation/test tasks.
- Remaining: apply tasks 1.4 and 2.4 through `/opsx:apply`.
- Model: Codex / GPT-5 Terra

## Request and response audit user email (implementation)

- 2026-08-16: Implemented tasks 1.4 and 2.4 for `add-request-response-audit-log`.
- Mapped the existing `audit_log.user_email` column and populated it from authenticated `request.user?.email`; anonymous and rejected-auth requests remain `NULL`.
- Added audit tests covering both authenticated and unauthenticated records. Backend tests passed (99 tests) and the backend TypeScript build passed.
- Remaining: none; the change is ready for OpenSpec archive.
- Model: Codex / GPT-5 Terra

## Request and response audit logging (refactor)

- 2026-08-16: Extracted the `onResponse` audit-log insert into `src/utils/audit.ts` as `persistAuditLog()`; the Fastify hook now only assembles lifecycle data and delegates persistence.
- Backend tests passed (99 tests) and the backend TypeScript build passed. Remaining: frontend build verification pending.
- Model: Codex / GPT-5 Terra

## Archive add-request-response-audit-log

- 2026-08-16: Synced the completed audit-log change into the main `data-persistence` spec, including authenticated `user_email` persistence and anonymous-request `NULL` behavior.
- Archived the completed 12/12-task change at `openspec/changes/archive/2026-08-16-add-request-response-audit-log/`.
- Strict validation passed for the change and the synced main spec.
- Remaining: none.
- Model: Codex / GPT-5 Terra

## French and German frontend translations

- 2026-08-19: Added complete French (`fr`) and German (`de`) translation resources using English as the source, including localized backend error messages.
- Made both locales selectable in the language dropdown and available through browser-locale detection.
- Remaining: none.
- Model: Codex / GPT-5 Terra

## Spanish frontend translation

- 2026-08-19: Added complete Spanish (`es`) translation resources from the English source, including backend error messages.
- Made Spanish selectable in the language dropdown and available through browser-locale detection.
- Remaining: none.
- Model: Codex / GPT-5 Terra

## Nello intro page

- 2026-08-20: Added a responsive unauthenticated intro page to `nello/frontend` with sign-in and registration actions, a board preview, and a feature list including multi-language support, shared boards, drag-and-drop workflow, and focused workspace design.
- Added localized intro copy and auth navigation for English, Italian, French, German, and Spanish. Existing authenticated board behavior is unchanged.
- Frontend tests and lint passed; lint retains three pre-existing warnings in unrelated files.
- Remaining: none.
- Model: Codex / GPT-5 Luna

## Capacity limits (implementation in progress)

- 2026-08-20: Implemented existing tier limits for board, active-list, and active-card capacity, with stable 409 error codes, active-archive accounting, owner-tier behavior for shared boards, and capacity metadata on board/list/card flows.
- Added localized capacity warnings at the 75% threshold in English, Italian, French, German, and Spanish, plus backend and frontend boundary coverage. Existing user migration was verified in an isolated SQLite copy (`tier_id = 0`, `free`).
- Automated verification: backend tests (102) and frontend tests (119) pass; backend/frontend builds pass.
- Remaining: human task 4.2 (exercise the threshold, capacity rejection, archive release, and shared-board flow in the running UI).
- Model: Codex / GPT-5.6 Terra



## Capacity limits (planning ready)

- 2026-08-20: Created OpenSpec change `capacity-limits` with proposal, design, capacity/data/API/i18n delta specs, and an implementation task list.
- Scope: enforce existing tier quotas transactionally; publish compact capacity metadata; show localized non-blocking warnings from 75% use; return localized 409 errors at capacity.
- Remaining: apply the implementation plan with `/opsx:apply capacity-limits`.
- Model: Codex / GPT-5.6 Terra

## Tier-based board, list, and card limits (exploration)

- 2026-08-20: Inspected `nello/backend/db-init/004-limits.sql` and the board/list/card creation and archive flows. The existing `user_tier` data model defines free (3 boards, 12 lists per board, 48 cards per list), `nello-remindme` (12/12/48), and `nello-one` (60/60/60) limits, but it is not yet mapped in Drizzle or enforced by the API.
- Identified the required enforcement points: create board; create list; create card; card move across lists; and card unarchive. Limits should use the board owner's tier and count only active entities, consistent with current archive visibility behavior.
- Remaining: decide the public limit-error contract/status and whether archived entities free capacity; then create an OpenSpec proposal before implementation.
- Model: Codex / GPT-5.6 Terra

## Tier-based capacity warnings (exploration)

- 2026-08-20: Added the `capacity-limits` OpenSpec requirement for a non-blocking, localized warning at or above 75% usage, including the current usage and applicable limit for boards, active lists, and active cards.
- 2026-08-20: Added explicit enforcement requirements: creation, card restoration, and cross-list moves cannot exceed the applicable tier limit; rejections preserve data and use a stable localizable error; archived lists and cards free active capacity.
- Remaining: decide the presentation timing and surface (for example, dashboard summary, contextual creation dialog, or both) before proposal and implementation.
- Model: Codex / GPT-5.6 Terra

## Capacity limits — Settings tier information

- 2026-08-21: Added the Settings Limits tab with the authenticated user's tier name, board usage and limit, list limit per board, and card limit per board.
- Added authenticated `GET /api/auth/tier` API support and focused backend/frontend coverage.
- Verification: backend tests (103) and build, frontend tests (120), and strict OpenSpec validation pass.
- Remaining: none; final frontend build is running.
Model: Codex / GPT-5 [2026-08-21]

## Board backgrounds (planning ready)

- 2026-08-21: Created OpenSpec change `add-board-backgrounds` with proposal, design, task plan, and delta specs for new `board-backgrounds` behavior and modified `board-persistence`.
- Scope: fixed, locally bundled decorative SVG choices (None, Mountain, Sea, Sport), accessible menu previews, per-board persistence, validation, shared-board consistency, and focused backend/frontend/human verification.
- Validation: `rtk openspec validate add-board-backgrounds --strict` passed.
- Remaining: implement the plan with `/opsx:apply add-board-backgrounds`.
Model: Codex / GPT-5 [2026-08-21]

## List action translations

- 2026-08-21: Retranslated the Italian, French, German, and Spanish `list.archive` and `list.archiveConfirm` labels to match the updated English delete-all-list-content behavior.
- Remaining: none.
Model: GPT-5.6 Luna [v1.0.78]

## Board backgrounds (Sport artwork refinement)

- 2026-08-21: Reimplemented `sport.svg` as a locally bundled basketball composition with an arena gradient, court markings, halftone texture, and energetic color bands.
- Softened the artwork to a pale lavender-and-sky base with translucent pastel accents and a muted warm basketball, aligning its saturation with the Mountain and Sea backgrounds.
- Preserved the decorative 1440×900 SVG format and subdued supporting details so board lists, cards, controls, and scrolling remain usable over the artwork.
- Verification: SVG XML validation, rendered visual review, diff checks, and final frontend production build pass.
- Remaining: none.
Model: Codex / GPT-5 [2026-08-21]

## Board backgrounds (list-menu placement)

- 2026-08-21: Moved the Board background picker from the header into the existing list `...` action menu and retained its previews, accessible radio options, and persistence action.
- Verification: frontend tests (123) and final frontend production build pass.
- Remaining: the existing human migration and UI verification tasks.
Model: Codex / GPT-5 [2026-08-21]

## Board backgrounds (implementation in progress)

- 2026-08-21: Implemented persisted board backgrounds with SQLite migration `005-board-background.sql` (`background TEXT DEFAULT NULL`), backend validation and API responses, and locally bundled Mountain, Sea, and Sport SVG artwork.
- Added an accessible, localized Board background menu with previews and selected state; selection is optimistically applied, persisted per board, and restored from the server after API errors.
- Verification: backend tests (106) and build pass; frontend tests (123), production build, and strict OpenSpec validation pass.
- Remaining: human migration review (task 1.6) and human UI verification (task 3.3).
Model: Codex / GPT-5 [2026-08-21]

## Board backgrounds (implementation blocked)

- 2026-08-21: Began backend implementation: added the planned board-background schema mapping, API validation/response work, migration file, and focused route coverage.
- Blocker: the project LibSQL/SQLite test database rejects `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` with `near "EXISTS": syntax error`; the required migration syntax prevents the backend suite from initializing.
- Remaining: decide whether to use compatible `ALTER TABLE ... ADD COLUMN background TEXT` syntax or introduce a migration runner that conditionally skips an already-existing column.
Model: Codex / GPT-5 [2026-08-21]

## Board backgrounds (migration task-plan update)

- 2026-08-21: Updated the confirmed `add-board-backgrounds` task plan to create `nello/backend/db-init/005-board-background.sql` with `IF NOT EXISTS`, then added a separate human migration-review task.
- Validation: `rtk openspec validate add-board-backgrounds --strict` passed.
- Remaining: implement the plan with `/opsx:apply add-board-backgrounds`.
Model: Codex / GPT-5 [2026-08-21]

## Board IDs — NanoID

- 2026-08-23: Replaced `crypto.randomUUID()` with `nanoid()` when creating boards and added NanoID to the frontend dependencies.
- Remaining: none.
Model: GPT-5.6 Terra [2026-08-23]

## Board backgrounds (plan reconciliation in progress)

- 2026-08-21: Reviewed the user-updated `add-board-backgrounds/design.md`. The added migration requirement is coherent with the behavior specs; the pending task-plan update will name `nello/backend/db-init/005-board-background.sql`, require `IF NOT EXISTS`, and add a human migration-review task.
- Remaining: user confirmation before revising `tasks.md`, as required by the OpenSpec update workflow.
Model: Codex / GPT-5 [2026-08-21]

## Board backgrounds (exploration)

- 2026-08-21: Explored a fixed menu of three SVG board backgrounds: Mountain, Sea, and Sport. No application code or OpenSpec change artifacts were created.
- Remaining: choose the preferred visual direction and create a change proposal before implementation.
Model: Codex / GPT-5 [2026-08-21]

## Capacity limits — board deletion warning fix

- 2026-08-21: Reload board summaries after a successful board deletion so the active board receives current capacity usage and clears stale warnings.
- Added a StoreContext regression test for the 3/3 to 2/3 capacity transition.
- Remaining: none; final frontend build is running.
Model: Codex / GPT-5 [2026-08-21]

## Capacity limits — tier explanation

- 2026-08-21: Added the Tier Limits explanatory sentence beneath the tab heading, with English, Italian, French, German, and Spanish translations.
- Verification: focused Settings tests pass.
- Remaining: none; final frontend build is running.
Model: Codex / GPT-5 [2026-08-21]

## Capacity limits — Settings tab refinement

- 2026-08-21: Moved the Tier Limits tab before Password and renamed it from Limits; localized the new label in all supported locales.
- Verification: focused Settings tests pass.
- Remaining: none; final frontend build is running.
Model: Codex / GPT-5 [2026-08-21]

## Board backgrounds (planning ready)

- 2026-08-21: Created OpenSpec change `add-board-backgrounds` with proposal, design, task plan, and delta specs for new `board-backgrounds` behavior and modified `board-persistence`.
- Scope: fixed, locally bundled decorative SVG choices (None, Mountain, Sea, Sport), accessible menu previews, per-board persistence, validation, shared-board consistency, and focused backend/frontend/human verification.
- Validation: `rtk openspec validate add-board-backgrounds --strict` passed.
- Remaining: implement the plan with `/opsx:apply add-board-backgrounds`.
Model: Codex / GPT-5 [2026-08-21]

## Board IDs — NanoID

- 2026-08-23: Replaced `crypto.randomUUID()` with `nanoid()` when creating boards and added NanoID to the frontend dependencies.
- Remaining: none.
Model: GPT-5.6 Terra [2026-08-23]

## Frontend test expectation alignment

- 2026-08-23: Updated ListColumn tests for the current localized archive-action label and switched password-flow tests to the Password tab before querying its form fields; modeled the initial tier request separately from password API responses.
- Remaining: none.
Model: GPT-5.6 Terra [v1.0.70]
