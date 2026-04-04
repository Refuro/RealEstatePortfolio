# Legal & Compliance Audit — 2026-04-04

**Disclaimer (mandatory):** This report is a **practical screening pass** for obvious product-facing legal and compliance gaps. It is **not legal advice**, **not a substitute for licensed counsel**, and **not a guarantee of compliance** in any jurisdiction. Use it to catch obvious issues early; escalate material legal questions to a qualified attorney. Findings are a documentation and copy review aid only.

---

## Executive summary

- **Overall health:** Core app-facing legal surfaces (Privacy Policy, Terms of Service, Pricing page) remain **substantially aligned** with runtime behavior. Cookie consent for optional analytics/ads (PostHog, Vercel Web Analytics, Google Ads) is **consistently documented** across Privacy Policy, Settings, cookie banner, `docs/security/security-notes.md`, and `docs/launch/analytics.md`. No Critical or High findings.
- **Resolved since 2026-04-03 (Run 2):** Both medium findings from the prior run are now **closed**: Settings `cookie-preferences-section.tsx` correctly names **PostHog, Vercel Web Analytics, and Google Ads**; `docs/security/security-notes.md` correctly states `gtag.js` loads only **after** optional analytics/ads consent. The overall disclosure posture is strong for a US-focused pre-launch product.
- **New surfaces in scope this pass:** Public **calculator pages** (`/tools/brrr`, `/tools/str-vs-ltr`) and the **planned Refinance What-If feature** (`docs/archive/plans/2026-04-04-refinance-payoff-insights-plan.md`). The BRRRR calculator carries an inline educational disclaimer; **STR vs LTR does not**, and the refinance feature will compute financial projections that warrant a disclaimer **before shipping**.
- **Top residual risks:** All remaining findings are **Medium or Low**: (1) Terms lack governing law/venue/dispute resolution clauses; (2) Public calculator pages have inconsistent inline disclaimer coverage; (3) Planned Refinance What-If feature needs a "not financial advice" note at launch; (4) US-only positioning without state-specific subscription disclosure validation. Counsel review is warranted for (1) and any multi-state scale.

---

## Severity-ranked findings

### Critical

- None identified in this pass.

### High

- None identified in this pass.

### Medium

- **Terms omit governing law, venue, and dispute resolution** — The Terms cover agreement, eligibility, billing, refunds, cancellation, acceptable use, and liability limits but contain **no governing law clause, no venue clause, and no dispute resolution mechanism** (`app/app/terms/page.tsx`). **Risk/impact:** Enforcement ambiguity, diligence gap, and user confusion if disputes arise across states. Standard for SaaS; **counsel** should supply clauses once the business has a legal home base. Not a blocking launch issue for a small US-focused product but grows in exposure as revenue and user base scale.

### Low

- **STR vs LTR calculator page lacks inline educational disclaimer** — The BRRRR calculator includes "Numbers are educational—confirm with your lender and include reserves, taxes, and insurance in expenses" (`app/app/tools/brrr/page.tsx`, line 57–59). The STR vs LTR calculator page has no equivalent disclaimer in the header or footer; the footer only contains navigation links (`app/app/tools/str-vs-ltr/page.tsx`). **Risk/impact:** Inconsistency across public calculator surfaces that display cash flow, NOI, DSCR, and cap rate projections. Terms state the service does not guarantee accuracy; an inline note on each calculator page closes the disclosure loop without requiring a full legal change.

- **Planned Refinance What-If feature needs a financial disclaimer before shipping** — Per `docs/archive/plans/2026-04-04-refinance-payoff-insights-plan.md`, Phase A (required) will display new monthly payment, monthly savings vs. current mortgage, break-even timeline for closing costs, and total interest delta — all computed financial projections. No disclaimer language is specified in the plan. **Risk/impact:** Publishing financial projection tools without an inline "not financial advice / educational only — confirm with your lender" caveat creates avoidable user expectation risk. The BRRRR pattern already solves this; it should be applied at launch.

