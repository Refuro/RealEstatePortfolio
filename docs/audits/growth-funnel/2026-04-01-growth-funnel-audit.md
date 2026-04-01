# Growth Funnel & Activation Audit — 2026-04-01

## Executive summary

- The acquisition path (landing → pricing → sign-up with `?intent=` and `PlanIntentUrlSync`) and the post-auth path (dashboard → welcome modal → `/properties/new` → `?onboarding=first-property` next steps) are coherent, instrumented in key places, and aligned with `docs/policies/design-spec.md` for primary CTAs and pricing surfaces.
- Paid conversion is supported by in-app `Plans & billing` (`/plans`), Stripe checkout from `PricingCards`, `PaidIntentCheckoutBanner` for free-tier users who stored Investor/Pro intent, limit banners, and `BillingSuccessClearIntent` plus limit copy on `/billing/success`.
- Remaining gaps are mostly **friction, attribution, and messaging consistency**: setup-time claims differ across surfaces, the sign-in route does not sync `?intent=` like sign-up, some upgrade links skip `UpgradePlanLink`, and the welcome modal does not surface errors if onboarding PATCH fails.
- **Recommendation:** Treat the funnel as healthy for launch-scale traffic; prioritize small copy/analytics fixes and resilient onboarding feedback before broad paid acquisition spend.

---

## Severity-ranked findings

### Critical

- None identified. No evidence of broken checkout, missing upgrade surfaces for limit enforcement, or dead-end auth routes in the reviewed paths.

### High

- **Onboarding welcome flow has no error surface if PATCH fails** — Users who click “Maybe later” or “Add first property” depend on `PATCH /api/onboarding` (`app/app/(app)/onboarding-panel.tsx`). If the request fails, `next` is null, `setBusy(false)` runs, and there is no toast or inline error; the modal can remain with no state change, risking confusion and repeat clicks. Impact: first-session activation drop-off for flaky networks or API errors.

- **Alternative first actions on empty dashboard stay collapsed by default** — `app/app/(app)/dashboard/page.tsx` puts “Analyze a deal” and CSV import under `<details>` (“More ways to get started”). Users whose first value is deal analysis or import—not adding a property—must discover the disclosure. Impact: slower time-to-first-value for that segment.

### Medium

- **Inconsistent “time to get started” messaging** — Home hero trust chips say “Start in about 60 seconds” (`app/app/page.tsx`); the welcome modal says “Typical setup time: about 2 minutes” (`app/app/(app)/onboarding-panel.tsx`). Impact: minor trust friction; undermines a single promised expectation.

- **Sign-in route does not mount `PlanIntentUrlSync`** — Sign-up (`app/app/sign-up/[[...sign-up]]/sign-up-view.tsx`) syncs `?intent=` from the URL; sign-in (`app/app/sign-in/[[...sign-in]]/page.tsx`) does not. Impact: low-frequency loss of intent refresh for flows that deep-link to `/sign-in?intent=…` (e.g. email campaigns); parity gap with sign-up.

- **“Upgrade to save more” on Deals list uses a plain `Link` to `/plans`** — `app/app/(app)/deals/page.tsx` uses `<Link href="/plans">` when at deal limit, not `UpgradePlanLink`. Impact: `plan_limit_upgrade_cta_clicked` is not fired from this high-intent surface (unlike `OverLimitBanner` and many limit-error UIs that use `UpgradePlanLink`).

- **Welcome modal is one-size-fits-all** — Copy does not reflect Investor/Pro plan intent from `localStorage` / URL (contrast with `PaidIntentCheckoutBanner` and `PlanIntentSignUpReinforcement`). Impact: missed personalization for paid-intent users still on Free during activation.

### Low

- **Landing “Sign in” in `LandingNav` is not a `FunnelCtaLink`** — `app/components/landing-nav.tsx`: returning-user clicks are not emitted as `funnel_cta_clicked`. Impact: attribution gap for sign-in vs sign-up from marketing pages.

- **Public calculator path does not push account creation** — Home section links to full public calculator (`app/app/page.tsx`); no mandatory in-flow CTA to sign up after engagement. Impact: optional lost conversions from calculator-heavy visitors (acceptable product choice).

- **Social proof is minimal on landing and pricing** — Trust chips and screenshots; no testimonials or usage stats. Impact: objection handling relies on copy and FAQs alone (`app/app/pricing/page.tsx`).

---

## Evidence reviewed

