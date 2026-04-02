# Business & Valuation Audit — 2026-04-03

## Executive summary

- **Monetization architecture:** Plan ladder (Free / Investor / Pro), property and deal caps, and RentCast hourly pools are **centralized in code** (`app/lib/plans.ts`) and **cross-walked to Stripe and display pricing** in `docs/internal/billing-matrix.md`, with implementation in `app/lib/stripe-config.ts` and `app/lib/pricing-display.ts`. This materially reduces the “commercial drift” risk called out in earlier audits.
- **Go-to-market and positioning:** `docs/launch/launch-plan.md` defines a **phased, capacity-aware rollout**, clear ICP (small landlords, analyzers), and **rule-safe community distribution**. Competitive SEO is **operationally documented** (`docs/launch/seo-growth-plan.md`) with **shipped** `/alternatives` and `/vs` surfaces backed by `app/lib/marketing/competitor-data.ts`; copy **acknowledges scope limits** (no bank sync, estimates not appraisals), which supports **trust** under diligence.
- **Analytics posture:** `docs/launch/analytics.md` describes **PostHog** wiring, **consent gating**, **deduplication**, and **plan-intent** semantics—appropriate for funnel measurement and paid acquisition readouts referenced in the launch plan.
- **Valuation lens:** The repository still contains **no customer, MRR, churn, or cohort exports**—strategic value remains **heavily weighted toward replacement cost, documentation, and GTM optionality** until traction is measured outside the repo. **Owner verification** of production launch checklist items (env, health, support, demo) remains open per `docs/launch/launch-plan.md` §9.

## Severity-ranked findings

### Critical

- *(none — no evidence in reviewed docs of blocking legal, billing-architecture, or data-loss defects.)*

### High

- **Revenue and retention are not evidenced in-repo** — Stripe integration, webhooks, and tier sync are documented and implemented in application libraries, but **this audit has no access to Dashboard MRR, churn, or user counts**. Any **valuation multiple** beyond asset-sale or replacement-cost framing stays **speculative** until those metrics exist and are reconciled. — `app/lib/stripe-config.ts`, `docs/internal/billing-matrix.md`; *gap: no financial export reviewed*

- **Equity / LTV trust over long horizons** — Prior business audits flagged **mortgage balance advancement** as a credibility issue for “portfolio truth.” Roadmap still treats deeper balance accuracy and related narrative as strategically material for sophisticated users. — `docs/reference/roadmap.md` (strategic backlog, mortgage-related themes); cross-ref. `docs/audits/business/2026-03-20-business-valuation-audit.md`

### Medium

- **Display price vs live Stripe amounts remain a process risk** — Public amounts use `PRICING_DISPLAY` / `NEXT_PUBLIC_PRICE_*` defaults ($15/$150 Investor; $29/$290 Pro in `app/lib/pricing-display.ts`); checkout resolves **`STRIPE_PRICE_ID_*`** in `app/lib/stripe-config.ts`. Internal **`docs/internal/billing-matrix.md`** and its release checklist **mitigate** drift but do not **eliminate** operator error when prices change in Stripe without updating envs. — `app/lib/pricing-display.ts`, `app/lib/stripe-config.ts`, `docs/internal/billing-matrix.md` § Release verification checklist

- **RentCast dependency and unit economics** — Hourly caps scale by tier (`app/lib/plans.ts`, `docs/reference/rentcast-quota.md` per billing matrix). **API cost and quota errors** are an ongoing ops and positioning constraint (“estimates,” not guaranteed valuations); this affects **gross margin story** and **support load** at scale. — `app/lib/plans.ts`, `docs/internal/billing-matrix.md`, `docs/launch/launch-plan.md` §2.2, §11

- **Production launch checklist partially unchecked** — Analytics events and external uptime are marked complete; **env verification, health, support path, golden-path demo**, and **pricing page ↔ Stripe alignment spot-check** still require **owner confirmation in production** (noted explicitly in §9). — `docs/launch/launch-plan.md` §9, §2.2 documentation pass note

- **SEO growth execution vs proposal** — `docs/launch/seo-growth-plan.md` phases beyond shipped competitor/alternative pages (e.g. Search Console baseline, programmatic expansion) are **proposal** status; **business value** from competitive positioning depends on **measurement and iteration**, not only shipped routes. — `docs/launch/seo-growth-plan.md` §Phase 0–1, `docs/launch/launch-plan.md` §5–6

### Low

- **Changelog and product velocity signaling** — `app/lib/changelog-data.ts` shows **regular 2026-03** through **2026-03-31** entries; process is documented in `docs/launch/changelog-process.md` and linked from `docs/launch/analytics.md`. This supports **operational maturity** and user trust but is **not** a substitute for revenue proof.

- **Legal entity vs marketing** — `docs/business-launch-checklist.md` states Terms/Privacy describe an **individual** DBA-style operator and outlines **LLC migration** steps. Acquirers and partners will expect **entity, Stripe account, and legal copy** to match; confirm outside static doc review. — `docs/business-launch-checklist.md` § Option B, § Full Launch Checklist

