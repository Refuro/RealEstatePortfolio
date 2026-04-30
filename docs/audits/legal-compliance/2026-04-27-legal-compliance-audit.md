# Legal & Compliance Audit — 2026-04-27

**Disclaimer (required):** This report is a **practical product and documentation screening pass** only. It is **not legal advice**, **not a substitute for licensed counsel**, and **not a guarantee of compliance** in any jurisdiction. Meaningful legal decisions should be escalated to a qualified attorney. Findings below are evidence-based observations for triage, not definitive legal conclusions.

## Executive summary

- **Overall:** App-facing privacy, terms, cookie banner, and billing links are largely **aligned** with documented behavior (PostHog anonymous client mode, optional Vercel/Google tags, server-side PostHog, Stripe path, third-party list). Several **gaps** warrant counsel or product-legal review, especially **US state privacy (e.g. California)** and **firm support SLAs** on marketing surfaces.
- **Top risks:** (1) Privacy policy is **US-focused** and does not surface **California / CPRA-style** disclosures while the product markets to landlords nationwide (including California-specific SEO/tool content). (2) **Contact page** states a fixed **24 business-hour** response time—a binding-style commitment not echoed or qualified in Terms/Privacy. (3) **Pricing page** mobile “compare features” omits the **hourly RentCast estimate pool** that desktop and the footnote disclose—**consumer disclosure parity** risk.
- **Recommendation:** Treat this pass as **ready for counsel review** before scaling paid acquisition or California-heavy positioning; prioritize state-privacy language, SLA wording, and plan-disclosure consistency.

## Severity-ranked findings

### Critical

- *None identified in this screening pass.* (No obvious missing privacy/terms routes, webhook/billing disclosures, or silent contradiction that would clearly rise to “stop ship” without further jurisdictional facts.)

### High

- **California / US state privacy gap vs nationwide positioning** — Privacy states the service is “US-focused” and “do not target EU users specifically” but does **not** include **California Consumer Privacy Act / CPRA**-style notices (categories of PI, purposes, selling/sharing, retention, rights, authorized agent, non-discrimination, etc.) or other **US state** patterns now common for B2C SaaS. Marketing and tools reference **California** (e.g. investment calculator and location copy). **Risk:** Residents of California and other covered states may expect statutory disclosures; omission is a common diligence flag. **Evidence:** `app/app/privacy/page.tsx` (Overview); `app/lib/marketing/location-data.ts`; `app/app/investment-property-calculator/page.tsx` (California mention).

- **Fixed support response commitment on Contact** — Copy promises: “We reply within **24 business hours** (Mon–Fri, US time, excluding holidays).” That is an **absolute performance claim**; Terms and Privacy do not limit liability for support timing or qualify this as a non-binding goal. **Risk:** Consumer expectations, chargeback/support disputes, or advertising substantiation if response times slip. **Evidence:** `app/app/contact/page.tsx`.

### Medium

- **Server-side PostHog and identity without browser cookie consent** — Privacy **accurately discloses** that backend events go to PostHog using a stable user ID “independent of the browser cookie banner.” That transparency is strong for alignment, but **jurisdictions with strict electronic communications or analytics rules** may still require **additional legal analysis** (not asserted here). **Evidence:** `app/app/privacy/page.tsx` (PostHog bullets); `app/lib/auth.ts` (server `captureServerEvent` on user creation); `app/lib/posthog-server.ts`; `docs/launch/analytics.md`.

- **Pricing: mobile feature list omits hourly estimate pool** — Desktop comparison table and footer copy disclose **5/10/20 successful RentCast requests per hour** by tier; the **mobile accordion** omits “Estimate pool (per hour)” entirely. **Risk:** Users on small screens may not see a **material plan limit** called out elsewhere. **Evidence:** `app/app/pricing/page.tsx` (desktop rows vs `md:hidden` section).

- **Policy updates: “continued use = acceptance”** — Privacy and Terms say updates will be posted and continued use constitutes acceptance. Some counsel prefer **notice channels** (email/in-app) for **material** changes to privacy, billing, or liability—especially for paying subscribers. **Risk:** Enforceability and notice expectations vary. **Evidence:** `app/app/privacy/page.tsx` (Changes); `app/app/terms/page.tsx` (Changes).

- **Structured data / display prices vs live Stripe prices** — `layout` JSON-LD `offers` uses `PRICING_DISPLAY` env-driven defaults. If production **Stripe prices diverge** from public display/schema without a deliberate strategy, **risk** of misleading pricing in rich results or marketing. **Evidence:** `app/app/layout.tsx` (`JsonLdScript`, `PRICING_DISPLAY`); `app/lib/pricing-display.ts`; `app/components/pricing-cards.tsx`.

### Low

- **Clerk session cookie characterization** — Privacy says Clerk cookies “do not contain personally identifiable information by default.” Session tokens can still be **personal data** under some frameworks even if they are not “PII” in a colloquial sense. **Risk:** Minor imprecision; counsel may prefer “authentication tokens” wording. **Evidence:** `app/app/privacy/page.tsx`.

