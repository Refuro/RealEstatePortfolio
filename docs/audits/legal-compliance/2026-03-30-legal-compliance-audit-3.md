# Legal & Compliance Audit — 2026-03-30 (Run 3)

**Disclaimer:** This audit is a practical screening pass for obvious product-facing gaps. It is **not legal advice**, **not a substitute for licensed counsel**, and **not a guarantee of compliance** in any jurisdiction. Findings are not exhaustive; escalate material questions to a qualified attorney.

---

## Executive summary

- Privacy, terms, cookie banner, pricing/checkout copy, and contact/support language are generally coherent and conservative for a US-focused SaaS analytics product.
- The largest **disclosure-alignment** gap in this pass: **PostHog** is described only as **optional client-side** analytics gated by the cookie banner, but **server-side PostHog events** still fire for subscription lifecycle events from the Stripe webhook without any mention in the Privacy Policy.
- Cookie consent UX, Google Ads gtag gating, and marketing claims align reasonably with Terms disclaimers (no financial advice, no guarantee on estimates); formal **operating-entity** alignment remains an open item noted in Terms.
- **Recommendation:** Update privacy disclosure for server-side analytics (and have counsel confirm basis—e.g. contract/service operation vs. marketing analytics—if needed). Refresh stale footer copyright year. Otherwise no critical blockers identified from static review.

---

## Severity-ranked findings

### Critical

- None identified.

### High

- None identified from static review. (Server-side PostHog disclosure is important but framed as **Medium** pending how counsel classifies server-side product analytics vs. user-facing “optional analytics” promise.)

### Medium

- **PostHog server-side events vs. privacy copy** — Privacy Policy states PostHog initializes only after optional analytics consent and ties “no analytics” to the client path. In parallel, `captureServerEvent` in `app/lib/posthog-server.ts` sends subscription lifecycle events from `app/app/api/billing/webhook/route.ts` (e.g. `subscription_activated`, `subscription_updated`, `subscription_canceled`) keyed by app user id, with **no** consent check. Internal docs (`docs/launch/analytics.md`) describe this server path; the **public** Privacy Policy does not. Users who reject optional cookies may still have subscription-related events processed in PostHog on the server — risk of **misaligned expectations** and incomplete processor disclosure.

### Low

- **Footer copyright year** — `app/components/footer.tsx` shows `© 2025 Veld Portfolio` while policy pages show “Last updated: March 2026”; minor staleness and inconsistency.
- **Terms contracting party** — `app/app/terms/page.tsx` includes a `TODO(legal)` to align operator identity when the entity is finalized; still appropriate for counsel before high-stakes commitments.
- **Privacy “Contact” section** — Refers to “support email in the app footer”; the footer links to `/contact` as “Contact” or “Support” and the raw email appears on the contact page when `SUPPORT_EMAIL` is set. Slight wording imprecision only.

---

## Evidence reviewed

- `docs/process/legal-compliance-audit-process.md`
- `docs/process/audit-report-template.md`
- `app/app/privacy/page.tsx`
- `app/app/terms/page.tsx`
- `app/app/pricing/page.tsx`
- `app/app/contact/page.tsx`
- `app/components/footer.tsx`
- `app/components/consent/cookie-consent-banner.tsx`
- `app/components/consent/cookie-consent-provider.tsx` (via grep/reference)
- `app/lib/cookie-consent.ts`
- `app/components/analytics/posthog-provider.tsx`
- `app/components/analytics/google-ads-gtag.tsx`
- `app/lib/posthog-server.ts`
- `app/app/api/billing/webhook/route.ts`
- `app/app/layout.tsx` (consent shell, preconnect)
- `app/app/page.tsx` (hero/value props)
- `app/components/pricing-cards.tsx` (partial)
- `docs/launch/analytics.md`
- `docs/security/security-notes.md` (ads/CSP/contact context)

**Limits:** No jurisdiction-specific legal research; no review of ad platform terms or merchant policies; no runtime verification in this pass.

---

## Risk & impact assessment

If privacy expectations and actual analytics processing diverge, exposure is mainly **trust, regulatory inquiry, and chargeback/support** risk rather than a pure security defect. Likelihood depends on user awareness and enforcement posture; impact is limited by the narrow server-side event set (billing lifecycle) but **omission in the policy** is still a compliance hygiene issue.

---

## Recommendations (prioritized)

1. **Amend the Privacy Policy** to disclose server-side PostHog processing for subscription/billing-related product events, and clarify how that relates to optional **browser** analytics (cookie banner). Align wording with `docs/launch/analytics.md` and implementation.
2. **Confirm with counsel** whether server-side product analytics require a different lawful basis or notice than optional client analytics in your target markets (this audit does not decide that).
3. **Update footer copyright** to the current year when convenient, and keep policy “Last updated” dates coordinated on substantive edits.

---

## Task candidates (optional)

- [ ] Privacy Policy: add explicit **server-side PostHog** (Stripe webhook) disclosure and relationship to cookie consent.
- [ ] Footer: align `©` year with current year / policy refresh.
- [ ] When operating entity is known, resolve Terms `TODO(legal)` and align contact/operator blocks.

---

## Re-test checklist

- [ ] After privacy text changes, verify Stripe webhook still documented accurately if events/properties change.
- [ ] Verify cookie banner + client PostHog behavior still matches updated privacy language in production.
- [ ] `npm run check` (when code or copy in TS/TSX changes)

---

## Next trigger and cadence

- **Trigger:** Material changes to analytics, ads, billing, refunds, or marketing claims; pre-launch; quarterly hygiene.
- **Recommended next run:** After privacy/terms update for server-side analytics, or next quarter if no material legal-surface changes.
