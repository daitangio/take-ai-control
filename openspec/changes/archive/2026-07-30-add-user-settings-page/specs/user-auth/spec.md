# User Auth — Delta Spec

## ADDED Requirements

### Requirement: Change password
The system SHALL allow an authenticated user to change their password by providing their current password and a new password. The new password MUST be at least 12 characters long.

#### Scenario: Successful password change
- **WHEN** an authenticated user submits a valid current password and a new password of 12 or more characters
- **THEN** the system updates the password hash and returns status 200

#### Scenario: Current password is incorrect
- **WHEN** an authenticated user submits an incorrect current password
- **THEN** the system returns status 401 (or 400) with an error message and does not change the password

#### Scenario: New password is too short
- **WHEN** an authenticated user submits a new password that is less than 12 characters long
- **THEN** the system returns status 422 with a validation error