- **Process / policy:** `docs/process/growth-funnel-audit-process.md`, `docs/process/audit-report-template.md`, `docs/policies/design-spec.md` (§1.1 audit surfaces), `docs/launch/posthog-growth-funnel.md`
- **Landing & marketing:** `app/app/page.tsx`, `app/components/landing-nav.tsx`, `app/components/marketing/funnel-cta-link.tsx`, `app/app/pricing/page.tsx`
- **Auth:** `app/app/sign-up/[[...sign-up]]/sign-up-view.tsx`, `app/components/analytics/plan-intent-url-sync.tsx`, `app/components/analytics/plan-intent-sign-up-reinforcement.tsx`, `app/app/sign-in/[[...sign-in]]/page.tsx`
- **Plan intent & growth components:** `app/lib/plan-intent.ts`, `app/components/growth/paid-intent-checkout-banner.tsx`, `app/components/growth/billing-success-clear-intent.tsx`
- **App shell & onboarding:** `app/app/(app)/layout.tsx`, `app/app/(app)/app-layout-client.tsx`, `app/app/(app)/onboarding-panel.tsx`, `app/app/api/onboarding/route.ts`, `app/lib/onboarding.ts`
- **Activation & core value:** `app/app/(app)/dashboard/page.tsx`, `app/app/(app)/properties/page.tsx`, `app/app/(app)/properties/add-property-wizard.tsx` (redirect with `onboarding=first-property`), `app/app/(app)/analyze/deal-analyzer-form.tsx` (empty portfolio compare block), `app/app/(app)/modeling/modeling-workspace.tsx`, `app/app/(app)/mortgage/mortgage-workspace.tsx`, `app/app/(app)/app-nav.tsx`
- **Paywall & upgrade:** `app/components/pricing-cards.tsx`, `app/app/(app)/plans/page.tsx`, `app/app/(app)/billing/success/page.tsx`, `app/app/(app)/components/over-limit-banner.tsx`, `app/app/(app)/components/past-due-banner.tsx`, `app/components/analytics/upgrade-plan-link.tsx`, `app/app/(app)/deals/page.tsx`
- **Analytics reference:** `app/lib/analytics-events.ts`, `app/lib/analytics-dedup.ts`

**Limits of this pass:** No production analytics or session replay was consulted; findings are from static review and documented behavior. Clerk-hosted UI behavior (e.g. social sign-in) was not exercised in a browser.

---

## Risk & impact assessment

- **Unresolved High items** affect **activation rate** (empty-state discoverability, silent onboarding failures) more than immediate revenue; exposure is **moderate** because many users will succeed on happy path.
- **Medium items** skew **measurement and message consistency**; business impact grows with paid ad volume and segmented campaigns.
- **Low items** are **optimization** tier unless the product positions heavily on social proof or calculator-led acquisition.

---

## Recommendations (prioritized)

1. **Harden onboarding PATCH UX** — On failure of `patchOnboarding`, show a non-blocking error (“Couldn’t save progress—check connection and try again”) and avoid closing the modal without confirmation; optionally retry once.
2. **Surface one secondary CTA above the fold on empty dashboard** — e.g. a single “Analyze a deal” outline button beside “Add your first property,” keeping CSV/import in `details` if space is tight.
3. **Unify setup-time messaging** — Pick one band (e.g. “about 2 minutes” or “under a minute for account + first step”) and apply to home chips, welcome modal, and pricing footer copy.
4. **Add `PlanIntentUrlSync` to sign-in** — Mirror sign-up for `?intent=` parity (small wrapper or shared layout fragment).
5. **Wrap Deals at-limit upgrade line with `UpgradePlanLink`** — Use placement `deals_header_at_limit` (or similar) for consistent `plan_limit_upgrade_cta_clicked` pairing with list behavior.

---

## Task candidates (optional)

- [ ] Add error/retry UX to `OnboardingPanel` when `/api/onboarding` PATCH fails
- [ ] Elevate “Analyze a deal” (or import) on dashboard empty state without relying on closed `<details>`
- [ ] Align hero, welcome modal, and pricing “minutes” copy across `page.tsx`, `onboarding-panel.tsx`, `pricing/page.tsx`
- [ ] Mount `PlanIntentUrlSync` on `sign-in/[[...sign-in]]/page.tsx` (or shared auth layout)
- [ ] Replace plain `Link` to `/plans` in `deals/page.tsx` at-limit block with `UpgradePlanLink`

---

## Re-test checklist

- [ ] Verify onboarding modal still completes and analytics fire after error-handling changes
- [ ] Verify empty dashboard layout on mobile and desktop
- [ ] `npm run check` (when code changes are made)

---

## Next trigger and cadence

- **Trigger:** Quarterly, after major pricing/onboarding changes, or before scaling paid acquisition
- **Recommended next run:** 2026-07-01 (or next major release touching `/plans`, sign-up, or dashboard empty state)

---

## Measurable hypotheses (for experiment backlog)

- **H1:** Showing one non-property primary action on empty dashboard increases `property_created` or `deal` engagement within 7 days without reducing first property adds.
- **H2:** Aligning setup time copy across landing and modal improves self-reported clarity (survey) or reduces support questions about “how long.”
- **H3:** `UpgradePlanLink` on Deals at-limit increases `plan_limit_upgrade_cta_clicked` from the Deals surface without hurting save rate.
