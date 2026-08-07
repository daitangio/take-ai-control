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
