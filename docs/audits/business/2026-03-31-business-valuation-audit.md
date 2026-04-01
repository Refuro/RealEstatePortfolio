# Business & Valuation Audit — 2026-03-31

## Executive summary

- **Product readiness:** Veld Portfolio presents as a **credible niche SaaS** for small real estate investors (1–20 properties) with **centralized plan limits** (`app/lib/plans.ts`), **Stripe checkout / webhooks / portal** patterns, **canonical ownership and analytics policies** (`docs/policies/ownership-metrics.md`, `docs/policies/analytics-math-policy.md`), and **shipped differentiators** aligned with the “portfolio intelligence” lane: public + in-app **calculators**, **deal vs portfolio context** on saved deals, **print-friendly portfolio summary**, and **mortgage effective balance / balance-as-of** (roadmap Phase 1 — done per `docs/reference/roadmap.md`).
- **Valuation posture:** With **no MRR, churn, or user counts in-repo**, acquirer/investor narrative still rests on **replacement cost, documentation depth, test coverage, and GTM optionality**. **PostHog** and changelog entries signal product iteration and funnel *instrumentation*, not proven PMF.
- **Strategic gaps:** Differentiation remains **execution- and niche-based** (`docs/internal/differentiator-value-add-analysis.md`); highest-value roadmap whitespace (prioritized insights, scenario comparison, richer sharing) is **partially** addressed by recent ships but not complete. **Conversion and trust** risks include **pricing display vs Stripe price ID discipline**, **mobile discoverability** of export and some polish items noted in sibling audits.
- **Recommendation:** Treat the product as **technically and narratively stronger than a greenfield** build, but **economically unproven** until commercial metrics exist. Prioritize **one source of commercial truth**, **paid conversion evidence**, and **closing UX gaps that block demos and mobile upgrade paths**.

## Severity-ranked findings

### Critical

- *(None — no in-repo evidence of blocking legal, billing, or catastrophic data-loss defects on this pass.)*

### High

- **Revenue and retention are not evidenced in the codebase** — Stripe integration and tiering are implemented (`app/lib/stripe-config.ts`, billing APIs), but **no export of paying subscribers, MRR, churn, or LTV** appears in reviewed artifacts. **Valuation cannot be anchored on revenue multiples** without external verification. — `app/lib/stripe-config.ts`, `app/.env.example`; limits: no Dashboard analytics export reviewed.

- **Trust in core math under bad inputs (diligence haircuts)** — The **2026-03-31 math audit** documents **negative amortization** when payment is below interest (principal can drift unbounded in schedule iteration) if nonsensical values are stored. Sophisticated buyers stress-testing mortgage paths may treat this as **credibility risk** alongside otherwise strong policy alignment. — `docs/audits/math/2026-03-31-math-logic-audit.md` (amortization module notes).

### Medium

- **Moat is workflow and clarity, not structural** — README and roadmap position the product against **landlord-ops and spreadsheet defaults**; defensibility is **UX, RentCast-assisted estimates, deal↔portfolio continuity, and policy-backed metrics**, not network effects or proprietary data at scale. — `README.md`, `docs/reference/roadmap.md`, `docs/internal/differentiator-value-add-analysis.md`.

- **Display price env vs Stripe price IDs must stay paired** — Public amounts use `PRICING_DISPLAY` from `NEXT_PUBLIC_PRICE_*` (`app/lib/pricing-display.ts`); checkout uses `STRIPE_PRICE_ID_*` (`app/lib/stripe-config.ts`). Drift **undermines trust** at purchase and complicates diligence. — `app/lib/pricing-display.ts`, `app/lib/stripe-config.ts`, `app/app/pricing/page.tsx`.

- **Scale and unit-economics signals before traction** — **Authenticated layout `force-dynamic`** and **PostHog person-properties refetching `/api/me` on every navigation** increase origin and DB work at scale (performance audit). Not a launch blocker at zero users, but relevant to **operating leverage** narrative if growth accelerates. — `docs/audits/performance-cost/2026-03-31-performance-cost-audit.md`, `app/app/(app)/layout.tsx`, `app/components/analytics/posthog-person-properties.tsx`.

