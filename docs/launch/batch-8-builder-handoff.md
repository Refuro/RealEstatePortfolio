# Batch 8 — Builder handoff (PM → builder)

> **COMPLETE (historical — 2026-03-20).** Batch 8 is **done** — full acceptance criteria are in [`docs/tasks-archived.md`](../tasks-archived.md) § **Tasks.md archive (2026-03-20)** (*Batch 8: Business & quality*). Production verification is recorded in [`launch-plan.md`](launch-plan.md) §6. Use this file only for **how we executed** the initiative, not as open work.

**PM:** Product owner / chat PM  
**Builder:** Cursor builder agent or implementer  
**Source of truth (current):** [`docs/tasks-archived.md`](../tasks-archived.md) § **Tasks.md archive (2026-03-20)** → **Batch 8: Business & quality — complete**

**Final status:** PostHog (prod keys + Live events), public `/changelog`, external uptime monitor + runbook, and launch checklist items are **verified in production**.

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

1. *(Historical.)* Acceptance criteria were under **§8.1–8.4** in [`docs/tasks-archived.md`](../tasks-archived.md) § **Tasks.md archive (2026-03-20)** — all complete.  
2. New builder work is tracked in [`docs/tasks.md`](../tasks.md) **Current product backlog** only.  
3. Run from `app/`: `npm run lint` and `npm run test`.  
4. Report back: PR summary, env vars added, any follow-ups for PM (e.g. PostHog project invite).

---

## PM review gate (completed 2026-03-20)

- [x] **8.1:** Live events visible in PostHog for a test user; `identify` works; funnel doc in `docs/launch/analytics.md` (create if implementing 8.1).  
- [x] **8.2:** `/changelog` renders, footer link works, sitemap/robots updated, SEO metadata passes spot check.  
- [x] **8.3:** Screenshot or note of uptime monitor config + updated runbook/launch checklist.

---

## References

- Investor snapshot: [`investor-style-one-pager.md`](investor-style-one-pager.md)  
- Launch plan: [`launch-plan.md`](launch-plan.md)  
- Incident / ops: [`../runbooks/incident-response.md`](../runbooks/incident-response.md)