- **Instrumentation drift** — Launch plan warns that **event name changes** require updating `docs/launch/analytics.md` and dashboards—relevant if refactors touch `app/lib/analytics-events.ts` or related clients. — `docs/launch/launch-plan.md` §11

## Evidence reviewed

- **Process:** `docs/process/business-valuation-audit-process.md`, `docs/process/audit-report-template.md`
- **Plans and billing alignment:** `app/lib/plans.ts`, `app/lib/pricing-display.ts`, `app/lib/stripe-config.ts`, `docs/internal/billing-matrix.md`
- **Changelog:** `app/lib/changelog-data.ts`, `docs/launch/changelog-process.md`
- **Launch and GTM:** `docs/launch/launch-plan.md`, `docs/launch/seo-growth-plan.md` (intro + Phase 0–1)
- **Analytics:** `docs/launch/analytics.md`
- **Competitive / marketing copy (positioning):** `app/lib/marketing/competitor-data.ts` (Stessa example and structure), `docs/launch/seo-growth-plan.md` §Phase 1 implementation note
- **Strategy cross-check:** `docs/reference/roadmap.md` (§1a strategic backlog), `README.md`, `docs/business-launch-checklist.md` (entity and Stripe)
- **Prior lane context:** `docs/audits/business/2026-03-20-business-valuation-audit.md`, `docs/audits/business/2026-04-02-business-valuation-audit.md`

**Assumptions / limits:** No production analytics, Stripe Dashboard, or Clerk exports were queried. **No application source was modified** for this pass. Valuation **numbers** below are **illustrative bands** from the 2026-03-20 audit, unchanged until real metrics replace them.

## Risk & impact assessment

| Theme | Likelihood | Business impact if ignored |
|-------|------------|----------------------------|
| No traction data in diligence | — | Negotiations anchor on **cost to replicate**, not strategic premium |
| Price display vs Stripe mismatch | Low with checklist discipline | Checkout surprise, support tickets, chargeback/reputation risk |
| RentCast limits / outages | Medium in growth | Quota friction, margin pressure, messaging tension (“estimates”) |
| Equity/LTV narrative vs roadmap | Medium for power users | Weaker story for lenders, coaches, or multi-year holders |
| Launch checklist gaps in prod | Operator-dependent | Preventable incidents (billing, health, support) during scale |

## Valuation posture (framing)

**Indicative ranges** below repeat the **2026-03-20** audit’s explicitly wide bands; **replace with actual MRR, churn, and CAC** when available.

| Scenario | What is priced in | Indicative range (USD) | Confidence |
|----------|-------------------|-------------------------|------------|
| **Codebase / no verified traction** | Replacement cost, tests, docs, integrations | **~$10K–$22K** | Low–medium |
| **Early revenue** | Dozens of paying subs, basic retention | **~$35K–$85K** | Low |
| **PMF signal** | ~100+ paying, **~$2K+ MRR**, improving funnel metrics | **~$100K–$300K+** | Low until verified |

**Buyer archetypes:** Indie/asset acquirer (faster, lower multiple), strategic proptech (fit + distribution), pure asset sale (lowest).

## Recommendations (prioritized)

1. **Close the production launch checklist** — Complete owner-verified items in `docs/launch/launch-plan.md` §9 (env, `/api/health`, support path, pricing ↔ Stripe spot-check, golden-path demo) so GTM spend and diligence do not hit preventable gaps.
2. **Keep the billing matrix as the change gate** — On any Stripe price or tier limit change, run **`docs/internal/billing-matrix.md`** release verification and update marketing surfaces in the same release.
3. **Instrument competitive landing performance** — Align PostHog dashboards with **`landingVariant`** / UTM expectations in `docs/launch/analytics.md` and `docs/launch/seo-growth-plan.md` so SEO and alternative-page investment has **conversion feedback** (extends `docs/audits/business/2026-04-02-business-valuation-audit.md`).
4. **Maintain honest differentiation** — Competitor copy in `app/lib/marketing/competitor-data.ts` already sets **fit and boundaries**; revalidate feature rows periodically as incumbents ship (see re-test below).

## Task candidates (optional)

- [ ] Production: run **`docs/internal/billing-matrix.md`** smoke checklist after any price change.
- [ ] PostHog: saved insight for **signup or activation by `landingVariant`** including alternative-page variants (see `docs/audits/business/2026-04-02-business-valuation-audit.md` task list).
- [ ] Quarterly: compare **competitor matrix** claims to competitor changelogs or marketing pages (`app/lib/marketing/competitor-data.ts`).

## Re-test checklist

- [ ] After pricing or Stripe product change: `/pricing` and `/plans` amounts match checkout and Customer Portal (`docs/internal/billing-matrix.md`).
- [ ] Verify **critical/high** findings above on next fundraising, acquisition, or major GTM push.
- [ ] `npm run check` in `app/` when follow-up code or copy changes land (not required for this audit-only pass).

## Next trigger and cadence

- **Trigger:** Pricing/packaging change, new tier, material roadmap shift affecting monetization or metrics trust, or active paid/community scale-up.
- **Recommended next run:** **Quarterly** (per `docs/audits/README.md` if listed), or **monthly** during fundraising or heavy acquisition spend.
