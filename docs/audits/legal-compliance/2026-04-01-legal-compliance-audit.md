# Legal & Compliance Audit — 2026-04-01

**Disclaimer (required):** This audit is a **practical product and documentation screening pass** only. It is **not legal advice**, **not a substitute for licensed counsel**, and **not a guarantee of compliance** in any jurisdiction. Findings are evidence-based observations for internal prioritization; escalate material decisions to a qualified attorney.

## Executive summary

- **Overall:** App-facing **Privacy Policy**, **Terms of Service**, **pricing/billing disclosures**, and **support/contact** copy are generally **aligned** with described behavior for optional analytics (PostHog, Vercel Web Analytics, Google Ads gtag), essential auth cookies, Stripe billing, and third-party processors listed in the privacy policy. **Marketing** language stays close to the Terms’ “not financial advice” and estimate-accuracy disclaimers.
- **Top gaps:** **In-app** Settings text about cookies names PostHog and Google Ads but **does not mention Vercel Web Analytics**, while the Privacy Policy does—minor **disclosure inconsistency** between surfaces. Internal **security notes** describe Google Ads gtag loading in a way that is **less precise** than the consent-gated implementation (documentation drift, not user-facing).
- **Counsel candidates:** Terms omit **governing law / venue**; privacy/terms **change** clauses rely on **continued use** as acceptance—common but may warrant review for **material changes** as the business grows. Wording on **Clerk session cookies** (“do not contain personally identifiable information by default”) is **nuanced** and may deserve precision review.
- **Recommendation:** Address the **Settings vs. Privacy** cookie copy alignment and **correct internal security doc** wording on Google Ads; schedule **periodic legal review** of Terms/Privacy before major monetization or geographic expansion.

## Severity-ranked findings

### Critical

- None identified in this pass.

### High

- None identified in this pass. (Server-side PostHog with user id is **disclosed** in the Privacy Policy; optional client analytics match consent gating in code.)

### Medium

- **Settings cookie disclosure omits Vercel Web Analytics** — Users see in Settings that “PostHog and Google Ads load only if you accept optional tracking,” but the Privacy Policy also lists **Vercel Web Analytics** as loading after acceptance. **Risk/impact:** In-app messaging is slightly narrower than the policy users can read elsewhere; reduces transparency consistency (not a mismatch of behavior—`VercelAnalyticsClient` gates on `hasAnalyticsConsent`). **Evidence:** `app/app/(app)/settings/cookie-preferences-section.tsx`; `app/app/privacy/page.tsx` (Vercel bullet and Cookies section); `app/components/analytics/vercel-analytics.tsx`.
- **Internal security documentation overstates unconditional gtag loading** — `docs/security/security-notes.md` states that when `NEXT_PUBLIC_GOOGLE_ADS_ID` is set, the root layout loads `gtag.js`. **Actual behavior:** `GoogleAdsGtagClient` returns `null` without analytics consent and without the env id (`app/components/analytics/google-ads-gtag.tsx`). **Risk/impact:** Operators relying on security notes could misunderstand consent posture during audits or incident response.

### Low

- **“Last updated” precision differs** between Privacy (“March 31, 2026”) and Terms (“March 2026”). **Evidence:** `app/app/privacy/page.tsx`; `app/app/terms/page.tsx`.
- **Clerk cookie characterization** — Privacy states Clerk session cookies “do not contain personally identifiable information by default.” Session identifiers can still be **linkable** to individuals in context. **Risk/impact:** Potential over-precision; a lawyer may prefer softer or more technical wording.
- **Terms: no governing law, venue, or dispute resolution** — Acceptable for many early-stage products but leaves **jurisdiction** open. **Evidence:** `app/app/terms/page.tsx`.
- **Privacy: EU posture** — States the product is “US-focused” and does not “target EU users specifically.” This is **not** the same as a determination of GDPR non-applicability; expansion or EU marketing would trigger review.
- **Root layout `preconnect` to PostHog host** when `NEXT_PUBLIC_POSTHOG_KEY` is set (`app/app/layout.tsx`) — May establish a **connection hint** before consent; no PostHog analytics payload is sent until consent per `PostHogGate`. Low risk; optional note for strict cookie-banner interpretations.

