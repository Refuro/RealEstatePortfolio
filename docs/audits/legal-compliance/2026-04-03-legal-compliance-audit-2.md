# Legal & Compliance Audit — 2026-04-03 (Run 2)

**Disclaimer:** This report is a **practical screening pass** for obvious product-facing legal/compliance gaps. It is **not legal advice**, **not a substitute for licensed counsel**, and **not a guarantee of compliance** in any jurisdiction. Escalate material questions to a qualified attorney.

## Executive summary

- **Overall:** This is the **second pass on 2026-04-03**, focused on re-checking the morning audit’s **Schedule** items (cookie/settings copy vs. Privacy Policy; `security-notes.md` vs. consent-gated Google Ads) and on **post-change** surfaces (pricing page mockups, billing footnotes, Terms entity language). **Runtime consent alignment** remains strong: `VercelAnalyticsClient` and `GoogleAdsGtagClient` both gate on `hasAnalyticsConsent` (`app/components/analytics/vercel-analytics.tsx`, `app/components/analytics/google-ads-gtag.tsx`).
- **Schedule status (morning):** **Not yet closed in-repo.** Settings still say only **PostHog and Google Ads** for optional loading (`app/app/(app)/settings/cookie-preferences-section.tsx`), and **`docs/security/security-notes.md`** still describes **unconditional** `gtag.js` loading when the Ads env var is set — both **unchanged** since Run 1 this morning.
- **Improvements since earlier audits:** **`/pricing`** includes a **billing / refunds / cancellation** footnote with anchors to Terms (`app/app/pricing/page.tsx`), consistent with Phase 20-style disclosure near plan content. **Terms** no longer contain an inline `TODO(legal)`; the **Contracting party** section uses **dba “Veld Portfolio”** and a forward-looking note if a registered entity is used later (`app/app/terms/page.tsx`).
- **Recommendation:** Apply the **two documentation/copy fixes** from Run 1 (Settings vendor naming or Privacy Policy cross-reference; security-notes gtag consent sentence). Re-run after any cookie UX or Ads configuration change.

## Severity-ranked findings

### Critical

- None identified in this pass.

### High

- None identified in this pass.

### Medium

- **Settings cookie copy still omits Vercel Web Analytics** — Text: “PostHog and Google Ads load only if you accept optional tracking” (`app/app/(app)/settings/cookie-preferences-section.tsx`). The Privacy Policy states that acceptance enables **PostHog, Vercel Web Analytics, and** Google Ads measurement when configured (`app/app/privacy/page.tsx`, Cookies section). **Risk/impact:** Same as Run 1 — **in-app list is narrower** than the policy; behavior matches the policy.

- **`docs/security/security-notes.md` overstates Google Ads / gtag loading** — The bullet under “As we go” still says that when `NEXT_PUBLIC_GOOGLE_ADS_ID` is set, the layout loads `gtag.js` (`docs/security/security-notes.md`, ~lines 24–25). **Actual behavior:** `GoogleAdsGtagClient` returns `null` without `hasAnalyticsConsent` and without the env id (`app/components/analytics/google-ads-gtag.tsx`). **Risk/impact:** Internal/operator documentation **misstates consent posture** for Ads measurement.

### Low

- **“Last updated” granularity differs across policies** — Privacy: “March 31, 2026” (`app/app/privacy/page.tsx`); Terms: “March 2026” (`app/app/terms/page.tsx`). **Risk/impact:** Minor user confusion; not a functional defect by itself.

- **PostHog `preconnect` in root layout** when `NEXT_PUBLIC_POSTHOG_KEY` is set (`app/app/layout.tsx`, `<head>`). Client PostHog remains behind `PostHogGate` / consent. **Risk/impact:** Low; stricter “prior to consent” interpretations may warrant **counsel** if EU/UK targeting grows (same as Run 1).

- **Landing pricing preview has no billing/Terms footnote** — The homepage “Simple pricing” block shows prices and CTAs to `/pricing` but **does not** repeat the Terms links present under `/pricing` (`app/app/page.tsx` vs. `app/app/pricing/page.tsx`). **Risk/impact:** Low — **primary paid-plan disclosure** with **Billing / refunds / cancellation** links lives on **`/pricing`**; Footer still links to Privacy and Terms site-wide.

