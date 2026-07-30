## 1. Backend Implementation

- [x] 1.1 Implement the `PUT /api/auth/password` endpoint to allow an authenticated user to change their password.
- [x] 1.2 Add password length validation (min 12) to the `PUT /api/auth/password` endpoint in the backend.
- [x] 1.3 Add backend unit tests for the `PUT /api/auth/password` endpoint.

## 2. Frontend Implementation

- [x] 2.1 Create a User Settings menu dropdown in the upper right corner of the application (near the search bar), containing a "Change Password" link.
- [x] 2.2 Create a new `UserSettings` page component with a "Change Password" form.
- [x] 2.3 Add frontend routing for `/settings` ensuring it is protected (requires authentication).
- [x] 2.4 Wire the "Change Password" form to call the new `PUT /api/auth/password` endpoint, and enforce the 12-char limit.
- [x] 2.5 Add frontend unit tests for the `UserSettings` component, the new menu, and form validation.

## 3. Verification

- [x] 3.1 Perform human testing: Log in, open the new upper-right Settings menu, click "Change Password" to navigate to the new Settings page, and successfully change the password (verify 12-char limit and correct current password requirements).