## Evidence reviewed

- **Legal pages:** `app/app/privacy/page.tsx`, `app/app/terms/page.tsx`, `app/app/pricing/page.tsx`
- **Marketing / support:** `app/app/page.tsx`, `app/components/pricing-cards.tsx` (partial), `app/app/contact/page.tsx`, `app/components/legal/support-contact-instructions.tsx`, `app/components/footer.tsx`
- **Consent & analytics (read-only verification):** `app/app/layout.tsx`, `app/components/analytics/posthog-provider.tsx`, `app/components/analytics/google-ads-gtag.tsx`, `app/components/analytics/vercel-analytics.tsx`, `app/components/consent/cookie-consent-provider.tsx`, `app/app/(app)/settings/cookie-preferences-section.tsx`
- **Supporting docs (process references):** `docs/launch/analytics.md`, `docs/setup/manual-steps.md`, `docs/security/security-notes.md`
- **Internal cross-check:** `docs/internal/billing-matrix.md`, `app/lib/plans.ts` (limits vs marketing)

**Assumptions / limits:** No jurisdiction-specific legal research; no review of signed DPAs, insurance, or corporate formation documents; Stripe live catalog and env vars were not verified in a dashboard—only consistency between in-app copy and code/docs.

## Risk & impact assessment

Unresolved **Medium** items mainly affect **consistency of user understanding** and **internal accuracy** for compliance workflows—not observed **secret tracking** or missing payment disclosures on the pricing page. **Low** items are **polish and scaling** risks (Terms scope, cookie wording, date alignment). **Likelihood** of user confusion from the Settings omission is **moderate** for privacy-conscious users who compare pages; **exposure** is **limited** because behavior matches the Privacy Policy.

## Recommendations (prioritized)

1. **Align Settings cookie copy** with the Privacy Policy by explicitly including **Vercel Web Analytics** (or a neutral phrase such as “optional analytics vendors listed in the Privacy Policy”) so in-app text matches policy breadth.
2. **Update `docs/security/security-notes.md`** to state that Google Ads **gtag** loads only when **`NEXT_PUBLIC_GOOGLE_ADS_ID` is set and** the user has **optional analytics/ads consent** (matching `GoogleAdsGtagClient`).
3. **Normalize “Last updated” dates** across Privacy and Terms (same granularity or cross-reference) to reduce stale-appearance risk.
4. **Before significant growth or EU outreach:** Have counsel review **Terms** (governing law, dispute resolution, subscription/refund mechanics) and **Privacy** (international transfers, state privacy laws, “sale/share” language if ad tech changes).

## Task candidates

- [ ] Update `cookie-preferences-section.tsx` copy to mention Vercel Web Analytics or point to the Privacy Policy list of optional tools.
- [ ] Edit `docs/security/security-notes.md` Google Ads bullet to reflect consent-gated loading.
- [ ] Align Terms and Privacy “Last updated” metadata for the same release when legal text next changes.

## Re-test checklist

- [ ] After copy changes: read Settings, Privacy, and Terms side-by-side for cookie/analytics language.
- [ ] Spot-check in browser: reject optional cookies → confirm no PostHog, Vercel Analytics component, or gtag network activity from those features; accept → confirm scripts load per `docs/launch/analytics.md` PM checklist.
- [ ] `npm run check` (when code or content under `app/` is modified)

## Next trigger and cadence

- **Trigger:** Pre-launch, **material change** to privacy/terms/billing, **new analytics or ad vendors**, or **geographic expansion**.
- **Recommended next run:** **2026-07-01** (quarterly) or sooner if Stripe pricing, consent UX, or marketing claims change materially.
