# Legal & Compliance Audit — 2026-04-09

**Disclaimer (mandatory):** This report is a **practical screening pass** for obvious product-facing legal and compliance gaps. It is **not legal advice**, **not a substitute for licensed counsel**, and **not a guarantee of compliance** in any jurisdiction. Use it to catch obvious issues early; escalate material legal questions to a qualified attorney. Findings are a documentation and copy review aid only.

---

## Executive summary

- **Overall health:** Privacy, cookie banner, and implementation are **largely aligned** on optional analytics: PostHog runs in memory mode before consent; Vercel Web Analytics and Google Ads `gtag` load only after acceptance; identified PostHog features (identify, signup/signin-once, plan intent) mount only with consent (`app/components/analytics/posthog-provider.tsx`).
- **Top risks:** (1) **Privacy Policy omits Google Maps Platform (Places)** used for address autocomplete—partial queries and place IDs go to Google when `GOOGLE_PLACES_API_KEY` is configured. (2) **Privacy understates server-side PostHog** by exemplifying only “billing or account” events while crons and auth emit broader product/lifecycle events. (3) **Terms do not describe the marketed 14-day trial** while pricing copy promises it—expectation gap vs contract text.
- **Recommendation:** Update Privacy (Places + accurate server PostHog scope), align Terms with trial and support expectations (or soften marketing/contact copy), and have counsel add governing law/venue when ready.

---

## Severity-ranked findings

### Critical

- *(None identified in this pass.)* Prior reports that claimed Privacy denied all pre-consent PostHog client activity are **stale** relative to current `app/app/privacy/page.tsx`, which describes anonymous memory-mode initialization, pre-consent page analytics, and server-side PostHog without the browser banner.

### High

- **Missing subprocessor disclosure for Google Places (Maps Platform)** — When address autocomplete is enabled, user-typed address fragments and place lookups are sent from `app/app/api/places/autocomplete/route.ts` and `app/app/api/places/details/route.ts` to Google’s Places API. **`app/app/privacy/page.tsx` does not list Google / Maps Platform** alongside Clerk, Stripe, RentCast, etc. **Risk/impact:** Incomplete transparency for a material third-party data flow; users cannot rely on the policy alone to understand where address typing goes.

### Medium

- **Privacy Policy narrows server-side PostHog more than implementation** — `app/app/privacy/page.tsx` examples cite billing/account-related server events. **`captureServerEvent` in `app/lib/posthog-server.ts` is also invoked from** Stripe webhook (`app/app/api/billing/webhook/route.ts`), user creation trial analytics (`app/lib/auth.ts`), and multiple Vercel cron routes (e.g. `app/app/api/cron/monthly-digest/route.ts`, `monthly-refresh`, `trial-emails`, `onboarding-emails`, `winback-emails`, `milestone-emails`, plus admin trial-email route). **Risk/impact:** Readers may underestimate backend product/lifecycle analytics tied to `clerkUserId`; consent narrative is “no banner for server” (accurate) but **scope should be described accurately**.

- **Terms of Service omit the free-trial program** — `app/app/pricing/page.tsx` states new accounts get **14 days of full Investor access** with no card. **`app/app/terms/page.tsx` does not define trial duration, downgrade behavior, or relationship to paid subscriptions.** **Risk/impact:** Marketing-led expectations may not be clearly bounded by the contract; refunds/cancellation sections do not contextualize trial-to-paid transitions.

- **Contact page support SLA not reflected in Terms or Privacy** — `app/app/contact/page.tsx` promises a reply within **24 business hours**. Neither `app/app/terms/page.tsx` nor `app/app/privacy/page.tsx` states that SLA. **Risk/impact:** Operational slip creates a gap between user-facing promise and formal policies.

- **Terms omit governing law, venue, and dispute resolution** — `app/app/terms/page.tsx` has no choice-of-law or forum clause. **Risk/impact:** Ambiguity as paid usage grows; **requires human counsel** once operating entity and home jurisdiction are fixed.

### Low

- **“Last updated” granularity differs** — `app/app/privacy/page.tsx` (“March 31, 2026”) vs `app/app/terms/page.tsx` (“March 2026”). **Risk/impact:** Minor transparency inconsistency.

