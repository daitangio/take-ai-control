## Why

User tiers already define board, list, and card quotas in the database, but the backend never applies them. Users can therefore exceed their entitlement without advance notice or a clear, localizable response.

## What Changes

- Enforce the tier limits for owned boards, active lists per board, and active cards per list.
- Treat archived lists and cards as inactive for capacity calculations; reject card creation, restoration, and cross-list moves that would overfill a target list.
- Return stable, localizable errors for capacity-limit rejections without changing data.
- Expose enough capacity information for the frontend to display localized, non-blocking warnings at 75% usage.
- Add localized frontend warnings and error messages, with automated coverage of threshold and limit behavior.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `capacity-limits`: Enforce tier capacity and notify users at the 75% threshold.
- `data-persistence`: Persist user-tier relationships in the application data model.
- `backend-api`: Provide capacity data and stable errors for limit enforcement.
- `multilingual-support`: Localize capacity warnings and limit-rejection messages.

## Impact

- Backend: SQL/Drizzle schema, board/list/card routes, error-code definitions, and API tests.
- Frontend: API types, capacity-warning presentation, translation resources, and frontend tests.
- Existing tier data in `nello/backend/db-init/004-limits.sql` becomes active application behavior.
