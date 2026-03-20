# Batch 8 — Builder handoff (PM → builder)

**PM:** Product owner / chat PM  
**Builder:** Cursor builder agent or implementer  
**Source of truth:** [`docs/tasks.md`](../tasks.md) → **Batch 8: Business & quality — active (pre-launch)**

**Status (code + docs):** PostHog SDK, events, `/changelog`, `analytics.md`, runbook uptime section, and `proxy`/`sitemap` updates are **implemented**. Remaining **manual**: add `NEXT_PUBLIC_POSTHOG_*` to Vercel and verify Live events; create external uptime monitor + alerts.

---

## Goal

Ship three launch-readiness items with acceptance criteria:

1. **PostHog** + core product events  
2. **Public `/changelog`** (including SEO notes in tasks)  
3. **External uptime monitor** for production `/api/health` (ops + docs, not app code beyond what exists)

---

## Execution order (recommended)

| Order | Workstream | Why |
|-------|------------|-----|
| 1 | **8.2 Changelog** | Fast, user-visible, improves SEO surface; no third-party secrets beyond env you already use. |
| 2 | **8.1 PostHog** | Needs PostHog project + env vars; touches app shell and event points. |
| 3 | **8.3 Uptime** | Manual setup in UptimeRobot / Better Stack / etc. + doc updates; no merge dependency on 8.1/8.2. |

*PM note: 8.3 can run in parallel with 8.1 if two people; solo builder should do 8.2 → 8.1 → 8.3.*

---

## Builder instructions

1. Open [`docs/tasks.md`](../tasks.md) and find **§8.1**, **§8.2**, **§8.3**.  
2. Implement each unchecked bullet; check boxes in `tasks.md` when done (or leave for PM review).  
3. Run from `app/`: `npm run lint` and `npm run test`.  
4. Report back: PR summary, env vars added, any follow-ups for PM (e.g. PostHog project invite).

---

## PM review gate (before merge)

- [ ] **8.1:** Live events visible in PostHog for a test user; `identify` works; funnel doc in `docs/launch/analytics.md` (create if implementing 8.1).  
- [ ] **8.2:** `/changelog` renders, footer link works, sitemap/robots updated, SEO metadata passes spot check.  
- [ ] **8.3:** Screenshot or note of uptime monitor config + updated runbook/launch checklist.

---

## References

- Investor snapshot: [`investor-style-one-pager.md`](investor-style-one-pager.md)  
- Launch plan: [`launch-plan.md`](launch-plan.md)  
- Incident / ops: [`../runbooks/incident-response.md`](../runbooks/incident-response.md)
