# Business & Valuation Audit — 2026-03-30 (Run 3)

## Executive summary

- **Monetization stack is coherent for a small SaaS:** three tiers with documented limits (`app/lib/plans.ts`), Stripe price IDs and display pricing (`app/lib/stripe-config.ts`, `app/lib/pricing-display.ts`), internal billing matrix with a production verification checklist (`docs/internal/billing-matrix.md`), and webhook-driven tier sync with server-side PostHog for subscription lifecycle (`app/app/api/billing/webhook/route.ts`, `app/lib/posthog-server.ts`).
- **Product analytics are commercially usable:** stable event names in `app/lib/analytics-events.ts`, consent-gated client capture, documented plan intent and deduplication in `docs/launch/analytics.md`, and funnel/checkout signals including `checkout_started` from pricing CTAs.
- **Public changelog and launch collateral support GTM:** `app/lib/changelog-data.ts` with process in `docs/launch/changelog-process.md`; launch positioning and ICP in `docs/launch/launch-plan.md` and `docs/internal/project-grounding.md`; entity/go-to-market checklist in `docs/business-launch-checklist.md`.
- **Tests are strong on core math and validations but thin on billing integration:** Vitest reports **129 passing tests** and **~81% overall statement coverage**; checkout **schema** is fully covered (`app/lib/validations/checkout.test.ts`) while Stripe **webhook** and **create-checkout-session** routes have **no** dedicated route tests—commercial regression risk remains for the paid path.

## Severity-ranked findings

### Critical

- None.

### High

- **Valuation and operating review still lack a standing metrics snapshot** — MRR, active paying subscribers, churn, and cohort signals are not packaged in-repo for quarterly business/valuation passes; reviews stay manual and heavier than necessary. — *Evidence:* `docs/audits/business/2026-03-30-business-valuation-audit-2.md` (same gap); no `docs/internal/` or ops doc providing a recurring snapshot template with live numbers.

- **Stripe webhook user-resolution gap is a revenue-integrity edge case** — If `appUserId` cannot be resolved from subscription metadata or `stripeCustomerId`, `syncSubscriptionToDb` aborts after Sentry warning; paid state may not match Stripe until repaired. — *Evidence:* `app/app/api/billing/webhook/route.ts` (lines 118–138: early return when `!appUserId`).

### Medium

- **Launch plan vs current GTM may be out of sync** — `docs/launch/launch-plan.md` §2.2 still states paid ads should stay off until PostHog baseline is established; the repo also contains active paid-ads runbooks and readouts (`docs/launch/paid-ads-monitoring-runbook.md`, `docs/launch/paid-ads-readout-2026-03-30-round1.md`, etc.). Reconcile messaging so internal strategy docs match actual launch phase. — *Evidence:* `docs/launch/launch-plan.md` (lines 42–43), `docs/launch/` paid-ads artifacts dated 2026-03-30.

- **Billing API paths lack automated integration tests** — Checkout session creation and webhook signature handling, idempotency-adjacent behavior, and tier mapping from price IDs are production-critical but not covered by Vitest route tests (unlike plan-limit cases on `POST /api/properties` and `POST /api/deals`). — *Evidence:* `app/app/api/billing/` (no `*.test.ts`); `glob **/*.test.ts` under `app/` lists 20 test files, none under `api/billing/`.

- **Roadmap still lists “Automated testing” as a prioritized backlog row** — `docs/reference/roadmap.md` shows it as Priority 15 with scope describing broader API/auth testing; this can confuse acquirers skimming the roadmap vs completed test-infrastructure work in `docs/tasks.md`. — *Evidence:* `docs/reference/roadmap.md` (lines 122–127), `docs/tasks.md` (Phase 1 & 2 test infrastructure marked complete).

### Low

- **Changelog date granularity mixes specific days and a month bucket** — Entries include `2026-03-28`, `2026-03-20`, and `2026-03` (`app/lib/changelog-data.ts`), which is allowed by process but slightly uneven for SEO and reader scanning. — *Evidence:* `app/lib/changelog-data.ts`.

