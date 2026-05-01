# Growth Funnel & Activation Audit — 2026-04-30

## Executive summary

- **Overall:** Primary acquisition and activation paths remain **coherent**: public pricing and calculators use **plan-intent sync**, **FunnelCtaLink**, and honest disclosure where calculator inputs **do not** carry into the app; **Clerk signup** still forces **`/properties/new?mode=quick`**. **Paid-intent checkout messaging** remains **bound to the dashboard** while authenticated **`/plans`** has **no** `PaidIntentCheckoutBanner`—the same structural gap noted on **2026-04-29**.
- **New cross-lane signal (Feature/UX audit same day):** **`mode=quick` vs full wizard** defaults are **inconsistent** not only on Modeling/Mortgage but on **dashboard populated chrome** and **Properties zero-state**, widening **time-to-first-value variance** depending on entry route. Mobile bottom nav labels **`/analyze`** as **Analyze** with a **calculator** icon, which can **blur** the SEO **calculator funnel** vs the in-app **Deal Analyzer**—a trust and discovery risk on small screens.
- **Recommendation:** Prioritize **paid-intent continuity** outside `/dashboard`, a **calculator→app handoff** experiment, and a **single documented rule** (and shared href helper) for when quick-add is the primary activation CTA—aligning dashboard chrome, Properties empty state, and tool empty states. Treat mobile Analyze affordance as part of **funnel clarity**, not only IA polish.
- **Permanent deferral GRW-1:** Mobile pricing accordion omission of **Estimate pool (per hour)** is **intentional by PM decision**—**not** assessed as a defect (`docs/process/growth-funnel-audit-process.md` §5).

## Severity-ranked findings

### Critical

- None identified in this static/code-path review.

### High

- **Paid-intent monetization nudge is dashboard-only; signup lands on quick add.** Users with stored **Investor/Pro** intent still pass through **`forceRedirectUrl="/properties/new?mode=quick"`** (`sign-up-view.tsx`). **`PaidIntentCheckoutBanner`** appears only on **`dashboard/page.tsx`** (multiple branches); **`plans/page.tsx`** imports billing and **`PricingCards`** but **does not** mount the paid-intent banner (`grep` confirms no import). **Risk:** Highest-intent signups may **not** see checkout reinforcement until they visit the dashboard. **Evidence:** `app/app/sign-up/[[...sign-up]]/sign-up-view.tsx`; `app/app/(app)/dashboard/page.tsx`; `app/app/(app)/plans/page.tsx`.

- **Public investment calculator discloses no input transfer on signup.** Footer copy explicitly states users must **re-enter** numbers after signup. **Risk:** Strong **SEO/tool-origin** traffic hits a **time-to-first-value cliff** at account creation. **Evidence:** `app/app/investment-property-calculator/page.tsx` (lines 69–94).

### Medium

- **Activation path fragmentation (`mode=quick` vs full wizard)** — **Dashboard empty state** and **onboarding** favor **`/properties/new?mode=quick`** (`dashboard-empty-state-ctas.tsx`, `onboarding-panel.tsx`). **Modeling** and **Mortgage** zero-property CTAs still use **`/properties/new`** only (`modeling-workspace.tsx`, `mortgage-workspace.tsx`). **Feature audit (same date)** adds: **dashboard populated** title bar **Add property** and upsells use **`/properties/new`** without `mode=quick`; **Properties** zero-state primary is **Add your first property** → full wizard while the list header exposes **Quick add** only when properties exist (`properties/page.tsx`). **Risk:** **Uneven activation speed** and completeness by entry point; undermines a single “fastest path to value” story. **Evidence:** paths cited above; detail in `docs/audits/feature/2026-04-30-feature-ux-audit.md` §High/Medium.

- **Homepage embedded calculator omits inline funnel CTAs.** **`/`** renders **`<PublicCalculator compact />`** without **`showCta`**; dedicated calculator and competitor pages pass **`showCta`**. **Risk:** Lower **onsite** conversion efficacy vs SEO calculator surfaces. **Evidence:** `app/app/page.tsx`; compare `app/app/investment-property-calculator/page.tsx`.

- **Mobile Deal Analyzer affordance may conflate calculators hub and Analyze.** Bottom nav uses **calculator** iconography and short **Analyze** label for **`/analyze`** while sidebar and page use **Analyze deal** semantics (`ClipboardList`). **Risk:** **Passive-landlord** sessions may mis-tap or mistrust nav when comparing **public calculators** (acquisition) to **saved-deal workspace** (activation). **Evidence:** `app/components/mobile-bottom-nav.tsx`; `app/app/(app)/app-nav.tsx`; `app/app/(app)/analyze/page.tsx`; see `docs/audits/feature/2026-04-30-feature-ux-audit.md` §High.

### Low

- **Dual pricing surfaces (`/pricing` vs `/plans`).** Public marketing pricing vs authenticated **Plans & billing** can split bookmarks and messaging; upgrade clarity depends on users finding the right surface. **Evidence:** `app/app/pricing/page.tsx`; `app/app/(app)/plans/page.tsx`; `app/app/(app)/app-nav.tsx`.

- **`plan-intent.ts` file header** still describes **`afterSignUpUrl`** → **`/dashboard`** as the signup landing behavior, while **`sign-up-view.tsx`** uses **`forceRedirectUrl`** to **`/properties/new?mode=quick`**—maintainer drift only. **Evidence:** `app/lib/plan-intent.ts` (lines 5–9); `app/app/sign-up/[[...sign-up]]/sign-up-view.tsx`.

