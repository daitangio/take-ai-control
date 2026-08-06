# invitation-registration Specification

## Purpose

Gate user registration behind invitation keys so only users with a valid key and matching email can create accounts, enabling controlled onboarding.

## Requirements

### Requirement: Registration with invitation key

The system SHALL allow a new user to register by providing an email, invitation key, and password. The invitation key MUST be validated against the `register_key` table: a row must exist with a matching `key_pass`, `avail_count` greater than 0, and the email MUST match the `email_regexp` pattern (if the pattern is non-empty and not `.*`). On success, `avail_count` SHALL be decremented by 1 atomically, the user account created with a bcrypt-hashed password, and a JWT access token returned.

#### Scenario: Successful registration with invitation key

- **WHEN** a user sends `POST /api/auth/register` with a unique email, a valid invitation key, and a password of 12 or more characters
- **THEN** a user account is created, the key's `avail_count` is decremented, and the response includes a JWT access token with status 200

#### Scenario: Invalid invitation key

- **WHEN** a user sends `POST /api/auth/register` with an invitation key that does not exist in `register_key`
- **THEN** the system returns status 401 with an error message "Invalid or exhausted invitation key"

#### Scenario: Exhausted invitation key

- **WHEN** a user sends `POST /api/auth/register` with an invitation key whose `avail_count` is 0
- **THEN** the system returns status 401 with an error message "Invalid or exhausted invitation key"

#### Scenario: Email does not match key's regexp

- **WHEN** a user sends `POST /api/auth/register` with an invitation key whose `email_regexp` does not match the provided email
- **THEN** the system returns status 401 with an error message "Email not eligible for this invitation key"

#### Scenario: Race-condition exhaustion

- **WHEN** two users concurrently register with the same invitation key and only one slot remains
- **THEN** exactly one user is created and the other receives status 409 with an error message "Invitation key just exhausted"

### Requirement: Invitation key email regexp matching

The system SHALL validate the user's email against the `email_regexp` column using a regular expression. If `email_regexp` is empty or the literal string `.*`, all emails SHALL be accepted.

#### Scenario: Regexp matches

- **WHEN** a key has `email_regexp` set to `.*@acme\.com` and the user provides `user@acme.com`
- **THEN** the email is accepted

#### Scenario: Regexp does not match

- **WHEN** a key has `email_regexp` set to `.*@acme\.com` and the user provides `user@gmail.com`
- **THEN** the email is rejected with status 401

#### Scenario: Wildcard regexp accepts any email

- **WHEN** a key has `email_regexp` set to `.*` and the user provides any valid email
- **THEN** the email is accepted

### Requirement: Invitation key uniqueness

The system SHALL enforce that each invitation key string is unique across all rows in the `register_key` table.

#### Scenario: Duplicate key insertion rejected

- **WHEN** an admin attempts to insert a `register_key` row with a `key_pass` that already exists
- **THEN** the database rejects the insert with a unique constraint violation

### Requirement: Shared password validation

The system SHALL enforce that passwords are at least 12 characters long for both registration and password change, using a shared validation function.

#### Scenario: Short password rejected at registration

- **WHEN** a user sends `POST /api/auth/register` with a valid invitation key but a password shorter than 12 characters
- **THEN** the system returns status 422 with a validation error

#### Scenario: Short password rejected at password change

- **WHEN** an authenticated user submits a new password shorter than 12 characters
- **THEN** the system returns status 422 with a validation error
