# Growth Funnel & Activation Audit — 2026-04-29

## Executive summary

- **Overall:** Acquisition surfaces (`/`, `/pricing`, public calculators, competitor routes) combine **tracked CTAs**, **plan-intent URL sync**, and clear trial copy (14-day Investor access on signup, Stripe trust on `/pricing`). **Clerk signup** redirects with **`forceRedirectUrl="/properties/new?mode=quick"`**, prioritizing activation. **Trial banner** renders in **`app-layout-client`** (`TrialBanner`), while **`PaidIntentCheckoutBanner`** remains **dashboard-specific** (`dashboard/page.tsx` only)—a structural mismatch for paid-intent users who bypass the dashboard after signup.
- **Top risks:** (1) **Investor/Pro-qualified signups** may not see the **paid-intent checkout nudge** until they navigate to **`/dashboard`**. (2) **SEO calculator → app** Handoff explicitly **does not transfer inputs** (`investment-property-calculator/page.tsx`). (3) **Modeling/Mortgage** empty states still link to **`/properties/new`** without **`?mode=quick`**, unlike dashboard empty state, onboarding, and re-engagement emails—inconsistent fastest path to first property value.
- **Recommendation:** Extend **paid-intent continuity** beyond the dashboard (e.g. **`/plans`** or app chrome), prioritize a **scoped calculator handoff** experiment for attributed traffic, and **align first-property deeplinks** from Modeling/Mortgage with the quick-add onboarding path. **Permanent deferral GRW-1** respected (mobile pricing accordion “Estimate pool” row omission is intentional)—not flagged.

## Severity-ranked findings

### Critical

- None identified in this static/code-path review (public route gating via `proxy.ts`, primary auth redirects, and plan-intent storage remain coherent).

### High

- **Paid-intent monetization nudge is dashboard-only while signup skips straight to quick add.** Users selecting **Investor** or **Pro** persist intent (`plan-intent.ts`, `PlanIntentSignUpReinforcement` via signup shell) but after signup **`SignUp`** uses **`forceRedirectUrl="/properties/new?mode=quick"`** (`sign-up-view.tsx`). **`PaidIntentCheckoutBanner`** renders only inside **`dashboard/page.tsx`** (multiple layout branches). **`/plans`** shows usage context cards but **does not** mount **`PaidIntentCheckoutBanner`** (`plans/page.tsx`). **Risk:** High-intent free-tier users focused on activation may delay or miss **checkout nudge** unless they reach the dashboard organically. **Evidence:** `app/app/sign-up/[[...sign-up]]/sign-up-view.tsx` (lines 32–39); `app/app/(app)/dashboard/page.tsx` (imports and usages of `PaidIntentCheckoutBanner`); `app/app/(app)/plans/page.tsx` (no paid-intent banner).

- **Public investment calculator explicitly does not carry inputs into the app.** Footer copy states calculator inputs **are not transferred on signup** and users must **re-enter** numbers—honest disclosure but a **major time-to-first-value leak** for SEO/tool-origin traffic. Standalone **`/investment-property-calculator`** uses **`PublicCalculator`** with **`showCta`** (good conversion surface). **Evidence:** `app/app/investment-property-calculator/page.tsx` (embedded calculator plus lines 94 onward); aligns with roadmap **tools vs workspace** framing (`docs/reference/roadmap.md` §1).

### Medium

- **Activation path fragmentation (Modeling & Mortgage vs canonical quick add).** **Modeling** and **Mortgage** zero-property empty-state CTAs use **`href="/properties/new"`** only. **Dashboard empty state**, **onboarding panel**, and onboarding emails consistently use **`/properties/new?mode=quick`**. **`TrialBanner`** hides on **`/properties/new?mode=quick`** (`trial-banner.tsx` first-property quick-add path), reinforcing **quick-mode** as the primary first-property UX. **Risk:** Uneven onboarding speed and completeness depending on whether the user enters from Modeling/Mortgage vs dashboard. **Evidence:** `app/app/(app)/modeling/modeling-workspace.tsx` (~lines 111–116); `app/app/(app)/mortgage/mortgage-workspace.tsx` (~lines 117–122); contrast `dashboard-empty-state-ctas.tsx`, `onboarding-panel.tsx`.

