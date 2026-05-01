# Legal & Compliance Audit — 2026-05-01

**Disclaimer (required):** This report is a **practical product and documentation screening pass** only. It is **not legal advice**, **not a substitute for licensed counsel**, and **not a guarantee of compliance** in any jurisdiction. Meaningful legal decisions should be escalated to a qualified attorney. Findings below are evidence-based observations for triage, not definitive legal conclusions.

## Executive summary

- **Overall:** Legal surfaces (**Privacy**, **Terms**, **pricing** disclosures, **cookie** copy) remain detailed and largely consistent with internal analytics documentation (`docs/launch/analytics.md`). PostHog **browser** vs **server** behavior is explicitly disclosed in the Privacy Policy, which reduces **disclosure-alignment** risk compared to products that bury backend analytics.
- **Top risks:** (1) **US state consumer privacy** expectations (including users in **California**, where location-specific marketing pages exist) vs Privacy copy that emphasizes US/non-EU framing without state-specific notices. (2) **Contact** page still states **24 business hours** response without matching **qualification in Terms/Privacy**, creating a user-facing commitment that legal/ops may not want as a hard standard. (3) **Marketing** language on the **home page** (“**Always current**,” “**Live**” estimates, “**20+ states**”) sits alongside Terms disclaimers on estimate accuracy—mostly manageable, but **substantiation** for broad geographic claims may warrant marketing/legal review.
- **Recommendation:** Treat **state privacy** and **support SLAs** as **counsel-led** before scaling paid acquisition; keep **FAQ / Terms / pricing footnotes** in lockstep when plan or trial rules change.

## Severity-ranked findings

### Critical

- *None identified in this screening pass.*

### High

- **US state privacy vs nationwide reach and California-specific marketing** — Privacy states the product is **US-focused**, does **not** target **EU** users specifically, and lists subprocessors, but does **not** address **US state** consumer privacy regimes. Separately, marketing tooling includes **California**-specific educational copy (`location-data.ts`), which supports treating California users as in-scope for diligence. **Risk:** Disclosure gaps relative to expectations in certain states. **Evidence:** `app/app/privacy/page.tsx` (Overview; processor list); `app/lib/marketing/location-data.ts` (California entry).

- **Fixed support-response commitment on Contact** — Contact promises a reply within **24 business hours** (Mon–Fri, US, holidays excluded) for product/account support. **Terms** and **Privacy** do not qualify, cap, or “best-efforts” that timing. **Risk:** Operational and dispute exposure if responses slip. **Evidence:** `app/app/contact/page.tsx`.

### Medium

- **Cookie banner vs “reject optional” mental model** — The banner explains **PostHog** anonymous/non-persistent mode before acceptance and gates **Vercel Web Analytics** and **Google Ads** on acceptance, consistent with `docs/launch/analytics.md`. **Privacy** further discloses **server-side PostHog** with a **stable user ID** independent of the browser banner. Users who only read the banner may **under-appreciate** ongoing server-side product analytics after **Reject optional**—the Privacy Policy mitigates, but **counsel** may still want in-banner or layered clarity depending on jurisdiction. **Evidence:** `app/components/consent/cookie-consent-banner.tsx`; `app/app/privacy/page.tsx` (PostHog **On the server** paragraph); `docs/launch/analytics.md`.

- **Marketing superlatives vs Terms (estimates and advice)** — Home **metadata** and body copy use phrases such as **“Live portfolio numbers”**, **“Always current”**, and **“Live rent and value estimates”**; the hero and value sections repeat **always current** / **live** framing. **Terms** state the service is **not financial advice** and do **not guarantee** third-party estimate accuracy. **Risk:** Truth-in-advertising and expectation management if users equate “live” with “accurate” or “guaranteed.” **Evidence:** `app/app/page.tsx` (`metadata`, `VALUE_PROPS`, hero); `app/app/terms/page.tsx` (Description of Service).

- **Geographic social proof (“20+ states”)** — The home page claims use **across 20+ states** without an on-page **methodology, “as reported by users,” or similar** qualifier visible in the audited strip. If not substantiated in ordinary business records, this can be a **marketing compliance** review item. **Evidence:** `app/app/page.tsx` (social proof strip).

- **Policy updates: continued use = acceptance** — Privacy and Terms say posting updates and **continued use constitutes acceptance**. Counsel often reviews whether **material** changes (privacy, fees, liability) need **stronger notice**. **Evidence:** `app/app/privacy/page.tsx` (Changes); `app/app/terms/page.tsx` (Changes).

### Low

- **“Last updated” granularity mismatch** — Privacy: **April 9, 2026**; Terms: **April 2026**. Minor hygiene for audit trails and user trust. **Evidence:** `app/app/privacy/page.tsx`; `app/app/terms/page.tsx`.