## Evidence reviewed

- **Process / template:** `docs/process/business-valuation-audit-process.md`, `docs/process/audit-report-template.md`
- **Product & strategy:** `README.md`, `docs/reference/roadmap.md`, `docs/business-launch-checklist.md`, `docs/internal/project-grounding.md`, `docs/internal/billing-matrix.md`, `docs/tasks.md` (header and active/completed sections)
- **Pricing & billing:** `app/lib/plans.ts`, `app/lib/stripe-config.ts`, `app/lib/pricing-display.ts`, `app/components/pricing-cards.tsx`, `app/app/api/billing/create-checkout-session/route.ts`, `app/app/api/billing/webhook/route.ts`, `app/lib/validations/checkout.ts`, `app/lib/validations/checkout.test.ts`, `app/.env.example`
- **Analytics:** `app/lib/analytics-events.ts`, `app/lib/analytics-client.ts`, `app/lib/posthog-server.ts`, `docs/launch/analytics.md`
- **Changelog:** `app/lib/changelog-data.ts`, `docs/launch/changelog-process.md`, `app/app/changelog/page.tsx` (referenced via data)
- **Launch / business-facing:** `docs/launch/launch-plan.md`, `docs/launch/analytics.md`, `docs/audits/README.md`
- **Tests:** `npm run test:coverage` (Vitest v4.1.0, 2026-03-30): 20 files, 129 tests passed; aggregate **80.73%** statements, **82.4%** lines (v8)

**Limits:** No access to production Stripe Dashboard, PostHog projects, or live MRR; valuation scenarios remain assumption-based without owner-provided traction data.

## Risk & impact assessment

Unresolved **High** items affect **strategic planning efficiency** (metrics snapshot) and **occasional billing sync correctness** (webhook edge cases), not routine happy-path checkout for correctly configured customers. **Medium** items affect **due-diligence clarity** (roadmap vs reality, launch doc drift) and **release confidence** on billing changes without integration tests. Likelihood of webhook resolution failure is **low** if checkout always sets customer metadata and `stripeCustomerId`; impact if it occurs is **high** until manually corrected.

## Recommendations (prioritized)

1. **Introduce and maintain a lightweight business metrics snapshot** (even a quarterly markdown table in `docs/internal/` or a secured sheet link) with MRR, subscriber count, churn, and PostHog funnel headline numbers—so valuation and business audits can cite numbers without ad hoc export work.
2. **Reconcile `docs/launch/launch-plan.md` §2.2** with the current paid-ads and telemetry posture (or add an explicit “as of” note when strategy shifts) so operators and reviewers see one story.
3. **Add minimal integration or contract tests** for billing: e.g. mocked Stripe webhook payload → `planTierFromPriceId` + DB update path; or documented manual smoke-only with stronger CI guardrails on `stripe-config` and checkout validation only—choose based on CI secret policy already noted in `docs/tasks.md`.

## Task candidates (optional)

- [ ] Create `docs/internal/business-metrics-snapshot.md` (or equivalent) with MRR/subscribers/churn placeholders and refresh cadence for valuation passes.
- [ ] Update `docs/launch/launch-plan.md` §2.2 to reflect PostHog + paid-ads status as of 2026-03-30, or archive superseded “keep ads off” language with date.
- [ ] Add Vitest coverage for `planTierFromPriceId` + webhook handler branches using Stripe fixture objects (no live keys), or extend `docs/internal/billing-matrix.md` release checklist with explicit webhook failure monitoring steps.

## Re-test checklist

- [ ] After any pricing or Stripe price ID change: run billing-matrix release checklist and smoke checkout in test/live as appropriate.
- [ ] After metrics snapshot process exists: confirm numbers match Stripe/PostHog for one reconciliation period.
- [ ] `npm run check` and `npm run test` from `app/` when billing code changes (per existing QA process).

## Next trigger and cadence

- **Trigger:** Pricing/packaging changes, material GTM shift, or quarterly planning.
- **Recommended next run:** Next quarter (2026-06) or earlier if Stripe products/prices or plan limits change.
