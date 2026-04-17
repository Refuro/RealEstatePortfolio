# Health check smoke (staging / production)

**Purpose:** Optional liveness check that `GET /api/health` returns **200** — for CI or external monitors. Note: this endpoint does not probe the database; use the Neon dashboard to verify DB connectivity.

## Manual

From a machine that can reach the deployment:

```bash
curl -sS -o /dev/null -w "%{http_code}" "https://YOUR_DOMAIN/api/health"
```

Expect `200` and JSON `{ "status": "ok" }` (see `app/app/api/health/route.ts`).

## CI (optional)

If you add a GitHub Actions (or other) workflow step, use a **staging** URL and **no production secrets** in logs. Example pattern:

- After deploy to staging, `curl` the staging `/api/health` once.
- Fail the job if status ≠ 200.

Production smoke is usually redundant if **UptimeRobot** (or similar) already monitors the same URL (see `docs/runbooks/incident-response.md`).

## Related

- [`docs/tasks-archived.md`](../tasks-archived.md) § **Tasks.md archive (2026-03-30)**, Batch 14 — optional CI smoke item (completed; historical reference)
- External uptime: documented in incident response runbook