- **Homepage embedded calculator lacks inline signup CTAs.** Landing **`PublicCalculator`** is loaded as **`<PublicCalculator compact />`** without the `showCta` prop. The dedicated **`/investment-property-calculator`** page passes **`showCta`** alongside funnel placement—the homepage relies on adjacent marketing copy rather than component-level signup controls. **Risk:** Lower onsite conversion efficacy on the flagship `/` funnel vs the SEO calculator page. **Evidence:** `app/app/page.tsx`; compare `app/app/investment-property-calculator/page.tsx` (`PublicCalculator` with **`showCta`**).

### Low

- **`plan-intent.ts` header comment vs production signup.** File header still references **`afterSignUpUrl`/dashboard-centric** behavior (`plan-intent.ts` lines 5–9) while signup uses **`forceRedirectUrl`** to **`/properties/new?mode=quick`** (`sign-up-view.tsx`). **Risk:** Maintainer confusion only.

- **Sign-in reinforces legal links only.** **Sign-up** repeats **14-day trial** and **`PlanIntentSignUpReinforcement`**; **sign-in** lists Terms/Privacy lines only (**no trial reminder**). **Evidence:** `app/app/sign-in/[[...sign-in]]/sign-in-view.tsx` vs `sign-up-view.tsx`.

- **Dashboard empty-state “Analyze a deal first” microcopy.** “**No account data needed**” while the user **is authenticated** reads slightly off-tone for funnel clarity. **Evidence:** `dashboard-empty-state-ctas.tsx` (~lines 41–43).

## Evidence reviewed

- **Process & template:** `docs/process/growth-funnel-audit-process.md`; `docs/process/audit-report-template.md`.
- **Permanent deferral GRW-1:** Mobile pricing accordion omitting estimate-pool row is **by design**—not assessed as a defect (`docs/process/growth-funnel-audit-process.md` §5).
- **Reference:** `docs/policies/design-spec.md` (CTA/primaries); `docs/reference/roadmap.md` (product map, calculators vs Analyze); `docs/audits/feature/2026-04-29-feature-ux-audit.md` / `2026-04-29-mobile-experience-audit.md` where relevant for IA/mobile overlap (not re-scoped here).
- **Marketing & acquisition:** `app/app/page.tsx`, `app/app/pricing/page.tsx`, `app/app/investment-property-calculator/page.tsx`, `app/components/marketing/funnel-cta-link.tsx`, `app/components/analytics/plan-intent-url-sync.tsx`, `app/lib/plan-intent.ts`.
- **Auth:** `app/app/sign-up/[[...sign-up]]/sign-up-view.tsx`, `app/app/sign-in/[[...sign-in]]/sign-in-view.tsx`, `app/proxy.ts` (routing—spot-checked for public vs app shell patterns in prior audits).
- **Activation:** `app/app/(app)/onboarding-panel.tsx`, `app/app/(app)/dashboard/page.tsx`, `app/app/(app)/dashboard/dashboard-empty-state-ctas.tsx`, `app/app/(app)/properties/new/page.tsx`, `app/app/(app)/components/trial-banner.tsx`, `app/app/(app)/app-layout-client.tsx`, `app/app/(app)/modeling/modeling-workspace.tsx`, `app/app/(app)/mortgage/mortgage-workspace.tsx`.
- **Upgrade & billing surfacing:** `app/components/pricing-cards.tsx`, `app/app/(app)/plans/page.tsx`, `app/components/growth/paid-intent-checkout-banner.tsx`.

**Assumptions / limits:** No production session replay, live PostHog funnel exports, Stripe conversion panels, or moderated usability sessions in this pass. Static review of representative routing, copy, and component placement only.

## Risk & impact assessment

