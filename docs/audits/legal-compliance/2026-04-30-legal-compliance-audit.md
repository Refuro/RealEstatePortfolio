# Legal & Compliance Audit — 2026-04-30

**Disclaimer (required):** This report is a **practical product and documentation screening pass** only. It is **not legal advice**, **not a substitute for licensed counsel**, and **not a guarantee of compliance** in any jurisdiction. Meaningful legal decisions should be escalated to a qualified attorney. Findings below are evidence-based observations for triage, not definitive legal conclusions.

## Executive summary

- **Overall:** Privacy, Terms, and pricing surfaces remain largely aligned with documented analytics and billing behavior. Compared to the prior pass (**2026-04-29**), two previously **High** gaps are **remediated**: the pricing FAQ (and JSON-LD source) now matches **plan-cap property visibility**, and the **mobile** pricing comparison includes the **hourly estimate pool** row via shared `PRICING_COMPARE_ROWS`.
- **Top risks:** (1) **US state privacy** (e.g. **CPRA**-style expectations) versus Privacy copy that emphasizes US/non-EU framing without state-specific disclosures, while product/marketing content still references **California**-specific positioning. (2) **Contact** page still promises replies within **24 business hours** without Terms/Privacy qualification or “best efforts” framing.
- **Recommendation:** Keep **FAQ / compare-table** parity when plan limits change; involve counsel on **state privacy** notices and **support timing** language before scaling paid acquisition nationwide.

## Severity-ranked findings

### Critical

- *None identified in this screening pass.*

### High

- **California / US state privacy gap vs nationwide positioning** — Privacy describes a **US-focused** product and states the service does **not** specifically target **EU** users, but does **not** address **US state** consumer privacy regimes (often expected for B2C SaaS with nationwide users). Marketing/location tooling still includes **California**-specific copy, which can strengthen the case that California residents are in scope for diligence. **Risk:** Expectation and disclosure gaps in covered states. **Evidence:** `app/app/privacy/page.tsx` (Overview); `app/lib/marketing/location-data.ts` (California entry).

- **Fixed support response commitment on Contact** — Copy states we **reply within 24 business hours** (Mon–Fri, US, holidays excluded). Terms and Privacy do **not** mirror, cap, or qualify that as aspirational. **Risk:** Operational and dispute exposure if response times slip. **Evidence:** `app/app/contact/page.tsx`.

### Medium

- **Server-side PostHog with stable user ID (independent of browser cookie banner)** — Privacy **discloses** backend product/lifecycle events tied to a stable user ID separately from optional browser cookies (**good alignment** with `docs/launch/analytics.md`). Jurisdiction-specific analysis may still be **counsel-dependent**. **Evidence:** `app/app/privacy/page.tsx` (PostHog bullets); `docs/launch/analytics.md` (cookie consent, server capture).

- **Policy updates: “continued use = acceptance”** — Privacy and Terms state that posting updates and continued use constitutes acceptance. Counsel may recommend **stronger notice** (e.g. email or in-app) for **material** privacy or fee/billing changes. **Evidence:** `app/app/privacy/page.tsx` (Changes); `app/app/terms/page.tsx` (Changes).

- **Public price display vs live Stripe / rich results** — Metadata, cards, and structured data ultimately depend on env and code; long-term **truth-in-pricing** hygiene needs a defined check (e.g. before price changes) so marketing and checkout do not drift. **Evidence:** `app/app/pricing/page.tsx`; prior pattern referenced in **2026-04-29** audit (`app/lib/pricing-display.ts` / pricing components—confirm when changing prices).

### Low

- **Clerk session-cookie wording** — Statement that Clerk cookies “do not contain personally identifiable information by default” may be read narrowly; some frameworks treat session tokens as personal data. Precision could be improved with counsel or a plainer technical description. **Evidence:** `app/app/privacy/page.tsx` (Clerk bullet).

- **Sentry client vs optional analytics consent** — Privacy distinguishes **Sentry** from optional PostHog/Google cookies; implementation details (e.g. client initialization when DSN is set) are **counsel-dependent** for classification. **Evidence:** `app/app/privacy/page.tsx` (Sentry); `docs/security/security-notes.md` (references client patterns—see codebase for live gating).

