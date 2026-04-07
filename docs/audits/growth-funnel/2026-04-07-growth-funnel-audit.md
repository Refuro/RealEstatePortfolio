# Growth Funnel & Activation Audit — 2026-04-07

## Executive summary

- **Acquisition surfaces** (landing, pricing) are instrumented with `FunnelCtaLink`, embed calculators, and clear plan framing, but the hero and pricing copy still **promise sub‑minute setup** while the in-product wizard and onboarding modal correctly frame **~5 minutes** — a trust gap at the top of the funnel.
- **Activation** improved since the last pass: dismissing the welcome modal is no longer a permanent dead end; a **7‑day snooze** then surfaces a **re-engagement strip** with an “Add property” CTA (`onboarding-panel.tsx`). The welcome modal itself now sets honest timing expectations.
- **Third-party social proof** (testimonials, counts, press) is still absent; the “social proof strip” remains **product positioning**, not evidence — a primary cold-traffic conversion risk for a financial product.
- **Measurement gaps** persist: dashboard empty-state links are plain `<Link>` (no funnel events), `user_signed_up` is **client + localStorage** only, and `WIZARD_ABANDONED` still lacks **step context** and relies on `beforeunload` (weak on mobile). Onboarding emails use branded **HTML** but CTA URLs omit **UTM** parameters for attribution.

---

## Severity-ranked findings

### Critical

- **No authentic social proof on marketing surfaces** — Cold visitors see feature-style claims, not user evidence. The landing strip (`app/app/page.tsx`, section `aria-label="Product highlights"`, ~lines 311–348) lists “Built for landlords with 1–10 properties”, “Track your portfolio…”, “Free plan — no card required”. There are no testimonials, ratings, usage counts, or external credibility on the landing or public pricing flow. **Risk:** Low trust → lower signup conversion for a product that handles financial data.

### High

- **“60 seconds” / “under a minute” claims conflict with real setup** — Hero subcopy (`app/app/page.tsx`, ~257–258): “Your first property in about 60 seconds.” Free-plan public feature line (`app/components/pricing-cards.tsx`, `publicFeatures[0]`): “Set up your first property dashboard in about 60 seconds.” Pricing page footer (`app/app/pricing/page.tsx`, ~296): “Your first property in under a minute.” The onboarding modal (`app/app/(app)/onboarding-panel.tsx`, ~271–273) correctly says ~5 minutes. **Risk:** Users feel misled entering the wizard, increasing abandonment and support doubt.

- **Sign-up page is thin for most traffic** — `app/app/sign-up/[[...sign-up]]/sign-up-view.tsx` wraps Clerk `<SignUp>` with trial/legal copy only. `PlanIntentSignUpReinforcement` (`app/components/analytics/plan-intent-sign-up-reinforcement.tsx`) renders **only** for `?intent=investor` or `?intent=pro`. Users arriving without that param get **no** Veld value recap at the highest-friction step.

- **`user_signed_up` is fragile** — `PostHogSignupOnce` (`app/components/analytics/posthog-signup-once.tsx`) fires from the browser with a **7-day window** and **localStorage** dedupe. New users do get `TRIAL_STARTED` server-side on first DB user creation (`app/lib/auth.ts`, `captureServerEvent` ~60–63), but the **named signup funnel event** is not guaranteed to match Clerk reality across devices or storage clears.

- **Dashboard empty-state CTAs are untracked** — With zero properties, `app/app/(app)/dashboard/page.tsx` (~126–153) uses plain `<Link>` for “Add your first property”, “Analyze a deal first”, and “Import from a spreadsheet”. No `FunnelCtaLink` / `captureClientEvent`. **Risk:** Cannot measure activation intent from the most visible post-login surface.

- **Wizard abandonment analytics lack diagnostic power** — `app/app/(app)/draft-context.tsx` (~272–277) fires `WIZARD_ABANDONED` with `{ has_draft: true }` only on `beforeunload`. `registerWizardGetStep` exists but is **not** used in the unload handler. **Risk:** No step-level funnel; mobile Safari often suppresses `beforeunload`, undercounting drop-off.

### Medium

- **Billing success page underuses the conversion moment** — `app/app/(app)/billing/success/page.tsx` confirms the plan and limits (improved vs. a bare “thanks”) but primary actions remain generic “Go to dashboard” / “Settings”. **Missed opportunity:** explicit next step (“Add a property — you’re covered up to N”) with tracked CTA for new payers.

- **Onboarding email CTAs lack UTM/query attribution** — `app/lib/emails/onboarding-reengagement.ts` builds CTA URLs as `${baseUrl}/properties/new?mode=quick` for Day 3 and Day 7 (text + HTML). No `utm_source` / `utm_campaign`. Server cron logs `ONBOARDING_EMAIL_SENT` (`app/app/api/cron/onboarding-emails/route.ts`) but **click-to-activation** paths are hard to tie in analytics.

- **No lifecycle touch after Day 7 onboarding email** — Cron sends only Day 3 and Day 7 variants to users with **no properties** (`onboarding-emails/route.ts`). After Day 7, inactive zero-property users rely on product discovery only.

- **Pricing page signup CTA is deep on the page** — For logged-out visitors, the tracked `FunnelCtaLink` “Start your free trial” lives in the **footer card** (`app/app/pricing/page.tsx`, ~291–347), after mockups and FAQ-style content. On mobile, decisive users may scroll a long way to convert.