- **Cookie banner copy is high-level** — Banner: “Optional analytics and ads measurement load only if you accept” plus Privacy Policy link (`app/components/consent/cookie-consent-banner.tsx`). It does not enumerate vendors (unlike Settings). **Risk/impact:** Low — consistent with a short banner; detail is in the Privacy Policy.

## Evidence reviewed

| Surface | Path(s) |
|--------|---------|
| Privacy Policy | `app/app/privacy/page.tsx` |
| Terms of Service | `app/app/terms/page.tsx` |
| Pricing page, billing footnote, mockups | `app/app/pricing/page.tsx` |
| Landing pricing preview | `app/app/page.tsx` |
| Cookie banner & consent | `app/components/consent/cookie-consent-banner.tsx`, `app/components/consent/cookie-consent-provider.tsx` (provider not re-read in full; banner behavior referenced) |
| Settings cookie preferences | `app/app/(app)/settings/cookie-preferences-section.tsx` |
| Analytics runtime | `app/components/analytics/vercel-analytics.tsx`, `app/components/analytics/google-ads-gtag.tsx`, `app/app/layout.tsx` |
| Embedded “mockups” | `app/components/mockups/dashboard-mockup.tsx` (sample; static UI), `app/app/pricing/page.tsx` (`MockupFrame`, `DashboardMockup`, `MortgageMockup`, `DealAnalyzerMockup`) |
| Internal security notes | `docs/security/security-notes.md` |
| Product analytics doc | `docs/launch/analytics.md` (spot-check: cookie consent for PostHog) |

**Assumptions / limits:** Static copy and in-repo behavior only; no jurisdiction-specific research; no review of Stripe-hosted portal wording; no verification of third-party DPAs beyond Privacy Policy summaries. **Run 2** explicitly compared against **`docs/audits/legal-compliance/2026-04-03-legal-compliance-audit.md`** (Run 1 same day).

## Risk & impact assessment

Unresolved **medium** items match Run 1: **internal doc drift** on gtag and **narrower Settings copy** than the Privacy Policy reduce trust and can cause **wrong answers** in diligence. **Low** items are cosmetic or acceptable layering (banner vs. policy; landing vs. full pricing page) until traffic or regulatory scrutiny increase.

## Recommendations (prioritized)

1. **Align Settings cookie copy** with the Privacy Policy — name **Vercel Web Analytics** or use language such as “optional analytics vendors listed in the Privacy Policy” (`cookie-preferences-section.tsx`).

2. **Update `docs/security/security-notes.md`** — Google Ads bullet should state that **`gtag.js` loads only when optional analytics consent is granted** (and the public Ads id is set), matching `GoogleAdsGtagClient`.

3. **Optional polish:** Harmonize “Last updated” formats when either Privacy or Terms next changes.

## Human / counsel review (not decided in this audit)

- **State auto-renewal / subscription disclosure rules** — Terms describe recurring billing and cancellation; **counsel** should validate against states where the business has customers if paid scale increases (not re-litigated here).

- **Clerk session cookies** — Privacy language on session cookies; **counsel** may prefer softer wording if “PII” precision is debated (`app/app/privacy/page.tsx` — same theme as prior audits).

- **Comparative / trademark marketing** — Unchanged process note: competitor pages and matrices need **ongoing accuracy** and **counsel** if paid comparative campaigns scale.

- **US-only positioning** — Privacy states US focus; reassess if marketing explicitly targets EEA/UK.

## Task candidates (optional)

- [ ] Update `app/app/(app)/settings/cookie-preferences-section.tsx` to mention Vercel Web Analytics or reference the Privacy Policy vendor list.
- [ ] Edit `docs/security/security-notes.md` Google Ads bullet for consent-gated loading of `gtag.js`.

## Re-test checklist

- [ ] After copy/docs fixes: compare Settings, cookie banner, and Privacy Policy for optional analytics vendor naming.
- [ ] After security-notes fix: confirm internal docs match `GoogleAdsGtagClient` and `docs/launch/analytics.md`.
- [ ] After application source changes: `npm run check`.

## Next trigger and cadence

- **Trigger:** Quarterly, pre-launch, or when privacy/terms/pricing/cookie UX, Stripe surfaces, or analytics/Ads configuration changes materially.
- **Recommended next run:** **2026-07-01** (quarterly) or sooner after **Schedule** items above are merged.