- **"Last updated" granularity differs across policies** — Privacy: "March 31, 2026" (`app/app/privacy/page.tsx`); Terms: "March 2026" (`app/app/terms/page.tsx`). **Risk/impact:** Minor transparency inconsistency; harmonize format on the next policy edit.

- **Mobile "Compare all features" accordion omits estimate pool row** — Desktop comparison table includes an "Estimate pool (per hour)" row (Free: 5/hr, Investor: 10/hr, Pro: 20/hr); the mobile accordion does not (`app/app/pricing/page.tsx`, lines 138–139 vs. 181–207). The per-account hourly pool limit is still disclosed in the footnote visible on both layouts. **Risk/impact:** A mobile user who only reads the accordion could overlook the quota limit; low risk because the footnote remains visible.

- **Clerk session cookie characterization** — Privacy states Clerk session cookies "do not contain personally identifiable information **by default**" (`app/app/privacy/page.tsx`, line 65). Session identifiers can still be **linked** to identity in context; some counsel prefer softer or more precise wording. **Risk/impact:** Cosmetic legal precision, not a runtime defect; flag for counsel on next Privacy revision.

- **Privacy "US-focused / not targeting EU" positioning** — Privacy Overview states US focus (`app/app/privacy/page.tsx`, line 54). **Risk/impact:** If EU/EEA/UK users access the service or marketing targets those regions, GDPR/ePrivacy obligations may apply regardless of "targeting" language. Reassess with **counsel** before any EU-directed paid acquisition.

- **Client-side Sentry not grouped with optional analytics** — Privacy discloses Sentry for server and browser error monitoring (`app/app/privacy/page.tsx`, line 83–84) but the Cookies section does not list it under "Optional." Error monitoring is typically treated differently from marketing analytics and is commonly considered essential/functional. **Risk/impact:** Low; strict ePrivacy interpretations may question any non-essential third-party client script — flag for counsel if EU/UK footprint grows.

---

## Evidence reviewed

| Category | Path(s) / notes |
|----------|------------------|
| Privacy Policy | `app/app/privacy/page.tsx` — full read |
| Terms of Service | `app/app/terms/page.tsx` — full read |
| Pricing page, billing footnote, FAQ | `app/app/pricing/page.tsx` — full read |
| Product analytics + consent | `docs/launch/analytics.md` — PostHog gating, server-side events, cookie consent references |
| Manual / launch ops | `docs/setup/manual-steps.md` — Stripe, cookie consent, analytics, support email, envs |
| Security & consent posture | `docs/security/security-notes.md` — Clerk proxy, Google Ads gtag gating, webhooks, rate limits |
| Settings cookie preferences | `app/app/(app)/settings/cookie-preferences-section.tsx` — verified Vercel Web Analytics now named |
| Cookie consent banner | `app/components/consent/cookie-consent-banner.tsx` — banner copy, accept/reject controls |
| BRRRR calculator page | `app/app/tools/brrr/page.tsx` — full read; educational disclaimer present |
| STR vs LTR calculator page | `app/app/tools/str-vs-ltr/page.tsx` — full read; no disclaimer found |
| Planned Refinance What-If | `docs/archive/plans/2026-04-04-refinance-payoff-insights-plan.md` — overview read for in-scope financial projections |
| Previous audit (reference) | `docs/audits/legal-compliance/2026-04-03-legal-compliance-audit-2.md` |

**Assumptions / limits:** In-repo static copy and documentation only; no review of Stripe-hosted Checkout / Customer Portal legal text; no jurisdiction-specific legal research; no verification of executed DPAs with third-party vendors; fix-and-flip (`/tools/fix-and-flip`) and investment property calculator (`/investment-property-calculator`) calculator pages were not read in full this pass — the pattern finding for STR vs LTR likely applies equally to those surfaces. Process: `docs/process/legal-compliance-audit-process.md`; structure: `docs/process/audit-report-template.md`.