- **Clerk session cookie description** — Statement that Clerk cookies “do not contain personally identifiable information **by default**” may be read narrowly; session identifiers are often treated as personal data. **Evidence:** `app/app/privacy/page.tsx` (Clerk bullet).

- **Sentry vs optional analytics** — Privacy distinguishes **Sentry** from optional PostHog/Google cookies. Classification of **client** error reporting relative to consent regimes is **implementation- and jurisdiction-dependent**. **Evidence:** `app/app/privacy/page.tsx` (Sentry); `app/next.config.ts` (Sentry integration — not exhaustively audited here).

- **Contracting party as individual DBA** — Terms disclose operation as an **individual DBA** with possible future **entity** update. Low ongoing risk but **corporate** counsel may want this kept current if structure changes. **Evidence:** `app/app/terms/page.tsx` (Contracting party).

## Evidence reviewed

- **Legal / public surfaces (read-only):** `app/app/privacy/page.tsx`, `app/app/terms/page.tsx`, `app/app/pricing/page.tsx`, `app/app/contact/page.tsx`, `app/app/page.tsx` (home / marketing claims).
- **Cookie / consent (read-only):** `app/components/consent/cookie-consent-banner.tsx`, `app/components/consent/cookie-consent-provider.tsx`, `app/lib/cookie-consent.ts`, `app/components/analytics/posthog-provider.tsx`.
- **Pricing / billing copy sources (read-only):** `app/lib/marketing/pricing-faqs.ts`; pricing footnotes and Term anchors in `app/app/pricing/page.tsx`.
- **Supporting documentation:** `docs/process/legal-compliance-audit-process.md`, `docs/process/audit-report-template.md`, `docs/launch/analytics.md`, `docs/setup/manual-steps.md` (cookie/analytics manual notes), `docs/security/security-notes.md` (Google Ads gating reference).
- **Marketing geography sample:** `app/lib/marketing/location-data.ts` (California snippet).
- **Assumptions / limits:** No jurisdiction-specific legal research; no review of executed vendor DPAs, corporate formation documents, insurance, or live Stripe Dashboard configuration; production environment values not inspected.

## Risk & impact assessment

- **Business / user impact:** **State privacy** and unqualified **support timing** scale with traffic, paid acquisition, and support load. **Marketing** claims scale with ad spend and competitor scrutiny.
- **Likelihood:** Nationwide landlord positioning and **50-state** SEO-related data make **multi-state** users plausible; the **24-hour** reply statement is a **deterministic** obligation whenever users read `/contact`.

## Recommendations (prioritized)

1. **Engage counsel** on **US state** privacy notices and how they interact with the existing **non-EU targeting** language and **California**-specific marketing pages.
2. After counsel review, **soften or cross-link** Contact response-time language (e.g. **typically** / **aim to**) or reflect agreed service standards in **Terms**.
3. **Marketing / counsel** spot-check: **`20+ states`**, **live** / **always current** language, and alignment with **Terms** disclaimers; document substantiation or add plain qualifiers where appropriate.
4. **Process:** When changing **trial length**, **RentCast pools**, or **plan limits**, update **Terms**, **`PRICING_FAQ`**, and visible **pricing** disclosures in the same change set.

## Task candidates (optional)

- [ ] **Human-only (counsel):** Add or approve **US state privacy** disclosures (including whether **California**-specific addenda or a broader **US** section is appropriate) and reconcile with EU non-targeting language in `app/app/privacy/page.tsx`.
- [ ] **Human-only (counsel):** Review **Terms/Privacy** change mechanics (continued use after posting) for **material** change scenarios (fees, data use, liability).
- [ ] Revise **`/contact`** response-time copy and optionally **Terms** so support commitments are **aligned** and **enforceable** (or explicitly aspirational). **`Human-only` recommended** if any binding SLA language is introduced.
- [ ] Review homepage **`metadata`**, **social proof** (“20+ states”), and **“live / always current”** claims for **substantiation** or softer phrasing; involve **counsel or marketing compliance** as appropriate.
- [ ] Align **“Last updated”** dating convention across Privacy and Terms when the next substantive legal edit ships.

## Re-test checklist

- [ ] After any legal copy change: confirm **Privacy**, **Terms**, **pricing** footnotes, and **`PRICING_FAQ`** still agree on **trial**, **billing**, **refunds**, and **limits**.
- [ ] After analytics/subprocessor changes: confirm **Privacy** processor list and **`docs/launch/analytics.md`** still match shipped behavior.
- [ ] Run `npm run check` when application code (not just docs) changes.

## Next trigger and cadence

- **Trigger:** New subprocessors or tracking modes, **pricing/plan** changes, **material** marketing claims, expansion into **new jurisdictions** or enterprise contracts.
- **Recommended next window:** **Quarterly** or **before** a large paid marketing push—whichever comes first.
