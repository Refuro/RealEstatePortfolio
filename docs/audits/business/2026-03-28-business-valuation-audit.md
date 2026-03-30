# Business & Valuation Audit — 2026-03-28

## Executive summary

- **Overall:** The codebase supports a **credible early-stage SaaS**: tiered limits in `lib/plans.ts`, Stripe checkout/webhook/billing surfaces, plan-limit API tests, public **pricing** and **plans** flows, and policies/changelog for release hygiene. **Value narrative** on the landing page is clear (portfolio analytics, estimates, deal analyzer, scenarios).
- **Top risks:** **Revenue integrity** still depends on **manual alignment** between Stripe Dashboard prices and display env vars; **strategic docs** (roadmap vs tasks) show **drift** on mortgage-balance work, which weakens diligence narrative; **trust/legal** signals are slightly uneven (Terms vs Privacy freshness).
- **Valuation framing:** With **no traction data in-repo**, value is **product + architecture + GTM optionality** (pre-revenue / low-ARR band). With paying users, standard **ARR-based** framing applies; **moat** is **feature workflow + UX for a niche**, not proprietary data—**expansion** via roadmap items (simulation, reports, refinance insights) would strengthen **buyer attractiveness**.
- **Recommendation:** Before investor or acquirer conversations, fix **roadmap truth**, reconcile **Terms dates/entity** with `docs/business-launch-checklist.md`, and document a **single internal matrix** (tier → limits → Stripe price IDs → display env).

## Severity-ranked findings

### Critical

- *(none — no evidence of broken billing logic in this review; webhook verification and plan enforcement patterns are documented in `docs/security/security-notes.md`.)*

### High

- **Stripe display amounts vs live products** — If `NEXT_PUBLIC_PRICE_*` and Stripe recurring prices diverge, users can see **wrong dollar amounts** until checkout, harming trust and creating support/chargeback risk. — `app/lib/pricing-display.ts`, `app/.env.example`, `app/components/pricing-cards.tsx`

### Medium

- **Roadmap vs completion state (mortgage balance)** — `docs/tasks.md` treats mortgage balance advancement as done, but `docs/reference/roadmap.md` still lists unchecked acceptance criteria for the same initiative. — `docs/reference/roadmap.md` (lines ~26–44), `docs/tasks.md` (roadmap priority table)

- **Legal page freshness mismatch** — Terms show **Last updated: March 2025** while Privacy shows **March 2026**, which looks inconsistent to users and diligence readers. — `app/app/terms/page.tsx`, `app/app/privacy/page.tsx`

- **Packaging clarity: RentCast hourly limits** — Plan-tier **hourly API limits** are defined in code (`RENTCAST_HOURLY_LIMITS`) but are **not** summarized on public pricing cards; users may only discover limits via in-app behavior or errors. — `app/lib/plans.ts`, `app/components/pricing-cards.tsx`

- **Entity / LLC path vs public Terms** — `docs/business-launch-checklist.md` describes forming an LLC and updating Terms/Privacy with the legal entity; current Terms refer to “Veld Portfolio” generically. Fine pre-entity; **before meaningful revenue or contracts**, misalignment with the checklist is a **governance** gap. — `docs/business-launch-checklist.md` §Full Launch, `app/app/terms/page.tsx`

### Low

- **Growth narrative assets** — Landing and pricing emphasize product screenshots and value props but include **no** testimonials, customer logos, or usage stats—normal pre-launch, but **limits fundraising story** without external validation. — `app/app/page.tsx`, `app/app/pricing/page.tsx`

- **Changelog vs pricing changes** — Changelog is maintained (`app/lib/changelog-data.ts`); prior audits noted keeping release notes aligned when **pricing or limits** change—still a process, not a product defect.

## Evidence reviewed

