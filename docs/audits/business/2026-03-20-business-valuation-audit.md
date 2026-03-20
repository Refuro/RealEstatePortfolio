# Business & Valuation Audit — 2026-03-20

## Executive summary

- **Overall:** **Plans/tiers** centralized in `lib/plans.ts` (with tests in API routes for limits). **Billing** flows through Stripe (checkout, webhook, portal) — align env and webhook URL with deployment. **Pricing** pages expose public-facing positioning; investor metrics in-app support **valuation narrative** (cap rate, cash flow, equity).
- **Top risks:** **Plan limit messaging** must stay consistent across API 403, UI, and upgrade CTAs; **export** data supports diligence — keep numerics aligned with policy docs.
- **Recommendation:** Before fundraising or B2B pitch, run a **numbers reconciliation** checklist (export vs dashboard vs policy tables).

## Severity-ranked findings

### Critical

- *(none)*

### High

- *(none — plan-limit tests exist per test infrastructure review)*

### Medium

- **Pricing copy vs in-app “Plans”** — Ensure marketing `/pricing` and in-app `/plans` stay synchronized when tiers/prices change. — `app/app/pricing/page.tsx`, `app/(app)/plans/page.tsx`

### Low

- **Changelog / release notes** — Keep `docs/` or product changelog updated when pricing or limits change for support readiness.

## Evidence reviewed

- `lib/plans.ts` (referenced), `app/api/billing/*`, property/deals route tests for `PLAN_LIMIT_REACHED`
- `docs/policies/ownership-metrics.md` (reference)
- Public pricing + plans pages (surface review)

## Risk & impact assessment

Business risk is mostly **GTM and messaging consistency**, not code defects—still worth periodic audit before launches.

## Recommendations (prioritized)

1. Single source for **display prices** (avoid drift between marketing and checkout).
2. PM review of **403** user-facing strings when limits change.

## Task candidates (optional)

- [ ] Add a short **“Plans matrix”** doc: tier → limits → Stripe price IDs (internal).
- [ ] Verify **annual vs monthly** display strings on pricing page match Stripe products.

## Re-test checklist

- [ ] Free tier: add property until blocked — message + link to `/plans`.
- [ ] Upgrade path: checkout success → subscription reflects in app (webhook).

## Next trigger and cadence

- **Trigger:** Pricing/packaging change, new tier, or investor demo.
- **Next window:** Quarterly.
