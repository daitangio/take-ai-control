# Board Persistence — Spec

## Purpose

Persist all boards, lists, cards, their ordering, and the active board selection to the backend API, scoped to the authenticated user, so that logging in from any device restores the same state. The persistence layer calls the backend API instead of browser local storage.

## Requirements

### Requirement: State persisted across sessions and devices

The system SHALL persist all boards, lists, cards, their ordering, and the active board selection to the backend API, scoped to the authenticated user, so that logging in from any device restores the same state.

#### Scenario: Login restores state

- **WHEN** the user logs in after creating boards, lists, and cards in a previous session
- **THEN** the same boards, lists, cards, and ordering are shown

#### Scenario: Reload restores state

- **WHEN** the user creates boards, lists, and cards, then reloads the page
- **THEN** the same boards, lists, cards, ordering, and active board are shown

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

#### Scenario: First visit

- **WHEN** the app is opened with no persisted data present
- **THEN** the app starts with the empty "no boards" state
