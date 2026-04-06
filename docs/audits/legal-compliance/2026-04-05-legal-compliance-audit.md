# Legal & Compliance Audit — 2026-04-05

**Disclaimer (mandatory):** This report is a **practical screening pass** for obvious product-facing legal and compliance gaps. It is **not legal advice**, **not a substitute for licensed counsel**, and **not a guarantee of compliance** in any jurisdiction. Use it to catch obvious issues early; escalate material legal questions to a qualified attorney. Findings are a documentation and copy review aid only.

---

## Executive summary

- **Overall health:** Core legal surfaces (Privacy Policy, Terms of Service, cookie consent, sign-up disclosure, data deletion, and export) remain **substantially aligned** with runtime behavior. No Critical findings. One **new Medium** finding is introduced: the "What if I refinanced?" feature inside `payoff-card.tsx` shipped as a live, authenticated financial-projection tool with no "educational only / confirm with your lender" disclaimer — this was explicitly flagged in the prior audit (2026-04-04) as a pre-ship requirement.
- **Resolved since 2026-04-04:** The **fix-and-flip calculator** (`/tools/fix-and-flip`) now carries an inline educational disclaimer ("Numbers are educational — add reserves and verify with your lender and agent"), closing that Low finding.
- **Carried forward:** Terms governing-law gap (Medium, unchanged), STR vs LTR and investment-property-calculator disclaimer gaps (Low, unchanged), minor policy formatting inconsistencies (Low, unchanged), mobile pricing accordion missing estimate-pool row (Low, unchanged).
- **Top residual risks:** (1) Refinance What-If projections live with no disclaimer; (2) Terms still lack governing law / venue / dispute resolution; (3) STR vs LTR and investment property calculator pages inconsistently uncovered by the calculator-disclaimer pattern established on BRRRR and fix-and-flip.

---

## Severity-ranked findings

### Critical

- None identified in this pass.

### High

- None identified in this pass.

### Medium

- **Refinance What-If feature shipped without a financial disclaimer** — The "What if I refinanced?" panel inside `app/app/(app)/properties/[id]/payoff-card.tsx` is now a live, authenticated feature that computes and displays **new P&I payment, monthly savings vs. current mortgage, total interest saved/added, and break-even timeline** (see lines 374–460). The 2026-04-04 audit flagged this exact feature as needing "not financial advice / educational only — confirm with your lender" copy **before Phase A ships**. The feature shipped without it. BRRRR (`app/app/tools/brrr/page.tsx`, line 57–59) and fix-and-flip (`app/app/tools/fix-and-flip/page.tsx`, line 56–58) already apply this pattern. **Risk/impact:** Users acting on displayed monthly-savings or break-even projections without the hedging context may have inflated reliance on the model output. The fix is one sentence near the output block. Terms' "as is / no guarantee" language provides background protection but an inline caveat is the standard for every other financial calculator in the product.

- **Terms of Service omit governing law, venue, and dispute resolution** — `app/app/terms/page.tsx` covers agreement, eligibility, billing, refunds, cancellation, acceptable use, and liability limits, but contains **no governing law clause, no venue clause, and no dispute resolution mechanism**. This finding carried forward unchanged from the 2026-03-30, 2026-04-01, 2026-04-03, and 2026-04-04 audits. **Risk/impact:** Enforcement ambiguity and user confusion if disputes arise across states; grows in exposure as paying user count and multi-state footprint scale. Requires **counsel** to draft appropriate clauses once a legal home base is established.

### Low

- **STR vs LTR calculator page still lacks inline educational disclaimer** — `app/app/tools/str-vs-ltr/page.tsx` header (lines 57–60) reads "Compare short-term (nightly) and long-term rent on the same purchase and mortgage. Adjust occupancy, platform fees, and rent to see cash flow and coverage." — no "Numbers are educational" hedging. BRRRR (line 57–59) and fix-and-flip (line 56–58) have such disclaimers. STR vs LTR computes cash flow, NOI, DSCR, and cap rate. **Risk/impact:** Inconsistency across public calculator surfaces. Easy one-sentence fix matching the established pattern.

