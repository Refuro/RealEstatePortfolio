# Legal & Compliance Audit — 2026-04-01

**Disclaimer (required):** This audit is a **practical product and documentation screening pass** only. It is **not legal advice**, **not a substitute for licensed counsel**, and **not a guarantee of compliance** in any jurisdiction. Findings are evidence-based observations for internal prioritization; escalate material decisions to a qualified attorney.

## Executive summary

- **Overall:** Public **Privacy Policy**, **Terms of Service**, **pricing** page, **contact** expectations, and **marketing calculator FAQs** are largely **consistent** with documented behavior: Stripe billing and Terms cross-links, optional client analytics gated by the cookie banner (`PostHogGate`, `VercelAnalyticsClient`, `GoogleAdsGtagClient`), and **server-side PostHog** for billing events is **explicitly disclosed** in the Privacy Policy (including that it does not depend on the browser banner).
- **Top gaps:** **Settings → Cookies** copy names **PostHog and Google Ads** only and **omits Vercel Web Analytics**, while the Privacy Policy and cookie section list all three optional tools—an **in-app vs. policy** disclosure gap. Internal **`docs/security/security-notes.md`** still describes Google **gtag** as loading when the Ads env is set, **without** stating **consent** is required—**documentation drift** vs. `GoogleAdsGtagClient`.
- **Counsel / scaling:** Terms still lack **governing law, venue, and dispute resolution**; Privacy/Terms **change** clauses use **continued use** as acceptance—common but worth counsel review before major expansion. **EU** language remains **US-focused / non-targeting**, not a legal determination of non-applicability of non-US law.
- **Recommendation:** Align **Settings** cookie text with the Privacy Policy vendor list (or a pointer to it); fix the **security-notes** Google Ads bullet; keep **quarterly** or **event-triggered** re-runs when consent, billing, or marketing claims change.

## Severity-ranked findings

### Critical

- None identified in this pass.

### High

- None identified in this pass.

### Medium

- **Settings cookie disclosure omits Vercel Web Analytics** — In-app copy: “PostHog and Google Ads load only if you accept optional tracking” (`app/app/(app)/settings/cookie-preferences-section.tsx`). Privacy Policy lists **Vercel Web Analytics** as loading after acceptance (`app/app/privacy/page.tsx`, Vercel bullet and Cookies section). **Risk/impact:** Users comparing Settings to the policy see a **narrower** list of optional tools; behavior matches policy (`app/components/analytics/vercel-analytics.tsx` gates on `hasAnalyticsConsent`).
- **Internal security doc overstates unconditional gtag loading** — `docs/security/security-notes.md` states that when `NEXT_PUBLIC_GOOGLE_ADS_ID` is set, the layout loads `gtag.js`. **Actual behavior:** `GoogleAdsGtagClient` returns `null` without `hasAnalyticsConsent` and without the env id (`app/components/analytics/google-ads-gtag.tsx`). **Risk/impact:** Operators or auditors relying on security notes may **misstate consent posture**.

### Low

- **“Last updated” granularity differs** — Privacy: “March 31, 2026”; Terms: “March 2026” (`app/app/privacy/page.tsx`; `app/app/terms/page.tsx`).
- **Clerk session cookie wording** — Privacy states session cookies “do not contain personally identifiable information by default.” Identifiers can still be **linkable** in context; counsel may prefer softer wording (`app/app/privacy/page.tsx`).
- **Terms: no governing law / venue** — Open jurisdiction for disputes (`app/app/terms/page.tsx`).
- **Privacy: international posture** — “US-focused” and not targeting EU users is **not** a GDPR applicability determination (`app/app/privacy/page.tsx`).
- **PostHog `preconnect` in root layout** when `NEXT_PUBLIC_POSTHOG_KEY` is set (`app/app/layout.tsx`) — Early connection hint; analytics payloads remain consent-gated per `PostHogGate`. Low risk; note for strict interpretations of “prior to consent” network activity.

## Evidence reviewed

- **Legal pages:** `app/app/privacy/page.tsx`, `app/app/terms/page.tsx`, `app/app/pricing/page.tsx`
- **Contact & support:** `app/app/contact/page.tsx` (response-time and non-advice disclaimer)
- **Consent & analytics:** `app/app/layout.tsx`, `app/components/analytics/posthog-provider.tsx` (gate), `app/components/analytics/google-ads-gtag.tsx`, `app/components/analytics/vercel-analytics.tsx`, `app/components/consent/cookie-consent-provider.tsx`, `app/app/(app)/settings/cookie-preferences-section.tsx`
- **Marketing:** `app/lib/marketing/calculator-faqs.ts` (educational / non-lender disclaimers)
- **Process references:** `docs/launch/analytics.md`, `docs/setup/manual-steps.md`, `docs/security/security-notes.md`

**Assumptions / limits:** No jurisdiction-specific research; no review of DPAs, corporate formation, or live Stripe catalog; code and copy reviewed as in workspace at audit time.

## Risk & impact assessment

**Medium** findings affect **transparency consistency** (Settings vs. Privacy) and **internal accuracy** (security notes)—not observed **hidden** client tracking beyond disclosed server PostHog. **Low** items are **polish, scaling, and precision** risks. Likelihood of user confusion from Settings omission is **moderate** for privacy-conscious users; **exposure** is **limited** because runtime behavior aligns with the Privacy Policy.

## Recommendations (prioritized)

1. **Align Settings cookie copy** with the Privacy Policy by naming **Vercel Web Analytics** or using a phrase such as “optional analytics vendors listed in the Privacy Policy.”
2. **Update `docs/security/security-notes.md`** so the Google Ads bullet states **gtag loads only when** `NEXT_PUBLIC_GOOGLE_ADS_ID` **is set and** the user has **accepted optional analytics/ads** (matching `GoogleAdsGtagClient`).
3. **Normalize “Last updated”** presentation across Privacy and Terms when legal text next ships.
4. **Before material growth or non-US marketing:** Counsel review of **Terms** (law/venue, subscriptions/refunds) and **Privacy** (state laws, transfers, ad tech changes).

## Task candidates

- [ ] Update `app/app/(app)/settings/cookie-preferences-section.tsx` to mention Vercel Web Analytics or reference the Privacy Policy list.
- [ ] Edit `docs/security/security-notes.md` Google Ads bullet for consent-gated loading.
- [ ] Align Privacy and Terms “Last updated” strings on the next legal edit.

## Re-test checklist

- [ ] After any copy changes: compare Settings, Privacy, and Terms for cookie/analytics language.
- [ ] Browser: reject optional cookies → no PostHog / Vercel Analytics / gtag from those features; accept → scripts load per `docs/launch/analytics.md` PM checklist.
- [ ] `npm run check` (when code under `app/` changes)

## Next trigger and cadence

- **Trigger:** Pre-launch, **material** privacy/terms/billing/analytics changes, **new vendors**, or **geographic expansion**.
- **Recommended next run:** **2026-07-01** (quarterly) or sooner if consent UX, Stripe pricing, or marketing claims change materially.
