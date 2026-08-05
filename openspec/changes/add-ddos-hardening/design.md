## Context

See `proposal.md` for motivation. The backend already uses Fastify with a single global request-throttling plugin registration, and the change must stay limited to `@fastify/rate-limit` and `@fastify/under-pressure`.

## Goals / Non-Goals

**Goals:**
- Define clear throttle behavior for normal API traffic and sensitive auth endpoints.
- Add overload shedding so the server fails fast when Node is under stress.
- Keep the implementation small and local to the backend app setup and auth routes.

**Non-Goals:**
- No proxy, WAF, or infrastructure-level DDoS mitigation.
- No authentication redesign or new security model.
- No frontend changes beyond existing error handling.

## Decisions

- Use a single global rate-limit plugin plus route-level overrides for auth endpoints.
  - Rationale: the global cap protects the whole API, while auth endpoints need tighter control because they are cheaper to abuse and more expensive to retry.
  - Alternatives considered: per-route limits everywhere, which is noisier to maintain; or only a global limit, which leaves login/register/password too permissive.

- Add `under-pressure` at the app level rather than embedding health checks in individual routes.
  - Rationale: overload is a process-wide concern, so the guard should fail requests consistently before route handlers run.
  - Alternatives considered: ad hoc checks inside handlers, which would duplicate logic and miss shared saturation points.

- Keep failure modes simple: 429 for throttling, 503 for overload.
  - Rationale: these status codes are standard, easy for clients to handle, and map directly to the two protection layers.

## Risks / Trade-offs

- [Low global limit may block legitimate bursts] → Tune the default limit conservatively and keep auth routes stricter but bounded.
- [Overload shedding can reject requests during transient spikes] → Use thresholds that reflect real Node saturation, not normal load.
- [Users may see more 429s on shared networks] → Prefer endpoint-specific throttling instead of relying on a very low global cap.
