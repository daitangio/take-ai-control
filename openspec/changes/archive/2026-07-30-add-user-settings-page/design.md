## Context

The Nello application currently lacks a way for users to update their credentials. We are adding a User Settings page, an API endpoint to allow password changes, and a user dropdown menu in the header. We also need to introduce a minimum 12-character constraint on all new passwords going forward via password change.

## Goals / Non-Goals

**Goals:**
- Provide a secure `/api/auth/password` PUT endpoint for changing passwords.
- Implement a UI view for User Settings and wire it to the API.
- Add a User Settings menu in the upper right corner of the app (near the search bar).
- Ensure the backend properly hashes the new password with bcrypt before storing.
- Enforce the 12-character limit on the backend for password change.

**Non-Goals:**
- Other account settings like email changes, profile pictures, or 2FA.
- Password complexity requirements beyond length (e.g., symbols, numbers).
- Updating registration (form registration is currently removed).

## Decisions

**1. API Endpoint for Password Change:**
- We will add `PUT /api/auth/password`. It expects `{ "currentPassword", "newPassword" }`.
- We decided against adding this to a generic user update endpoint to keep security-sensitive operations distinct and easily auditable.

**2. Frontend Placement & Navigation:**
- A new route `/settings` will be added to the frontend, accessible only for authenticated users.
- Navigation will be provided via a new User Settings dropdown menu in the top right corner of the header, which will contain a link directly to the Change Password section of the settings page.

## Risks / Trade-offs

- **Risk**: Existing users might have passwords shorter than 12 characters.
  → **Mitigation**: The system will allow them to login. The 12-character rule will only be enforced when they choose to change their password.
