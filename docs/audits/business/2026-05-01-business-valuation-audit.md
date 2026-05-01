# Business & Valuation Audit — 2026-05-01

> **Continuity:** Fresh pass per `docs/process/business-valuation-audit-process.md`. **Permanent deferral (§5):** **GRW-1** — mobile pricing accordion omitting the “Estimate pool (per hour)” row is **intentional by design**; **not** a finding.

---

## Executive summary

- **Monetization and plan architecture look production-grade in-repo:** Three tiers (Free / Investor / Pro), Stripe-backed checkout and portal, webhook + sync routes with Vitest coverage, and a single source for public comparison rows (`app/lib/marketing/pricing-compare-rows.ts`) aligned with `app/lib/plans` limits. Public `/pricing` copy links Terms sections for billing, refunds, and cancellation.
- **Analytics coverage is documented and broad:** `docs/launch/analytics.md` defines plan intent, deduplication, funnel events (`app/lib/analytics-events.ts`), and PM QA checklists; implementation spans client capture, server webhook/cron paths, and gated initialization per `PostHogGate` / consent behavior described in analytics docs and `app/app/privacy/page.tsx`.
- **Valuation remains traction-limited, not capability-limited:** `docs/reference/valuation-brief.md` still frames **early-launch / pre-revenue**, directs readers to **verify** Stripe and PostHog before external use, and flags **internal conflict** on activation counts pending analytics reconciliation (§10 Q&A). Until dated MRR and activation cohorts replace snapshots, **observed revenue and usage cap** buyer and investor pricing.
- **Launch readiness:** `docs/launch/launch-plan.md` marks product analytics and uptime monitor as done; **§9 operational checklist** still leaves env verification, prod health, support path, pricing↔Stripe spot-check, trial copy cross-check, and golden-path demo **unchecked** (explicitly owner verification items).
- **Overall recommendation:** Treat **traction truth** (PostHog + Stripe + DB) as the next valuation unlock; refresh **documentation snapshots** that lag the test suite; close **launch §9** for a scale-ready narrative; keep **investor-intelligence** roadmap execution aligned with `docs/internal/differentiator-value-add-analysis.md`.

---

## Severity-ranked findings

### Critical

- *(None from reviewed docs and evidence. Billing architecture and plan gating are supported by route tests under `app/app/api/billing/` and `app/lib/plans.test.ts`.)*

### High

- **Revenue and activation evidence remain the primary valuation ceiling** — `docs/reference/valuation-brief.md` §8–§10 describe **pre-revenue** positioning, instruct verification before investor conversations, and preserve a **historical** activation anecdote with explicit warning not to treat it as current truth without PostHog/DB reconciliation. Until **dated** MRR, trial→paid, and property-created cohorts are canonical, external valuation stays **asset / pre-SaaS-multiple** weighted.

### Medium

- **`docs/reference/roadmap.md` Vitest snapshot drifted within a week** — Completed-work table and “Current state” still cite **618** tests as of **2026-04-30** (`docs/reference/roadmap.md` §~260, §~391). As of **2026-05-01**, `npm run test -- --run` in `RealEstatePortfolio/app/` reports **85** test files, **628** passed tests. **Impact:** Mis-stated engineering velocity signals in diligence conversations; easy to fix by updating the snapshot or relying solely on “re-run `npm run test`.”

- **`docs/launch/launch-plan.md` §9 operational gaps persist** — Production env verification, `/api/health`, support path, pricing↔Stripe↔`NEXT_PUBLIC_PRICE_*` alignment, trial copy consistency, and **golden-path demo** remain unchecked (`docs/launch/launch-plan.md` §226–235). **Impact:** Weaker “production-ready for scale” story for partners, spend, or acquirer ops review.

- **Defensibility backlog vs. positioning** — `docs/internal/differentiator-value-add-analysis.md` and `docs/reference/valuation-brief.md` still imply **gaps** in investor-grade outputs, persistent alerting, shareability, and comparable **switching-cost** depth versus incumbents once ICP compares feature tables. Shipped **portfolio insights** and **deal↔portfolio** continuity (`app/lib/changelog-data.ts` 2026-04-29 entry; roadmap §1a) **narrow** but do not **close** that narrative.

- **Optional analytics consent vs. attribution completeness** — `docs/launch/analytics.md` and privacy copy describe **memory-first** PostHog until optional consent; cross-session funnels and identity-rich attribution **depend** on acceptance. **Impact:** Paid and organic channel ROI may be **under-measured** for users who never accept optional cookies — plan dashboards accordingly.

### Low

- **Entity posture** — `docs/business-launch-checklist.md` §76–77: Terms/Privacy may still describe **sole proprietor–style** operator until LLC formation; **human-only** legal work.

- **Owner concentration** — `docs/reference/valuation-brief.md` §301: single-operator **bus factor** — typical for stage, still a buyer discount without team or handover artifacts.

- **Changelog cadence** — Latest user-facing entry **2026-04-29** (`app/lib/changelog-data.ts`); audit date **2026-05-01** has no new top entry (expected if no user-visible deploy yet).

- **Cross-lane technical debt (velocity signal)** — `docs/audits/code/2026-05-01-code-audit.md` flags very large client modules and defense-in-depth rate-limit gaps. **Impact:** Higher marginal cost per feature iteration; indirect business risk via slower shipping, not a pricing defect.

---

## Evidence reviewed

