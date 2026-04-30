# Legal & Compliance Audit — 2026-04-29

**Disclaimer (required):** This report is a **practical product and documentation screening pass** only. It is **not legal advice**, **not a substitute for licensed counsel**, and **not a guarantee of compliance** in any jurisdiction. Meaningful legal decisions should be escalated to a qualified attorney. Findings below are evidence-based observations for triage, not definitive legal conclusions.

## Executive summary

- **Overall:** Privacy and Terms remain detailed on subprocessors, trials, billing links, and PostHog (including server-side capture independent of the cookie banner). The strongest **new** product-facing gap identified this pass is a **factual mismatch** between the `/pricing` FAQ (and JSON-LD sourced from it) and actual **property visibility under plan limits**. Previously flagged items—**US state privacy** breadth vs nationwide landlord positioning, **fixed support turnaround** on Contact, and **mobile pricing parity** for RentCast pool limits—still apply after re-read.
- **Top risks:** (1) **Pricing FAQ** claims users can view **all** existing properties when over limit; the properties experience shows **only up to the plan limit** (“Showing X of Y”). (2) **California / CPRA-style** disclosure gaps vs marketing that includes **California** and nationwide landlords. (3) **24 business-hour** reply promise on `/contact` without Terms/Privacy qualification.
- **Recommendation:** Fix FAQ and structured data to match product behavior before leaning on them for compliance or SEO; engage counsel on **US state privacy** and **support SLA** language prior to scaling paid acquisition.

## Severity-ranked findings

### Critical

- *None identified in this screening pass.*

### High

- **Pricing FAQ contradicts plan-limit behavior (structured data risk)** — `PRICING_FAQ` answers “What happens when I reach my property limit?” with “You can view all your existing properties but cannot add new ones…”. The properties list when over limit shows a subset and explains “Showing {visible} of {total} properties (plan limit)” / locked messaging after trial—users do **not** retain full visibility of every property without upgrading. Same FAQ drives **JSON-LD** on `/pricing`, so search surfaces may repeat the inaccurate claim. **Risk:** Misleading consumer disclosure and advertising-substantiation exposure. **Evidence:** `app/lib/marketing/pricing-faqs.ts`; `app/app/(app)/properties/page.tsx` (over-limit banner).

- **California / US state privacy gap vs nationwide positioning** — Privacy frames the product as US-focused and not EU-targeted but does **not** include **CPRA**-style or broader **US state** consumer privacy disclosures common for B2C SaaS. Marketing data and tools reference **California**. **Risk:** Diligence and resident-expectation gaps in covered states. **Evidence:** `app/app/privacy/page.tsx` (Overview); `app/lib/marketing/location-data.ts` (California entry).

- **Fixed support response commitment on Contact** — Copy promises replies within **24 business hours** (Mon–Fri, US time, holidays excluded). Terms and Privacy do **not** qualify this as aspirational or exclude liability for delays. **Risk:** Operational and dispute exposure if timing slips. **Evidence:** `app/app/contact/page.tsx`.

### Medium

- **Server-side PostHog tied to stable user ID without browser consent** — Privacy **discloses** this explicitly (good alignment). Some jurisdictions may still warrant **counsel-specific** analysis beyond this pass. **Evidence:** `app/app/privacy/page.tsx` (PostHog); `docs/launch/analytics.md`.

- **Pricing: mobile feature accordion omits hourly estimate pool** — Desktop table and footnote disclose **5 / 10 / 20** successful RentCast requests per hour by tier; mobile “Compare all features” list does **not** include that row. **Risk:** Material limit less visible on small screens. **Evidence:** `app/app/pricing/page.tsx`.

- **Policy updates: “continued use = acceptance”** — Privacy and Terms tie acceptance to continued use after posting updates. Counsel may recommend **additional notice** (email/in-app) for **material** privacy or billing changes. **Evidence:** `app/app/privacy/page.tsx`; `app/app/terms/page.tsx`.

