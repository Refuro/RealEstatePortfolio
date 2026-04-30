# Growth Funnel & Activation Audit — 2026-04-27

## Executive summary

- **Overall:** Acquisition surfaces (`/`, `/pricing`, public calculators, tools hub) use consistent tracked CTAs (`FunnelCtaLink`), plan-intent persistence, and clear trial messaging (14-day Investor access, no card on Free). Sign-up **`forceRedirectUrl`** sends new users straight to **`/properties/new?mode=quick`**, which strongly favors activation; sign-in still lands on **`/dashboard`** with a parallel empty-state path.
- **Top risks:** Highest-intent signups (**Investor / Pro** from pricing or calculator) may **not see the paid-intent checkout nudge** until they open the dashboard, because **`PaidIntentCheckoutBanner`** is mounted only on **`dashboard/page.tsx`**. Separately, **public calculator inputs are not carried into the app** after signup—disclosed on the SEO calculator page but still a major time-to-value leak for tool-origin traffic.
- **Recommendation:** Surface paid-intent continuity on **`/plans`** or the app shell (not only the dashboard), and run a scoped experiment on **calculator → Analyze / quick-add prefill** when engineering capacity allows. Align **first-property** deep links (**`?mode=quick`**) across Modeling/Mortgage empty states to protect consistent activation (see `docs/audits/feature/2026-04-27-feature-ux-audit.md`).

## Severity-ranked findings

### Critical

- None identified in this static/code-path review (auth gating in `app/proxy.ts`, public route matcher, and primary CTAs are coherent).

### High

- **Paid-intent monetization nudge is dashboard-only while signup jumps to quick add** — Users who choose **Investor** or **Pro** on `/pricing` (or `?intent=` from other CTAs) persist intent in localStorage and see **`PlanIntentSignUpReinforcement`** on the Clerk form, but after signup they are redirected to **`/properties/new?mode=quick`** (`sign-up-view.tsx`). **`PaidIntentCheckoutBanner`** only renders on the **dashboard** page when **`effectiveTier === "free"`** and analytics intent is investor/pro. **Risk:** Delayed or missed upgrade prompts for the strongest commercial intent cohort until they manually visit `/dashboard`. **Evidence:** `app/app/sign-up/[[...sign-up]]/sign-up-view.tsx` (`forceRedirectUrl`); `app/components/growth/paid-intent-checkout-banner.tsx`; `app/app/(app)/dashboard/page.tsx` (banner placement only).

- **Public calculator → in-app re-entry** — The investment property calculator page states that **calculator inputs are not transferred** when the user signs up and they must re-enter numbers in the app. **Risk:** Drop-off and longer time-to-first-value for SEO/tool-origin traffic. **Evidence:** `app/app/investment-property-calculator/page.tsx` (~line 94); aligns with `docs/reference/roadmap.md` (tools vs full workspace).

### Medium

- **Inconsistent first-property entry across workspaces** — Dashboard empty state and onboarding “Add first property” use **`/properties/new?mode=quick`**, while Modeling and Mortgage zero-property flows use **`/properties/new`** without `mode=quick` (per `docs/audits/feature/2026-04-27-feature-ux-audit.md`). **Impact:** Uneven time-to-first-value and profile completeness depending on entry path.

- **Homepage embedded calculator omits inline conversion strip** — The landing calculator section renders **`<PublicCalculator compact />`** without **`showCta`**, so the component’s built-in **“Create a free account” / investor secondary** controls do not appear inside the widget; conversion relies on surrounding copy and the **“Want to save…”** line. **Evidence:** `app/app/page.tsx` (calculator section); `app/components/marketing/public-calculator.tsx` (`showCta` default `false`).

- **Mobile primary nav may obscure the Deal Analyzer for activated users** — Bottom nav uses a **Calculator** icon for **`/analyze`** while the sidebar uses a different affordance, which can mis-set expectations on mobile (feature audit). **Growth impact:** Weaker discovery of a core post-signup value path on small screens. **Evidence:** `app/components/mobile-bottom-nav.tsx` vs `app/app/(app)/app-nav.tsx` (see `docs/audits/feature/2026-04-27-feature-ux-audit.md`).

### Low

- **`plan-intent.ts` header comment vs implementation** — Comment describes Clerk **`afterSignUpUrl`** landing on **`/dashboard`** and **`PaidIntentCheckoutBanner`** on that landing; production signup uses **`forceRedirectUrl="/properties/new?mode=quick"`**. **Risk:** Maintainer confusion only. **Evidence:** `app/lib/plan-intent.ts` (file header); `app/app/sign-up/[[...sign-up]]/sign-up-view.tsx`.

- **Dashboard empty-state copy** — “Analyze a deal first” says **“No account data needed”** while the user is signed in. **Evidence:** `app/app/(app)/dashboard/dashboard-empty-state-ctas.tsx`.

- **Sign-in lacks trial/value reinforcement** — Sign-up includes the 14-day trial line and optional paid-intent reinforcement; sign-in only adds Terms/Privacy links. **Evidence:** `app/app/sign-in/[[...sign-in]]/sign-in-view.tsx`; `app/app/sign-up/[[...sign-up]]/sign-up-view.tsx`.

