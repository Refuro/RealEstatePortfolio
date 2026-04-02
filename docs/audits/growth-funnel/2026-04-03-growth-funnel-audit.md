# Growth Funnel & Activation Audit — 2026-04-03

## Executive summary

- **Acquisition and intent plumbing are strong:** Marketing routes mount `PlanIntentUrlSync` (plan intent + UTM), sign-up uses Clerk with `PlanIntentUrlSync` / reinforcement for paid intents, and `FunnelCtaLink` emits deduped `funnel_cta_clicked` with optional `setPlanIntent`. PostHog event names are centralized in `app/lib/analytics-events.ts` with documented dedup in `docs/launch/analytics.md`.
- **Remaining gaps are mostly instrumentation and parity:** Plain `<Link>` paths (nav “Sign in”, public calculator body copy, deals **at-limit** upgrade line, paid-intent banner, competitor **secondary** pricing links) do not emit `funnel_cta_clicked` or `plan_limit_upgrade_cta_clicked`, which weakens funnel attribution vs tracked surfaces.
- **`/sign-in` still lacks `PlanIntentUrlSync`:** Campaigns that deep-link `/sign-in?intent=…` do not get the same URL → `localStorage` sync as marketing pages and sign-up (`app/app/sign-in/[[...sign-in]]/page.tsx`).
- **Activation UX:** Empty dashboard and properties list give clear “add property” paths; onboarding welcome modal instruments `onboarding_step_completed` but **fails silently** if the onboarding PATCH returns non-OK—risk of stuck modal with no feedback.

## Severity-ranked findings

### Critical

- None observed in this pass. Core paths (landing → pricing → sign-up, first property, upgrade via `PricingCards` / `UpgradePlanLink` on over-limit) are coherent.

### High

- **Onboarding API failure is invisible to the user** — `patchOnboarding` returns `null` when `!res.ok` and `handleWelcome` does not surface an error; the user can remain on a blocking welcome modal with no retry guidance. — `app/app/(app)/onboarding-panel.tsx` (`patchOnboarding`, `handleWelcome`).

- **Deals list “at limit” upgrade uses a plain `Link` to `/plans`** — When `atLimit` is true, “Upgrade to save more” is a standard link without `UpgradePlanLink`, so **`plan_limit_upgrade_cta_clicked` does not fire** for that high-intent click, while the **over-limit** notice uses `UpgradePlanLink` (`placement="deals_list_over_limit"`). — `app/app/(app)/deals/page.tsx` (lines 73–80 vs 93–101).

- **`/sign-in` does not mount `PlanIntentUrlSync`** — Sign-up view syncs URL intent (`app/app/sign-up/[[...sign-up]]/sign-up-view.tsx`); sign-in page is Clerk-only with no sync component. **Impact:** `?intent=` / UTM on sign-in URLs are not processed the same way as on marketing pages—campaign parity gap for returning users. — `app/app/sign-in/[[...sign-in]]/page.tsx`.

### Medium

- **Public investment-property calculator: inline “create a free account” is not a `FunnelCtaLink`** — Body copy uses `<Link href="/sign-up?intent=free">` so URL intent can still apply on the sign-up route, but **no `funnel_cta_clicked`** and **no `setPlanIntent(..., "landing_cta")`** on click (unlike nav, hero, pricing footer, LP variant). — `app/app/investment-property-calculator/page.tsx` (approx. lines 70–73).

- **Competitor / alternative pages: primary signup CTAs omit `planIntent` and use `href="/sign-up"` without `?intent=`** — `FunnelCtaLink` fires for placements like `competitor_alt_hero`, but **no `planIntent` prop** (contrast `landing_nav`, `pricing_footer`). New sessions that only touch this funnel may resolve **`plan_intent` / source less consistently** than pricing- or home-driven flows. — `app/components/marketing/competitor-alternative-page.tsx` (e.g. lines 74–82, 145–153, 242–250).

