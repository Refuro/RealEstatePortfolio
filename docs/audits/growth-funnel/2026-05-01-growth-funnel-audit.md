# Growth Funnel & Activation Audit — 2026-05-01

## Executive summary

- **Overall health:** Acquisition CTAs are consistent and measurable on the homepage and pricing footer (`FunnelCtaLink` + deduped `funnel_cta_clicked`), signup continuity is strong (`forceRedirectUrl` to `/properties/new?mode=quick`), and onboarding UX avoids stacking a welcome modal on top of that first-run flow. Server-side **`trial_started`** on first `User` creation gives a durable backend funnel anchor independent of browser state.
- **Top risks:** PostHog **person-level** signals (`PostHogIdentify`, `PostHogSignupOnce` / **`user_signed_up`**, `PostHogSigninOnce` / **`user_signed_in`**, `PostHogPlanIntent` / **`plan_intent_applied`**) mount only after **optional analytics consent**, while anonymous **`$pageview`** and generic **`captureClientEvent`** traffic still fires in memory mode—so dashboards that assume a single stitched visitor from landing → signup will under-count or fracture for users who defer or reject optional cookies. Paid card CTAs on `PricingCards` likewise skip **`funnel_cta_clicked`**, weakening placement attribution versus marketing surfaces that use **`FunnelCtaLink`**.
- **Recommendation:** Treat **server `trial_started` + Clerk ID** (and DB counts) as the canonical signup cohort when QA-ing funnels; on the product side, either accept the privacy-aligned split intentionally or introduce **consent-independent, essential-only** aggregated funnel beacons—without weakening the banner’s stated guarantees—if leadership needs tighter client-side signup stitching.

Permanent deferrals from `docs/process/growth-funnel-audit-process.md` §5 (e.g. **GRW-1** mobile compare parity) were **not** resurrected.

## Severity-ranked findings

### Critical

- *(None identified on this pass.)*

### High

- *(None escalated.)* No evidence of broken signup redirect, silent loss of Clerk session continuity, or a hard blocker on the documented first-property path; remaining issues are instrumentation and attribution depth, not end-user deadlock.

### Medium

- **Consent-gated identity vs anonymous capture (measurement fracture)** — `PostHogGate` initializes PostHog in memory/anonymous mode for all visitors but mounts **`PostHogIdentify`**, **`PostHogSignupOnce`**, **`PostHogSigninOnce`**, and **`PostHogPlanIntent`** only when `hasAnalyticsConsent` is true (`app/components/analytics/posthog-provider.tsx`). The cookie banner states optional scripts load **after acceptance** (`app/components/consent/cookie-consent-banner.tsx`). **`GoogleAdsGtagClient`** also loads only after consent (`app/components/analytics/google-ads-gtag.tsx`), aligning **`GoogleAdsSignupConversion`** behavior with **`gtag`** availability (`app/components/analytics/google-ads-signup-conversion.tsx`). **Impact:** Returning-user **`user_signed_in`**, onboarding super-properties **`plan_intent`**, **`user_signed_up`**, and Google Ads signup conversions systematically miss users who reject optional analytics—expect funnels built only on client “identified” paths to diverge from **`trial_started`** (`lib/auth.ts` via `captureServerEvent`).

- **Pricing grid CTAs omit `funnel_cta_clicked` (lost placement attribution)** — Logged-out **Choose Free / Investor / Pro** actions use `<Link>` with inline **`setPlanIntent`** instead of **`FunnelCtaLink`** (`app/components/pricing-cards.tsx`). Footer and hero paths on `/pricing` do use **`FunnelCtaLink`** (`app/app/pricing/page.tsx`). **Impact:** Cannot compare card-click vs footer-click conversion intensity using the deduped `placement` taxonomy used elsewhere (`app/components/marketing/funnel-cta-link.tsx`).

- **`wizard_abandoned` fires only on `beforeunload` with draft** — `DraftContext` sends **`AnalyticsEvents.WIZARD_ABANDONED`** only when **`pathname === "/properties/new"`**, **`hasDraftRef.current`**, and the browser fires **`beforeunload`** (`app/app/(app)/draft-context.tsx`). SPA navigation away without unload, or abandonment without persisted draft state, generates no event. **Impact:** Underestimates wizard drop-off versus completion events (`PROPERTY_CREATED`, `PROPERTY_QUICK_ADD_COMPLETED`, milestones in **`add-property-wizard.tsx`** per grep alignment with `analytics-events.ts`).

### Low

- **Untracked secondary calculator links on the homepage** — Under the hero calculator block, **`CALCULATOR_LINKS`** render as plain **`<Link>`** without **`FunnelCtaLink`** (`app/app/page.tsx`). Primary “Open full calculator” and “Create a free account” paths are tracked. **Impact:** Weaker insight into which calculator entry points seed later signup.

- **Nav exploratory links untracked** — **Pricing**, **Calculators**, **Guides**, etc. in **`LandingNav`** use plain **`<Link>`**; only the **Sign up** control uses **`FunnelCtaLink`** (`app/components/landing-nav.tsx`). **Impact:** Expected trade-off; limits path analysis for non-CTA navigation.

