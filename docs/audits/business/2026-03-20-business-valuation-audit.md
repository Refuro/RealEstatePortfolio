# Business & Valuation Audit — 2026-03-20

## Executive summary

- **Readiness:** Veld Portfolio is a **credible niche SaaS** (small real estate investors, 1–20 properties) with a **documented product story**, **canonical ownership/metrics policies**, and **production-shaped billing** (Stripe checkout, webhooks, portal) plus **plan limits** centralized in code. **Automated tests** (Vitest) now cover core metrics, amortization, validations, and sampled API routes—materially better technical due diligence than a greenfield build.
- **Moat & posture:** Differentiation is **workflow + clarity** (portfolio analytics, deal tools, RentCast-assisted estimates), not a network effect or data moat. **Switching costs** are moderate (Clerk, Stripe, property data entry). **Strategic risk:** roadmap still flags **mortgage balance drift** (equity/LTV accuracy over time) as a high-priority gap until amortization-based effective balance ships.
- **Valuation framing:** With **no disclosed traction** in-repo, value rests on **replacement cost, code quality, and GTM optionality**. Scenarios below separate **assumptions** from **numbers** so you can re-anchored with real MRR/churn.
- **Highest-ROI uplift:** Prove **paid conversion** (even a small cohort), keep **pricing/checkout/display** aligned, and close the **balance-accuracy** narrative before pitching lenders or sophisticated investors who will stress-test equity.

## Severity-ranked findings

### Critical

- *(none — no evidence this pass of blocking legal, billing, or data-loss defects in reviewed docs and surfaces.)*

### High

- **Equity/LTV credibility over time (product trust → valuation)** — Roadmap marks **mortgage balance advancement** as high priority: without projected/statement-aware effective balance, **equity, LTV, and debt rollups drift** as users pay principal. That weakens the “portfolio truth” story for power users and diligence. — `docs/reference/roadmap.md` (§ Mortgage balance advancement, Phase 1 scope and acceptance criteria)

- **Revenue model still evidence-light in-repo** — Stripe integration and tiering are implemented (`lib/plans.ts`, `lib/stripe-config.ts`, billing API), but **this audit has no customer/MRR export**—valuation remains **unvalidated** until paying users and retention are observable.

### Medium

- **Moat is execution- and niche-based, not structural** — README and product scope describe a **crowded category** (spreadsheets, generic finance apps, vertical competitors). Defensibility is **speed to value, UX, and integrations** (e.g. RentCast per roadmap/completed items), not lock-in beyond data gravity. — `README.md`, `docs/reference/roadmap.md` (§ Long-term Vision, Deferred)

- **Display price env vs Stripe price IDs must stay paired** — Public amounts come from `PRICING_DISPLAY` (`lib/pricing-display.ts`, `NEXT_PUBLIC_PRICE_*`); checkout uses `STRIPE_PRICE_ID_*` in `lib/stripe-config.ts`. Drift between env display and live Stripe products **undermines trust** at purchase time. — `app/lib/pricing-display.ts`, `app/lib/stripe-config.ts`

### Low

- **Go-to-market proof points are not established in docs reviewed** — Strong **engineering and process** maturity (`docs/audits/README.md` cadence, policies) does not substitute for **distribution** (case studies, SEO, channel tests). Prior audit lane notes (code, 2026-03-20) flagged **marketing image/perf polish**—secondary to revenue but relevant to **conversion and perceived quality**. — `docs/audits/code/2026-03-20-code-audit.md` (marketing `<img>` / bundle notes)

- **Operator/entity readiness is documented but not a product artifact** — `docs/business-launch-checklist.md` correctly frames **ND LLC vs sole proprietor** and Stripe migration considerations; acquirers care that **legal/billing entity** matches customer-facing terms. Confirm production alignment outside this codebase review.

## Evidence reviewed

- **Process:** `docs/process/business-valuation-audit-process.md`, `docs/process/audit-report-template.md`
- **Product & strategy:** `README.md`, `docs/reference/roadmap.md`
- **Business ops:** `docs/business-launch-checklist.md`
- **Policies:** `docs/policies/ownership-metrics.md` (canonical formulas; diligence alignment)
- **Monetization & limits:** `app/lib/plans.ts`, `app/lib/pricing-display.ts`, `app/lib/stripe-config.ts`, `app/app/pricing/page.tsx`
- **Prior lane context:** `docs/audits/business/2026-03-19-business-valuation-audit.md`, `docs/audits/code/2026-03-20-code-audit.md`, `docs/audits/README.md`
- **Technical quality signal:** `app/package.json` (Vitest scripts), `app/**/*.test.ts` / `route.test.ts` (multiple modules—metrics, amortization, API samples)