- **Conversion / demo friction on mobile and IA** — Portfolio summary export is **desktop-biased** in the dashboard strip; **Analyze** lacks strong above-the-fold orientation to **Deals**; **Plans vs Pricing** dual surfaces can confuse. These affect **activation and perceived completeness** in investor demos. — `docs/audits/feature/2026-03-31-feature-ux-audit.md`.

### Low

- **Operator / entity alignment is documented, not verified here** — `docs/business-launch-checklist.md` frames ND LLC vs sole proprietor and Stripe migration; acquirers expect **Terms/Privacy and Stripe account** to match the stated entity — confirm in production outside this repo review.

- **Security documentation vs implementation drift** — Master security doc can lag CSP rollout (security audit); secondary to valuation but affects **enterprise-ready** framing if claimed prematurely. — `docs/audits/security/2026-03-31-security-audit.md`.

- **Silent client billing sync failures** — Reliability audit notes swallowed errors on `/api/billing/sync`; subscription state may lag without ops visibility — **support load and churn risk** if users see wrong tier. — `docs/audits/reliability-ops/2026-03-31-reliability-ops-audit.md`, `app/app/(app)/app-layout-client.tsx`.

- **Mobile polish gaps on marketing and analyzer chrome** — Mobile experience audit flags **safe-area / sticky bar** and **marketing drawer a11y** gaps; affects **brand quality** in App Store–less web funnel, not core billing. — `docs/audits/feature/2026-03-31-mobile-experience-audit.md`.

## Evidence reviewed

- **Process:** `docs/process/business-valuation-audit-process.md`, `docs/process/audit-report-template.md`
- **Product & strategy:** `README.md`, `docs/reference/roadmap.md`, `docs/internal/differentiator-value-add-analysis.md`
- **Business ops:** `docs/business-launch-checklist.md`
- **Policies:** `docs/policies/ownership-metrics.md` (canonical formulas)
- **Monetization & limits:** `app/lib/plans.ts`, `app/lib/pricing-display.ts`, `app/lib/stripe-config.ts`, `app/app/pricing/page.tsx`, `app/.env.example`
- **Product-evidence signals:** `app/lib/changelog-data.ts` (2026-03-31 release narrative)
- **Cross-lane context (same date):** `docs/audits/feature/2026-03-31-feature-ux-audit.md`, `docs/audits/feature/2026-03-31-mobile-experience-audit.md`, `docs/audits/math/2026-03-31-math-logic-audit.md`, `docs/audits/performance-cost/2026-03-31-performance-cost-audit.md`, `docs/audits/security/2026-03-31-security-audit.md`, `docs/audits/reliability-ops/2026-03-31-reliability-ops-audit.md`
- **Prior business audit (continuity):** `docs/audits/business/2026-03-20-business-valuation-audit.md`
- **Audit program:** `docs/audits/README.md`

**Limits:** This pass did **not** query production Stripe, Clerk, PostHog, or hosting dashboards. **Valuation numbers below are illustrative bands**, not fairness opinions; replace with actual MRR, churn, CAC, and cohort data when available.

## Risk & impact assessment

| Area | Likelihood | Business / valuation impact if ignored |
|------|------------|----------------------------------------|
| No verified revenue | — | Negotiations stay in **asset / replacement-cost** territory; no strategic premium from cash flow |
| Amortization edge cases | Low frequency, high severity if triggered | Power users and diligence lose faith in debt/equity outputs |
| Pricing env vs Stripe mismatch | Low with discipline | Checkout surprise, disputes, support cost |
| Moat + crowded category | — | Buyer assumes **fast follow** unless distribution or data advantages appear |
| Mobile / IA friction | Medium in real usage | Weakens **activation and demo** story for investors and paid ads efficiency |
| Scale costs (dynamic shell, analytics fan-out) | Rises with traffic | **Gross margin** narrative needs honest infra + DB load planning |

## Valuation posture (realistic framing)

**Shared assumptions (explicit):**

