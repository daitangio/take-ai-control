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

## Add Multilingual Support

- 2026-08-06: Implemented OpenSpec change `add-multilingual-support` for the Nello frontend.
- Added Lingui 5.9.5 with English and Italian catalogs, lazy runtime activation, persisted `nello.locale` preference, and an English/Italian selector in user settings.
- Migrated user-facing component strings to Lingui macros, translated all 113 catalog messages, and documented the workflow for adding another language.
- Added i18n test infrastructure and locale persistence/activation coverage; all 115 frontend tests pass and the production build is clean.
- Remaining: none. The completed change is ready to archive.
- Model: Codex / GPT-5 [2026-08-06]
