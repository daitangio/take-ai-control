## ADDED Requirements

### Requirement: Stable error codes for localizable client errors
For frontend-consumed error paths in authentication, user settings, and board/list/card/member operations, the API SHALL return a stable `error_code` field in error responses so clients can localize messages without parsing free-text details.

#### Scenario: Authentication error includes stable code
- **WHEN** a client sends invalid credentials to an authentication endpoint
- **THEN** the API returns an error response that includes a stable `error_code` value for that failure class

#### Scenario: Domain validation error includes stable code
- **WHEN** a client submits an invalid request in a board/list/card/member flow
- **THEN** the API returns an error response that includes a stable `error_code` value describing the validation failure class

#### Scenario: Authorization error includes stable code
- **WHEN** a client attempts an action without required ownership or membership permissions
- **THEN** the API returns an error response that includes a stable `error_code` value for the authorization failure class

### Requirement: Error-code contract stability
The API SHALL keep existing `error_code` values stable once published for a given failure class, and any newly introduced error codes SHALL be documented before frontend use.

#### Scenario: Existing error code remains unchanged
- **WHEN** an already-defined failure class is returned by an endpoint
- **THEN** the API uses the previously documented `error_code` for that class

#### Scenario: New failure class is introduced
- **WHEN** a new client-visible failure class is added to an endpoint
- **THEN** a new `error_code` is defined and documented before client mapping is required
