## Why

The backend needs basic abuse protection before it is exposed to more traffic. Using only `@fastify/rate-limit` and `@fastify/under-pressure` gives the app a low-complexity defense against request floods and overload without introducing proxy or infrastructure changes.

## What Changes

- Keep global request throttling in the Fastify app with `@fastify/rate-limit`.
- Apply stricter throttling to expensive auth endpoints such as login, register, and password change.
- Add `@fastify/under-pressure` so the server returns controlled failures when the process is overloaded.
- Preserve existing API behavior for normal traffic while rejecting abusive bursts and shedding load under stress.

## Capabilities

### New Capabilities
- `backend-abuse-protection`: request throttling and overload shedding for the backend API.

### Modified Capabilities
- `backend-api`: backend responses gain explicit throttling and overload-failure behavior under abuse conditions.

## Impact

Affected backend Fastify app setup, auth route configuration, package dependencies, and backend tests. No frontend contract changes are expected for normal traffic.
