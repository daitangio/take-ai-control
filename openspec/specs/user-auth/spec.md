# User Auth — Spec

## Purpose

Enable users to register an account and log in with email and password. Authenticated sessions are managed via JWT access tokens. All board, list, and card endpoints are protected behind authentication.
## Requirements
### Requirement: User registration

The system SHALL allow a new user to register with an email, invitation key, and password. The invitation key MUST be validated against the `register_key` table before account creation. The password MUST be hashed with bcrypt before storage and be at least 12 characters long. The email MUST be unique.

#### Scenario: Successful registration

- **WHEN** a user sends `POST /api/auth/register` with a unique email, a valid invitation key, and a password of 12 or more characters
- **THEN** a user account is created and the response includes a JWT access token with status 200

#### Scenario: Duplicate email registration

- **WHEN** a user sends `POST /api/auth/register` with an email that already exists
- **THEN** the system returns status 409 with an error message

#### Scenario: Registration with short password

- **WHEN** a user sends `POST /api/auth/register` with a valid invitation key but a password shorter than 12 characters
- **THEN** the system returns status 422 with a validation error

#### Scenario: Registration with missing invitation key

- **WHEN** a user sends `POST /api/auth/register` without an invitation key
- **THEN** the system returns status 422 with a validation error

#### Scenario: Registration with invalid email

- **WHEN** a user sends `POST /api/auth/register` with a malformed email
- **THEN** the system returns status 422 with a validation error

### Requirement: User login

The system SHALL allow an existing user to log in with email and password and receive a JWT access token.

#### Scenario: Successful login

- **WHEN** a user sends `POST /api/auth/login` with the correct email and password for an existing account
- **THEN** the response includes a JWT access token with status 200

#### Scenario: Wrong password

- **WHEN** a user sends `POST /api/auth/login` with the correct email but wrong password
- **THEN** the system returns status 401 with an error message

#### Scenario: Unknown email

- **WHEN** a user sends `POST /api/auth/login` with an email that does not match any account
- **THEN** the system returns status 401 with an error message

### Requirement: JWT token structure

Access tokens SHALL be JWTs signed with HS256, containing at minimum the user ID (`sub` claim) and an expiration time (`exp` claim).

#### Scenario: Token contains user identity

- **WHEN** a token is decoded and verified
- **THEN** the `sub` claim contains the user's UUID

#### Scenario: Expired token is rejected

- **WHEN** a request uses a token whose `exp` claim is in the past
- **THEN** the system returns status 401

### Requirement: Password hashing

User passwords SHALL be hashed with bcrypt before storage and never stored or logged in plaintext.

#### Scenario: Password is not stored in plaintext

- **WHEN** a user account is created
- **THEN** the stored password value in the database is a bcrypt hash, not the original password

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
