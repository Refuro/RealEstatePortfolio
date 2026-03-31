# Legal & Compliance Audit — 2026-03-30 (Run 5)

**Disclaimer:** This audit is a practical screening pass for obvious product-facing gaps. It is **not legal advice**, **not a substitute for licensed counsel**, and **not a guarantee of compliance** in any jurisdiction. Findings are not exhaustive; escalate material questions to a qualified attorney.

---

## Executive summary

- **Disclosure alignment improved:** The Privacy Policy now explicitly distinguishes **browser** PostHog (cookie-banner–gated) from **server-side** product events tied to billing (e.g. Stripe webhook), closing the main gap called out in Run 4.
- **Remaining polish:** The PostHog bullet in `app/app/privacy/page.tsx` uses markdown-style `**` markers inside JSX, which typically render as **visible asterisks** rather than bold—hurting readability and polish of a key disclosure.
- **Cookie banner** remains accurate for **client** optional scripts; it does not restate server-side analytics—users who only read the banner may still need the Privacy Policy for the full picture (linked from the banner).
- **Recommendation:** Fix JSX formatting for the PostHog paragraph; keep Terms `TODO(legal)` on the list until the operating entity is finalized; optional counsel review if marketing or billing copy changes materially.

---

## Severity-ranked findings

### Critical

- None identified.

### High

- None identified from static review.

### Medium

- None identified. (Run 4’s server-side PostHog vs. public policy gap is **addressed** in the current Privacy Policy text.)

### Low

- **Privacy Policy — PostHog paragraph formatting** — `app/app/privacy/page.tsx` (PostHog list item) contains `**In the browser:**` and `**On the server:**` as plain text. In React/JSX this usually displays **literal double asterisks** instead of emphasis. Risk: **unprofessional appearance** and slightly harder scanning of an important disclosure; not a substantive legal analysis issue for this audit.
- **Cookie banner vs. full disclosure** — `app/components/consent/cookie-consent-banner.tsx` describes optional analytics/ads loading only after acceptance (true for the browser). It does not mention server-side PostHog for billing-related events; the banner links to the Privacy Policy, which now covers server-side behavior. Residual risk: **users who never open the policy** rely on a shorter summary only.
- **Terms contracting party** — `app/app/terms/page.tsx` retains `TODO(legal)` to align operator identity when finalized.
- **Privacy “Contact” section** — Still refers to “support email in the app footer”; the footer links to `/contact` (“Support” or “Contact”), and the contact page shows the email when `SUPPORT_EMAIL` is set. Minor wording imprecision.

---

## Evidence reviewed

- `docs/process/legal-compliance-audit-process.md`
- `docs/process/audit-report-template.md`
- Prior run: `docs/audits/legal-compliance/2026-03-30-legal-compliance-audit-4.md`
- `app/app/privacy/page.tsx`
- `app/app/terms/page.tsx`
- `app/app/pricing/page.tsx`
- `app/app/contact/page.tsx`
- `app/app/page.tsx` (hero/value props; marketing copy sample)
- `app/components/footer.tsx`
- `app/components/consent/cookie-consent-banner.tsx`
- `app/lib/cookie-consent.ts`
- `app/components/consent/cookie-consent-provider.tsx` (partial)
- `app/components/analytics/posthog-provider.tsx`
- `app/components/analytics/google-ads-gtag.tsx`
- `app/lib/posthog-server.ts`
- `app/app/api/billing/webhook/route.ts` (imports / server-side analytics)
- `app/components/pricing-cards.tsx` (partial)
- `app/app/(app)/settings/subscription-billing-display.tsx`
- `docs/launch/analytics.md` (partial)
- `docs/policies/` — sampled `analytics-math-policy.md` (internal metric contracts; not consumer legal copy). Other files in `docs/policies/` are engineering/design policies (CSP, shell risk, ownership metrics, design spec), not substitutes for privacy/terms.

**Limits:** No jurisdiction-specific legal research; no review of ad platform or payment network policies; no live production verification; audit-only (no code changes).

---

## Risk & impact assessment

With server-side PostHog called out in the Privacy Policy, **disclosure alignment** risk for that topic is materially reduced versus Run 4. Remaining items are mostly **presentation** (JSX asterisks), **summarization** (banner vs. policy depth), and **incomplete business identity** in Terms until `TODO(legal)` is resolved—primarily hygiene and counsel workflow rather than a repeat of the prior medium-severity mismatch.

---

## Recommendations (prioritized)

1. **Replace markdown-style `**` in the Privacy Policy PostHog bullet** with proper JSX emphasis (e.g. `<strong>` or separate sentences) so “In the browser” / “On the server” read clearly without stray asterisks.
2. **Optional:** Add a short clause to the cookie banner body (or a footnote) that **limited server-side product analytics** may occur as described in the Privacy Policy—only if product/legal wants banner-level parity; the current link to Privacy Policy may suffice.
3. **When the operating entity is known**, resolve Terms `TODO(legal)` and align operator/contact blocks across legal pages per internal checklist.
4. **On substantive marketing or pricing changes**, re-check alignment with Terms (refunds, estimates disclaimers, billing).

---

## Task candidates (optional)

- [ ] Privacy Policy: replace `**…**` in PostHog `<li>` with valid JSX emphasis (no literal asterisks in rendered text).
- [ ] When operating entity is known, resolve Terms `TODO(legal)` and align contact/operator blocks.

---

## Re-test checklist

- [ ] After privacy copy/formatting changes, spot-check rendered `/privacy` in the browser (PostHog section legibility).
- [ ] Verify cookie banner + client PostHog/gtag behavior still matches privacy language if implementation changes.
- [ ] `npm run check` (when code or copy in TS/TSX changes)

---

## Next trigger and cadence

- **Trigger:** Material changes to analytics, ads, billing, refunds, or marketing claims; after privacy/terms updates; pre-launch; quarterly hygiene.
- **Recommended next run:** Next quarter, or sooner if legal surfaces or billing/analytics behavior changes.
