# Legal & Compliance Audit — 2026-03-31

**Disclaimer:** This audit is a practical product and documentation screening pass only. It is **not legal advice**, **not a substitute for licensed counsel**, and **not a guarantee of compliance** in any jurisdiction. Use it to catch obvious gaps early; escalate meaningful decisions to a qualified attorney.

## Executive summary

- **Cookie consent and optional analytics/ads** align well with runtime: PostHog and Google `gtag` load only after `hasAnalyticsConsent`; privacy policy correctly describes client gating and separately discloses server-side PostHog from Stripe webhooks.
- **High-priority gap:** The in-app **Privacy Policy** does not list **Resend** (contact email delivery) or **Sentry** (error monitoring, including client SDK when DSN is set, and server/CSP paths) as subprocessors—disclosure alignment is incomplete versus actual data flows.
- **Terms** include a visible **TODO(legal)** on operating entity; refund/cancellation language is present but **state-specific auto-renewal** and similar subscription-disclosure rules were not validated (counsel should review before scaling paid acquisition).
- **Recommendation:** Update privacy disclosures for missing vendors, finalize contracting party in terms with counsel, and have counsel spot-check subscription and marketing copy for target states.

## Severity-ranked findings

### Critical

- None identified in this static review.

### High

- **Subprocessor disclosure gaps (Privacy Policy)** — Users’ contact submissions are emailed via **Resend** (`app/app/api/contact/route.ts`); operational and client errors are reported to **Sentry** when configured (`instrumentation-client.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`, API routes). These are not enumerated in `app/app/privacy/page.tsx` under “Data We Collect” / third-party services, which understates who processes personal data relative to implementation.

### Medium

- **Operating entity not finalized in Terms** — `app/app/terms/page.tsx` includes an inline `TODO(legal)` to align the contracting party with `docs/business-launch-checklist.md` before substantive edits to operator identity. Launching paid subscriptions without resolving this creates contractual ambiguity.
- **Privacy “Contact” vs runtime** — Privacy and Terms direct users to the “support email in the app footer,” but `app/components/footer.tsx` only shows a mailto when `SUPPORT_EMAIL` is set; otherwise the link is labeled “Contact” with no address. That can frustrate privacy rights requests if env is misconfigured in production.
- **Subscription law copy not validated** — Terms describe recurring Stripe billing, cancellation, and refunds (`app/app/terms/page.tsx`), but jurisdiction-specific requirements (e.g. **automatic renewal** notice/consent in certain US states) were not verified against product copy or checkout UX. Requires **human legal review**, not code inference.

### Low

- **Clerk session cookie wording** — Privacy states Clerk session cookies “do not contain personally identifiable information by default.” Counsel may prefer softer language (tokens are linkable to accounts once combined with your systems).
- **Internal security doc drift** — `docs/security/security-notes.md` still describes a flat “20 calls per user per hour” rent estimate limit; implementation uses tiered shared hourly **RentCast** pools (`app/lib/plans.ts`, estimate routes). Not user-facing but can mislead operators reviewing “documented behavior.”
- **Marketing tone** — Landing and pricing copy use outcome-oriented language (e.g. “confidence,” “always current,” “live market data” on `app/app/page.tsx`). Terms disclaim estimates and non-advice (`Description of Service`), which generally supports alignment; still worth a quick counsel/marketing review before broad paid claims.

## Evidence reviewed

- Process: `docs/process/legal-compliance-audit-process.md`
- Legal pages: `app/app/privacy/page.tsx`, `app/app/terms/page.tsx`
- Billing/marketing: `app/app/pricing/page.tsx`, `app/components/pricing-cards.tsx`, `app/app/(app)/plans/page.tsx`, `app/app/page.tsx`
- Consent & analytics: `app/app/layout.tsx`, `app/components/consent/cookie-consent-provider.tsx`, `app/lib/cookie-consent.ts`, `app/components/consent/cookie-consent-banner.tsx`, `app/components/analytics/posthog-provider.tsx`, `app/components/analytics/google-ads-gtag.tsx`, `app/lib/analytics-client.ts`
- Server analytics: `app/lib/posthog-server.ts`, `app/app/api/billing/webhook/route.ts`
- Contact: `app/app/api/contact/route.ts`, `app/app/contact/page.tsx`
- Footer / support surfacing: `app/components/footer.tsx`
- Reference docs: `docs/launch/analytics.md`, `docs/setup/manual-steps.md`, `docs/security/security-notes.md`
- Plan/estimate limits (pricing vs code): `app/lib/plans.ts`, `app/app/api/estimates/rent/route.ts`, `app/app/api/estimates/value/route.ts`

## Risk & impact assessment

Unresolved **subprocessor** gaps increase the chance that regulators or users view the Privacy Policy as incomplete. **Entity ambiguity** in Terms weakens enforceability and clarity for paid customers. Likelihood of immediate harm is **moderate** and scales with traffic, ad spend, and scrutiny; exposure is **higher** after public launch or B2B conversations.

## Recommendations (prioritized)

1. **Amend the Privacy Policy** to name **Resend** (purpose: transactional/support email delivery for contact form) and **Sentry** (error and security monitoring, including optional client SDK), with a short description of categories of data each may receive, consistent with how the app uses them.
2. **Resolve the Terms TODO(legal)** with counsel and `docs/business-launch-checklist.md`: legal name, address if required, and consistent “we” / operator identity before treating Terms as final.
3. **Counsel review** of subscription/auto-renewal and refund copy against target US states (and any future EU/UK positioning, noting privacy already states US focus).

## Task candidates (optional)

- [ ] Add Resend and Sentry to the third-party list in `app/app/privacy/page.tsx` (subprocessor disclosure).
- [ ] Ensure production `SUPPORT_EMAIL` is always set, or adjust Privacy/Terms contact language to describe the `/contact` flow when email is not shown.
- [ ] Finalize operating entity in Terms per checklist; remove or resolve the `TODO(legal)` comment with counsel sign-off.
- [ ] Update `docs/security/security-notes.md` RentCast rate-limit bullet to match tiered hourly pool (`docs/reference/rentcast-quota.md` / `app/lib/plans.ts`).

## Re-test checklist

- [ ] Privacy Policy lists every vendor that processes personal data on current code paths (including contact and observability).
- [ ] Cookie/consent: with optional cookies **rejected**, confirm no PostHog init and no Google tag network requests; with **accepted**, confirm expected loads.
- [ ] Terms footer and checkout UX match counsel-approved subscription disclosures for chosen jurisdictions.
- [ ] `npm run check` (when code or copy changes are made after this audit).

## Next trigger and cadence

- **Trigger:** Changes to privacy/terms, new third-party scripts, billing or refund policy, major marketing claims, or pre-launch / paid-campaign milestones.
- **Recommended next run:** After privacy/terms edits from this report, or **quarterly** if no material changes.
