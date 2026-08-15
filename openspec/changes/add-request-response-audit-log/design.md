## Context

The existing `audit_log` table has `url`, `method`, `request`, `response`, and a database-generated `log_time`. The application uses a single Drizzle/libSQL database instance and builds every route through `buildApp`; tests use the same DDL against an in-memory database.

## Goals / Non-Goals

**Goals:**

- Make audit persistence cross-cutting so application and error responses use one path.
- Preserve request and response structure while preventing secret persistence.
- Ensure audit failures never alter the completed HTTP response.
- Enforce four-week audit retention without a separate service or dependency.

**Non-Goals:**

- Capturing headers, response status, remote address, timing, or streamed payload contents.
- Providing an API for reading audit records or retention/rotation policy.

## Decisions

### Record at the response-completion lifecycle stage

Install an application-level response-completion hook. It has access to parsed request data and the serialized reply payload after routing, including authentication, validation, rate-limit, and not-found outcomes. A request-start hook cannot reliably capture a response; per-route code would omit framework-generated outcomes.

### Store JSON text in the existing TEXT columns

Use JSON serialization for both fields and write JSON `null` for absent bodies. Represent non-JSON content with a JSON omission object rather than storing raw payloads. This preserves valid JSON despite SQLite's TEXT storage and avoids accidental form or binary capture.

### Sanitize recursively before serialization

Use a shared, recursive sanitizer that replaces values for case-insensitive sensitive keys, including password variants, invitation keys, authorization, and token/access-token fields. Do not include request headers in the audit payload. Sanitizing at this boundary protects both request and response content; the latter can otherwise include login access tokens.

### Treat audit persistence as best effort

Catch and log database insertion failures from the completion hook. The response has already been completed and must not be changed or delayed by an audit failure.

### Run cleanup at startup and daily

Delete rows whose SQLite `log_time` is older than 28 days when the application starts, then repeat the best-effort cleanup every 24 hours. This avoids a new scheduler dependency and guarantees cleanup resumes after restarts. Clear the timer during Fastify shutdown so tests and graceful process termination do not retain a handle.

## Risks / Trade-offs

- [Large JSON payloads increase database size] → The initial contract retains the complete safe JSON structure; retention and size caps are intentionally deferred.
- [Framework-generated responses can have no accessible payload] → Persist JSON `null` or the non-JSON omission marker, preserving the audit record.
- [Future secret-bearing fields are missed] → Keep redaction centralized and cover nested request and response examples in tests.
- [An inactive backend can retain expired rows until its next scheduled cleanup] → Run cleanup at startup as well as daily; no request data is exposed by an audit API.

## Migration Plan

1. Add the Drizzle mapping and runtime audit hook.
2. Run the existing DDL-based initialization; `003-audit-log.sql` already creates `response` for new databases.
3. Enable the startup and daily retention cleanup.
4. Verify the backend test suite and TypeScript build.
5. Roll back by removing the hook and cleanup timer; existing audit rows remain inert and no public API contract changes.