- `README.md`, `docs/reference/roadmap.md`, `docs/business-launch-checklist.md`
- `docs/tasks.md` (intro + roadmap priority table)
- `docs/security/security-notes.md` (Stripe webhook, env)
- `docs/audits/business/2026-03-20-business-valuation-audit.md` (prior lane output)
- `docs/audits/growth-funnel/2026-03-20-growth-funnel-audit.md` (cross-lane context)
- `docs/reference/engineering-spec.md` §Module J (Subscription / Billing)
- `app/lib/plans.ts`, `app/lib/pricing-display.ts`, `app/components/pricing-cards.tsx`
- `app/app/pricing/page.tsx`, `app/app/(app)/plans/page.tsx`, `app/app/page.tsx`
- `app/lib/changelog-data.ts`, `app/.env.example`
- `app/app/terms/page.tsx`, `app/app/privacy/page.tsx` (headers + key sections)

**Assumptions / limits:** This pass is **documentation- and code-structure-heavy**; it does **not** verify live Stripe products, production env vars, or actual MRR/churn. Valuation scenarios below are **qualitative**.

## Risk & impact assessment

| Area | Impact if unresolved |
|------|----------------------|
| Price display vs Stripe | Support load, disputes, reputational harm; fixable with process |
| Roadmap drift | Weaker **operator/investor** confidence in “what’s shipped” |
| Terms/Privacy dates | **Trust** and minor **compliance optics** |
| Hidden API limits | Surprise at limit—retention risk for power users |
| No social proof | Slower **fundraising** and enterprise trust—not a code bug |

**Likelihood:** Mis-sync of env and Stripe is **common** in small teams without a release checklist; roadmap drift is **already visible** in-repo.

## Valuation framing (qualitative)

| Scenario | Framing |
|----------|---------|
| **Codebase + no/low users** | Asset value ≈ **IP (code + docs) + time-to-market** for a niche vertical SaaS; multiples on revenue **not** applicable. Key upside: **clean billing/auth architecture** and **documented policies**. |
| **With paying subscribers** | Typical **SaaS ARR** framing; adjust for **churn**, **concentration** (likely early), and **key-person** risk unless team/process is documented. |
| **Defensibility** | **Workflow + clarity** for 1–20 property investors; **not** deep network effects or proprietary market data. Roadmap depth (simulation, PDF report, refinance) would raise **strategic** appeal to buyers in **real estate fintech** adjacencies. |

## Recommendations (prioritized)

1. **Publish an internal “billing matrix”** (tier → property/deal limits → `STRIPE_PRICE_ID_*` → `NEXT_PUBLIC_PRICE_*`) and verify on each pricing change.
2. **Reconcile `docs/reference/roadmap.md`** with shipped work: either check off mortgage-balance acceptance criteria and move to Completed, or explicitly mark deferred sub-items.
3. **Align Terms “Last updated”** (and material subscription copy if needed) with Privacy and actual review cadence.
4. **Optional packaging:** Add one line per paid tier on pricing about **estimate refresh limits** (hourly), or link to a short FAQ—set expectations without cluttering the UI.
5. **GTM:** When ready, add **one** proof point (beta quote, early user count, or niche community endorsement) to support **valuation narrative**.

## Task candidates (optional)

- [ ] Create internal doc or table: tier → property/deal limits → RentCast hourly → Stripe price IDs → display env keys.
- [ ] Update `docs/reference/roadmap.md` mortgage balance section to match shipped state (or split “remaining” vs “done”).
- [ ] Align Terms last-updated date and, if applicable, legal entity name with `docs/business-launch-checklist.md`.
- [ ] Add FAQ or footnote on `/pricing` for third-party estimate limits by tier (from `RENTCAST_HOURLY_LIMITS`).
- [ ] Pre-launch checklist row: verify Stripe live prices match `NEXT_PUBLIC_PRICE_*` in Vercel (manual step per `docs/setup/manual-steps.md` pattern).
- [ ] When traction exists, add a lightweight **trust strip** (quote or metric) to landing—coordinate with growth audit.

## Re-test checklist

- [ ] After roadmap edit: confirm mortgage/benchmark bullets match app behavior.
- [ ] After Terms update: compare Privacy cross-references (Stripe, data deletion).
- [ ] `npm run check` (when any code or copy in app changes)

## Next trigger and cadence

- **Trigger:** Pricing or Stripe product change, fundraising prep, legal entity formation, quarterly business review.
- **Recommended next run:** **2026-06-28** or next major packaging/GTM milestone.