| Area | Sources |
|------|---------|
| **Process / template** | `docs/process/business-valuation-audit-process.md` (§5 GRW-1), `docs/process/audit-report-template.md` |
| **Product & strategy** | `README.md`, `docs/reference/roadmap.md`, `docs/reference/valuation-brief.md`, `docs/internal/differentiator-value-add-analysis.md` |
| **Pricing / plans** | `app/app/pricing/page.tsx`, `app/lib/marketing/pricing-compare-rows.ts`, `app/components/pricing-cards.tsx`, `docs/reference/valuation-brief.md` §2 (pricing table + env note) |
| **Tests** | `app/lib/plans.test.ts`; `app/app/api/billing/*/route.test.ts` (webhook, sync, checkout, portal); `npm run test -- --run` in `app/` → **85** files, **628** tests passed (2026-05-01) |
| **Changelog** | `app/lib/changelog-data.ts`, `docs/launch/changelog-process.md` |
| **Launch readiness** | `docs/launch/launch-plan.md` (§2 risks, §5 phases, §9 checklist), `docs/business-launch-checklist.md` |
| **Analytics** | `docs/launch/analytics.md`, `app/lib/analytics-events.ts`, `app/lib/analytics-client.ts`, sampled `captureClientEvent` usage (pricing, onboarding, billing) |
| **Cross-audit** | `docs/audits/code/2026-05-01-code-audit.md` |

**Limits:** No live Stripe Dashboard, PostHog project drill-down, or production URL verification. User/revenue figures taken **only** as described in `valuation-brief.md` with its explicit “verify externally” instructions. Valuation bands are **illustrative**, not fairness opinions. **Audit only** — no edits under `app/`.

---

## Risk & impact assessment

| Theme | Likelihood | Business impact if unresolved |
|-------|------------|--------------------------------|
| Pre-revenue / un-reconciled activation story | High until disproven | Weak ARR narrative; buyers price **implementation + option value**, not SaaS comps |
| Stale roadmap test snapshot | Certain (already drifted) | Small but **avoidable** credibility hit in technical diligence |
| Launch §9 incomplete | Medium | Ops and trust gaps when marketing or spend scales |
| Thin share/export/alert moat vs. incumbents | High as backlog | **Compression** of differentiated positioning in competitive bake-offs |
| Consent-gated analytics | Medium (by audience) | **Attribution blind spots**; risk of under-investing in working channels |

---

## Valuation framing

*(Indicative bands only — not fairness opinions. Reconcile `valuation-brief.md` with live Stripe and PostHog before any external use.)*

### Assumptions

- **Codebase / minimal ARR:** Billing, feature depth, governance, and tests per reviewed docs; **traction** per `valuation-brief.md` remains **early** until updated with owner-verified metrics.
- **With traction:** Requires **dated** MRR, churn, trial→paid, and activation cohort exports.

### Indicative bands (USD)

| Scenario | Priced in | Indicative range | Notes (2026-05-01 vs. prior) |
|----------|-----------|------------------|------------------------------|
| **A — Codebase, minimal ARR** | Replacement cost, documentation, automation | **~$22K–$55K** | **Marginal** change: **+10** passing tests vs. 2026-04-30 snapshot (**618→628**); still **not** ARR-driven |
| **B — Early revenue** | Dozens of paying subs, basic retention, visible funnel | **~$50K–$110K** | Requires **actuals** in Stripe |
| **C — PMF signal** | ~$2K+ MRR, improving NRR, differentiated outputs (exports, alerts, share) | **~$150K–$400K+** | Needs **traction + moat** delivery |

`valuation-brief.md` §315 **$200K–$450K** rebuild-style estimate remains a **theoretical replication ceiling**, not a transaction clearing price for an unscaled operator asset.

---

## Recommendations (prioritized)

1. **Reconcile activation and revenue truth** — Export PostHog (`property_created`, onboarding steps, `checkout_started`, `subscription_activated`) and Stripe; **replace or annotate** the historical funnel paragraph in `valuation-brief.md` §10 with **dated** facts or a single “unknown until dashboard” statement.
2. **Refresh `docs/reference/roadmap.md` test snapshot** — Set to **85 / 628** (2026-05-01) or drop hard counts in favor of “run `npm run test`” only, per the doc’s own guidance.
3. **Close `docs/launch/launch-plan.md` §9** — Production env, health, support email flow, pricing↔portal parity, trial copy, and a **short golden-path** screen recording for diligence and community distribution.
4. **Maintain a weekly monetization view** — Use `docs/launch/posthog-growth-funnel.md` (referenced from `analytics.md`) for **checkout_started → subscription_activated** and trial banner / plan-limit upgrade paths.

---

## Task candidates

- [ ] Update `docs/reference/roadmap.md` Vitest snapshot from **618** to **628** tests (and date stamp **2026-05-01**), or remove pinned counts in favor of CI/command-only wording.
- [ ] Complete remaining **unchecked** items in `docs/launch/launch-plan.md` §9 (env, health, support, Stripe↔pricing spot-check, demo recording).
- [ ] Pull a **single dated** PostHog + Stripe export and revise `docs/reference/valuation-brief.md` §10 activation Q&A so external sharing does not rely on conflicting snapshots.
- [ ] Record **golden-path demo** (signup → add property → dashboard → deal analyzer) per launch plan §9 for investor, partner, and acquirer conversations.

---

## Re-test checklist

- [ ] After doc updates: re-run `npm run test -- --run` before quoting test counts externally.
- [ ] After launch §9: smoke **checkout** and **billing portal** in production with test card / real flow per `docs/business-launch-checklist.md`.
- [ ] Spot-check PostHog Live for `checkout_started` and webhook-driven `subscription_activated` after any billing change.

---

## Next trigger and cadence

- **Trigger:** Monthly or after any **pricing**, **Stripe**, **analytics schema**, or **material launch** change; required read before **fundraising or sale** conversations.
- **Recommended next run:** **2026-06-01** or next **full-audit synthesis** date per `docs/process/full-audit-synthesis.md`.
