# Board Persistence — Spec (Delta)

## MODIFIED Requirements

### Requirement: State persisted across sessions and devices

The system SHALL persist all boards, lists, cards, their ordering, and the active board selection to the backend API, scoped to the authenticated user, so that logging in from any device restores the same state.

#### Scenario: Login restores state

- **WHEN** the user logs in after creating boards, lists, and cards in a previous session
- **THEN** the same boards, lists, cards, and ordering are shown

#### Scenario: State is per-user

- **WHEN** user A logs in on device 1 and user B logs in on device 2
- **THEN** each user sees only their own boards, lists, and cards

### Requirement: Graceful fallback on network or server errors

The system SHALL display an error toast and log a debug trace to the browser console when an API call fails, without crashing or losing locally optimistic state.

#### Scenario: Network failure during save

- **WHEN** the user performs an action and the API call fails due to a network error
- **THEN** a toast notification is shown, a `console.debug` trace is emitted, and the UI remains usable

#### Scenario: Server error during save

- **WHEN** the user performs an action and the API returns a 5xx error
- **THEN** a toast notification is shown with a generic error message and the UI remains usable

#### Scenario: No persisted data for new user

- **WHEN** a new user logs in with no boards
- **THEN** the app starts with the empty "no boards" state

## REMOVED Requirements

### Requirement: Versioned storage payload

**Reason**: The versioned payload was a localStorage concern. The backend API defines its own schema; the API contract and database schema serve as the versioning mechanism.

**Migration**: The localStorage code (`storage.ts`, `nello:v1` key, `VersionedPayload` type) is replaced by the API client module.

### Requirement: Graceful fallback on missing or invalid data

**Reason**: Replaced by the MODIFIED "Graceful fallback on network or server errors" requirement above, which covers the backend failure modes instead of the localStorage corruption scenarios.

**Migration**: The `localStorage.load()` error handling is replaced by the API client's network error handling.
