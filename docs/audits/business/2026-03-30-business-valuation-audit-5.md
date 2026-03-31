# Business & Valuation Audit — 2026-03-30 (Run 5)

## Executive summary

- **Monetization and billing architecture remain coherent:** three tiers with documented limits (`app/lib/plans.ts`), Stripe price IDs and display pricing defaults (`app/lib/stripe-config.ts`, `app/lib/pricing-display.ts`), internal billing matrix (`docs/internal/billing-matrix.md`), and webhook-driven tier sync with server-side PostHog events (`app/app/api/billing/webhook/route.ts`).
- **Product analytics are commercially usable:** stable event names in `app/lib/analytics-events.ts`, client capture (`app/lib/analytics-client.ts`, Google Ads conversion hooks when labels are set), dedup rules in `app/lib/analytics-dedup.ts`, and operator-facing docs in `docs/launch/analytics.md` and `docs/launch/posthog-views-setup.md`.
- **Tests and coverage remain strong on core math and validations:** Vitest reports **138 passing tests** (22 files, including `app/components/mobile-tool-shell.test.tsx`) and **~80.8% overall statement coverage** (2026-03-30); checkout **schema** remains fully covered (`app/lib/validations/checkout.test.ts`). Stripe **billing API routes** still lack dedicated route tests—paid-path regression risk remains.
- **Launch readiness documentation improved:** `docs/launch/launch-plan.md` §2.2 now explicitly reconciles PostHog/baseline status with paid acquisition **as of 2026-03-30**, with links to telemetry QA and paid-ads runbooks—resolving the prior run’s “ads vs baseline” doc tension.
- **Standing business metrics snapshot in-repo is still missing** (MRR, paying subscribers, churn)—valuation work stays assumption-heavy without owner exports. Dollar sections below remain **illustrative** only.

---

## Valuation scenarios ($)

**Disclaimer:** All figures below are **indicative / illustrative**, not appraisals or investment advice. No production Stripe, MRR, or subscriber data was accessed; ranges use repo-stated defaults and common SMB SaaS heuristics.

### Codebase / software asset value with zero paying users

**Method:** **Replacement cost** (order-of-magnitude build cost implied by scope, complexity, and integrations—not fair market value of a sale).

**Evidence for scope:** ~**28,450** lines of TypeScript/TSX under `app/` (excluding `node_modules`), measured 2026-03-30; stack includes Next.js app routes, Prisma, Clerk, Stripe, RentCast, Sentry, PostHog, Vitest coverage ~81% statements.

**Assumptions (conservative):**

- Rebuilding to similar depth (auth, billing webhooks, portfolio metrics, RentCast quotas, CSV import, amortization, benchmarks) implies **roughly 6–14 engineer-months** of focused effort at a blended **$75–$125/hr** fully loaded cost (or agency-equivalent), before GTM and ongoing ops.
- Discount for “asset only” (no brand, no customers, no recurring revenue): buyer would not pay full replacement cost.

**Indicative USD range (software / IP only, zero paying users):** **$45,000–$120,000**

- Lower bound: lean rebuild estimate with reuse of off-the-shelf patterns.
- Upper bound: replacement-style cost for tested, integrated vertical SaaS of this footprint.

*Comparable framing (non-binding):* pre-revenue SaaS asset transactions and acquihires vary widely; this range is **not** a prediction of an actual sale price.

---

### Market comparables (code / small SaaS — not replacement cost)

**Purpose:** Cross-check the replacement-cost band using **observed M&A and marketplace behavior** for small SaaS, not engineering hours.

**Sources (public, 2024–2026):**

