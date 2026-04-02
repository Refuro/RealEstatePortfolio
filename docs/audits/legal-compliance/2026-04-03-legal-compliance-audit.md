# Legal & Compliance Audit — 2026-04-03

**Disclaimer:** This report is a **practical screening pass** for obvious product-facing legal/compliance gaps. It is **not legal advice**, **not a substitute for licensed counsel**, and **not a guarantee of compliance** in any jurisdiction. Escalate material questions to a qualified attorney.

## Executive summary

- **Overall:** Privacy Policy, Terms, pricing disclosures, cookie banner, and `docs/launch/analytics.md` are **largely aligned** with implemented behavior: optional analytics/ads are consent-gated (`PostHogGate`, `VercelAnalyticsClient`, `GoogleAdsGtagClient`), and the Privacy Policy explicitly covers **server-side PostHog** for billing events independent of the browser banner.
- **Top gaps:** **Settings → Cookies** copy still names **PostHog and Google Ads** only and **omits Vercel Web Analytics**, while the Privacy Policy lists all three optional tools — an **in-app vs. policy** disclosure gap (behavior matches policy; copy is narrower). Internal **`docs/security/security-notes.md`** still implies **unconditional** gtag loading when the Ads env is set, which **does not match** consent-gated `GoogleAdsGtagClient`.
- **Comparative marketing:** `app/lib/marketing/competitor-data.ts` uses hedged language, scope boundaries (no bank sync, no rent collection where relevant), and FAQs that avoid absolute superiority claims; **ongoing accuracy** and **trademark/comparative-ad** posture remain **owner/counsel** topics if paid scale increases.
- **Recommendation:** Close the **Settings** and **security-notes** documentation gaps; keep **quarterly** or **release-triggered** re-runs when consent UX, billing, or competitor matrices change.

## Severity-ranked findings

### Critical

- None identified in this pass.

### High

- None identified in this pass.

### Medium

- **Settings cookie copy omits Vercel Web Analytics** — In-app text: “PostHog and Google Ads load only if you accept optional tracking” (`app/app/(app)/settings/cookie-preferences-section.tsx`). The Privacy Policy states that acceptance enables **PostHog, Vercel Web Analytics, and** Google Ads measurement (`app/app/privacy/page.tsx`, Cookies section). **Risk/impact:** Users reconciling Settings with the policy see a **narrower** vendor list; runtime behavior matches the policy (`app/components/analytics/vercel-analytics.tsx` gates on `hasAnalyticsConsent`).

- **Internal security doc overstates unconditional Google Ads loading** — `docs/security/security-notes.md` states that when `NEXT_PUBLIC_GOOGLE_ADS_ID` is set, the layout loads `gtag.js`. **Actual behavior:** `GoogleAdsGtagClient` returns `null` without `hasAnalyticsConsent` and without the env id (`app/components/analytics/google-ads-gtag.tsx`). **Risk/impact:** Operators or auditors relying on security notes may **misstate consent posture** for Ads measurement.

### Low

- **“Last updated” granularity differs across policies** — Privacy: “March 31, 2026” (`app/app/privacy/page.tsx`); Terms: “March 2026” (`app/app/terms/page.tsx`). **Risk/impact:** Minor user confusion when comparing documents; not a functional compliance defect by itself.

- **PostHog `preconnect` in root layout** when `NEXT_PUBLIC_POSTHOG_KEY` is set (`app/app/layout.tsx`) — Early connection hint to PostHog host; client analytics payloads remain consent-gated per `PostHogGate`. **Risk/impact:** Low; strict interpretations of “prior to consent” network activity may still warrant **counsel** review if EU/UK targeting expands.

## Evidence reviewed