- **Sentry browser SDK vs cookie banner** — Client `instrumentation-client.ts` initializes Sentry when `NEXT_PUBLIC_SENTRY_DSN` is set, **without** tying to optional analytics consent. Privacy **does** carve out Sentry separately from PostHog/Google optional cookies—good alignment—but EU/ePrivacy classification remains **counsel-dependent**. **Evidence:** `app/instrumentation-client.ts`; `app/app/privacy/page.tsx` (Sentry bullet).

- **Contact form data retention description** — Privacy lists email, subject, and message for the contact flow. The API **persists only** a rate-limit `identifier` in `ContactFormSubmission`, not message body; content flows to email via Resend. Slightly more precision (“delivered to support email; minimal log in our database for abuse prevention”) could reduce ambiguity. **Evidence:** `app/app/api/contact/route.ts`; `app/prisma/schema.prisma` (`ContactFormSubmission`).

- **“Last updated” granularity** — Privacy: “April 9, 2026”; Terms: “April 2026.” Minor consistency nit for legal hygiene. **Evidence:** `app/app/privacy/page.tsx`; `app/app/terms/page.tsx`.

## Evidence reviewed

- **Legal / marketing surfaces (app, read-only):** `app/app/privacy/page.tsx`, `app/app/terms/page.tsx`, `app/app/pricing/page.tsx`, `app/app/contact/page.tsx`, `app/app/layout.tsx`, `app/components/footer.tsx`, `app/components/consent/cookie-consent-banner.tsx`, `app/components/consent/cookie-consent-provider.tsx` (referenced via banner), `app/components/legal/support-contact-instructions.tsx`, `app/lib/marketing/pricing-faqs.ts`, `app/app/page.tsx` (partial — hero/value props), `app/lib/marketing/location-data.ts`, `app/app/investment-property-calculator/page.tsx` (California mention).
- **Consent & analytics implementation:** `app/components/analytics/posthog-provider.tsx`, `app/components/analytics/posthog-page-view.tsx`, `app/lib/posthog-server.ts`, `app/lib/auth.ts`, `app/instrumentation-client.ts`, `app/app/api/contact/route.ts`.
- **Internal docs (supporting behavior):** `docs/launch/analytics.md`, `docs/setup/manual-steps.md`, `docs/security/security-notes.md`.
- **Assumptions / limits:** No jurisdiction-specific legal research; no review of signed DPAs, insurance, or corporate formation docs; Stripe Dashboard configuration not inspected; no live production env verification.

## Risk & impact assessment

- **Business impact:** Gaps in **US state privacy** copy and **support commitments** are the most likely sources of **customer trust issues**, **payment disputes**, or **due-diligence findings** during fundraising or enterprise conversations.
- **Likelihood:** Nationwide landlord positioning makes **California** and other **US state** privacy exposure **plausible** even with a “US-focused” statement. Support SLA language creates **operational** exposure proportional to ticket volume.
- **Overall exposure:** Moderate for a growing B2C subscription; **not** assessed as “none” for scaled marketing.

## Recommendations (prioritized)

1. **Engage counsel** (or a specialized privacy vendor) to add **US state** disclosures appropriate to actual data practices (at minimum **CPRA** if California residents are in scope), and to reconcile **international** traffic with current EU disclaimer.
2. **Soften or operationalize** the Contact page SLA: e.g. “we **aim** to respond within…” or tie to Terms with a clear **“best efforts”** limitation—**after** counsel review.
3. **Align pricing disclosures across breakpoints:** add **hourly estimate pool** (or equivalent summary) to the mobile comparison on `/pricing` so material limits are not desktop-only.
4. **Process:** Keep **Stripe list prices**, **in-app display**, and **JSON-LD offers** in a single change checklist when prices change.
5. **Policy updates:** Ask counsel whether **material** privacy/billing changes need **email or in-app notice** in addition to posting.

## Task candidates (optional)

- [ ] Add **California / US state privacy** section(s) to Privacy (and any required links) per counsel-approved template.
- [ ] Revise **Contact** copy (and optionally Terms) for **support response** expectations.
- [ ] Update **`/pricing` mobile** feature accordion to include **RentCast hourly pool** parity with desktop.
- [ ] Counsel review of **server-side analytics** disclosure sufficiency for intended markets.
- [ ] Optional: tighten **Clerk cookie** and **contact form retention** sentences in Privacy for precision.

## Re-test checklist

- [ ] Verify counsel-approved **privacy** text is live and matches **runtime** analytics/subprocessors.
- [ ] Verify **Contact** and **Terms** language are consistent after SLA edits.
- [ ] Spot-check **`/pricing`** on **mobile viewport** for plan limits.
- [ ] After any code changes: `npm run check` (per template; not required for this docs-only audit).

## Next trigger and cadence

- **Trigger:** Before **major marketing pushes**, **price changes**, **new subprocessors** (analytics, ads, email), or **material policy** edits; otherwise **quarterly** for B2C subscription.
- **Recommended next run:** **2026-07-27** (quarterly), or earlier if California-focused campaigns or new state privacy laws apply.
