# Full Audit Synthesis — 2026-04-03 (Run 2)

## Audits included

Fourteen parallel agent lanes — second pass of 2026-04-03, run after three major plans were executed (embedded mockups, landing mobile/CTA improvements, pricing page polish queued). First 7 lanes used the default model; final 7 used a faster model.

| Lane | Report |
|------|--------|
| Code | [`../code/2026-04-03-code-audit-2.md`](../code/2026-04-03-code-audit-2.md) |
| Math & Logic | [`../math/2026-04-03-math-logic-audit-2.md`](../math/2026-04-03-math-logic-audit-2.md) |
| Feature / UX / IA | [`../feature/2026-04-03-feature-ux-audit-2.md`](../feature/2026-04-03-feature-ux-audit-2.md) |
| Mobile experience | [`../feature/2026-04-03-mobile-experience-audit-2.md`](../feature/2026-04-03-mobile-experience-audit-2.md) |
| Security & Privacy | [`../security/2026-04-03-security-audit-2.md`](../security/2026-04-03-security-audit-2.md) |
| Performance & Cost | [`../performance-cost/2026-04-03-performance-cost-audit-2.md`](../performance-cost/2026-04-03-performance-cost-audit-2.md) |
| Reliability & Operations | [`../reliability-ops/2026-04-03-reliability-ops-audit-2.md`](../reliability-ops/2026-04-03-reliability-ops-audit-2.md) |
| Data Integrity | [`../data-integrity/2026-04-03-data-integrity-audit-2.md`](../data-integrity/2026-04-03-data-integrity-audit-2.md) |
| Business & Valuation | [`../business/2026-04-03-business-valuation-audit-2.md`](../business/2026-04-03-business-valuation-audit-2.md) |
| Growth Funnel | [`../growth-funnel/2026-04-03-growth-funnel-audit-2.md`](../growth-funnel/2026-04-03-growth-funnel-audit-2.md) |
| SEO | [`../seo/2026-04-03-seo-audit-2.md`](../seo/2026-04-03-seo-audit-2.md) |
| Documentation | [`../documentation/2026-04-03-documentation-audit-2.md`](../documentation/2026-04-03-documentation-audit-2.md) |
| Legal & Compliance | [`../legal-compliance/2026-04-03-legal-compliance-audit-2.md`](../legal-compliance/2026-04-03-legal-compliance-audit-2.md) |
| AI Agent Governance | [`../agent-governance/2026-04-03-agent-governance-audit-2.md`](../agent-governance/2026-04-03-agent-governance-audit-2.md) |

**Context:** Three significant plans were executed between run 1 and run 2:
- `docs/archive/plans/2026-04-03-embedded-mockups-plan.md` — Implemented. PNGs deleted; `DashboardMockup`, `MortgageMockup`, `DealAnalyzerMockup` + `MockupFrame` live.
- `docs/archive/plans/2026-04-03-landing-mobile-cta-plan.md` — Implemented (all 10 items).
- `docs/archive/plans/2026-04-03-pricing-page-premium-plan.md` — Queued, not yet implemented.

---

## Cross-cutting themes

1. **MockupFrame CLS (new, affects LCP):** `scale` initialises at `0`, the outer container collapses to `0px` on first paint, then jumps when `ResizeObserver` fires. Hits the hero desktop, hero mobile, and pricing dashboard placements — all above-the-fold or near-LCP. Performance and Feature/UX both flag it Medium; combined risk is effectively High for Core Web Vitals. One-line fix: add a `min-h` placeholder on the wrapper before scale resolves.

2. **Deprecated tokens in freshly committed mockup components:** `border-border/70` (9 instances in `deal-analyzer-mockup.tsx`, 1 in `mortgage-mockup.tsx`) and `bg-card/95` — both explicitly banned in `design-spec-2026.md` §15.2 and §5. `uppercase tracking-wide` also introduced (7 new instances). These just shipped; fix cost is lowest now.

3. **Sentry `VERCEL_ENV` not applied (confirmed High, third consecutive audit):** All four Sentry config files (`sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`, `instrumentation-client.ts`) still use `process.env.NODE_ENV`. Every deployment to Vercel preview appears as "production" in Sentry. Reliability lane rates this High; carried from morning run 1.

