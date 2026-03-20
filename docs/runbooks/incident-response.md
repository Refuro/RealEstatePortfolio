# Incident response runbook

**Purpose:** Steps to rollback, monitor, and recover when something goes wrong in production.

**Status:** Reference — update when deployment or monitoring changes.

---

## 1. Rollback

### Vercel (default deployment)

1. Go to [Vercel Dashboard](https://vercel.com) → your project → **Deployments**.
2. Find the last known-good deployment (before the incident).
3. Click the **⋯** menu → **Promote to Production**.
4. Confirm. The previous production deployment is restored.

### Alternative: redeploy from Git

If you need to deploy a specific commit:

```bash
# From repo root
cd app
vercel --prod
# Or: link to a specific commit and deploy
```

---

## 2. Monitoring and logs

### Where to check

| Source | What to check |
|--------|---------------|
| **Vercel** | Project → Logs (runtime logs, build logs). Filter by time range. |
| **Sentry** | [sentry.io](https://sentry.io) → your project. Errors, performance, releases. |
| **Database** | Neon (or your provider) dashboard. Connection count, query performance, storage. |
| **Stripe** | Dashboard → Developers → Logs. Webhook delivery, API errors. |
| **Clerk** | Dashboard. Auth errors, user sessions. |

### Health check

- **Endpoint:** `GET /api/health`
- **Expected:** `200` with `{ status: "ok", database: "connected" }`
- **Failure:** `503` when DB is unreachable. Use for uptime monitoring (e.g. UptimeRobot, Better Uptime).

### External uptime monitor (production)

**Provider:** [UptimeRobot](https://uptimerobot.com)

| Item | Value |
|------|--------|
| **Monitored URL** | `GET https://veldportfolio.com/api/health` |
| **Expected** | HTTP **200**, JSON `{ "status": "ok", "database": "connected" }` (see [`app/api/health`](../../app/app/api/health/route.ts)) |
| **Alerts** | Email to the **support** inbox (same address as `SUPPORT_EMAIL` / Contact page) |
| **Public status page** | [stats.uptimerobot.com/Z6ScA8Ip37](https://stats.uptimerobot.com/Z6ScA8Ip37) — share with users who want a live “is the app up?” page |

**UptimeRobot dashboard:** edit monitors and alert contacts at [uptimerobot.com](https://uptimerobot.com) (account login).

If you change production domain or DNS, update the monitor URL in UptimeRobot to match.

---

## 3. Recovery steps

### Database unreachable (503 on /api/health)

1. Check Neon (or DB provider) dashboard for outages, connection limits, or maintenance.
2. If connection limit hit: scale up or close idle connections.
3. If credentials changed: update `DATABASE_URL` in Vercel env vars and redeploy.

### Billing / Stripe errors

1. Check Stripe Dashboard → Logs for failed webhooks or API errors.
2. Verify `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` in Vercel match Stripe Dashboard.
3. If webhook URL changed: update in Stripe and redeploy.

### Auth / Clerk errors

1. Check Clerk Dashboard for configuration or outage.
2. Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` in Vercel.
3. Ensure redirect URLs in Clerk Dashboard include your production domain.

### High error rate (Sentry)

1. Identify top errors in Sentry (grouped by type).
2. Check recent deployments: did the error rate spike after a deploy? Consider rollback.
3. For new errors: triage, fix, deploy. Use Sentry stack traces to locate the issue.

---

## 4. Post-incident

- Document what happened and what fixed it.
- Add to this runbook if a new failure mode was discovered.
- Consider adding alerts (e.g. Sentry alerts, Vercel deployment notifications).

---

*Reference: [docs/architecture-and-build-practices.md](../architecture-and-build-practices.md), [docs/setup/manual-steps.md](../setup/manual-steps.md).*
