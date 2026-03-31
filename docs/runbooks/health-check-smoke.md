# Health check smoke (staging / production)

**Purpose:** Optional reliability check that `GET /api/health` returns **200** when the database is reachable — for CI or external monitors.

## Manual

From a machine that can reach the deployment:

```bash
curl -sS -o /dev/null -w "%{http_code}" "https://YOUR_DOMAIN/api/health"
```

Expect `200` and JSON including a healthy DB indicator (see `app/app/api/health/route.ts`).

## CI (optional)

If you add a GitHub Actions (or other) workflow step, use a **staging** URL and **no production secrets** in logs. Example pattern:

- After deploy to staging, `curl` the staging `/api/health` once.
- Fail the job if status ≠ 200.

Production smoke is usually redundant if **UptimeRobot** (or similar) already monitors the same URL (see `docs/runbooks/incident-response.md`).

## Related

- `docs/tasks.md` Batch 14 — optional CI smoke item
- External uptime: documented in incident response runbook
