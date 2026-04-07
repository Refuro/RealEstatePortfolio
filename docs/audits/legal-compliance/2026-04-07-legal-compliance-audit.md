# Legal & Compliance Audit — 2026-04-07

**Disclaimer (mandatory):** This report is a **practical screening pass** for obvious product-facing legal and compliance gaps. It is **not legal advice**, **not a substitute for licensed counsel**, and **not a guarantee of compliance** in any jurisdiction. Use it to catch obvious issues early; escalate material legal questions to a qualified attorney. Findings are a documentation and copy review aid only.

---

## Executive summary

- **Overall health:** Privacy Policy, Terms, cookie consent, pricing footnotes, sign-up disclosures, and runtime analytics gating remain **aligned** with documented behavior. **No Critical or High findings** in this pass.
- **Improvement since 2026-04-05:** The **Refinance What-If** copy on the property payoff card now includes an educational estimate disclaimer (`payoff-card.tsx`), resolving the prior **Medium** finding for that surface. The dedicated **refinance workspace** also carries an informational / not-advice line (`refinance-workspace.tsx`).
- **Top residual risks:** Terms still lack **governing law, venue, and dispute resolution** (**Medium**, counsel). Two public calculator pages remain **without** the inline educational hedging used on BRRRR and fix-and-flip (**Low**, engineering). Minor transparency and parity items (policy date format, mobile pricing accordion row) remain **Low**.

---

## Severity-ranked findings

### Critical

- None identified in this pass.

### High

- None identified in this pass.

### Medium

- **Terms of Service omit governing law, venue, and dispute resolution** — `app/app/terms/page.tsx` still has no clause selecting applicable law, forum, or dispute process. **Risk/impact:** Ambiguity if cross-state or cross-border disputes arise; exposure grows with paid subscribers. **Requires human counsel** once a legal home base is chosen.

### Low

- **STR vs LTR calculator page lacks inline educational disclaimer** — `app/app/tools/str-vs-ltr/page.tsx` header (lines 54–60) describes the tool but does not mirror the BRRRR / fix-and-flip “numbers are educational — verify with your lender” pattern. **Risk/impact:** Inconsistent hedging across calculator surfaces; easy copy fix.

- **Investment property calculator page lacks inline educational disclaimer** — `app/app/investment-property-calculator/page.tsx` header (lines 51–56) same gap. **Risk/impact:** Same as STR vs LTR.

- **“Last updated” granularity differs between Privacy and Terms** — Privacy: “March 31, 2026” (`app/app/privacy/page.tsx`); Terms: “March 2026” (`app/app/terms/page.tsx`). **Risk/impact:** Minor transparency inconsistency.

- **Mobile pricing accordion omits estimate pool row** — Desktop table lists “Estimate pool (per hour)” (`app/app/pricing/page.tsx`); mobile `<details>` accordion does not, though the footnote under the cards still states hourly pool limits. **Risk/impact:** Mobile users who read only the accordion may miss quota detail.

- **Privacy “US-focused / not targeting EU” positioning** — `app/app/privacy/page.tsx` (Overview). If EU/EEA/UK users or paid acquisition in those regions increase, obligations may apply regardless of targeting language. **Risk/impact:** Low for current stated scope; reassess with counsel before EU-directed growth.

- **Onboarding re-engagement emails vs explicit sign-up consent** — Sign-up (`app/app/sign-up/[[...sign-up]]/sign-up-view.tsx`) references Terms/Privacy but does not describe day-3/day-7 onboarding emails; emails include unsubscribe (per prior audits and `docs/setup/manual-steps.md` posture). **Risk/impact:** Low for US/CAN-SPAM-style compliance if copy is transactional and unsubscribe works; counsel if treating as marketing or expanding to stricter jurisdictions.

---

## Evidence reviewed