**Limits:** This pass did **not** query production analytics, Stripe Dashboard, or Clerk user counts; **valuation numbers are illustrative** and should be replaced with actual MRR, churn, and CAC when available.

## Risk & impact assessment

| Area | Likelihood | Business impact if ignored |
|------|------------|----------------------------|
| Mortgage balance drift | High over multi-year use | Users lose trust in equity/LTV; harder B2B or lender-facing pitch |
| Pricing display vs Stripe mismatch | Low if process discipline | Checkout surprise, chargebacks, support load, brand damage |
| Thin moat + no traction | — | Buyer pays for **cost to replicate** or small **revenue multiple**, not strategic premium |
| Strong docs + tests | — | Reduces buyer **discount for technical risk** vs. untested monolith |

## Valuation posture (realistic framing)

**Shared assumptions (explicit):**

- **Asset type:** Small SaaS codebase + docs; no balance sheet or IP litigation reviewed here.
- **“Code-only”** means no material recurring revenue attributable to the product in evidence reviewed.
- **“With traction”** assumes verified MRR, low churn, and clean Stripe history—multiples collapse if churn is high or revenue is one-off.

**Indicative ranges (wide bands; not a fairness opinion):**

| Scenario | What’s priced in | Indicative range (USD) | Confidence |
|----------|------------------|---------------------------|------------|
| **A — Codebase / no users** | Replacement cost, time-to-clone, integration depth, test coverage, documentation | **~$10K–$22K** | Low–medium (buyer-dependent) |
| **B — Early revenue** | 10–50 paying subs, basic retention visible | **~$35K–$85K** | Low (needs actuals) |
| **C — PMF signal** | ~100+ paying, **~$2K+ MRR**, improving metrics | **~$100K–$300K+** | Low until verified |

**Why A moved up slightly vs. a 2025-style “no tests” baseline:** Vitest coverage and golden metric tests reduce **technical DD haircuts**; the uplift is **modest** without revenue.

**Buyer archetypes:** Indie acquirer (lower multiple, faster close), strategic in proptech (higher if product fits distribution), asset sale (lowest).

## Recommendations (prioritized)

1. **Ship or clearly message mortgage balance accuracy** — Either prioritize roadmap Phase 1 effective balance **or** surface conservative disclaimers where equity/LTV rely on stale `currentBalance`—so investor conversations stay honest.
2. **Establish one internal “commercial truth” table** — Tier → property/deal/RentCast limits (`lib/plans.ts`) → **Stripe price IDs** → **display env** → marketing copy—reviewed when anything changes.
3. **Convert documentation strength into market proof** — Case study, waitlist metrics, or paid pilot—even small—shifts negotiation from **cost-based** to **revenue-based** pricing.
4. **Before fundraising or acquisition talks:** Run a **numbers reconciliation** (export vs dashboard vs `docs/policies/ownership-metrics.md`) so diligence doesn’t find a narrative break first.

## Task candidates (optional)

*Included only where they reduce business/valuation risk; PM may fold into `docs/tasks.md` or ops.*

- [ ] **Commercial matrix (internal):** Single table: Free / Investor / Pro → limits from `lib/plans.ts` → `STRIPE_PRICE_ID_*` → `NEXT_PUBLIC_PRICE_*` defaults → owner of updates.
- [ ] **Investor-demo checklist:** Reconcile dashboard, property detail, and CSV export for one golden property (ownership mode, debt mode, key formulas per `docs/policies/ownership-metrics.md`).

## Re-test checklist

- [ ] After any pricing or Stripe product change: public `/pricing` amounts match checkout and Customer Portal.
- [ ] Free tier: property limit block produces consistent UX and link to `/plans` (per plan architecture).
- [ ] When mortgage balance work ships: spot-check equity/LTV vs manual spreadsheet for one property.
- [ ] `npm run check` in `app/` when code changes follow from prioritized work (not required for this audit-only pass).

## Next trigger and cadence

- **Trigger:** Pricing/packaging change, new tier, strategic/investor event, or material roadmap shift affecting monetization or metrics trust.
- **Recommended next run:** **Quarterly** (per `docs/audits/README.md`), or **monthly** if actively fundraising or running paid acquisition.