- **Competitor pages: multiple “View pricing” / “See full pricing” links are plain `<Link href="/pricing">`** — No `funnel_cta_clicked` for secondary funnel steps (hero, footer, aside). — `app/components/marketing/competitor-alternative-page.tsx` (e.g. lines 83–88, 132–136, 204–207, 251–256).

- **`PaidIntentCheckoutBanner` “View plans” is a plain `Link` to `/plans`** — No `FunnelCtaLink` or dedicated upgrade event; post-signup paid-intent nudges are harder to isolate in the same taxonomy as `funnel_cta_clicked` / checkout events. — `app/components/growth/paid-intent-checkout-banner.tsx` (lines 76–80).

- **Marketing nav “Sign in” is not instrumented as a funnel CTA** — Only “Sign up” uses `FunnelCtaLink` (`placement="landing_nav"`). Returning users are invisible to `funnel_cta_clicked` from nav. — `app/components/landing-nav.tsx` (lines 88–107).

### Low

- **Time-to-value copy mismatch** — Home hero subcopy says first property in **about 60 seconds** (`app/app/page.tsx` ~182–183); welcome modal says **about 2 minutes** (`app/app/(app)/onboarding-panel.tsx` ~116). Minor trust friction for careful readers.

- **Logged-in home hero uses plain links** — “Go to dashboard” and “View pricing plans” are standard `Link`s (no `funnel_cta_clicked`). Low severity because these users are already activated; relevant only if you track returning sessions on `/` as a funnel.

- **PostHog client is consent-gated** — `PostHogGate` only initializes after analytics consent (`app/components/analytics/posthog-provider.tsx`). Funnel metrics undercount users who never accept optional cookies; server-side events (e.g. Stripe) still flow. Aligns with `docs/launch/analytics.md`.

- **Tools hub (`/tools`) has no primary signup CTA** — Intentional SEO/education positioning; `PlanIntentUrlSync` is present (`app/app/tools/page.tsx`). Conversion relies on nav/footer or calculator pages.

## Evidence reviewed

- Process: `docs/process/growth-funnel-audit-process.md`, `docs/process/audit-report-template.md`
- Reference: `docs/launch/analytics.md`, `docs/launch/posthog-growth-funnel.md` (cited in repo; not re-read line-by-line in this pass)
- Sign-up / sign-in: `app/app/sign-up/[[...sign-up]]/sign-up-view.tsx`, `app/app/sign-in/[[...sign-in]]/page.tsx`, `app/components/analytics/plan-intent-sign-up-reinforcement.tsx`
- Plan intent & sync: `app/components/analytics/plan-intent-url-sync.tsx`, `app/lib/plan-intent.ts` (referenced via sync component)
- Landing & pricing: `app/app/page.tsx`, `app/app/pricing/page.tsx`, `app/components/landing-nav.tsx`
- Funnel CTAs: `app/components/marketing/funnel-cta-link.tsx`, `app/components/marketing/competitor-alternative-page.tsx`, `app/app/investment-property-calculator/page.tsx`
- Onboarding & empty states: `app/app/(app)/onboarding-panel.tsx`, `app/app/(app)/dashboard/page.tsx`, `app/app/(app)/properties/page.tsx`, `app/app/(app)/deals/deals-list.tsx` (empty copy), `app/app/(app)/modeling/modeling-workspace.tsx`
- Upgrade & limits: `app/components/analytics/upgrade-plan-link.tsx`, `app/app/(app)/deals/page.tsx`, `app/components/growth/paid-intent-checkout-banner.tsx`, `app/components/pricing-cards.tsx` (checkout/portal events)
- Events catalog: `app/lib/analytics-events.ts`; PostHog wiring: `app/components/analytics/posthog-provider.tsx`, `posthog-signup-once.tsx`, `posthog-plan-intent.tsx`

