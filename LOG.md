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