- **Asset type:** SaaS codebase, docs, and operational runbooks; no corporate financial statements or IP litigation reviewed.
- **“Codebase-only / no users”** means no material **attributed recurring revenue** evidenced in-repo.
- **“With traction”** assumes **verified** MRR, manageable churn, and clean subscription history — multiples **collapse** if churn is high or revenue is one-off services.

**Indicative ranges (USD, wide bands; not a fairness opinion):**

| Scenario | What is priced in | Indicative range | Confidence |
|----------|-------------------|------------------|------------|
| **A — Codebase / no paying users** | Replacement cost, integration depth (Clerk, Stripe, RentCast), policy + test maturity, shipped feature surface (calculators, deal context, export API) | **~$12K–$28K** | Low–medium (buyer- and geography-dependent) |
| **B — Early revenue** | ~10–50 paying subs, visible retention, supportable unit economics | **~$40K–$95K** | Low until actuals |
| **C — PMF signal** | ~100+ paying, **~$2K+ MRR**, improving net retention | **~$110K–$320K+** | Low until verified |

**Narrative adjustments vs 2026-03-20:** **Mortgage balance Phase 1** (effective/projected balance, balance-as-of) **removes** a prior headline product-trust gap. **Offset:** diligence may still probe **amortization edge cases** and **operational scale** costs as noted above.

**Buyer archetypes:** Indie micro-acquire (cost-based, fast close), proptech strategic (premium if distribution fit), asset-style sale (lowest multiple).

**Metrics that matter for the narrative (collect outside the repo):** MRR and ARPA by tier; **logo / ICP** concentration; **churn and expansion**; **CAC** by channel (ads, SEO, referral); **RentCast and Stripe** COGS per active user; **support tickets** per 100 MAU; **activation** (e.g. first property + first insight within 24–48h) if instrumented in PostHog.

## Recommendations (prioritized)

1. **Establish one internal “commercial truth” table** — Free / Investor / Pro → property and deal limits (`app/lib/plans.ts`) → RentCast hourly caps → **Stripe price IDs** → **display env** → marketing and `/pricing` copy; owner and review trigger on any change.
2. **Produce paid-traction evidence** — Even a small paying cohort with **permission to cite** (or anonymized funnel metrics) moves conversations from **replacement cost** toward **revenue-based** multiples.
3. **Close demo- and mobile-blocking UX gaps** — Portfolio export discoverability on mobile, Analyze↔Deals orientation, and safe-area polish where confirmed (per feature/mobile audits) to support **conversion and fundraising demos**.
4. **Harden or document amortization edge cases** — Validation or schedule clamping for **payment < interest** paths (per math audit) to preempt diligence findings.
5. **Reconcile “portfolio truth” for one golden property** — Dashboard, property detail, CSV export, and `/api/export/portfolio-summary` vs `docs/policies/ownership-metrics.md` before external diligence.

## Task candidates (optional)

- [ ] **Commercial matrix (internal):** Single living doc or spreadsheet: tier limits → Stripe IDs → `NEXT_PUBLIC_PRICE_*` → marketing owner.
- [ ] **Investor one-pager:** ICP, differentiation (`docs/internal/differentiator-value-add-analysis.md` bullets), shipped proof (changelog), and **explicit gaps** (insights layer, side-by-side scenarios) — honest positioning beats feature laundry lists.
- [ ] **PostHog funnel definition:** Named funnel for signup → first property → plan view → checkout attempt → subscribed (even if volume is small) for future audit evidence.

## Re-test checklist

- [ ] After any pricing or Stripe product change: `/pricing` amounts and `PricingCards` match Checkout and Customer Portal.
- [ ] Free tier: property/deal limit UX and links to `/plans` remain consistent (`app-layout-client` banners).
- [ ] If amortization validation ships: spot-check schedule vs spreadsheet for edge-case mortgages.
- [ ] `npm run check` in `app/` when code changes follow recommendations (not required for this audit-only pass).

## Next trigger and cadence

- **Trigger:** New tier or packaging, material roadmap change affecting monetization, fundraising or acquisition process, or first **meaningful MRR** milestone.
- **Recommended next run:** **Quarterly** per `docs/audits/README.md`, or **monthly** while running paid acquisition or investor conversations.