- **Investment property calculator page still lacks inline educational disclaimer** — `app/app/investment-property-calculator/page.tsx` header (lines 54–56) reads "Estimate rental property performance. With a free account, save deals in Analyze and track your portfolio." — no hedging language. This was noted as likely carrying the same gap in the 2026-04-04 assumptions block and is confirmed here. **Risk/impact:** Same as STR vs LTR finding above; same one-sentence fix applies.

- **"Last updated" granularity differs between Privacy and Terms** — Privacy Policy: "March 31, 2026" (`app/app/privacy/page.tsx`, line 43); Terms of Service: "March 2026" (`app/app/terms/page.tsx`, line 43). **Risk/impact:** Minor transparency inconsistency; harmonize format on the next policy revision.

- **Mobile pricing accordion omits the estimate pool row** — The desktop feature comparison table includes "Estimate pool (per hour)" (Free: 5/hr, Investor: 10/hr, Pro: 20/hr) at `app/app/pricing/page.tsx` lines 138–139. The mobile `<details>` accordion (lines 180–207) does not include this row. The per-account hourly pool limit is still visible in the text footnote below the cards on both layouts. **Risk/impact:** A mobile user who reads only the accordion summary without the footnote may be surprised by quota limits. Low risk because the footnote persists; consider adding an "Estimate pool (per hour)" row or a note like "see estimate quota footnote below."

- **Privacy "US-focused / not targeting EU" soft positioning** — `app/app/privacy/page.tsx` line 54 states "We are US-focused for now and do not target EU users specifically." If EU/EEA/UK users access the service or paid acquisition reaches those regions, GDPR/ePrivacy obligations may apply regardless of targeting language. **Risk/impact:** Reassess with counsel before any EU-directed acquisition.

- **Onboarding emails sent without explicit marketing-email opt-in at sign-up** — `app/app/api/cron/onboarding-emails/route.ts` and `app/lib/emails/onboarding-reengagement.ts` send day-3 and day-7 re-engagement emails to users who have not added a property. The sign-up view (`app/app/sign-up/[[...sign-up]]/sign-up-view.tsx`) collects agreement to Terms/Privacy but does not include a checkbox or copy indicating that transactional re-engagement emails will be sent. An unsubscribe link is included in every email, and `onboardingEmailsOptedOutAt` opt-out is honored. **Risk/impact:** For a US-only product with transactional-style re-engagement copy, the unsubscribe footer generally satisfies CAN-SPAM requirements. However, some jurisdictions and some counsel treat re-engagement sequences as commercial email requiring prior explicit consent. Given the unsubscribe link, this is Low for current US-only scope; note for counsel review if EU/UK footprint grows (where PECR/GDPR "soft opt-in" rules differ).

---

## Evidence reviewed

