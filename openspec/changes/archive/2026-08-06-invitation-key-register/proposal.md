## Why

Nello currently has no working registration — the `POST /api/auth/register` route doesn't exist on the backend, so new users cannot create accounts. The `register_key` table already exists in the schema but is unused. This change wires it up to gate registration behind invitation keys, enabling controlled user onboarding without an open sign-up.

## What Changes

- **New backend route**: `POST /api/auth/register` accepting `{ email, keyPass, password }` — validates the invitation key against `register_key`, checks email against the key's `emailRegexp`, decrements `avail_count` race-safely, creates the user, and returns a JWT
- **Password validation extracted**: shared `validatePassword()` function used by both registration and password-change routes (enforces ≥ 12 chars)
- **Schema**: add `UNIQUE` constraint on `register_key.key_pass`
- **Frontend register form**: new `RegisterForm` component with email, invitation key, and password fields
- **Login/register toggle**: `AuthGuard` switches between `LoginForm` and `RegisterForm` via local state (no router dependency)
- **`api.ts`**: `register()` signature updated to include `keyPass` — **BREAKING** change to the frontend API client (currently unused, so no real breakage)
- **AuthContext**: `handleRegister` signature updated to pass `keyPass`

## Capabilities

### New Capabilities

- `invitation-registration`: Invitation-key gated user registration — validates against `register_key` table with email regexp matching, race-safe availability counting, and bcrypt-hashed password storage

### Modified Capabilities

- `user-auth`: Registration requirement changes from "email + password" to "email + invitation key + password". The `POST /api/auth/register` endpoint now requires `keyPass` and validates against `register_key`. Password validation (≥ 12 chars) becomes a shared rule between register and change-password.

## Impact

- **Backend**: `routes/auth.ts`, `utils/password.ts`, `db/schema.ts`
- **Frontend**: `api.ts`, `AuthContext.tsx`, `AuthGuard.tsx`, `LoginForm.tsx`, new `RegisterForm.tsx`
- **No new dependencies** — regex matching done in TypeScript (avoids SQLite/libsql REGEXP compatibility issues)
- **Database migration needed** for `UNIQUE` on `register_key.key_pass`
