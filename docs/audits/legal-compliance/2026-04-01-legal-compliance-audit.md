# Legal & Compliance Audit — 2026-04-01

**Disclaimer:** This audit is a practical product and documentation screening pass only. It is **not legal advice**, **not a substitute for licensed counsel**, and **not a guarantee of compliance** in any jurisdiction.

## Executive summary

- Privacy, terms, cookie-consent, support contact, and billing surfaces are generally aligned with current implementation, with no obvious critical compliance breaks found in this pass.
- Consent behavior is clearly implemented: optional analytics/ads scripts load only after explicit optional-consent acceptance, and privacy copy discloses this client-side gating plus separate server-side analytics events.
- Data processor disclosures are materially improved and now include contact-email and observability processors used by runtime paths.
- Remaining risk is mostly policy-hardening: subscription disclosure completeness and legal text precision should be reviewed by counsel before broader paid scale.

## Severity-ranked findings

### Critical
- None identified in this audit pass.

### High
- None identified in this audit pass.

### Medium
- **Billing disclosure depth on conversion surfaces is lighter than Terms detail** — pricing and upgrade flows emphasize "Cancel anytime" and Stripe checkout, but refund window/discretion language is primarily in Terms (`app/app/pricing/page.tsx`, `app/components/pricing-cards.tsx`, `app/app/terms/page.tsx`). This can create expectation mismatch if users do not read full Terms before purchase.
- **Jurisdiction-specific subscription-law requirements not validated** — recurring billing and cancellation are documented, but this audit did not verify state-specific auto-renewal/notice wording adequacy in all target jurisdictions (`app/app/terms/page.tsx`). Human legal review is required.

### Low
- **Terms "Last updated" granularity is month-only** — `March 2026` is less precise than privacy's exact date and can make change tracking harder for users and support (`app/app/terms/page.tsx`, `app/app/privacy/page.tsx`).
- **Processor disclosure links are inconsistent by vendor** — Google has direct policy links, while other processors are named without outbound policy links (`app/app/privacy/page.tsx`). Not required in all contexts, but adding consistent links can improve transparency and trust.

## Evidence reviewed

- Process docs: `docs/process/legal-compliance-audit-process.md`, `docs/process/audit-report-template.md`
- Legal pages: `app/app/privacy/page.tsx`, `app/app/terms/page.tsx`
- Billing/legal copy surfaces: `app/app/pricing/page.tsx`, `app/components/pricing-cards.tsx`, `app/app/(app)/plans/page.tsx`, `app/app/api/billing/create-checkout-session/route.ts`
- Consent/runtime behavior: `app/app/layout.tsx`, `app/components/consent/cookie-consent-provider.tsx`, `app/components/consent/cookie-consent-banner.tsx`, `app/components/consent/cookie-preferences-button.tsx`, `app/app/(app)/settings/cookie-preferences-section.tsx`, `app/components/analytics/posthog-provider.tsx`, `app/components/analytics/google-ads-gtag.tsx`, `app/components/analytics/vercel-analytics.tsx`, `app/lib/cookie-consent.ts`
- Support/contact handling: `app/components/legal/support-contact-instructions.tsx`, `app/app/contact/page.tsx`, `app/app/contact/contact-form.tsx`, `app/app/api/contact/route.ts`, `app/components/footer.tsx`
- Data processor and server analytics references: `app/app/api/billing/webhook/route.ts`, `docs/launch/analytics.md`, `docs/setup/manual-steps.md`, `docs/security/security-notes.md`
- Assumptions/limits: Static code-and-doc review only; no jurisdiction-by-jurisdiction legal interpretation; no live production UI session replay or policy enforceability determination.

## Risk & impact assessment

- Current unresolved items are primarily medium/low and center on expectation management and legal hardening rather than immediate user harm.
- Likelihood of user-impacting disputes is moderate if pricing/checkout expectations are interpreted more broadly than Terms language.
- Exposure increases with paid traffic volume, annual-plan adoption, and expansion into additional jurisdictions without counsel review.

## Recommendations (prioritized)

1. Add concise refund/cancellation summary language (or a prominent Terms link) near pricing CTA surfaces so high-intent users see key billing terms before checkout.
2. Route current Terms through licensed counsel for recurring billing/auto-renewal compliance in intended launch jurisdictions, then lock a reviewed version.
3. Standardize legal-page metadata hygiene (exact "Last updated" date format and optional vendor-policy links) to improve transparency and auditability.

## Task candidates (optional)

- [ ] Add a short "billing terms" disclosure block adjacent to pricing upgrade CTAs linking to `/terms` refund/cancellation sections.
- [ ] Run counsel review of `app/app/terms/page.tsx` for auto-renewal and recurring billing wording in target US states.
- [ ] Update Terms "Last updated" to exact date format and adopt the same format across legal pages.
- [ ] Optionally add external policy links for listed processors in privacy page for consistency.

## Re-test checklist

- [ ] Confirm pricing and plans pages surface billing-term context before checkout redirects.
- [ ] Verify with optional cookies rejected: PostHog, Google Ads tag, and Vercel Analytics remain unloaded client-side.
- [ ] Verify with optional cookies accepted: expected analytics/ads scripts initialize and cookie preference updates persist.
- [ ] Confirm support/contact instructions match runtime both when `SUPPORT_EMAIL` is set and unset.
- [ ] `npm run check` (when code/copy changes are made after this audit).

## Next trigger and cadence

- Trigger: Any change to privacy/terms language, consent tooling, billing/refund policy, checkout UX, or addition/removal of processors.
- Recommended next run date/window: Pre-release for any legal-copy or billing-flow change, otherwise quarterly.
