# Backend Abuse Protection - Spec

## Purpose

Protect the backend API from basic request floods and overload conditions while preserving normal behavior for legitimate traffic. This capability defines the user-visible throttling and overload-failure contract for the service.

## Requirements

### Requirement: Global request throttling

The system SHALL reject excessive request bursts to the backend API with status 429.

#### Scenario: Burst exceeds global limit

- **WHEN** a client sends more requests than the configured global limit within the configured time window
- **THEN** the system returns status 429 for the excess requests

### Requirement: Sensitive endpoint throttling

The system SHALL apply stricter request limits to authentication endpoints than to general API traffic.

#### Scenario: Auth endpoint exceeds stricter limit

- **WHEN** a client sends repeated requests to `/api/auth/login`, `/api/auth/register`, or `/api/auth/password` beyond the configured auth limit
- **THEN** the system returns status 429 before the general API limit would be reached

### Requirement: Overload shedding

The system SHALL return status 503 when runtime pressure exceeds configured health thresholds.

#### Scenario: Runtime becomes overloaded

- **WHEN** process memory usage or event loop pressure exceeds the configured threshold
- **THEN** the system rejects new requests with status 503 until the service is healthy again

### Requirement: Normal traffic remains available

The system SHALL continue serving non-abusive requests while rate limits and health thresholds are not exceeded.

#### Scenario: Regular request stays within limits

- **WHEN** a client sends requests within the configured limits and the service is healthy
- **THEN** the system processes the request normally