| Category | Path(s) / notes |
|----------|------------------|
| Privacy Policy | `app/app/privacy/page.tsx` — processors, cookies, server PostHog, Google, Sentry, contact |
| Terms of Service | `app/app/terms/page.tsx` — contracting party, billing, refunds, cancellation, liability |
| Pricing | `app/app/pricing/page.tsx` — trial copy, Stripe badges, footnote to Terms anchors, FAQ, desktop vs mobile compare |
| Sign-up | `app/app/sign-up/[[...sign-up]]/sign-up-view.tsx` — trial line, Terms/Privacy links |
| Contact | `app/app/contact/page.tsx` — 24 business hours, not tax/legal/investment advice |
| Cookie banner | `app/components/consent/cookie-consent-banner.tsx` |
| Consent gating | `app/components/analytics/posthog-provider.tsx`, `google-ads-gtag.tsx`, `vercel-analytics.tsx` |
| Root wiring | `app/app/layout.tsx` — providers order |
| Refinance surfaces | `app/app/(app)/properties/[id]/payoff-card.tsx` (What-If disclaimer); `app/app/(app)/refinance/refinance-workspace.tsx` (footer informational line) |
| Public calculators | `app/app/tools/str-vs-ltr/page.tsx`, `app/app/investment-property-calculator/page.tsx` |
| Support copy in policies | `app/components/legal/support-contact-instructions.tsx` |
| Product analytics docs | `docs/launch/analytics.md` |
| Manual / ops | `docs/setup/manual-steps.md` |
| Security / consent notes | `docs/security/security-notes.md` |
| Homepage (marketing sample) | `app/app/page.tsx` — hero/value props (spot-check for overclaims) |
| Process & template | `docs/process/legal-compliance-audit-process.md`, `docs/process/audit-report-template.md` |
| Prior audit | `docs/audits/legal-compliance/2026-04-05-legal-compliance-audit.md` |

**Assumptions / limits:** Static in-repo review only; no live environment or Stripe Checkout/Customer Portal text review; no DPA/vendor contract review; no state-by-state auto-renewal legal research. Server-side PostHog for billing/account events is disclosed in Privacy and is intentional relative to the browser cookie banner.

---

## Risk & impact assessment

Unresolved items are **structural legal drafting** (governing law — Medium) and **copy consistency** (calculator disclaimers, policy dates, mobile table parity — Low). No evidence of consent bypass for optional analytics/ads scripts, deceptive billing promises vs Terms, or missing deletion/export narratives in Privacy/Terms for the flows described.

---

## Recommendations (prioritized)

1. **Engage counsel** to add **governing law, venue, and dispute resolution** to Terms, and to sanity-check **auto-renewal / cancellation** copy against states where you have paying customers as volume grows.

2. **Engineering / product:** Add one-line **educational / not advice** disclaimers to **STR vs LTR** and **investment property calculator** headers to match BRRRR and fix-and-flip.

3. **Optional polish:** Harmonize **Last updated** format on Privacy and Terms; add **estimate pool** row (or pointer to footnote) in the **mobile** pricing accordion.

4. **Before EU/EEA/UK expansion:** Counsel review of Privacy framing, cookie/analytics basis, and email consent mechanics.

---

## Task candidates

- [ ] **`app/app/tools/str-vs-ltr/page.tsx`** — Add inline educational disclaimer (match BRRRR / fix-and-flip). **Engineering**
- [ ] **`app/app/investment-property-calculator/page.tsx`** — Same. **Engineering**
- [ ] **`app/app/pricing/page.tsx`** — Mobile accordion: include estimate pool row or explicit “see footnote” note. **Engineering**
- [ ] **Next policy edit** — Align Terms “Last updated” style with Privacy (`Month DD, YYYY`). **Engineering / ops**
- [ ] **`app/app/terms/page.tsx`** — Governing law, venue, dispute resolution clauses. **Human counsel**
- [ ] **Multi-state paid scale** — Validate refund/cancellation/auto-renewal disclosures vs applicable state laws. **Human counsel**
- [ ] **Pre-EU expansion** — Privacy, cookies, onboarding email characterization. **Human counsel**

---

## Human counsel vs engineering

| Owner | Task |
|--------|------|
| **Human counsel** | Draft Terms: governing law, venue, dispute resolution; periodic review of billing/refund/cancellation language for state law; pre-EU privacy/email/cookie basis. |
| **Engineering / product copy** | STR vs LTR + investment property calculator disclaimers; optional pricing accordion + “Last updated” harmonization. |

---

## Re-test checklist

- [ ] After any Terms change: re-read Pricing footnote links (`#subscriptions-and-payments`, `#refunds`, `#cancellation`) still valid.
- [ ] After calculator disclaimer edits: spot-check layout on mobile.
- [ ] `npm run check` when code or copy in `app/` changes.

---

## Next trigger and cadence

- **Trigger:** Monthly, or after material changes to Privacy/Terms, billing, analytics vendors, or marketing claims.
- **Suggested next run:** **2026-05-07** (or next release with legal/analytics/billing touch).

---

## Output path

Report written to: `docs/audits/legal-compliance/2026-04-07-legal-compliance-audit.md`