| Surface | Path(s) |
|--------|---------|
| Privacy Policy | `app/app/privacy/page.tsx` |
| Terms of Service | `app/app/terms/page.tsx` |
| Pricing / billing disclosure | `app/app/pricing/page.tsx` |
| Cookie banner & consent model | `app/components/consent/cookie-consent-banner.tsx`, `app/components/consent/cookie-consent-provider.tsx` |
| Settings cookie preferences | `app/app/(app)/settings/cookie-preferences-section.tsx` |
| Analytics runtime alignment | `app/components/analytics/posthog-provider.tsx`, `vercel-analytics.tsx`, `google-ads-gtag.tsx`, `app/app/layout.tsx` |
| Competitor / comparative copy | `app/lib/marketing/competitor-data.ts` (and routing via `app/app/alternatives/`, `app/app/vs/` as consumers) |
| Analytics documentation | `docs/launch/analytics.md` |
| Internal security notes | `docs/security/security-notes.md` |

**Assumptions / limits:** Review focused on static copy and documented behavior described in-repo; no jurisdiction-specific research, no review of Stripe Customer Portal wording inside Stripe’s UI, and no review of third-party terms (Clerk, Stripe, PostHog, etc.) beyond what the Privacy Policy summarizes.

## Risk & impact assessment

Unresolved **medium** items create **moderate** operational and trust risk: inconsistent optional-vendor naming may frustrate privacy-conscious users; inaccurate internal security documentation can cause **wrong answers** in diligence or incident review. **Low** items are cosmetic or edge-case until international expansion or enforcement interest increases.

Likelihood of external challenge scales with **traffic**, **paid comparative ads**, and **claims about competitors** — competitor matrices should be treated as **living** and validated against public competitor materials.

## Recommendations (prioritized)

1. **Align Settings cookie copy** with the Privacy Policy by naming **Vercel Web Analytics** or using language such as “optional analytics vendors listed in the Privacy Policy” (`cookie-preferences-section.tsx`).

2. **Update `docs/security/security-notes.md`** Google Ads bullet to state that **`gtag.js` loads only when optional analytics consent is granted** (and the env id is set), consistent with `GoogleAdsGtagClient`.

3. **Optional polish:** Harmonize “Last updated” date formats between Privacy and Terms when either document next changes.

## Human / counsel review (not decided in this audit)

- **Clerk session cookies** — Privacy states session cookies “do not contain personally identifiable information by default.” Identifiers may still be **linkable** in context; **counsel** may prefer softer or more precise wording (`app/app/privacy/page.tsx`).

- **Comparative / trademark use** — Alternative and `/vs` pages use competitor names in **descriptive** comparison contexts (“Stessa alternative”). **Counsel** should confirm this remains appropriate if **brand visibility** or **paid competitive campaigns** scale (`app/lib/marketing/competitor-data.ts`, related routes).

- **Feature matrix accuracy** — Boolean rows for third-party products require **periodic product verification** against current competitor capabilities; legal risk attaches to **material misstatements** (owner/product process, not automated).

- **US-only positioning** — Privacy notes US focus and no EU targeting; **counsel** should reassess if marketing or product **explicitly targets** EEA/UK users.

## Task candidates (optional)

- [ ] Update `app/app/(app)/settings/cookie-preferences-section.tsx` to mention Vercel Web Analytics or reference the Privacy Policy vendor list.
- [ ] Edit `docs/security/security-notes.md` Google Ads bullet for consent-gated loading of `gtag.js`.

## Re-test checklist

- [ ] After copy/docs fixes: compare Settings, Privacy banner, and Privacy Policy for optional analytics vendor naming.
- [ ] After security-notes fix: confirm internal docs match `GoogleAdsGtagClient` and `docs/launch/analytics.md`.
- [ ] `npm run check` (when application source is changed — not required for docs-only updates).

## Next trigger and cadence

- **Trigger:** Quarterly, pre-launch, or when privacy/terms/pricing/cookie UX, Stripe surfaces, or `competitor-data.ts` changes materially.
- **Recommended next run:** **2026-07-01** (quarterly) or sooner if consent or comparative marketing changes.