---

## Risk & impact assessment

**Business / user impact:** The **Medium** finding (Terms: no governing law/venue) is the highest-priority item and grows in exposure as paying user count and multi-state footprint increase. The **calculator disclaimer inconsistency** (Low) and the **refinance feature pre-ship gap** (Low) carry real user expectation risk but are easily remedied by adding one sentence per page at or before ship. **Cookie consent alignment** — the prior area of most concern across earlier audits — is now **consistent** across Privacy, Settings, banner, and internal docs.

**Likelihood / exposure:** No immediate critical or high-exposure gaps remain for a careful US-focused launch with existing paid subscriber terms and honest "as is" liability language. The governing-law gap is the most material unclosed item but is standard counsel work, not a copy or documentation defect that this audit can resolve.

---

## Recommendations (prioritized)

1. **Engage counsel** to draft **governing law, venue, and dispute resolution** clauses (and optionally arbitration/class waiver) for the Terms when the business is ready to fix a legal home base. Priority rises with each paid subscriber added.

2. **Add inline educational disclaimer to STR vs LTR** (and audit fix-and-flip + investment property calculator pages in the next pass): apply the BRRRR pattern — "Numbers are educational — confirm with your lender and include all expenses" — to each public calculator page header.

3. **Add "not financial advice" disclaimer to the Refinance What-If feature** before Phase A ships — minimum one sentence near the monthly savings / break-even output, consistent with BRRRR's educational caveat.

4. **Before scaling paid subscriptions across multiple US states**, have counsel validate **auto-renewal and cancellation disclosure** language against applicable state laws. The Terms and Pricing page already describe recurring billing, cancellation, and refunds at a high level; state-specific safe harbor may require more.

5. **Optional polish:** Align "Last updated" format between Privacy and Terms on next edit; add estimate pool row to mobile pricing accordion or note "see footnote above" to match desktop table.

---

## Task candidates

- [ ] `app/app/tools/str-vs-ltr/page.tsx` — Add inline "Numbers are educational" disclaimer matching BRRRR pattern.
- [ ] Audit `app/app/tools/fix-and-flip/page.tsx` and `app/app/investment-property-calculator/page.tsx` in next pass; add disclaimer if missing (same pattern).
- [ ] Before Phase A of Refinance What-If ships: add "not financial advice / educational only — confirm with your lender" note near financial projection output in `payoff-card.tsx`.
- [ ] **Counsel (human-only):** Governing law, venue, dispute resolution clauses for `app/app/terms/page.tsx`.
- [ ] **Counsel (human-only):** State auto-renewal / subscription disclosure validation before multi-state paid scale.

---

## Re-test checklist

- [ ] After STR vs LTR / fix-and-flip disclaimer copy added: verify inline text is visible on page load without expanding any accordion; check BRRRR copy for parity.
- [ ] After Refinance What-If (Phase A) ships: confirm disclaimer is visible near break-even / monthly savings output.
- [ ] After any Privacy or Terms edit: re-read **Cookies**, **PostHog server-side** paragraph, and **third-party list** against `docs/launch/analytics.md` for alignment.
- [ ] After cookie or Ads env changes: confirm `docs/security/security-notes.md` and Settings still match runtime (`PostHogGate`, `VercelAnalyticsClient`, `GoogleAdsGtagClient`).
- [ ] After application or policy source changes: `npm run check` (when code changes are made).

---

## Next trigger and cadence

- **Trigger:** Quarterly; **pre-ship** for Refinance What-If or any new financial projection surface; **pre-launch** if scaling paid acquisition or expanding to EU/EEA/UK; or when privacy/terms/pricing/Stripe products/analytics/entity structure changes materially.
- **Recommended next run:** **2026-07-01** (quarterly) or sooner if Refinance What-If ships, fix-and-flip / investment calculator disclaimer gaps remain open, or any of the triggers above apply.
