## 1. Audit persistence

- [x] 1.1 Map `audit_log` in the Drizzle schema and include it in test reset cleanup.
- [x] 1.2 Add a reusable JSON-safe recursive redaction and serialization utility for audit payloads.
- [x] 1.3 Register a best-effort application-wide completion hook that persists the URL, method, sanitized request payload, and sanitized response payload.
- [x] 1.4 Map and persist `request.user?.email` in the existing `audit_log.user_email` column, storing `NULL` when no authenticated user is available.

## 2. Verification

- [x] 2.1 Add unit coverage for successful JSON, nested redaction, login-token redaction, bodyless, and rejected requests.
- [x] 2.2 Run backend tests and the backend TypeScript build.
- [x] 2.3 Human test: issue a request against the running backend and inspect the resulting `audit_log` row for expected redaction.
- [x] 2.4 Add automated coverage for `user_email` on authenticated requests and `NULL` on anonymous or authentication-rejected requests.

## 3. Audit retention

- [x] 3.1 Add best-effort startup and daily cleanup for audit records older than 28 days, with shutdown cleanup for its timer.
- [x] 3.2 Add unit coverage proving that expired audit rows are deleted while newer rows remain.
- [x] 3.3 Run backend tests and the backend TypeScript build after retention cleanup is added.
- [x] 3.4 Human test: insert expired and current audit rows in a temporary backend database, then confirm cleanup removes only the expired row.
