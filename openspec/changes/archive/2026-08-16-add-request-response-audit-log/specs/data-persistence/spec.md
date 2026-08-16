## MODIFIED Requirements

### Requirement: Request and response audit persistence

The system SHALL persist one audit record for every completed Fastify request in the `audit_log` table. Each record SHALL contain the request URL, HTTP method, a JSON `request` payload, a JSON `response` payload, the authenticated user's email in `user_email` when available, and the database-generated log time. The `user_email` column SHALL be `NULL` when the request has no authenticated user. The request and response payloads MUST be recursively redacted before persistence so credentials, invitation keys, bearer tokens, access tokens, and password values are never stored. The system SHALL automatically delete audit records older than four weeks.

#### Scenario: JSON request and response are audited

- **WHEN** a request with a JSON body completes with a JSON response
- **THEN** one `audit_log` row is stored with its URL and method, plus JSON representations of the request body and response body

#### Scenario: Sensitive values are redacted

- **WHEN** a request or response contains sensitive data at any nesting level
- **THEN** the stored JSON retains its structure but replaces the sensitive value with a redacted marker

#### Scenario: Request has no body or response body

- **WHEN** a completed request or response has no body
- **THEN** the corresponding audit column stores the JSON value `null`

#### Scenario: Non-JSON content is not captured raw

- **WHEN** a request or response body is not JSON
- **THEN** the corresponding audit column stores a JSON-safe omission marker rather than the raw content

#### Scenario: Rejected requests are audited

- **WHEN** a request completes with an authentication, validation, rate-limit, or not-found response
- **THEN** an audit record is persisted for that completed request

#### Scenario: Authenticated user email is audited

- **WHEN** a request completes after authentication has assigned a user to the request
- **THEN** the audit record stores that user's email in `user_email`

#### Scenario: No authenticated user email is available

- **WHEN** a request completes without an authenticated user, including a rejected authentication request
- **THEN** the audit record stores `NULL` in `user_email`

#### Scenario: Expired audit records are removed

- **WHEN** audit cleanup runs
- **THEN** audit records whose `log_time` is older than four weeks are deleted and newer records are retained