- **Structured display prices vs live Stripe / JSON-LD** — Public price display and layout JSON-LD use env-driven defaults; divergence from Stripe without process creates **truth-in-pricing** risk in rich results. **Evidence:** `app/lib/pricing-display.ts`; prior pattern in `app/app/layout.tsx` / `app/components/pricing-cards.tsx` (confirm when editing).

### Low

- **Clerk cookie wording** — “Do not contain personally identifiable information by default” may be tightened to “authentication/session tokens” for precision under some privacy frameworks. **Evidence:** `app/app/privacy/page.tsx`.

- **Sentry client vs cookie banner** — `instrumentation-client.ts` initializes Sentry when `NEXT_PUBLIC_SENTRY_DSN` is set, **not** gated on optional analytics consent; Privacy **calls out** Sentry separately—aligned at disclosure level; classification remains counsel-dependent. **Evidence:** `app/instrumentation-client.ts`; `app/app/privacy/page.tsx`.

- **“Last updated” granularity** — Privacy: “April 9, 2026”; Terms: “April 2026.” Minor hygiene. **Evidence:** `app/app/privacy/page.tsx`; `app/app/terms/page.tsx`.

## Evidence reviewed

- **Legal / marketing surfaces (read-only):** `app/app/privacy/page.tsx`, `app/app/terms/page.tsx`, `app/app/pricing/page.tsx`, `app/app/contact/page.tsx`, `app/app/page.tsx` (trial/value props), `app/components/footer.tsx`, `app/components/legal/support-contact-instructions.tsx`, `app/lib/marketing/pricing-faqs.ts`, `app/app/(app)/properties/page.tsx` (plan-limit UX).
- **Consent & analytics:** `app/components/analytics/posthog-provider.tsx`, `app/components/analytics/posthog-page-view.tsx`, `app/components/consent/cookie-consent-provider.tsx`, `app/instrumentation-client.ts`.
- **Supporting docs:** `docs/launch/analytics.md`, `docs/setup/manual-steps.md`, `docs/security/security-notes.md`.
- **Assumptions / limits:** No jurisdiction-specific legal research; no review of executed DPAs, corporate formation, or insurance; Stripe Dashboard and production env not inspected live.

## Risk & impact assessment

- **Business impact:** Incorrect **FAQ / schema** copy undermines trust and can amplify disputes **about access** to stored portfolio data. **State privacy** and **support SLA** gaps scale with traffic and paid acquisition.
- **Likelihood:** Nationwide positioning makes California and other **US state** residents plausible users; FAQ mismatch is **deterministic** whenever users exceed tier limits.

## Recommendations (prioritized)

1. **Correct pricing FAQ and JSON-LD** to describe actual behavior at limits (partial visibility / upgrade to see all, consistent with UI and Terms intent)—then validate structured data in Search Console.
2. **Engage counsel** on **US state** privacy notices (at least **CPRA** if California residents are in scope) and reconciliation with the EU non-targeting statement.
3. **Soften or qualify** Contact SLA (“aim,” “typically,” or Terms linkage with **best efforts**) after counsel review.

## Task candidates (optional)

- [ ] Rewrite **`PRICING_FAQ`** limit answer and verify **`CalculatorFaqJsonLd`** parity with visible FAQ on `/pricing`.
- [ ] Add **California / US state privacy** sections per counsel-approved template.
- [ ] Revise **Contact** copy (and optionally Terms) for support timing expectations.
- [ ] Add **hourly estimate pool** row to **`/pricing` mobile** comparison accordion.

## Re-test checklist

- [ ] Confirm FAQ / JSON-LD match properties list behavior for Free, Investor, Pro, and post-trial states.
- [ ] Mobile viewport spot-check **`/pricing`** for material limits.
- [ ] After copy changes: counsel sign-off on privacy/terms deltas; `npm run check` when app code changes.

## Next trigger and cadence

- **Trigger:** Pre-launch scaling, material analytics/subprocessor changes, or pricing/plan limit changes.
- **Recommended next window:** Within **one quarter** or **before** large paid marketing pushes—whichever comes first.