| Area | Likelihood | Impact |
|------|-------------|--------|
| Paid-intent nudge unseen until dashboard | Moderate–high for users who linger on **`/properties/new`** or **`/plans`** after signup without visiting dashboard first | Reduced **checkout-start rate** for highest commercial-intent cohorts |
| Calculator handoff gap | High traffic on SEO calculators | Delayed activation; higher perceived friction |
| Modeling/Mortgage quick-mode mismatch | Elevated when users bookmark or sidebar-navigate to workspaces before dashboard | Uneven **time-to-first-metrics** |

## Recommendations (prioritized)

1. **Extend paid-intent continuity beyond `/dashboard`:** Mount **`PaidIntentCheckoutBanner`** (or a condensed variant so it stacks cleanly with **`TrialBanner`** / **`OverLimitBanner`** on **`plans/page.tsx`** and/or **`app-layout-client.tsx`** gated by **`effectiveTier === "free"`** + stored Investor/Pro intent. Measure **`/plans`** visits → **Stripe checkout_started** within 7 days for intent cohorts.
2. **Calculator handoff experiment:** Prefill overlapping fields onto **`/analyze`** or **`/properties/new?mode=quick`** via query/session draft for **`investment-property-calculator`** and high-traffic tool pages. Hypothesis—**signup → first saved deal/property within 7d** ↑ for calculator-origin users.
3. **Unify first-property deeplinks from Modeling/Mortgage** to **`/properties/new?mode=quick`** or a **`FIRST_PROPERTY_HREF`** constant shared with onboarding.
4. **Homepage calculator:** Experiment with **`PublicCalculator`** **`showCta={true}`** (or localized CTA strip) alongside **`compact`**; track **`FUNNEL_CTA_CLICKED`** with **`placement: "landing_calculator"`**.

**Measurable hypotheses**

- **H1:** Showing paid-intent messaging in-shell (not dashboard-only) increases **Stripe checkout initiation** within 7 days for users whose stored **`plan_intent ∈ {investor, pro}`** at signup.
- **H2:** Homepage **`showCta`** on **`PublicCalculator`** increases **signup CTR** from **`/`** without harming bounce rate.
- **H3:** Aligning Modeling/Mortgage empty-state links to **`mode=quick`** reduces **median seconds to first property created** vs control.

## Task candidates (optional)

- [ ] Add **`PaidIntentCheckoutBanner`** to **`plans/page.tsx`** and/or app layout with dismiss/coexistence rules vs **`TrialBanner`** / **`OverLimitBanner`**.
- [ ] Design **calculator → app** field handoff (query params, short-lived server draft, or client carry) for **`investment-property-calculator`** entry.
- [ ] Replace Modeling/Mortgage **`/properties/new`** with **`/properties/new?mode=quick`** in zero-property empty states (or shared constant).
- [ ] Enable **`showCta`** (or equivalent) on homepage **`PublicCalculator`** with analytics placement consistent with SEO page.
- [ ] Update **`plan-intent.ts`** file header comment to describe **`forceRedirectUrl`** signup → quick-add accurately.
- [ ] Optional polish: revise signed-in dashboard empty-state “Analyze first” subtitle; optional trial one-liner on sign-in shell.

## Re-test checklist

- [ ] Verify paid-intent users see **exactly one** coherent upgrade lane after signup (**trial strip** + paid-intent nudge—not competing duplicate messaging).
- [ ] Smoke-test: Pricing **Investor** → signup → **`/properties/new?mode=quick`** → **`/plans`** / dashboard—**banner visibility** behaves as intended.
- [ ] After implementation: `npm run check`

## Next trigger and cadence

- **Trigger:** Changes to signup redirect, Clerk appearance, **`plan-intent`** persistence, **`/pricing`** or **`/plans`**, public calculators/trial duration, onboarding empty states—or **quarterly** review absent material changes.
- **Recommended next run:** **2026-07-29** (~quarterly) or alongside the next release touching auth/onboarding/billing funnel surfaces.
