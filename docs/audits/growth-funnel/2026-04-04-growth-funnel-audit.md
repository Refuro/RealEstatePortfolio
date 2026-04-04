# Growth Funnel & Activation Audit — 2026-04-04

## Executive summary

- **All Run-2 High findings resolved.** `/sign-in` now mounts `PlanIntentUrlSync` (Suspense-wrapped); deals at-limit upgrade uses `UpgradePlanLink` with `placement="deals_list_at_limit"`. Both Run-2 Medium fixes also shipped: `PaidIntentCheckoutBanner` "View plans" uses `FunnelCtaLink` with `placement="paid_intent_checkout_banner"`; investment-property-calculator footer carries `planIntent="free"`. Calculator Phase 1 CTA work is complete — all public calculator surfaces (`/tools`, `/tools/brrr`, `/tools/str-vs-ltr`, `/tools/fix-and-flip`, `/investment-property-calculator`, location pages) now have proper `FunnelCtaLink` placements with distinct `placement` values.
- **Acquisition instrumentation is now strong end-to-end.** Hero, calculator, pricing-preview, and bottom-CTA sections all use `FunnelCtaLink` + `planIntent="free"`. `PlanIntentUrlSync` is mounted at `/`, `/pricing`, `/sign-in`, `/sign-up`, `/investment-property-calculator`, and competitor/alternative pages. `PlanIntentSignUpReinforcement` is active on sign-up. `PaidIntentCheckoutBanner` is live on `/dashboard` (14-day cooldown dismiss). Time-to-value copy is now consistent: landing hero, welcome modal (`onboarding-panel.tsx` line 196), and bottom CTA all say "about 60 seconds."
- **Two remaining High-priority gaps:** (1) The **pricing page mobile accordion** omits the "Estimate pool (per hour)" row that the desktop table and footer text disclose — mobile evaluators comparing tiers are missing a key differentiator. (2) Competitor/alternative primary sign-up CTAs use `href="/sign-up"` without `?intent=free` and no `planIntent` prop — inconsistent with the free-intent signal sent from every other primary CTA surface.
- **Activation quality is good but has addressable gaps:** The welcome modal is property-first only; deal-intent users (who arrive via calculator CTAs) see the same modal flow and are steered to `/properties/new`. No interactive product demo exists on the critical path; the roadmap calls this out as a validated risk.

---

## Severity-ranked findings

### Critical

- None. Auth routes resolve correctly to `/dashboard`; plan-intent storage, sign-up reinforcement, and post-checkout cleanup (`BillingSuccessClearIntent`) are all wired. PostHog funnel definition is unchanged.

### High

- **Pricing mobile accordion missing Estimate pool row** — Desktop `<table>` at `app/app/pricing/page.tsx` lines 133–143 includes `["Rent &amp; value estimates", true, true, true]` and `["Estimate pool (per hour)", "5/hr", "10/hr", "20/hr"]`. The mobile `<details>` block (lines 180–187) includes only 7 rows and **never shows the hourly pool row**, while the page footer (lines 85–88) still discloses the per-hour limits. **Risk:** Mobile-first buyers comparing tiers are systematically under-informed about a paid-tier differentiator tied to RentCast usage; they may pick a plan, hit the estimate-pool ceiling, and churn or escalate to support.

- **Competitor/alternative primary sign-up CTAs missing `planIntent` and `?intent=free`** — `app/components/marketing/competitor-alternative-page.tsx` hero primary (`competitor_alt_hero` placement, line 74–82), inline-table (`competitor_alt_table`, line 156–165), and final-section (`competitor_alt_footer`, line 260–267) CTAs all use `href="/sign-up"` without `?intent=free` and no `planIntent` prop. Secondary "View pricing" links on those placements do carry `planIntent="free"`. **Risk:** Visitors converting from `/alternatives/*` or `/vs/*` pages — often high-intent SEO traffic — arrive at sign-up without plan intent set. `PlanIntentSignUpReinforcement` cannot show reinforcement copy; `PaidIntentCheckoutBanner` cannot fire; attribution analytics for that cohort remain incomplete relative to every other acquisition surface.

### Medium

- **Welcome modal is property-first; no deal-first path** — `OnboardingPanel` (`app/app/(app)/onboarding-panel.tsx`, line 96) routes "Add first property" to `/properties/new`. Users arriving via the public deal-analyzer or with `plan_intent=free` after calculator CTAs are funneled into a property-setup flow on first session. **Risk:** Lower activation rate for the "deal analyzer first" segment; time-to-first `deal_created` is not measurable as a first-value KPI; one activation path doesn't fit all entry cohorts.

- **No interactive product demo on the critical path** — The landing page relies on static `DashboardMockup` / `DealAnalyzerMockup` / `MortgageMockup` mockups and an embedded public calculator. No clickable Arcade/demo or seeded guest session exists. The roadmap (`docs/reference/roadmap.md`) explicitly lists this as a Phase A experiment with uplift potential for skeptical passive landlords. **Risk:** Visitors who want to "see before signing up" bounce after viewing static mockups; sign-up quality may be lower for cold/comparison traffic.