**Limits:** Static code review only; no browser session or PostHog live verification. Prior audit markdown files under `docs/audits/growth-funnel/` were not used as evidence—this pass re-checked sources above.

## Risk & impact assessment

- **Unresolved high items** affect **trust** (silent onboarding failure), **measurement** (at-limit upgrade clicks invisible next to over-limit), and **campaign attribution** (sign-in without URL sync)—moderate business risk for optimization and support, not usually hard launch blockers for core signup/checkout.
- **Medium items** skew **funnel dashboards** and **plan_intent** resolution for SEO/alternative landing segments unless compensated by URL params or prior sessions.
- **Exposure:** Alternative and calculator pages are high-intent SEO/GTM surfaces; measurement gaps there matter most when scaling paid or organic top-of-funnel.

## Recommendations (prioritized)

1. **Fix onboarding PATCH failure UX** — On non-OK response, show inline error, keep buttons enabled for retry, and optionally log to Sentry; prevents users from being stuck on an opaque welcome modal.
2. **Unify deals upgrade instrumentation** — Use `UpgradePlanLink` (or shared capture) for the at-limit “Upgrade to save more” path so `plan_limit_upgrade_cta_clicked` aligns with over-limit and analyzer upgrade surfaces.
3. **Mount `PlanIntentUrlSync` on `/sign-in`** (e.g. `Suspense` boundary mirroring other public routes) for `?intent=` / UTM parity with sign-up and marketing pages.
4. **Wrap high-readership plain links** — Prioritize `investment-property-calculator` inline sign-up (`FunnelCtaLink` + `planIntent="free"`), competitor secondary pricing CTAs (distinct `placement`/`cta_id`), and `PaidIntentCheckoutBanner` “View plans” (tracked upgrade intent), per existing patterns in `funnel-cta-link.tsx` / `upgrade-plan-link.tsx`.
5. **Optional: `planIntent="free"` + `href="/sign-up?intent=free"` on competitor primary CTAs** — Aligns `plan_intent_source` with other acquisition paths.

## Task candidates (optional)

- [ ] Onboarding: user-visible error + retry when `PATCH /api/onboarding` fails (`onboarding-panel.tsx`)
- [ ] Deals page: replace at-limit plain `/plans` link with `UpgradePlanLink` and a distinct `placement` (e.g. `deals_list_at_limit`)
- [ ] Sign-in page: add `PlanIntentUrlSync` inside `Suspense` (and verify Clerk + client-only hooks)
- [ ] `investment-property-calculator/page.tsx`: `FunnelCtaLink` for “create a free account” with `placement` such as `public_calc_body`
- [ ] `competitor-alternative-page.tsx`: add `planIntent="free"` to primary `FunnelCtaLink`s and/or `?intent=free` on `href`; optionally `FunnelCtaLink` for “View pricing” with unique `placement`s
- [ ] `paid-intent-checkout-banner.tsx`: tracked navigation to `/plans` (reuse `UpgradePlanLink` or `captureClientEvent` with a dedicated placement)
- [ ] Align hero “60 seconds” vs modal “2 minutes” copy (`page.tsx`, `onboarding-panel.tsx`)

## Re-test checklist

- [ ] Verify onboarding error state after simulating 4xx/5xx on `PATCH /api/onboarding`
- [ ] Verify `plan_limit_upgrade_cta_clicked` fires when at-limit user clicks “Upgrade to save more” on deals
- [ ] After adding sign-in sync, verify `?intent=` on `/sign-in` updates stored intent before Clerk completes
- [ ] Spot-check PostHog: `funnel_cta_clicked` for new calculator / competitor placements after instrumentation
- [ ] `npm run check` (when code changes are made)

## Next trigger and cadence

- **Trigger:** After material marketing or auth route changes, or quarterly funnel review
- **Recommended next run:** Within one month of any shipped change to `FunnelCtaLink`, auth routes, or pricing/checkout flows
