## Why

The backend currently writes operational logs but has no durable record of the request and response payloads that produced an API outcome. A redacted audit trail supports troubleshooting without persisting credentials or tokens.

## What Changes

- Record every completed Fastify request in the existing SQLite `audit_log` table.
- Persist JSON-safe, recursively redacted request and response payloads alongside the URL and HTTP method.
- Retain audit records for four weeks, then remove expired records automatically.
- Cover ordinary, rejected, bodyless, and non-JSON requests with automated tests.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `data-persistence`: Persist redacted request and response audit records for completed backend requests.

## Impact

- Backend: Fastify app lifecycle configuration, Drizzle schema, and a small audit utility.
- Tests: in-memory schema cleanup and audit-log coverage.
- Database: uses the existing `audit_log.response` column; no new dependency or public API endpoint.