- **Acquire.com — Biannual Acquisition Multiples Report (Jan 2026):** Confirmed SaaS acquisitions on the platform show a **median profit multiple of ~3.9×** annual profit (2024 vs 2025 stable); most deals emphasize **profitability**, not codebase size. The report notes buyers are selective and that **unprofitable** listings often take longer and attract fewer offers. Public **revenue** multiples for large SaaS (macro context in the same report) **do not** apply to a zero-revenue asset. See: [Acquire.com Biannual Acquisition Multiples Report — Jan 2026](https://blog.acquire.com/acquire-com-biannual-acquisition-multiples-report-jan-2026/).
- **Micro-SaaS / small ARR band studies (e.g. industry blog summaries of marketplace data):** For **profitable** micro-SaaS, **profit multiples** often cluster in the **~2.8×–4.8×** range depending on ARR band (illustrative; each deal varies). These still require **profit**, so they value **traction**, not LOC.
- **Pre-revenue or “asset-only” listings:** Brokered marketplaces (Acquire, Flippa, etc.) publish **asking** prices for small web/SaaS products from roughly **mid–five figures into low six figures USD** when the product is transferable and documented; **closed** prices are often **lower** than ask, and **buyers heavily discount** absent revenue, recurring users, or clear strategic fit (e.g. niche audience, IP). There is **no** single “multiple of LOC” — comparables are **sparse and noisy**.

**Bridging to this codebase (zero paying users, illustrative):**

| Approach | Indicative implication for *this* repo |
|----------|----------------------------------------|
| **Profit-based market (Acquire median ~3.9× profit)** | **Not applicable** at $0 profit / $0 revenue — buyers would not anchor on profit multiples until there is P&amp;L. |
| **Revenue-based SMB SaaS (2–6× ARR)** | Only applies once there is **ARR**; see table in the next section. |
| **Observed asset-only / small SaaS listing ranges** | Many **pre-revenue** or minimal-traction product sales **overlap** the **$45k–$120k** replacement band but can **trade outside** it: lower if buyer views code as commodity; higher if stack, niche, or speed-to-market is strategic. |
| **Comparable “ceiling” from market** | Without customers, it is rare for private **code-only** sales to approach **revenue-multiple** math used for operating SaaS; **market evidence** for sub-$10M EV deals still centers on **profit** once revenue exists. |

**Indicative market-style range (code + productization, zero revenue) — USD:** **~$25,000–$150,000**

- **Lower bound:** Consistent with **fire-sale / buyer-favorable** outcomes for unprofitable, no-ARR products on marketplaces (buyer absorbs migration and risk).
- **Mid band:** Overlaps **replacement cost** **$45k–$120k** — often where **seller expectation** and **buyer “build vs buy”** meet for a documented Next.js + billing + domain app.
- **Upper bound:** Requires **strategic** buyer (saves more than purchase price in time-to-market) or **adjacent assets** (audience, brand, domain) not included in “code only.”

**Disclaimer:** This is **not** a formal 409A or broker opinion; **actual** comps require comparable transactions in the same niche with disclosed terms.

---

### Scaled with users (published display prices)

**Published default prices** (from `app/lib/pricing-display.ts` when env overrides are unset):

| Tier | Monthly | Yearly (stated) |
|------|---------|-----------------|
| Investor | $15/mo | $150/yr |
| Pro | $29/mo | $290/yr |

**Paid tier mix (assumption):** **50% Investor / 50% Pro** among paying subscribers.

**Billing cycle mix (assumption):** **70% monthly / 30% annual** (annual treated as monthly-equivalent: yearly price ÷ 12).

**Effective monthly ARPU by tier (before cross-tier blend):**

- Investor: `0.7 × $15 + 0.3 × ($150/12)` = **$14.25/mo**
- Pro: `0.7 × $29 + 0.3 × ($290/12)` = **~$27.55/mo**

**Blended ARPU (50/50 Investor/Pro):** **~$20.90/mo** per paying subscriber.

**Formulas (illustrative):**

- `MRR ≈ paying_subscribers × blended_ARPU`
- `ARR ≈ MRR × 12` = `paying_subscribers × $20.90 × 12` ≈ `paying_subscribers × $250.80`
- `valuation_range ≈ ARR_multiple × ARR`, with **ARR_multiple ∈ [2, 6]×** (stated band for **pre-profit SMB SaaS**; actual comps depend on growth, churn, market, and capital environment).

**Table — implied ARR and valuation range (USD):**

| Paying subscribers | Implied ARR (USD) | Implied valuation @ **2×** ARR | Implied valuation @ **6×** ARR |
|-------------------:|------------------:|-----------------------------:|------------------------------:|
| 0 | $0 | *See codebase range above; revenue-based multiple not applicable* | *same* |
| 100 | ~$25,100 | ~$50,200 | ~$150,600 |
| 1,000 | ~$251,000 | ~$502,000 | ~$1,506,000 |
| 10,000 | ~$2,508,000 | ~$5,016,000 | ~$15,048,000 |

**Notes:**

- **Stripe fees, refunds, annual discounting, and actual price IDs** may differ from display defaults; reconcile with live Stripe and env before any real planning.
- At **zero paying** users, **enterprise value** is dominated by **codebase/IP** (above) plus any brand/domain unless traction is priced in.
- Multiples **2–6×** widen intentionally for **pre-profit** posture; profitable SMB SaaS can trade outside this band.

---

## Severity-ranked findings

### Critical

- None.

### High

- **Valuation and operating review still lack a standing metrics snapshot** — MRR, active paying subscribers, churn, and cohort signals are not packaged in-repo for quarterly business/valuation passes; reviews stay manual and heavier than necessary. — *Evidence:* prior runs; no `docs/internal/business-metrics-snapshot.md` or equivalent with live numbers.

- **Stripe webhook user-resolution gap is a revenue-integrity edge case** — If `appUserId` cannot be resolved from subscription metadata or `stripeCustomerId`, sync returns early and tier is not updated; Sentry warning is emitted (`app/app/api/billing/webhook/route.ts` lines 122–142). — *Evidence:* `app/app/api/billing/webhook/route.ts`.

### Medium

- **Stripe webhook → PostHog duplicate rows on retries** — DB sync is idempotent; server-side `captureServerEvent` does not dedupe by Stripe `event.id`, so duplicate deliveries can inflate funnel metrics. Documented for operators in `docs/internal/stripe-webhook-posthog-idempotency.md`. — *Evidence:* same doc; comment block in `app/app/api/billing/webhook/route.ts` lines 13–15.

- **Billing API paths lack automated integration tests** — Checkout session creation, portal, sync, and webhook handling remain production-critical but not covered by Vitest route tests under `app/app/api/billing/`. — *Evidence:* no `*.test.ts` under `app/app/api/billing/`; `stripe-config.test.ts` covers price mapping, not HTTP handlers.

- **Roadmap still lists “Automated testing” as a prioritized backlog row** — `docs/reference/roadmap.md` shows Priority 15 while substantial Vitest coverage exists; can confuse skimming acquirers vs `docs/tasks.md`. — *Evidence:* `docs/reference/roadmap.md` (lines 122–127).

### Low

- **Tier attribution vs admin override** — Some analytics paths may read `subscriptionTier` from the DB without `getEffectiveTier`; when `subscriptionTierOverride` is set, reported tier can diverge from UI limits — *Evidence:* `docs/internal/effective-tier-analytics.md`, `getEffectiveTier` in `app/lib/plans.ts`.

- **Changelog date granularity** — Mix of specific days and month buckets in `app/lib/changelog-data.ts` is allowed by process but slightly uneven for scanning. — *Evidence:* `app/lib/changelog-data.ts`.

## Evidence reviewed

- **Process / template:** `docs/process/business-valuation-audit-process.md`, `docs/process/audit-report-template.md`
- **Product & strategy:** `README.md`, `docs/reference/roadmap.md`, `docs/business-launch-checklist.md`, `docs/internal/billing-matrix.md`, `docs/internal/stripe-webhook-posthog-idempotency.md`, `docs/internal/effective-tier-analytics.md` (referenced)
- **Pricing & billing:** `app/lib/plans.ts`, `app/lib/stripe-config.ts`, `app/lib/pricing-display.ts`, `app/.env.example`, `app/app/api/billing/*`
- **Analytics:** `app/lib/analytics-events.ts`, `app/lib/analytics-client.ts`, `app/lib/analytics-dedup.ts`, `app/lib/posthog-server.ts`, `docs/launch/analytics.md`, `docs/launch/posthog-views-setup.md`
- **Launch:** `docs/launch/launch-plan.md`, `docs/launch/pre-live-telemetry-qa-2026-03-30.md`, `docs/launch/paid-ads-monitoring-runbook.md`, `docs/audits/README.md`
- **Tests:** `npm run test:coverage` (Vitest v4.1.0, 2026-03-30): **22** files, **138** tests passed; aggregate **80.75%** statements, **82.42%** lines (v8)
- **Prior audit:** `docs/audits/business/2026-03-30-business-valuation-audit-4.md`

**Limits:** No access to production Stripe Dashboard, PostHog projects, or live MRR; dollar sections are **illustrative** and must be reconciled with real data for decisions.

## Risk & impact assessment

Unresolved **High** items affect **strategic planning efficiency** (metrics snapshot) and **occasional billing sync correctness** (webhook edge cases). **Medium** items affect **analytics trust** (duplicate PostHog rows under Stripe retries), **due-diligence clarity** (roadmap vs reality), and **release confidence** on billing changes without integration tests.

## Recommendations (prioritized)

1. **Introduce and maintain a lightweight business metrics snapshot** (quarterly markdown table in `docs/internal/` or secured sheet) with MRR, subscriber count, churn, and PostHog funnel headline numbers.
2. **Add minimal integration or contract tests** for billing (mocked webhook payload → `planTierFromPriceId` + DB update path), or extend monitoring runbooks for webhook/Sentry patterns already emitted on user-resolution failure.
3. **Reconcile `docs/reference/roadmap.md` “Automated testing”** with current Vitest posture (mark done, narrow scope to remaining gaps, or cross-link `docs/tasks.md`) so acquirer skims match engineering reality.

## Task candidates (optional)

- [ ] Create `docs/internal/business-metrics-snapshot.md` with MRR/subscribers/churn placeholders and refresh cadence.
- [ ] Update `docs/reference/roadmap.md` Priority 15 row to reflect existing test coverage and remaining targets (e.g. billing route tests only).
- [ ] Optional: persist processed Stripe `event.id` for PostHog-emitting branches if duplicate server events become material—see `docs/internal/stripe-webhook-posthog-idempotency.md`.

## Re-test checklist

- [ ] After any pricing or Stripe price ID change: run billing-matrix release checklist and smoke checkout.
- [ ] After metrics snapshot exists: reconcile one period against Stripe/PostHog.
- [ ] `npm run check` and `npm run test` from `app/` when billing code changes.

## Next trigger and cadence

- **Trigger:** Pricing/packaging changes, material GTM shift, or quarterly planning.
- **Recommended next run:** Next quarter (2026-06) or earlier if Stripe products/prices or plan limits change.