| Category | Path(s) / notes |
|----------|------------------|
| Privacy Policy | `app/app/privacy/page.tsx` — full read |
| Terms of Service | `app/app/terms/page.tsx` — full read |
| Pricing page, billing footnote, FAQ | `app/app/pricing/page.tsx` — full read |
| Sign-up view | `app/app/sign-up/[[...sign-up]]/sign-up-view.tsx` — Terms/Privacy link and consent copy |
| Cookie consent banner | `app/components/consent/cookie-consent-banner.tsx` — banner copy, accept/reject controls |
| Cookie consent logic | `app/lib/cookie-consent.ts` — first-party consent cookie schema |
| Footer | `app/components/footer.tsx` — Privacy, Terms, Contact, and cookie-preferences links |
| Settings: delete account | `app/app/(app)/settings/delete-account-section.tsx` — deactivate + permanent delete flows |
| Settings: CSV export | `app/app/(app)/settings/download-csv-button.tsx` — portfolio export |
| Onboarding emails (cron) | `app/app/api/cron/onboarding-emails/route.ts` — opt-out guard, send logic |
| Onboarding email unsubscribe | `app/app/api/unsubscribe/route.ts` — HMAC-validated GET unsubscribe endpoint |
| Onboarding email copy | `app/lib/emails/onboarding-reengagement.ts` — email text, unsubscribe URL |
| Product analytics | `docs/launch/analytics.md` — PostHog gating, server-side events, cookie consent references |
| Manual / launch ops | `docs/setup/manual-steps.md` — Stripe, cookie consent, analytics, support email |
| Security & consent posture | `docs/security/security-notes.md` — Google Ads gtag gating, CSP, rate limits |
| BRRRR calculator | `app/app/tools/brrr/page.tsx` — disclaimer present (lines 57–59) |
| Fix and flip calculator | `app/app/tools/fix-and-flip/page.tsx` — disclaimer present (lines 56–58); **RESOLVED** from prior audit |
| STR vs LTR calculator | `app/app/tools/str-vs-ltr/page.tsx` — no disclaimer; **carried forward** |
| Investment property calculator | `app/app/investment-property-calculator/page.tsx` — no disclaimer; **confirmed open** |
| Refinance What-If (payoff card) | `app/app/(app)/properties/[id]/payoff-card.tsx` — live financial projections, no disclaimer; **new Medium** |
| Plans & billing page | `app/app/(app)/plans/page.tsx` — plan/billing context display |
| Root layout | `app/app/layout.tsx` — CookieConsentProvider, PostHogGate, GoogleAdsGtagClient, VercelAnalyticsClient wiring |
| Homepage | `app/app/page.tsx` — landing copy, pricing preview, free plan framing |
| Contact page | `app/app/contact/page.tsx` — 24-hr support SLA copy, "not tax/legal/investment advice" note |
| Audit process | `docs/process/legal-compliance-audit-process.md` |
| Report template | `docs/process/audit-report-template.md` |
| Prior audit | `docs/audits/legal-compliance/2026-04-04-legal-compliance-audit.md` |

**Assumptions / limits:** In-repository static copy and documentation only. No review of Stripe-hosted Checkout or Customer Portal legal text. No jurisdiction-specific legal research. No verification of executed DPAs with third-party vendors. Server-side PostHog events (billing/account milestones) are disclosed in Privacy but not subject to user cookie consent — this is consistent with the privacy policy as written and was unchanged from prior audits; no new finding raised.

---

## Risk & impact assessment

**Business / user impact:** The **Refinance What-If** gap (Medium) is the single highest-priority new finding: a live authenticated feature computing financial projections (monthly savings, break-even, total interest delta) with no "educational only" caveat. Every other financial calculator in the product carries this language and it is a one-line addition. The governing-law gap (Medium, carried) remains the most material counsel-dependency item and grows with each new paying subscriber. The STR vs LTR and investment property calculator disclaimer gaps (Low) are minor but create inconsistency now that fix-and-flip is resolved — they are the straightforward remaining items from the full calculator audit the process requested. The onboarding email finding (Low) is compliant for US/CAN-SPAM given the unsubscribe link, but should be reassessed before any EU expansion.

**Likelihood / exposure:** No Critical or new High findings. No evidence of runtime consent-bypass, missing data deletion path, or deceptive billing claims. Immediate user-facing risks are limited to the refinance disclaimer gap (easily patched) and the minor calculator inconsistencies. The governing-law gap is structural legal debt rather than a product defect.

---

## Recommendations (prioritized)

1. **Add "not financial advice / educational only — confirm with your lender" disclaimer to the Refinance What-If output block** in `app/app/(app)/properties/[id]/payoff-card.tsx` near the monthly-savings / break-even output, matching the BRRRR and fix-and-flip pattern. One sentence; no code architecture change needed.