- **Paid-intent checkout banner** — `PaidIntentCheckoutBanner` (referenced from `dashboard/page.tsx`) still uses a **14-day localStorage dismiss** with limited alternate surfacing to `/plans` (pattern unchanged from prior audits; worth validating copy and recovery paths in growth backlog).

### Low

- **Post-first-property and multi-property nudges** — Dashboard links for upsell / “add another” paths (beyond empty state) should be checked for consistent funnel instrumentation when prioritizing analytics hygiene.

- **`SUBSCRIPTION_ACTIVATED` dependency** — Still primarily webhook-driven; billing success page does not emit a client-side confirmation event with dedupe (resilience gap if webhooks lag).

---

## Evidence reviewed

- `app/app/page.tsx` — Hero, social proof strip, calculators, pricing preview, `FunnelCtaLink` usage, “60 seconds” copy
- `app/app/pricing/page.tsx` — Plans, FAQ, mockups, footer CTA, “under a minute” copy
- `app/components/pricing-cards.tsx` — Public plan features including “60 seconds”
- `app/app/sign-up/[[...sign-up]]/sign-up-view.tsx` — Clerk signup shell
- `app/components/analytics/plan-intent-sign-up-reinforcement.tsx` — Intent-gated reinforcement
- `app/components/analytics/posthog-signup-once.tsx` — `USER_SIGNED_UP` client firing
- `app/lib/auth.ts` — First-time user creation, `TRIAL_STARTED` server event
- `app/app/(app)/onboarding-panel.tsx` — Welcome modal, 7-day snooze, re-engagement strip
- `app/app/api/onboarding/route.ts` — Onboarding PATCH actions
- `app/app/(app)/dashboard/page.tsx` — Empty state, `PaidIntentCheckoutBanner`, post-property messaging
- `app/app/(app)/draft-context.tsx` — Wizard draft restore, `WIZARD_ABANDONED`
- `app/lib/emails/onboarding-reengagement.ts` — Day 3 / Day 7 HTML + text, CTA URLs
- `app/app/api/cron/onboarding-emails/route.ts` — Send windows, PostHog `ONBOARDING_EMAIL_SENT`
- `app/app/(app)/billing/success/page.tsx` — Post-checkout confirmation
- `app/lib/analytics-events.ts` — Event names (spot-checked)
- `docs/policies/design-spec.md`, `docs/reference/roadmap.md` — Reference per process (design/roadmap alignment)
- Prior lane context: `docs/audits/growth-funnel/2026-04-05-growth-funnel-audit.md` (delta: snooze strip + HTML emails + billing copy)

**Assumptions / limits:** Static code review only; no live PostHog funnels, Clerk metrics, or session replay. No changes were made under `app/`.

---

## Risk & impact assessment

**Critical (social proof):** Directly caps cold-traffic conversion; compounds weak sign-up reinforcement.

**High (time claims, signup UX, analytics):** Misaligned time promises damage trust at wizard entry; untracked empty-state CTAs and coarse wizard abandonment block data-driven optimization; fragile `user_signed_up` skews funnel reporting.

**Medium (billing success, email UTM, deep pricing CTA, post–Day 7 silence):** Revenue and re-activation leakage rather than total funnel failure; still meaningful for growth experiments.

---

## Recommendations (prioritized)

1. **Add minimal real social proof** to the landing strip location (`app/app/page.tsx`): e.g. one quote, a beta count, or “landlords in X states” if defensible. Replace or supplement feature bullets with **evidence**.

2. **Align all public “time to first property” claims** with quick-add reality (~2–5 minutes) across hero, `pricing-cards.tsx`, and pricing footer — match onboarding modal language.

3. **Enrich the sign-up view** with a split layout or bullet recap for **all** visitors (not only `intent=investor|pro`), reusing existing value props from marketing.

4. **Instrument empty-state and re-engagement strip CTAs** with `FunnelCtaLink` or `captureClientEvent` so activation attempts are measurable end-to-end.

5. **Extend `WIZARD_ABANDONED`** with `step` from `wizardGetStepRef` and add a non-`beforeunload` path (e.g. visibility change / route change) for mobile reliability.

6. **Append UTM parameters** to onboarding email CTA URLs (`onboarding-reengagement.ts`) for `day3` / `day7` campaigns.

7. **Upgrade billing success** to a primary “Add your first property” (or “Invite team” if applicable) CTA with plan limits repeated, plus optional celebration microcopy.

---

## Task candidates

- [ ] Replace landing “social proof” strip with at least one evidence-based element + keep accessibility/structure
- [ ] Unify “first property” time claims across `page.tsx`, `pricing-cards.tsx`, `pricing/page.tsx`
- [ ] Add sign-up page value column or header for default (no intent) traffic
- [ ] Wire dashboard empty-state links (and onboarding strip `Link`) to funnel analytics
- [ ] Add `step` + mobile-safe abandonment signal in `draft-context.tsx` / wizard
- [ ] Add UTM query params to onboarding email CTA URLs
- [ ] Add activation-forward primary CTA on `billing/success/page.tsx`

---

## Re-test checklist

- [ ] Verify social proof and time-claim copy on staging marketing pages
- [ ] Verify PostHog receives events from empty-state CTAs after instrumentation
- [ ] Verify wizard abandonment includes step in test sessions
- [ ] Verify email links carry UTM and parse in analytics
- [ ] `npm run check` (when code changes are made)

---

## Next trigger and cadence

- **Trigger:** Monthly or after any major change to signup, onboarding, pricing, or billing flows
- **Recommended next run:** 2026-05-07 (or next release touching growth surfaces)
