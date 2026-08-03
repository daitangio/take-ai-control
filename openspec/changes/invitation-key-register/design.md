## Context

Nello uses Fastify with Drizzle ORM on LibSQL (SQLite). Auth currently has only login (`POST /api/auth/login`) and password change (`PUT /api/auth/password`). The `register_key` table exists in the schema but is unused. The frontend has a stubbed `register()` function in `api.ts` calling `/auth/register` but no backend route serves it and no register UI exists.

See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**
- Enable registration gated by invitation keys from `register_key`
- Race-safe decrement of `avail_count` using conditional UPDATE
- Regex email validation in TypeScript (no SQLite REGEXP dependency)
- Shared password validation between register and change-password routes
- Minimal frontend: register form, toggle between login/register, no router dependency

**Non-Goals:**
- UI for managing `register_key` rows (manual DB insert by admin)
- Email verification / confirmation flow
- Password reset flow
- Rate limiting specific to registration (existing global rate limit applies)
- Multi-tenancy or organization-scoped keys

## Decisions

### 1. Regex matching in TypeScript, not SQLite

**Decision**: Query `register_key` by `key_pass` + `avail_count > 0`, then apply `new RegExp(row.emailRegexp).test(email)` in application code.

**Alternatives considered**:
- SQLite `REGEXP` via custom function — LibSQL may not support `sqlite3_create_function`, making this fragile
- `GLOB` or `LIKE` in SQL — not expressive enough for email patterns like `.*@acme\.com`

**Rationale**: TypeScript has built-in `RegExp`. The table is small (a few rows), so filtering in memory is cheap and portable.

### 2. Race safety via conditional UPDATE

**Decision**: After validation, run `UPDATE register_key SET avail_count = avail_count - 1 WHERE id = ? AND avail_count > 0` and check `rowsAffected`. If 0, the key was exhausted between SELECT and UPDATE — reject.

**Alternatives considered**:
- SQLite `BEGIN IMMEDIATE` transaction — works but more complex error handling; conditional UPDATE is simpler and standard practice
- Application-level mutex — doesn't work across processes/instances

**Rationale**: Conditional UPDATE is atomic in SQLite and handles the race without transactions or locks.

### 3. Single-step registration endpoint

**Decision**: `POST /api/auth/register` accepts `{ email, keyPass, password }` in one call.

**Alternatives considered**:
- Two-step: validate key first, then create user — more API calls, needs session state between steps
- Separate key-validation endpoint — adds complexity without benefit for this use case

**Rationale**: Fits the "less is more" mantra. One form, one request, one response.

### 4. UNIQUE on `register_key.key_pass`

**Decision**: Add a `UNIQUE` constraint so each invitation key string maps to exactly one row.

**Rationale**: The user confirmed one keyPass = one regexp. Unique prevents ambiguity when looking up by key.

### 5. No client-side router for register form

**Decision**: `AuthGuard` manages a `mode` state (`'login'` | `'register'`). Each form has a link to toggle mode. No new dependency.

**Alternatives considered**:
- React Router with `/login` and `/register` routes — overkill for two views; adds a dependency
- Query param (`?mode=register`) — functional but less clean than state

**Rationale**: The app has no router today. Adding one for two static forms violates "less is more."

### 6. Shared password validation function

**Decision**: Extract `validatePassword(password: string): void` in `utils/password.ts`, throw on `< 12 chars`. Both register and password-change routes call it.

**Rationale**: Single source of truth for password rules. The change-password route currently has the check inline — refactoring it keeps behavior consistent.

## Risks / Trade-offs

- **[Low] Regex DoS via malicious `emailRegexp`**: An admin could insert a pathological regex (e.g., catastrophic backtracking). Mitigation: admin inserts keys manually — trusted operation. If automated later, add regex timeout validation on insert.
- **[Low] No key expiration**: Keys have no expiry date. Mitigation: admin can manually set `avail_count = 0` to disable a key. An `expires_at` column could be added later if needed.
- **[Low] Email uniqueness across keys**: A user could register with one key, then another user can't reuse that email. Standard behavior — email is globally unique in `users`.

## Migration Plan

1. Deploy backend with new `UNIQUE` constraint on `register_key.key_pass`. If existing duplicate keys exist, resolve them manually first (table is currently unused — likely empty).
2. Deploy frontend with register form.
3. Admin inserts invitation keys via SQL: `INSERT INTO register_key (key_pass, email_regexp, avail_count) VALUES ('INVITE-2026', '.*@acme\.com', 10)`.
4. No rollback concerns — the change is additive. Existing login and password-change flows are unaffected.