## Evidence reviewed

- **Process & template:** `docs/process/growth-funnel-audit-process.md`; `docs/process/audit-report-template.md`.
- **Permanent deferral:** **GRW-1** — Mobile pricing accordion omitting **“Estimate pool (per hour)”** is **intentional**; not reported as a defect (`docs/process/growth-funnel-audit-process.md` §5).
- **Reference:** `docs/policies/design-spec.md` (funnel-relevant hierarchy/mobile notes); `docs/reference/roadmap.md` (product map, tools vs workspace); `docs/audits/feature/2026-04-27-feature-ux-audit.md` (cross-cutting activation/IA items).
- **Public funnel:** `app/app/page.tsx`, `app/app/pricing/page.tsx`, `app/app/investment-property-calculator/page.tsx`, `app/components/landing-nav.tsx`, `app/components/marketing/funnel-cta-link.tsx`, `app/components/marketing/public-calculator.tsx`, `app/components/analytics/plan-intent-url-sync.tsx`, `app/lib/plan-intent.ts`.
- **Auth:** `app/app/sign-up/[[...sign-up]]/sign-up-view.tsx`, `app/app/sign-in/[[...sign-in]]/sign-in-view.tsx`, `app/proxy.ts`.
- **Activation:** `app/app/(app)/onboarding-panel.tsx`, `app/app/(app)/dashboard/page.tsx`, `app/app/(app)/dashboard/dashboard-empty-state-ctas.tsx`, `app/app/(app)/properties/new/page.tsx`.
- **Upgrade & billing:** `app/components/pricing-cards.tsx`, `app/app/(app)/plans/page.tsx`, `app/app/(app)/components/trial-banner.tsx`, `app/components/growth/paid-intent-checkout-banner.tsx`.

**Assumptions / limits:** No production session replay, PostHog funnels, or moderated usability tests in this pass. Findings are from representative source review; conversion rates are unknown.

## Risk & impact assessment

- Unresolved **High** items affect **tool-origin signup efficiency** and **early monetization of pricing-qualified leads**—segments with direct revenue and LTV implications.
- **Medium** items affect **time-to-first-value** and **mobile engagement**; likelihood is elevated for users who enter through Modeling/Mortgage before the dashboard or primarily use phones.
- **Low** items are polish and documentation hygiene; low exposure.

## Recommendations (prioritized)

1. **Extend paid-intent continuity beyond the dashboard:** Mount **`PaidIntentCheckoutBanner`** (or an equivalent compact strip) on **`/plans`** and/or **`AppLayoutClient`** for **free tier + investor/pro intent**, or redirect paid-intent signups through **one** dashboard interstitial—measure impact on **visit `/plans` within 24h of signup** for investor/pro intent cohorts.
2. **Calculator handoff experiment:** Prefill overlapping fields on **`/analyze`** or quick-add via query params or short-lived server-side draft for highest-traffic calculator entry; measure **signup → first saved deal or first property within 7 days** for calculator-attributed users.
3. **Unify first-property CTAs:** Use **`/properties/new?mode=quick`** (or a shared constant) from Modeling and Mortgage empty states so activation matches dashboard/onboarding (`docs/audits/feature/2026-04-27-feature-ux-audit.md`).
4. **Homepage calculator:** A/B **`showCta={true}`** (or a single prominent CTA row) on the embedded calculator vs control; track **`funnel_cta_clicked`** from **`landing_calculator`** placements.

**Measurable hypotheses**

- *H1:* Showing paid-intent nudge in-app shell (not only dashboard) increases **checkout starts** within 7 days for users with **`plan_intent` ∈ {investor, pro}** at signup.
- *H2:* Calculator field handoff increases **% of calculator-origin signups** who create a **saved deal** or **property** within one session.
- *H3:* Aligning Modeling/Mortgage empty states to **`mode=quick`** reduces **median time to first property** (server-side metric).

## Task candidates (optional)

- [ ] Render **`PaidIntentCheckoutBanner`** on `/plans` or app layout for eligible users; avoid duplicate messaging with trial strip (coordinate copy/stacking).
- [ ] Add **`showCta`** (or equivalent) to homepage **`PublicCalculator`** and verify analytics placements.
- [ ] Replace `/properties/new` with **`/properties/new?mode=quick`** in Modeling and Mortgage zero-property empty states (or shared **`FIRST_PROPERTY_HREF`**).
- [ ] Refresh **`plan-intent.ts`** file header to match **`forceRedirectUrl`** signup behavior.
- [ ] Tweak dashboard empty-state **Analyze** card copy for signed-in users; optional one-line trial reminder on **sign-in** view.

## Re-test checklist

- [ ] Verify paid-intent users still see a single clear **upgrade** path after signup (no duplicate competing banners).
- [ ] Smoke-test: pricing **Choose Investor** → signup → quick add → dashboard → banner and/or `/plans` behavior.
- [ ] After any code changes: `npm run check`

## Next trigger and cadence

- **Trigger:** After changes to signup redirects, pricing CTAs, trial rules, or public calculators; otherwise quarterly.
- **Recommended next run:** **2026-07-27** (Q3) or the next release that touches auth, onboarding, or billing surfaces.