2. **Add inline educational disclaimer to STR vs LTR** (`app/app/tools/str-vs-ltr/page.tsx`) and **investment property calculator** (`app/app/investment-property-calculator/page.tsx`) pages: apply the BRRRR/fix-and-flip pattern — "Numbers are educational — confirm with your lender and include all expenses" — to each page header. This closes all public calculator disclaimer gaps in one pass.

3. **Engage counsel** to draft **governing law, venue, and dispute resolution** clauses for `app/app/terms/page.tsx`. Priority rises with each new paying subscriber and with any multi-state or international expansion.

4. **Before any EU/EEA/UK paid acquisition:** Reassess Privacy "US-focused" positioning and onboarding email consent mechanics with counsel; GDPR/ePrivacy and PECR rules differ materially from CAN-SPAM.

5. **Optional polish:** Align "Last updated" format between Privacy and Terms on next policy edit; add "Estimate pool (per hour)" row to the mobile pricing accordion, or insert a note like "See hourly quota footnote below."

---

## Task candidates

- [ ] `app/app/(app)/properties/[id]/payoff-card.tsx` — Add "Numbers are educational — confirm with your lender" disclaimer near the refinance projection output block (monthly savings / break-even / total interest metrics). **(New — previously pre-ship, now live)**
- [ ] `app/app/tools/str-vs-ltr/page.tsx` — Add inline "Numbers are educational" disclaimer in page header, matching BRRRR and fix-and-flip pattern. **(Carried forward)**
- [ ] `app/app/investment-property-calculator/page.tsx` — Add inline "Numbers are educational" disclaimer in page header. **(Confirmed open)**
- [ ] `app/app/pricing/page.tsx` — Add "Estimate pool (per hour)" row to the mobile `<details>` accordion (lines ~181–207) to match desktop table. **(Carried forward; optional polish)**
- [ ] On next policy edit: Align "Last updated" date format in `app/app/terms/page.tsx` to match `app/app/privacy/page.tsx` ("Month DD, YYYY"). **(Carried forward; optional polish)**
- [ ] **Counsel (human-only):** Draft governing law, venue, and dispute resolution clauses for `app/app/terms/page.tsx`.
- [ ] **Counsel (human-only):** Validate auto-renewal and cancellation disclosure language against applicable US state laws before multi-state paid scale.
- [ ] **Counsel (human-only, pre-EU expansion):** Review onboarding email consent mechanism and Privacy "US-focused" positioning before any EU/EEA/UK paid acquisition.

---

## Re-test checklist

- [ ] After payoff-card refinance disclaimer is added: verify text is visible when the "What if I refinanced?" section is expanded, near the projection output metrics.
- [ ] After STR vs LTR and investment property calculator disclaimers are added: verify each matches the BRRRR/fix-and-flip inline text pattern; check that text is visible without expanding any accordion.
- [ ] After any Privacy or Terms edit: re-read Cookies, PostHog server-side paragraph, and third-party list against `docs/launch/analytics.md` for alignment; verify "Last updated" format consistency.
- [ ] After cookie or ads env changes: confirm `docs/security/security-notes.md` and Settings cookie-preferences section still match runtime (`PostHogGate`, `VercelAnalyticsClient`, `GoogleAdsGtagClient`).
- [ ] After code changes: `npm run check`.

---

## Next trigger and cadence

- **Trigger:** Quarterly; **immediately** for the Refinance What-If disclaimer (Medium — live feature); **pre-ship** for any new financial-projection surface; **pre-launch** if scaling paid acquisition to EU/EEA/UK; or when privacy/terms/pricing/Stripe products/analytics/entity structure changes materially.
- **Recommended next run:** **2026-07-01** (quarterly), or sooner if the Medium finding is not patched within one sprint, if any new financial-output feature ships, or if EU expansion is planned.