- **Investment-property-calculator footer "See plans" is a plain `Link`** — `app/app/investment-property-calculator/page.tsx` lines 135–140: the secondary "See plans" button uses a plain `<Link href="/pricing">` — no `FunnelCtaLink`, no `placement`, no event. This is adjacent to the now-instrumented `investment_property_footer` primary CTA, so secondary-click attribution from this surface remains a gap. **Risk:** Minor analytics blind spot; cannot attribute pricing-page visits originating from this secondary CTA.

- **TTV claim vs wizard complexity** — Landing and welcome modal both say "about 60 seconds" but `AddPropertyWizard` is a multi-section form (`app/app/(app)/properties/new/page.tsx` + `AddPropertyWizard`). Users filling out mortgage details, vacancy, ownership percent, etc. are likely slower. **Risk:** Perceived exaggeration for detail-oriented users; low direct churn risk but trust/NPS drag if first experience overshoots the promise.

### Low

- **Landing nav "Sign in" is a plain `Link`** — `app/components/landing-nav.tsx` lines 95–100: plain `<Link href="/sign-in">` with no `FunnelCtaLink`, `placement`, or analytics. "Sign up" in the same nav uses `FunnelCtaLink` with `placement="landing_nav"`. **Risk:** No attribution for returning-user re-entry via nav sign-in; low-priority given sign-in is a returning-user path, not acquisition.

- **Pricing vocabulary split: "Pricing" (marketing) vs "Plans & billing" (app)** — Signed-in users on `/pricing` are linked to `/plans` (`app/app/pricing/page.tsx` line 57–62); `/plans` page (`app/app/(app)/plans/page.tsx`) uses "Plans & billing" label. Small cognitive-load friction when a signed-in user navigates from marketing to app upgrade surface.

- **Public calculator → workspace input continuity gap** — Calculator inputs are not pre-filled in `/analyze` after sign-up (noted inline at `investment-property-calculator/page.tsx` line 83). CTAs are honest about this. A future continuity feature (roadmap §Tools hub) would reduce re-entry friction; flagged here as an open low-priority activation gap.

- **PostHog consent gating** — All client events remain dependent on optional analytics consent. Funnel undercounting for consent decliners is expected, not a regression; noted for completeness.

---

## Evidence reviewed

| Area | Paths / artifacts |
|------|-------------------|
| Process & template | `docs/process/growth-funnel-audit-process.md`, `docs/process/audit-report-template.md` |
| Previous audit | `docs/audits/growth-funnel/2026-04-03-growth-funnel-audit-2.md` |
| Calculator plan | `docs/archive/plans/2026-04-04-calculators-premium-cta-plan.md`, `docs/archive/plans/2026-04-04-calculators-premium-cta-phase1-audit.md` |
| Landing & CTAs | `app/app/page.tsx` (variant `home_v4`), `app/components/landing-nav.tsx` |
| Pricing & upgrade | `app/app/pricing/page.tsx`, `app/app/(app)/plans/page.tsx` |
| Auth surfaces | `app/app/sign-in/[[...sign-in]]/page.tsx`, `app/app/sign-up/[[...sign-up]]/sign-up-view.tsx`, `app/app/sign-up/[[...sign-up]]/page.tsx` |
| Activation | `app/app/(app)/onboarding-panel.tsx`, `app/app/(app)/properties/new/page.tsx` |
| Upgrade prompts | `app/app/(app)/deals/page.tsx`, `app/components/growth/paid-intent-checkout-banner.tsx` |
| Calculator surfaces | `app/app/investment-property-calculator/page.tsx`, `app/components/marketing/competitor-alternative-page.tsx` |
| Analytics infra | `app/components/analytics/plan-intent-url-sync.tsx` (referenced), `app/lib/plan-intent.ts` (referenced) |

**Limits:** Static code review only. No live PostHog session data, A/B results, or browser session replay. Clerk-hosted flows (email verification, OAuth) not tested in a browser. Pricing card checkout buttons (`PricingCards`) not fully inspected (referenced behavior only).

---

## Risk & impact assessment

| Finding | Likelihood of user impact | Business impact |
|---------|--------------------------|-----------------|
| Mobile pricing missing estimate-pool row | High for mobile visitors on /pricing | Wrong tier selected; estimate-pool surprises post-upgrade; weaker paid upgrade conversion |
| Competitor CTAs missing planIntent/intent | High for SEO competitor/alternative traffic | Attribution gap; PaidIntentCheckoutBanner cannot fire; plan intent reinforcement skipped |
| Property-first modal vs deal-first ICP | Medium — depends on traffic mix | Slower activation for deal-analyzer segment; hard to measure with single KPI |
| No interactive demo | Medium-high for cold/comparison traffic | Bounce before signup for skeptical ICP; documented roadmap risk |
| Calculator footer "See plans" plain Link | Low | Attribution gap only; no conversion break |
| TTV "60 seconds" vs wizard | Low-medium | Trust drag for detail-oriented users; no hard churn |

---

