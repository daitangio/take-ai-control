## 1. Backend protection setup

- [x] 1.1 Add and register `@fastify/under-pressure` in the backend app so overload shedding is active for every request.
- [x] 1.2 Keep the existing global `@fastify/rate-limit` plugin and adjust its default budget for general API traffic.
- [x] 1.3 Configure stricter rate limits for `/api/auth/login`, `/api/auth/register`, and `/api/auth/password`.
- [x] 1.4 Ensure proper logs when under-pressure limits are around 90% (i.e. event loop delay, memory limit)
- [x] 1.5 Provide a small shell test script (called loadTest.sh) inside nello/backend to overload dev system. 

## 2. Behavior and tests

- [x] 2.1 Add backend tests covering global throttling, stricter auth throttling, and 429 responses on excess requests.
- [x] 2.2 Add backend tests covering overload shedding and 503 responses when the service reports unhealthy pressure.
- [x] 2.3 Update any affected route tests so normal requests still succeed when limits are not exceeded.

## 3. Verification

- [x] 3.1 Run the backend test suite and fix any regressions caused by the new protection layers.
- [x] 3.2 Manually exercise the backend with repeated requests to confirm 429 and 503 responses appear at the expected thresholds.