- **Copy emphasis varies between “Free plan” and “trial”** — Hero subcopy highlights **Free plan / no card** (`app/app/page.tsx`); bottom CTA stresses **14-day Investor access** (`app/app/page.tsx`). Signup view combines both messages (`app/app/sign-up/[[...sign-up]]/sign-up-view.tsx`). **Impact:** Minor cognitive load, not a functional defect.

## Evidence reviewed

- Process: `docs/process/growth-funnel-audit-process.md` (scope, dimensions, output path, §5 deferrals).
- Template: `docs/process/audit-report-template.md`.
- Landing & conversion: `app/app/page.tsx` (hero, calculator, pricing preview, bottom CTA, `PlanIntentUrlSync`).
- Marketing CTA primitive: `app/components/marketing/funnel-cta-link.tsx`.
- Navigation: `app/components/landing-nav.tsx`.
- Pricing: `app/app/pricing/page.tsx`, `app/components/pricing-cards.tsx`, `lib/marketing/pricing-compare-rows.ts`.
- Auth & continuity: `app/app/sign-up/[[...sign-up]]/sign-up-view.tsx`, `app/app/sign-in/[[...sign-in]]/sign-in-view.tsx`, `app/components/analytics/plan-intent-url-sync.tsx`, `app/components/analytics/plan-intent-sign-up-reinforcement.tsx`, `app/components/analytics/posthog-auth-page-view.tsx`.
- Onboarding: `app/app/(app)/onboarding-panel.tsx`, mount in `app/app/(app)/app-layout-client.tsx`.
- Consent & analytics shell: `app/app/layout.tsx`, `app/components/consent/cookie-consent-provider.tsx`, `app/components/consent/cookie-consent-banner.tsx`, `app/components/analytics/posthog-provider.tsx`, `app/components/analytics/posthog-page-view.tsx`, `app/components/analytics/posthog-signup-once.tsx`, `app/components/analytics/posthog-signin-once.tsx`, `app/components/analytics/posthog-plan-intent.tsx`, `app/lib/analytics-client.ts`, `app/lib/analytics-events.ts`, `app/lib/posthog-server.ts`, `app/lib/auth.ts` (`trial_started`), `app/components/analytics/google-ads-gtag.tsx`, `app/components/analytics/google-ads-signup-conversion.tsx`.
- Wizard / draft: `app/app/(app)/draft-context.tsx` (abandon).
- In-app upgrade surface (sample): `app/app/(app)/plans/page.tsx`.

**Assumptions / limits:** Read-only review of source; no live browser session, no PostHog project query, no production funnel SQL. Clerk environment-specific edge cases (SSO, enterprise) not exercised.

## Risk & impact assessment

Unaddressed **Medium** items skew growth reporting and A/B readouts more than they damage sign-up completion: product behavior remains coherent, but marketing and PM may mis-prioritize channels or screens if funnels ignore consent splits and untracked pricing-card clicks. **Low** items are incremental observability gains.

## Recommendations (prioritized)

1. **Align funnel dashboards with reality:** Build primary signup / activation reports using **`trial_started`** (server, Clerk `distinctId`) and SQL property counts, and label client-only funnels as “consent-enriched” where **`PostHogIdentify`** is a precondition.
2. **Close the pricing attribution gap:** Standardize logged-out plan selection clicks on **`FunnelCtaLink`** (or an equivalent single helper) so **`placement: "pricing_cards"`** (or per-card ids) appears alongside **`setPlanIntent`**.
3. **Broaden wizard drop-off signal (hypothesis-driven):** Add an explicit “leave wizard” or route-change handler event (debounced) if product wants parity with **`beforeunload`**-only abandon signal.
4. **Optional copy pass:** Harmonize “free vs trial” language so hero, pricing, and signup subcopy tell one tight story (still accurate: trial on new accounts, free tier thereafter).

## Task candidates (optional)

- [ ] Wrap **`PricingCards`** logged-out **Choose Free / Investor / Pro** links with **`FunnelCtaLink`** (or shared tracking wrapper) while preserving **`setPlanIntent`** behavior — files: `app/components/pricing-cards.tsx`.
- [ ] Document in internal analytics runbook: **which events require optional consent** vs **memory-only / server** — files: `app/components/analytics/posthog-provider.tsx`, `app/lib/posthog-server.ts`, `app/lib/auth.ts`.
- [ ] Add **`FunnelCtaLink`** (or placement-specific ids) to homepage **`CALCULATOR_LINKS`** — file: `app/app/page.tsx`.
- [ ] Instrument wizard exit on in-app navigation (not only **`beforeunload`**) — files: `app/app/(app)/draft-context.tsx`, possibly `app/app/(app)/properties/add-property-wizard.tsx`.

## Re-test checklist

- [ ] After any instrumentation change: verify **`funnel_cta_clicked`** dedup keys do not double-fire on rapid double-clicks (`funnel-cta-link.tsx` session dedup).
- [ ] Verify signup still lands on **`/properties/new?mode=quick`** and onboarding modal does not overlay the wizard (`sign-up-view.tsx`, `onboarding-panel.tsx`).
- [ ] `npm run check` (when code changes are made).

## Next trigger and cadence

- **Trigger:** Full audit run **2026-05-01** (this document); next run on material marketing/auth/pricing changes or monthly growth review.
- **Recommended next window:** **2026-06-01** or next major pricing / onboarding experiment.