4. **Welcome modal a11y (confirmed High):** `onboarding-panel.tsx` still has no `role="dialog"`, `aria-modal`, `aria-labelledby`, focus trap, or Escape handler. Feature/UX lane rates High; carried from both the morning run and yesterday.

5. **Timing copy inconsistency:** "60 seconds" (hero, bottom CTA) vs "2 minutes" (How it works, onboarding modal) on the same landing page. Small but directly contradicts credibility claims on the same URL. Feature/UX + Growth both note it.

6. **`next.config.ts` `images.localPatterns` wildcard:** Still present after embedded-mockups plan cleanup step that explicitly listed its removal. Code and Performance both flag it Low.

7. **Confirmed carried items from morning run 1 (still open):** billing rate limits (sync/portal), admin layout auth, export truncation UX, import loanType normalization, Papa Parse error surfacing, JSON-LD WebApplication operatingSystem/offers, cookie/gtag disclosure alignment, cursor-agent-setup.md seo-audit-agent.mdc, deals at-limit CTA, PlanIntentUrlSync on /sign-in, funnel instrumentation gaps, PostHog landingVariant on user_signed_up.

---

## Deduplication notes

| Duplicate sources | Consolidated handling |
|---|---|
| MockupFrame CLS | Performance (Medium) + Feature/UX (Medium) → **Ship** (combined LCP risk) |
| `border-border/70` in mockups | Code (High) + Feature/UX (Low in modal) → **Ship** (freshly committed; low fix cost) |
| `localPatterns` still in config | Code (Low) + Performance (Low) → **Schedule** (minor housekeeping) |
| `cursor-agent-setup.md` seo-audit-agent.mdc | Documentation (Medium) + Governance (Medium) → **Schedule** (one task) |
| Timing "60s" vs "2 min" | Feature/UX (Medium) + Growth (editorial note) → **Schedule** |
| 640–767px hero overlap (mobile mockup + HERO_STEPS both visible) | Feature/UX (Medium) + Mobile (noted) → **Schedule** |

---

## PM triage (2026-04-03 run 2)

Per [`docs/process/full-audit-synthesis.md`](../../process/full-audit-synthesis.md) §3.5.

### Ship (next window)

*Unresolved findings that warrant immediate action before any production traffic on the new LCP surfaces.*

- [ ] **Performance/UX — MockupFrame CLS fix:** Add a minimum height placeholder to `MockupFrame` for non-`fitToHeight` frames (hero desktop, hero mobile, pricing dashboard) before the `ResizeObserver` scale resolves. One-line CSS/style addition; no component restructuring needed. `app/components/mockups/mockup-frame.tsx`.

- [ ] **Code — Deprecated tokens in new mockup components:** Remove `border-border/70` (9× in `deal-analyzer-mockup.tsx`, 1× in `mortgage-mockup.tsx`), `bg-card/95`, and `uppercase tracking-wide` violations; replace with current `design-spec-2026.md` tokens. These were introduced today and are cheapest to fix now.

- [ ] **Reliability — Sentry `VERCEL_ENV`:** Replace `process.env.NODE_ENV` with `process.env.VERCEL_ENV ?? process.env.NODE_ENV` (or equivalent) in all four Sentry init files. This has been open since run 1 this morning and multiple prior audits; correct Sentry environment tagging is a prerequisite for reliable production monitoring.

### Schedule (next batch)

*Bounded medium improvements; not blocking current release if PM accepts the risk.*

**Security**
- [ ] Rate limits: Add `billing:sync` and `billing:portal` to `RATE_LIMITS` in `app/lib/rate-limit.ts`, or document intentional omission with monitoring rationale in `security-audit.md`.
- [ ] Admin layout: Replace `getAppUser()` with `getActiveAppUser()` + null redirect in `app/app/admin/layout.tsx`; verify soft-deleted admins cannot access admin surfaces.
- [ ] CSP docs: Update `docs/security/security-audit.md` §5 directive table to include Google Ads domains, PostHog, Facebook Pixel, Clerk custom domain, and Google Fonts now present in `next.config.ts`.

