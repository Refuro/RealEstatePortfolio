# Legal & Compliance Audit — 2026-03-30 (Run 4)

**Disclaimer:** This audit is a practical screening pass for obvious product-facing gaps. It is **not legal advice**, **not a substitute for licensed counsel**, and **not a guarantee of compliance** in any jurisdiction. Findings are not exhaustive; escalate material questions to a qualified attorney.

---

## Executive summary

- App-facing legal surfaces (privacy, terms, cookie banner, pricing/checkout-adjacent copy, contact) remain **structurally consistent** with Run 3; no new critical or high-severity issues were identified in this static review.
- The primary **disclosure-alignment** gap from Run 3 **persists**: the Privacy Policy still describes PostHog as loading only after optional **browser** consent, while **server-side** PostHog events continue to fire from the Stripe webhook without that narrative in the public policy.
- Footer copyright year remains **2025** while policies show “Last updated: March 2026” — minor inconsistency.
- **Recommendation:** Same as prior run — amend the Privacy Policy for server-side product/billing analytics (and have counsel confirm framing if needed), align footer year when convenient, and resolve the Terms `TODO(legal)` when the operating entity is fixed.

---

## Severity-ranked findings

### Critical

- None identified.

### High

- None identified from static review.

### Medium

- **PostHog server-side events vs. privacy copy (unchanged from Run 3)** — `app/app/privacy/page.tsx` states PostHog initializes only after optional analytics consent and that until then no PostHog scripts load and no analytics events are sent (client-focused). `app/lib/posthog-server.ts` and `app/app/api/billing/webhook/route.ts` still send subscription lifecycle events (`subscription_activated`, `subscription_updated`, `subscription_canceled`) keyed by app user id **without** reference to cookie consent. Internal `docs/launch/analytics.md` documents the server path; the **public** Privacy Policy does not. Risk: **misaligned user expectations** and incomplete disclosure of processing.

### Low

- **Footer copyright year** — `app/components/footer.tsx` still shows `© 2025 Veld Portfolio` while policy pages show “Last updated: March 2026”.
- **Terms contracting party** — `app/app/terms/page.tsx` retains `TODO(legal)` to align operator identity when finalized.
- **Privacy “Contact” section** — Still refers to “support email in the app footer”; the footer routes to `/contact` (“Support” or “Contact”) and the raw email appears on the contact page when `SUPPORT_EMAIL` is set. Minor wording imprecision only.

---

## Evidence reviewed

- `docs/process/legal-compliance-audit-process.md`
- `docs/process/audit-report-template.md`
- Prior run: `docs/audits/legal-compliance/2026-03-30-legal-compliance-audit-3.md`
- `app/app/privacy/page.tsx`
- `app/app/terms/page.tsx`
- `app/app/pricing/page.tsx`
- `app/app/contact/page.tsx`
- `app/app/page.tsx` (hero/value props)
- `app/components/footer.tsx`
- `app/components/consent/cookie-consent-banner.tsx`
- `app/lib/cookie-consent.ts`
- `app/components/consent/cookie-consent-provider.tsx` (partial)
- `app/components/analytics/posthog-provider.tsx`
- `app/components/analytics/google-ads-gtag.tsx`
- `app/lib/posthog-server.ts`
- `app/app/api/billing/webhook/route.ts`
- `app/components/pricing-cards.tsx` (partial)
- `app/app/(app)/settings/subscription-billing-display.tsx`
- `docs/launch/analytics.md` (partial)

**Limits:** No jurisdiction-specific legal research; no review of ad platform or payment network policies; no live production verification; audit-only (no code changes).

---

## Risk & impact assessment

Unchanged from Run 3: if privacy expectations and server-side analytics processing diverge, exposure is mainly **trust, inquiry, and support/chargeback** risk. The server-side event set remains narrow (subscription lifecycle tied to billing), but omission in the public policy is still a **compliance hygiene** issue worth closing.

---

## Recommendations (prioritized)

1. **Amend the Privacy Policy** to disclose server-side PostHog processing for subscription/billing-related events, and clarify its relationship to optional **client** analytics and the cookie banner. Align wording with `docs/launch/analytics.md` and implementation.
2. **Confirm with counsel** whether server-side product/billing analytics need distinct notice or basis from optional browser analytics in target markets (this audit does not decide that).
3. **Update footer copyright** to the current year when convenient, and keep policy “Last updated” dates coordinated on substantive edits.
4. **When the operating entity is known**, resolve Terms `TODO(legal)` and align contact/operator blocks across legal pages.

---

## Task candidates (optional)

- [ ] Privacy Policy: add explicit **server-side PostHog** (Stripe webhook) disclosure and relationship to cookie consent.
- [ ] Footer: align `©` year with current year / policy refresh.
- [ ] When operating entity is known, resolve Terms `TODO(legal)` and align contact/operator blocks.

---

## Re-test checklist

- [ ] After privacy text changes, verify Stripe webhook events/properties still match disclosure if implementation changes.
- [ ] Verify cookie banner + client PostHog behavior still matches updated privacy language in production.
- [ ] `npm run check` (when code or copy in TS/TSX changes)

---

## Next trigger and cadence

- **Trigger:** Material changes to analytics, ads, billing, refunds, or marketing claims; after privacy/terms updates; pre-launch; quarterly hygiene.
- **Recommended next run:** After privacy/terms update for server-side analytics disclosure, or next quarter if no material legal-surface changes.
