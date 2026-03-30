# Agent tasks

Tasks you want the **builder** agent to do. The PM adds tasks here when you ask; you can say "have the builder complete the tasks in tasks.md" and the PM will run the builder with these tasks.

**Product mantra (all tasks):** Thoughtful, robust, modern, frictionless. See `docs/architecture-and-build-practices.md`.
**Ownership policy (ownership/metrics tasks):** Follow `docs/policies/ownership-metrics.md` as the canonical source for formulas and copy semantics.
**Analytics math policy (analytics/projection tasks):** Follow `docs/policies/analytics-math-policy.md` for debt-service basis, time-window labels, and UI/API/export reconciliation.

**Future features / roadmap:** See `docs/reference/roadmap.md`. PM promotes items from there to here when ready to build.

**Test quality gate (process):** How tests fit CI, PM review, and pre-push flow is described in [`qa/test-infrastructure-review.md`](qa/test-infrastructure-review.md). **Test infrastructure** Phases 1 & 2 and Husky are **complete** — detail in [`tasks-archived.md`](tasks-archived.md) § **Tasks.md archive (2026-03-20)**.

---

## Completed

Checked-off history (**test infrastructure & hooks**, **Batches 1–8**, add-property **Epics A–G**): **[`docs/tasks-archived.md`](tasks-archived.md)** — section **Tasks.md archive (2026-03-20)**. Older archive entries (website perf, dashboard batches, etc.) are in the same file above that section.

---

## Current product backlog

### Launch readiness + growth sprint (2026-03-20)

- [x] **Legal freshness + privacy analytics disclosure (P0):**
  - Update `app/app/terms/page.tsx` and `app/app/privacy/page.tsx` with current "Last updated" dates.
  - Add explicit PostHog mention to privacy copy (data processor + product analytics purpose + link/reference to policy language in `docs/launch/analytics.md`).
  - Keep copy consistent with existing "no tax/legal advice" and "estimates/benchmarks" language.
- [x] **Support SLA definition + verification (P0):**
  - Define a simple support SLA for launch (recommended baseline: first response within 24 hours on business days).
  - Add SLA wording to support-facing surfaces/docs (at minimum `docs/launch/launch-plan.md`, optional contact page copy).
  - Verify support path end-to-end: submit contact form, confirm inbound delivery, and confirm response workflow owner + inbox. *(Runbook checklist in [`docs/runbooks/incident-response.md`](runbooks/incident-response.md) §5 — PM completes verification in production.)*
- [x] **Soft launch execution updates (P0):**
  - Expand `docs/launch/launch-plan.md` with an actionable 30/60/90-style plan aligned to current channel strategy (Reddit/forums now, small Google Ads test next week).
  - Include weekly cadence for posting, ad-budget guardrails, and KPI checkpoints (`user_signed_up` -> `property_created`, `checkout_started` -> `subscription_activated`).
  - Keep phases synced with this backlog section and mark assumptions clearly. *(Covered by `docs/launch/launch-plan.md` §5.1–5.2 and §6.1.)*

---

## Roadmap priority (value vs effort — 2026-03-15)

| Order | Item | Effort | Value | Recommendation |
|-------|------|--------|-------|----------------|
| — | Mortgage balance advancement | ✓ Done | — | Balance advancement, escrow, amortization fix, loan type import, chart tooltip. |
| — | Admin membership override | ✓ Done | — | Tier override, admin UI, settings override display. |
| — | Benchmarking | ✓ Done | — | Rent vs market, surfacing on list/dashboard, inline refresh. |
| — | Error tracking (Sentry) | ✓ Done | — | Production error monitoring; set NEXT_PUBLIC_SENTRY_DSN in Vercel. |
| — | Dashboard single-property | ✓ Done | — | Property at a glance, metrics, Rent vs. Market auto-refresh. |
| **1** | Refinance / payoff insights | Medium–High | High | Actionable; builds on amortization logic. |
| **3** | Simulation page | High | High | Full modeling; extends scenario concept. |
| **4** | Report section (PDF) | Medium | Medium | Professional output; share with partners/lenders. |
| **5** | Automated testing | High | High | Quality foundation; plan per Module M. |

**Defer:** Rent gap email (cost scales), Referral system (validate first).

---

*When the builder completes a task, they check it off here and report back.*
