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

### Database migration rollback (when schema changed)

Vercel deployment rollback does **not** automatically roll back database migrations. If an incident involves a bad migration, choose one path:

1. **Hotfix forward (preferred):** if data is intact and fix is quick, ship a follow-up migration + code fix.
2. **Mark migration rolled back + restore app compatibility:** use Prisma resolve when rollback is required.

```bash
# Example: mark a failed/bad migration as rolled back
cd app
npx prisma migrate resolve --rolled-back "<migration_name>"
```

Rollback decision checklist:

- Confirm incident is schema-related (errors start after migration).
- Freeze risky writes if needed (maintenance notice or temporary feature flag).
- Choose **forward fix** vs **rolled back** based on blast radius and data safety.
- Pair DB action with app deploy action so runtime and schema stay compatible.
- Record exact commands and migration name in post-incident notes.

---

## 2. Monitoring and logs

### Where to check

| Source | What to check |
|--------|---------------|
| **Vercel** | Project → Logs (runtime logs, build logs). Filter by time range. |
| **Sentry** | [sentry.io](https://sentry.io) → your project. Errors, performance, releases, and CSP rollout monitoring (`signal=csp`). |
| **Database** | Neon (or your provider) dashboard. Connection count, query performance, storage. |
| **Stripe** | Dashboard → Developers → Logs. Webhook delivery, API errors. |
| **Clerk** | Dashboard. Auth errors, user sessions. |

### Health check

- **Endpoint:** `GET /api/health`
- **Expected:** `200` with `{ status: "ok" }`
- **Note:** This endpoint no longer probes the database — it is a lightweight liveness check only. Use the Neon dashboard to verify DB connectivity separately.

### External uptime monitor (production)

**Provider:** [UptimeRobot](https://uptimerobot.com)

| Item | Value |
|------|--------|
| **Monitored URL** | `GET https://veldportfolio.com/api/health` |
| **Expected** | HTTP **200**, JSON `{ "status": "ok" }` (see [`app/api/health`](../../app/app/api/health/route.ts)) |
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

### PostHog degraded / analytics missing

1. Verify `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` in Vercel env.
2. Confirm cookie consent behavior in browser (optional accepted vs rejected).
3. Check PostHog Live Events for incoming data from production.
4. If client capture is down, rely on server-side billing/account captures for partial signal and log the outage window.

### Resend degraded / email delivery failures

1. Check Resend dashboard for API outages, bounce spikes, or rate limits.
2. Verify `RESEND_API_KEY` in Vercel env and recent deploy history.
3. Test a support/contact email flow and a transactional email path.
4. If outage persists, post a user-facing support note and retry once provider status is green.

### RentCast degraded / estimate refresh failures

1. Check `monthly-refresh` and estimate route logs for upstream errors.
2. Verify `RENTCAST_API_KEY` and hourly quota usage.
3. Confirm fallback behavior: app should keep previous estimates/metrics without crashing.
4. Communicate stale-estimate window if outage spans scheduled refresh runs.

### Google Places degraded / address autocomplete failures

1. Check API route logs for `/api/places/autocomplete` and `/api/places/details`.
2. Verify `GOOGLE_MAPS_API_KEY` and Google project quota limits.
3. Confirm users can still enter addresses manually as fallback.
4. Re-test autocomplete once key/quota/status is restored.

### Auth / Clerk errors

1. Check Clerk Dashboard for configuration or outage.
2. Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` in Vercel.
3. Ensure redirect URLs in Clerk Dashboard include your production domain.

### High error rate (Sentry)

1. Identify top errors in Sentry (grouped by type).
2. Check recent deployments: did the error rate spike after a deploy? Consider rollback.
3. For new errors: triage, fix, deploy. Use Sentry stack traces to locate the issue.

### CSP rollout violations

1. In Sentry, filter for tag `signal=csp` or search event messages like `CSP violation: script-src`.
2. Triage by fingerprint/grouping: directive + blocked resource origin + document path.
3. Ignore browser-extension noise if it appears; focus on first-party pages or required third-party services.
4. If a production release creates new legitimate CSP violations on critical flows, keep or revert to report-only mode until the policy is updated.

---

## 4. Post-incident

- Document what happened and what fixed it.
- Add to this runbook if a new failure mode was discovered.
- Consider adding alerts (e.g. Sentry alerts, Vercel deployment notifications).

---

## 5. Support SLA and inbox verification

**SLA (launch):** Aim for **first response within 24 business hours** (Monday–Friday, US business days, excluding holidays) for messages sent via the **contact form** or **support email** (`SUPPORT_EMAIL`). Documented for users on the production **/contact** page and in `docs/launch/launch-plan.md` (internal doc, not in public repo) §6.1.

**Owner:** Designate who monitors `SUPPORT_EMAIL` (founder/ops). UptimeRobot alerts also go to this inbox when configured.

### Verification checklist (run after deploy or email change)

| Step | Action | Pass / note |
|------|--------|-------------|
| 1 | Send a test message from `/contact` in production (or staging with same email provider). | Message submits without error. |
| 2 | Confirm the message arrives at the **inbox** configured for `SUPPORT_EMAIL` (or your contact API route). | Inbox receives body + reply address. |
| 3 | Confirm the **owner** knows to check this inbox and the **24 business hour** target. | Owner acknowledged. |
| 4 | Optional: reply from the inbox to confirm outbound mail works. | Reply sent OK. |

If the contact form uses a third-party or server route, verify the route’s env vars (e.g. `RESEND_API_KEY`, SMTP) in Vercel match production.

---

*Reference: [docs/architecture-and-build-practices.md](../architecture-and-build-practices.md), [docs/setup/manual-steps.md](../setup/manual-steps.md).*