- **US state comprehensive privacy laws** — Policy notes US focus and no EU targeting but does not address state-specific rights (e.g. California/CPRA-style disclosures). **Risk/impact:** May be acceptable at current stage; **counsel should confirm** if thresholds or marketing reach trigger obligations.

- **Mobile pricing feature accordion vs desktop table** — Desktop compare table in `app/app/pricing/page.tsx` includes “Estimate pool (per hour)”; the mobile `<details>` list omits that row (footnote still mentions pool limits). **Risk/impact:** Small parity issue for disclosure-heavy users on mobile; not strictly legal but affects clarity next to Terms links.

---

## Evidence reviewed

- **Legal / marketing surfaces:** `app/app/privacy/page.tsx`, `app/app/terms/page.tsx`, `app/app/pricing/page.tsx`, `app/app/contact/page.tsx`
- **Consent & analytics:** `app/components/consent/cookie-consent-provider.tsx`, `app/components/consent/cookie-consent-banner.tsx`, `app/components/analytics/posthog-provider.tsx`, `app/components/analytics/posthog-page-view.tsx`, `app/components/analytics/posthog-identify.tsx`, `app/components/analytics/vercel-analytics.tsx`, `app/components/analytics/google-ads-gtag.tsx`, `app/lib/analytics-client.ts`, `app/lib/posthog-server.ts`
- **Places / subprocessors:** `app/app/api/places/autocomplete/route.ts`, `app/app/api/places/details/route.ts`, `app/components/property/address-autocomplete-input.tsx`
- **Support copy:** `app/components/legal/support-contact-instructions.tsx`, `app/components/footer.tsx`
- **Internal docs:** `docs/launch/analytics.md`, `docs/setup/manual-steps.md`, `docs/security/security-notes.md`

**Assumptions / limits:** Runtime behavior inferred from source and env-gated features (e.g. PostHog and Google Ads inactive when keys unset). No jurisdiction-specific legal research; no review of Stripe Customer Portal hosted terms beyond in-app links.

---

## Risk & impact assessment

Unresolved **High** findings mainly affect **trust, regulator or card-scheme scrutiny, and due-diligence** scenarios where subprocessors must be enumerated accurately. **Medium** findings increase **support disputes and expectation mismatches** (trial, SLA) and leave **contractual ambiguity** (venue/law). Likelihood of immediate harm is moderate and situational; exposure rises with revenue, user count, and states where the product is marketed.

---

## Recommendations (prioritized)

1. **Add Google Maps Platform (Places)** to the Privacy Policy third-party list with a plain-language description of what is sent (partial address text, place identifiers) and link to Google’s Maps/Places privacy materials where appropriate.
2. **Broaden the server-side PostHog paragraph** to state that backend product and lifecycle events (including email-related cron outcomes and subscription lifecycle) may be sent using stable user identifiers, independent of the cookie banner—without overstating as “marketing” if events are operational/product analytics.
3. **Align Terms with the trial and support story:** either add a short “Trial” section consistent with `app/app/pricing/page.tsx` and product behavior, or adjust marketing/contact copy to avoid fixed SLAs and trial promises that Terms do not mirror; **add governing law/venue with counsel**.

---

## Task candidates (optional)

- [ ] Privacy: document Google Places / Maps Platform as a processor; review whether any other env-gated vendors need listing.
- [ ] Privacy: revise server-side PostHog scope to match `captureServerEvent` call sites (webhook, auth, crons).
- [ ] Terms (+ optional Pricing cross-links): add trial terms; add governing law/venue after counsel input.
- [ ] Align contact SLA with Terms/Privacy or soften `app/app/contact/page.tsx` copy.

---

## Re-test checklist

- [ ] Verify Privacy processor list against `app/.env.example` and production integrations.
- [ ] Verify cookie banner and Settings copy still match `PostHogGate` / `VercelAnalyticsClient` / `GoogleAdsGtagClient` after any copy changes.
- [ ] `npm run check` (when code or legal pages are edited).

---

## Next trigger and cadence

- **Trigger:** Quarterly, or before material changes to analytics, billing, trial policy, or new third-party data processors.
- **Recommended next run:** 2026-07-09 (Q3 window) or sooner if Places, ads, or payment flows change materially.
