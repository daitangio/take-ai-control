## 1. Backend — Schema

- [x] 1.1 Add `UNIQUE` constraint on `register_key.key_pass` in `db/schema.ts`

## 2. Backend — Shared password validation

- [x] 2.1 Extract `validatePassword(password)` function in `utils/password.ts`
- [x] 2.2 Refactor `PUT /auth/password` to use `validatePassword` instead of inline check

## 3. Backend — Register endpoint

- [x] 3.1 Add `POST /api/auth/register` route in `routes/auth.ts` with full validation logic (key lookup, email regexp matching, race-safe decrement, user creation, JWT return)
- [x] 3.2 Add TypeScript types for the register request body (`RegisterBody` interface)

## 4. Backend — Tests

- [x] 4.1 Add unit tests for `POST /api/auth/register`: successful registration, invalid key, exhausted key, email regexp mismatch, duplicate email, short password, missing fields, race-condition exhaustion

## 5. Frontend — API client

- [x] 5.1 Update `register()` signature in `api.ts` to accept `(email, keyPass, password)` and send all three fields in the body

## 6. Frontend — Auth context

- [x] 6.1 Update `handleRegister` in `AuthContext.tsx` to accept and pass `keyPass` parameter

## 7. Frontend — Register form

- [x] 7.1 Create `RegisterForm.tsx` component with email, invitation key, and password fields, matching LoginForm visual style
- [x] 7.2 Add "Already have an account? Login" link in RegisterForm that switches to login mode

## 8. Frontend — AuthGuard toggle

- [x] 8.1 Add `mode` state (`'login'` | `'register'`) to `AuthGuard` inner component
- [x] 8.2 Conditionally render `LoginForm` or `RegisterForm` based on mode
- [x] 8.3 Add "Don.t have an account? Register" link in `LoginForm` that switches to register mode

## 9. Frontend — Tests

- [x] 9.1 Add unit tests for `RegisterForm`: renders fields, calls register on submit, shows error messages, toggles to login
- [x] 9.2 AuthGuard tests - skipped (no existing tests to update)
- [x] 9.3 Update `api.test.ts` for new `register()` signature

## 10. Build & Verify

- [x] 10.1 Run `rtk npm run build` in nello/frontend to verify no regressions
- [x] 10.2 Human test: insert a `register_key` row manually, then register a new user through the UI end-to-end