## Recommendations (prioritized)

1. **Add Estimate pool (per hour) to mobile pricing accordion** — Mirror the desktop `<table>` row in the `<details>` block at `app/app/pricing/page.tsx` (7 rows → 8). Verify no other desktop-only rows have drifted. Quick, low-risk, high-leverage fix for mobile upgrade clarity.
2. **Add `planIntent="free"` and `?intent=free` to competitor primary sign-up CTAs** — Update the three `FunnelCtaLink` blocks in `competitor-alternative-page.tsx` (`competitor_alt_hero`, `competitor_alt_table`, `competitor_alt_footer`) to use `href="/sign-up?intent=free"` and `planIntent="free"`. Aligns this high-SEO surface with every other acquisition CTA.
3. **Instrument the "See plans" secondary CTA on the investment-property-calculator page** — Replace the plain `<Link href="/pricing">` with a `FunnelCtaLink` (e.g. `placement="investment_property_footer_pricing"`, `ctaId="see_plans"`). Small effort, closes the last instrumentation gap on the calculator surface after Phase 1.
4. **Run Phase A demo experiment** — Embed an Arcade (or equivalent) on `/` or a new `/demo` route; fire `demo_session_started` event. Measure signup CVR vs `home_v4` baseline. If validated, promote to Phase B (seeded guest account) per roadmap.
5. **Add deal-analysis branch to welcome modal** — When `plan_intent` (from `getPlanIntentForAnalytics()`) is not set or is `free` after entering from a calculator CTA, offer a secondary action alongside "Add first property" (e.g., "Analyze a deal →" pointing to `/analyze`). Requires a product decision on primary activation KPI.

---

## Measurable funnel hypotheses

| ID | Hypothesis | Primary metric | Notes |
|----|------------|----------------|-------|
| H1 | Adding estimate-pool row to mobile pricing accordion **increases** mobile checkout-started rate from `/pricing` | `checkout_started` events segmented `md:false` | A/B by shipping and comparing before/after |
| H2 | Adding `planIntent="free"` to competitor CTAs **increases** `PaidIntentCheckoutBanner` impressions and `plan_intent_upgrade_nudged` events for that cohort | Banner impression rate for competitor-origin sessions | Cross-reference with `/alternatives/*` and `/vs/*` PostHog funnels |
| H3 | Arcade/demo embed on landing **increases** signup CVR vs `home_v4` control | `funnel_cta_clicked` → `sign_up_completed` | Control: landing variant `home_v4`; treat: with demo embed |
| H4 | Deal-analysis option in welcome modal **reduces** D0 drop-off for calculator-origin signups | `onboarding_step_completed` (step `welcome_add_first_property`) rate for `plan_intent=free` from calculator | Requires defining "calculator-origin" cohort |

---

## Task candidates

- [ ] `app/app/pricing/page.tsx`: add `["Estimate pool (per hour)", "5/hr", "10/hr", "20/hr"]` row to mobile `<details>` block (mirror desktop).
- [ ] `app/components/marketing/competitor-alternative-page.tsx`: set `href="/sign-up?intent=free"` and `planIntent="free"` on `competitor_alt_hero`, `competitor_alt_table`, `competitor_alt_footer` `FunnelCtaLink`s.
- [ ] `app/app/investment-property-calculator/page.tsx`: replace plain `<Link href="/pricing">` "See plans" with `FunnelCtaLink` (`placement="investment_property_footer_pricing"`, `ctaId="see_plans"`).
- [ ] Ship **Phase A** demo embed per roadmap: instrument `demo_session_started` event, measure CVR.
- [ ] Optional: add secondary deal-analysis action to `OnboardingPanel` welcome modal for calculator-origin sessions.

---

## Re-test checklist

- [ ] `/pricing` at 375 px width: expand "Compare all features" and confirm **Estimate pool (per hour)** row is present and values match desktop (`5/hr` / `10/hr` / `20/hr`).
- [ ] `/alternatives/stessa` (or any `/alternatives/*`): confirm hero, table, and footer primary CTAs link to `/sign-up?intent=free`; confirm `plan_intent` is stored after landing.
- [ ] `/sign-in?intent=investor` → sign in → confirm `PaidIntentCheckoutBanner` appears on `/dashboard` (plan intent preserved through sign-in).
- [ ] `/deals` at deal limit: confirm "Upgrade to save more" fires `plan_limit_upgrade_cta_clicked` with `placement=deals_list_at_limit`.
- [ ] `/investment-property-calculator`: confirm "See plans" secondary CTA (if updated) fires `funnel_cta_clicked` with expected `placement`.
- [ ] `npm run check` (when code changes are made).

---

## Next trigger and cadence

- **Trigger:** After shipping pricing mobile fix or competitor CTA fix; after pricing or plan limit changes; after Phase A demo experiment; quarterly growth review.
- **Recommended next run:** **2026-07-04** (quarterly) or within two weeks of shipping either High-priority fix above.

**Report path (confirmed):** `docs/audits/growth-funnel/2026-04-04-growth-funnel-audit.md`