- **“Last updated” granularity mismatch** — Privacy: **April 9, 2026**; Terms: **April 2026**. Minor hygiene for user trust and change tracking. **Evidence:** `app/app/privacy/page.tsx`; `app/app/terms/page.tsx`.

- **`/contact` `robots: { index: false }`** — Reduces organic exposure of support promises; does **not** remove obligation to honor stated response times for users who find the page. **Evidence:** `app/app/contact/page.tsx` (metadata).

## Evidence reviewed

- **Legal / marketing surfaces (read-only):** `app/app/privacy/page.tsx`, `app/app/terms/page.tsx`, `app/app/pricing/page.tsx`, `app/app/contact/page.tsx`, `app/lib/marketing/pricing-faqs.ts`, `app/lib/marketing/pricing-compare-rows.ts`, `app/lib/marketing/location-data.ts`, `app/app/(app)/properties/page.tsx` (plan limit / over-cap messaging).
- **Supporting docs:** `docs/process/legal-compliance-audit-process.md`, `docs/process/audit-report-template.md`, `docs/launch/analytics.md`, `docs/setup/manual-steps.md`, `docs/security/security-notes.md`.
- **Prior audit:** `docs/audits/legal-compliance/2026-04-29-legal-compliance-audit.md` (for regression on prior High items).
- **Assumptions / limits:** No jurisdiction-specific legal research; no review of executed DPAs, corporate formation, insurance, or live Stripe Dashboard; production env values not inspected.

## Risk & impact assessment

- **Business impact:** **State privacy** and unqualified **support SLAs** scale with traffic, paid acquisition, and support load. Resolved FAQ/table items reduce **misleading disclosure** risk on pricing and structured data.
- **Likelihood:** Nationwide landlord positioning makes **multi-state** users plausible; **24-hour** commitment is **deterministic** whenever the Contact page is shown.

## Recommendations (prioritized)

1. **Engage counsel** on **US state** privacy notices (including whether **California**-specific sections or a broader **US state** addendum is appropriate) and how that reconciles with the EU non-targeting statement.
2. **Soften or cross-link** Contact timing language (“typically,” “aim to,” or Terms **best-efforts** language) after counsel review.
3. **Process:** When changing **plan limits**, **hourly pools**, or **trial** behavior, update **Terms**, **`PRICING_FAQ`**, and **`PRICING_COMPARE_ROWS`** in the same change set and spot-check JSON-LD on `/pricing`.

## Task candidates (optional)

- [ ] Add **California / US state privacy** sections or links per counsel-approved template.
- [ ] Revise **Contact** copy and optionally **Terms** for support response expectations.
- [ ] Align **“Last updated”** dating convention across Privacy and Terms when substantive edits ship.

## Re-test checklist

- [ ] After any pricing/plan change: FAQ + JSON-LD + compare rows + Terms trial/limit sections still agree.
- [ ] Mobile **`/pricing`**: confirm material limits visible in accordion.
- [ ] After legal copy changes: counsel sign-off; `npm run check` when application code changes.

## Next trigger and cadence

- **Trigger:** Material subprocessors/analytics changes, pricing or plan-limit changes, expansion into new jurisdictions or enterprise sales.
- **Recommended next window:** **Quarterly** or **before** a large paid marketing push—whichever comes first.

---

## Resolved since 2026-04-29 (informational)

These items were **High** in **2026-04-29** and appear **addressed** as of this review:

- **Pricing FAQ vs plan-limit UX** — FAQ now states the Properties list shows **up to the plan cap** with the remainder locked until upgrade; consistent with UI (“Showing … of … (plan limit)”). **Evidence:** `app/lib/marketing/pricing-faqs.ts`; `app/app/(app)/properties/page.tsx`.
- **Mobile pricing parity for hourly estimate pool** — **Estimate pool (per hour)** is in **`PRICING_COMPARE_ROWS`** and renders in the mobile accordion. **Evidence:** `app/lib/marketing/pricing-compare-rows.ts`; `app/app/pricing/page.tsx`.
