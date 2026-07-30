## Why

Users need a way to manage their account security. Adding a User Settings page with a Change Password menu solves the problem of users not being able to update their credentials if they feel they are compromised or want to follow security best practices.

## What Changes

- Add a User Settings page in the Nello frontend.
- Add a "Change Password" menu/form on the User Settings page.
- Implement the backend endpoint to handle password change requests for authenticated users.
- Enforce a minimum password length of 12 characters for the new password.

## Capabilities

### New Capabilities
- `user-settings`: Introduces a User Settings page in the frontend for managing account preferences.

### Modified Capabilities
- `user-auth`: Adds the requirement to allow authenticated users to change their password, and enforces a minimum password length of 12 characters.

## Impact

- **Frontend**: New `UserSettings` component and routing.
- **Backend**: New `PUT /api/auth/password` (or similar) endpoint. Updates to password validation logic.
- **Database**: No schema changes expected, but the password hash will be updated for existing users.