- **Sign-in shell** may lack **trial** reinforcement present on sign-up (parity optional). **Evidence:** pattern noted in **2026-04-29** pass (`sign-in-view.tsx` vs `sign-up-view.tsx`).

## Evidence reviewed

- **Process & template:** `docs/process/growth-funnel-audit-process.md`; `docs/process/audit-report-template.md`.
- **Permanent deferral GRW-1:** **Not** raised (`docs/process/growth-funnel-audit-process.md` §5).
- **Reference:** `docs/policies/design-spec.md`; `docs/reference/roadmap.md` §1 (calculators vs Analyze).
- **Continuity:** `docs/audits/growth-funnel/2026-04-29-growth-funnel-audit.md`; `docs/audits/feature/2026-04-30-feature-ux-audit.md` (cross-lane activation consistency).
- **Marketing & acquisition:** `app/app/page.tsx`, `app/app/pricing/page.tsx`, `app/app/investment-property-calculator/page.tsx`, `app/components/marketing/funnel-cta-link.tsx`, `app/components/analytics/plan-intent-url-sync.tsx`.
- **Auth:** `app/app/sign-up/[[...sign-up]]/sign-up-view.tsx`.
- **Activation & upgrade:** `app/app/(app)/dashboard/page.tsx`, `app/app/(app)/dashboard/dashboard-empty-state-ctas.tsx`, `app/app/(app)/properties/page.tsx`, `app/app/(app)/onboarding-panel.tsx`, `app/app/(app)/modeling/modeling-workspace.tsx`, `app/app/(app)/mortgage/mortgage-workspace.tsx`, `app/components/growth/paid-intent-checkout-banner.tsx`, `app/app/(app)/plans/page.tsx`, `app/components/mobile-bottom-nav.tsx`.

**Assumptions / limits:** Static review and grep spot-checks only—no live funnel metrics, session replay, or Stripe cohort exports.

## Risk & impact assessment

| Area | Likelihood | Impact |
|------|------------|--------|
| Paid-intent nudge unseen until dashboard | Moderate–high for users who live on quick-add, **Analyze**, or **/plans** first | Lower **checkout starts** for Pro/Investor-intent cohorts |
| Calculator handoff gap | High among SEO calculator visitors | Delayed activation; perceived **duplicate work** |
| `mode=quick` fragmentation | High whenever users skip dashboard empty state | Longer **median time to first property**; uneven data completeness |
| Mobile Analyze vs calculators conflation | Ongoing on mobile sessions | Weaker **tool → workspace** mental model; possible support questions |

## Recommendations (prioritized)

1. **Extend paid-intent continuity:** Mount **`PaidIntentCheckoutBanner`** (or a condensed variant with explicit stacking rules vs **`TrialBanner`** / limit banners) on **`/plans`** and/or **`app-layout-client`** for **free tier + stored paid intent**.
2. **Calculator handoff experiment:** Carry overlapping fields into **`/properties/new?mode=quick`** or **`/analyze`** via query, short-lived draft, or session—measure **signup → first saved property/deal in 7d** for calculator-origin users.
3. **`mode=quick` policy and implementation:** Document primary vs wizard defaults; converge **dashboard populated** CTAs, **Properties** zero-state, **Modeling/Mortgage** empty states, and **deal-analyzer** links via a shared constant—per **2026-04-30** feature audit.
4. **Homepage calculator:** Trial **`showCta`** (or adjacent strip) on **`/`** with analytics placement **`landing_calculator`**.
5. **Mobile Analyze affordance:** Align icon and label with **Analyze deal** semantics to protect **calculator funnel** vs **in-app analysis** clarity.

**Measurable hypotheses**

- **H1:** In-shell paid-intent messaging increases **checkout initiation (7d)** for **`plan_intent ∈ {investor, pro}`** at signup.
- **H2:** Field handoff from **investment-property-calculator** increases **first deal/property saved (7d)** for attributed traffic.
- **H3:** Unified **`mode=quick`** entry reduces **median seconds to first property** for cohorts entering via Properties or tools first.
- **H4:** Mobile nav parity for **Analyze deal** improves **/analyze** engagement without depressing calculator hub use (guardrail: calculators hub CTR).

## Task candidates (optional)

- [ ] Add **`PaidIntentCheckoutBanner`** to **`plans/page.tsx`** and/or app layout with coexistence rules.
- [ ] Design calculator → app **field carry** for **`/investment-property-calculator`** (and priority tool pages).
- [ ] Replace fragmented **`/properties/new`** links with policy-driven **quick vs full** hrefs (dashboard, Properties zero-state, Modeling, Mortgage, deal analyzer).
- [ ] Enable **`showCta`** (or equivalent) on homepage **`PublicCalculator`** with tracking.
- [ ] Update **`MobileBottomNav`** **`/analyze`** item per feature audit (`mobile-bottom-nav.tsx`).
- [ ] Optional: **`plan-intent.ts`** comment accuracy; sign-in trial one-liner.

## Re-test checklist

- [ ] Paid-intent user: signup → quick add → **/plans** / **/dashboard**—**single** coherent upgrade lane (no duplicate/conflicting banners).
- [ ] Smoke: pricing **Investor/Pro** → signup → activation path; mobile **/pricing** accordion (GRW-1 row **still** intentionally absent).
- [ ] After code changes: `npm run check`

## Next trigger and cadence

- **Trigger:** Changes to signup redirect, **plan-intent**, **/pricing** / **/plans**, public calculators, onboarding empty states, or mobile nav—or **quarterly** review.
- **Recommended next run:** **2026-07-30** (quarterly) or after any funnel/auth/billing surface ship.
