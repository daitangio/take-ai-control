# member-management Specification

## Purpose
TBD - created by archiving change add-shared-boards-frontend. Update Purpose after archive.
## Requirements
### Requirement: Member dialog

The system SHALL provide a member management dialog accessible from the board switcher for shared boards owned by the current user.

#### Scenario: Open member dialog

- **WHEN** the user clicks the share button on a shared board they own
- **THEN** a dialog opens showing the current member list and an "add member" form

#### Scenario: View members

- **WHEN** the member dialog opens
- **THEN** all current members are listed with their email and a remove button

#### Scenario: Add member

- **WHEN** the owner enters a valid email and submits
- **THEN** the user is added as a member, appears in the list, and a success toast is shown

#### Scenario: Add member error

- **WHEN** the add member API call fails (duplicate, not found, etc.)
- **THEN** an error toast is shown and the dialog stays open

#### Scenario: Remove member

- **WHEN** the owner clicks the remove button next to a member
- **THEN** the member is removed and a success toast is shown

#### Scenario: Remove member error

- **WHEN** the remove member API call fails
- **THEN** an error toast is shown and the member remains in the list

#### Scenario: Close dialog

- **WHEN** the user clicks close or outside the dialog
- **THEN** the dialog closes

