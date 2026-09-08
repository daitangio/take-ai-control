The docker compose is an example of a full deployable application with frontend, backend and backup procedure
Customize the docker-compose.yml for your needs.
To work, remember to init the database manually

## Board events (SSE real-time sync)

Backend env vars (docker-compose `backend.environment`):
- `NELLO_EVENTS_ENABLED` — kill switch for the events routes and emissions. Default: enabled; set to `false` to disable server-side.
- `NELLO_EVENTS_INTERVAL_SECONDS` — how often board changes are flushed to subscribers. Default: 3.
- `NELLO_EVENTS_MAX_CONNECTIONS_PER_USER` — maximum concurrent SSE streams held by one user. Default: 3.
- `NELLO_EVENTS_MAX_CONNECTIONS` — maximum concurrent SSE streams held by one backend process. Default: 300. Set this below the process and proxy connection capacity; the backend rejects excess streams with HTTP 429.

Frontend build-time env var:
- `VITE_EVENTS_ENABLED` — kill switch for the EventSource subscription. Default: enabled; set to `false` at build time (e.g. `VITE_EVENTS_ENABLED=false npm run build`).

Both sides degrade gracefully if either switch is off: the app keeps working REST-only.