**UX / Feature**
- [ ] Welcome modal a11y: Add `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, focus trap, and Escape handler to `onboarding-panel.tsx` modal card.
- [ ] Timing copy consistency: Reconcile "60 seconds" (hero/bottom CTA) vs "2 minutes" (How it works / onboarding modal) to a single claim across `app/app/page.tsx` and `onboarding-panel.tsx`.
- [ ] 640–767px breakpoint overlap: At `sm` widths, both the `md:hidden` mobile mockup and `sm:grid` HERO_STEPS are simultaneously visible; clarify intended breakpoint boundary for the hero section.
- [ ] Design-spec §6: Update nav section in `docs/design/design-spec-2026.md` to reflect `app-nav.tsx` (Tools + Plans), or add a one-line documented deviation note.
- [ ] Pricing FAQ deduplication: "Do I need a credit card?" appears in both the FAQ accordion and the bottom CTA card on `pricing/page.tsx`; remove the duplicate during the pricing polish pass.

**Performance**
- [ ] RentCast quota dedup: Single fetch per page for `RentCastQuotaHint` (currently 3 mounts each in `property-form.tsx` and `benchmark-display.tsx`).
- [ ] Remove `images.localPatterns` wildcard from `next.config.ts` (screenshot PNGs are deleted; the config entry is now a no-op with a misleading wildcard).

**Reliability**
- [ ] `(app)/error.tsx` capture pattern: Move `Sentry.captureException(error)` from render body into `useEffect([error])` to avoid double-capture on re-renders.
- [ ] Webhook unresolved user test: Add a test case in `app/app/api/billing/webhook/route.test.ts` for the fully-unresolved path (both `stripeCustomerId` and metadata lookups return null) to pin the silent-200 behavior.

**Data Integrity**
- [ ] Export truncation UX: `download-csv-button.tsx` should read `X-Veld-Slice-Truncated` / `X-Veld-Property-Count-*` headers from `GET /api/export/portfolio` and surface a count/warning to the user when the export is partial.
- [ ] Import `loanType` normalization: Normalize CSV `loan type` column value to uppercase before storing; validate against `LOAN_TYPE_OPTIONS`; surface Papa Parse structural errors in import response.
- [ ] Download CSV error feedback: Empty catch block in `download-csv-button.tsx` swallows 429 and 5xx — show a user-visible toast or message.

**Growth**
- [ ] Deals at-limit CTA: Replace plain `<Link>` with `UpgradePlanLink` (parity with over-limit) on the deals at-limit state.
- [ ] `PlanIntentUrlSync` on `/sign-in`: Add with `Suspense` / Clerk-safe wrapper (matches pattern on sign-up page).
- [ ] Funnel instrumentation: Add `FunnelCtaLink` + `planIntent` to investment-property-calculator body CTA; competitor/alternative page primary CTAs; `PaidIntentCheckoutBanner` tracked link.
- [ ] PostHog `landingVariant` on signup: `posthog-signup-once.tsx` does not pass `landingVariant` to `user_signed_up`; add it so PostHog can segment signups by landing variant without a separate insight.

**SEO**
- [ ] JSON-LD `WebApplication`: Add `operatingSystem` and `offers` to `WebApplication` structured data in root layout (`seo-growth-plan` Phase 0.7).
- [ ] `/investment-property-calculator` cross-link: Add BRRRR calculator to cross-link footer (STR vs LTR and Fix-and-Flip are present; BRRRR is missing).

**Legal**
- [ ] Cookie preferences disclosure: Update `cookie-preferences-section.tsx` to name Vercel Web Analytics alongside PostHog and Google Ads.
- [ ] `security-notes.md` gtag wording: Align gtag/consent description with actual `GoogleAdsGtagClient` consent-gated behavior.

**Documentation**
- [ ] `visual-assets-guide.md` L237: Fix broken relative link in footer (`[design-spec.md](design-spec.md)` → correct path).
- [ ] Benchmarking archive link L148: Fix broken `(docs/roadmap.md)` reference.
- [ ] Design-brief reconciliation: `docs/design/design-brief-2026.md` has a SUPERSEDED banner but still shows "Status: Active" and `docs/policies/design-spec.md` still says "consult brief first" — add a one-sentence clarification pointing exclusively to `design-spec-2026.md`.
- [ ] Post-ship PNG reference cleanup: Remove or update references to deleted screenshot PNGs in `design-brief-2026.md`, implementation guides, and landing plan Item 4 (they now reference mockup components).

**Governance**
- [ ] `docs/cursor-agent-setup.md` Step 1: Add `seo-audit-agent.mdc` to the clone list.
- [ ] Lane rename checklist discrepancy: `command-integrity-check.md` lists 5 items, `README.md` lists 6 — reconcile to one canonical count.

**Math**
- [ ] `DashboardMockup` Annual rent = NOI: Both values are `$55,290` which implies zero portfolio-wide expenses. Update one of the hardcoded values to produce a realistic NOI/rent split before the component is visible to prospects.

**Business**
- ~~Mobile pricing accordion: Add "Hourly estimate pool" row to mobile plan comparison~~ — **intentional design decision**: the row does not fit the mobile accordion layout cleanly; desktop comparison table is the canonical reference for full feature detail. No action.

**Code**
- [ ] Billing portal Zod validation: Add Zod schema for `POST /api/billing/portal` request body.
- [ ] `design-spec-2026.md §13.6`: Remove or correct stale `bg-card/95` reference that contradicts the live deprecation rule.

### Optional / backlog

- [ ] Consolidate mortgage GET queries (Performance).
- [ ] Bundle analyzer pass (Code/Performance).
- [ ] Root `app/error.tsx` or runbook note for public-route errors (Reliability).
- [ ] Framer Motion evaluation: if chosen for pricing polish pass, confirm bundle delta is acceptable (~20-30KB); prefer CSS-only animations per plan §C.
- [ ] `getCapRateTone` unit test (Math — trivial default-return function, minimal risk).
- [ ] `annualGrossIncome` STR vs LTR label: Add UI clarification that STR gross is pre-fee bookings vs LTR post-vacancy effective rent (Math note, medium documentation priority).
- [ ] Skill paths portability: Skills exist at project root `.cursor/skills/` vs `RealEstatePortfolio/.cursor/skills/`; worth noting in setup doc for future contributors.

### Human-only / deferred

- [ ] Manual full mobile checklist per `docs/qa/mobile-experience-audit.md` §4 (devices/viewports).
- [ ] Legal counsel: auto-renew wording for target jurisdictions; comparative claims.
- [ ] Production: Stripe webhook replay tests; Search Console spot checks; PostHog UI verification.
- [ ] Owner: close unchecked items in `docs/launch/launch-plan.md` §9 against production reality.
- [ ] `SUPPORT_EMAIL` production value verification (in-repo `.env.example` is set; live value must be confirmed in Vercel).

---

## Appendix: severity snapshot by lane (run 2)

| Lane | Highest new severity |
|------|----------------------|
| Code | High (deprecated tokens in new mockups) |
| Math | Low (DashboardMockup NOI/rent equality) |
| Feature / UX | High (welcome modal a11y, confirmed carried) |
| Mobile | Low (CLS risk noted; manual QA gap) |
| Security | Medium (rate limits, admin auth, CSP docs staleness) |
| Performance | **Medium** (MockupFrame CLS — above-the-fold LCP) |
| Reliability | **High** (Sentry VERCEL_ENV — third consecutive open) |
| Data integrity | Medium (export truncation, import normalization) |
| Business | Medium (landingVariant on signup; mobile accordion gap) |
| Growth | Medium (at-limit CTA, intent sync, instrumentation gaps) |
| SEO | Medium (JSON-LD completeness) |
| Documentation | Medium (broken links, stale references, seo-audit-agent.mdc) |
| Legal | Medium (cookie/gtag disclosure alignment) |
| Agent Governance | Medium (cursor-agent-setup.md Step 1; checklist discrepancy) |

---

## PM review

Review triage above. **Promote Ship items to [`docs/tasks.md`](../../tasks.md)** — MockupFrame CLS in particular is above-the-fold on the hero and should be fixed before marketing traffic. Schedule items remain in the next batch queue.

## Re-test (cross-cutting)

- [ ] `npm run check` in `app/` after Ship items implemented.
- [ ] Visual spot-check: hero and pricing mockup frames at 375px and 1440px — no layout jump on load.
- [ ] `npx vitest run` after webhook test addition and mockup token fixes.
- [ ] Rich Results Test after JSON-LD edits.
