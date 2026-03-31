# Full Audit Synthesis — 2026-03-30 (Run 4)

## Audits included

- Code (`2026-03-30-code-audit-4.md`)
- Math & Logic (`2026-03-30-math-logic-audit-4.md`)
- Feature / UX / IA (`2026-03-30-feature-ux-audit-4.md`)
- Mobile experience (`2026-03-30-mobile-experience-audit-4.md`) — supplementary narrow-viewport pass
- Security & Privacy (`2026-03-30-security-audit-4.md`)
- Performance & Cost (`2026-03-30-performance-cost-audit-4.md`)
- Reliability & Operations (`2026-03-30-reliability-ops-audit-4.md`)
- Data Integrity & Reconciliation (`2026-03-30-data-integrity-audit-4.md`)
- Business & Valuation (`2026-03-30-business-valuation-audit-4.md`)
- Growth Funnel & Activation (`2026-03-30-growth-funnel-audit-4.md`)
- Documentation (`2026-03-30-documentation-audit-4.md`)
- Legal & Compliance (`2026-03-30-legal-compliance-audit-4.md`)
- AI Agent Governance (`2026-03-30-agent-governance-audit-4.md`)

**Business valuation ($) headline (illustrative, from business audit):** codebase / IP with **zero paying users** — **$45,000–$120,000** (replacement-cost band); at **50/50 Investor–Pro** and **70/30 monthly–annual** mix from `pricing-display.ts`, implied **ARR** at **100 / 1,000 / 10,000** paying subscribers ≈ **$25.1k / $251k / $2.51M**; revenue-based valuation **2–6× ARR** ≈ **$50k–$151k / $502k–$1.51M / $5.0M–$15.0M** respectively (see business report for tables and disclaimers).

---

## Consolidated task list

### Security

- [ ] Verify production `CSP_ENFORCEMENT` and `NEXT_PUBLIC_APP_URL` values match `docs/policies/csp-rollout.md` expectations. *(Security)*
- [ ] Optionally add a request body size guard for `POST /api/csp-report` if monitoring shows abuse. *(Security)*

### UX / Feature

- [ ] Add logged-in CTA or copy on `/pricing` pointing to `/plans`; align FAQ “account settings” wording with actual surfaces (`/plans`, Settings). *(Feature/UX)*
- [ ] Unify empty-state classes across `modeling-workspace.tsx`, `mortgage-workspace.tsx`, and `deals/page.tsx`. *(Feature/UX)*
- [ ] Mobile drawer: focus management and modal semantics (`app-layout-client.tsx`). *(Mobile)*
- [ ] Deal Analyzer: unsaved-changes warning or autosave indicator (`deal-analyzer-form.tsx`). *(Mobile / consistency with draft flows)*
- [ ] Safe-area padding for fixed chrome and `prefers-reduced-motion` audit for animated UI. *(Mobile)*

### Performance

- [ ] Refactor tier-limited list/export/summary queries to use `orderBy` + `take` at the database (including deals). *(Performance)*
- [ ] Add Prisma migration for `Property.userId`, `SavedDeal.userId`, and `Mortgage.propertyId` indexes; verify query plans. *(Performance)*
- [ ] Admin: paginate or aggregate RentCast by-user stats; cap user scan for per-plan property averages. *(Performance)*
- [ ] Spike: reduce `getAppUser` upsert to conditional updates after profile diff. *(Performance)*

### Reliability

- [ ] `Sentry.captureException` on Resend error in `app/app/api/contact/route.ts` when DSN present. *(Reliability)*
- [ ] Evaluate Stripe webhook idempotency for `captureServerEvent` paths (store `event.id` or document acceptance of duplicate analytics). *(Reliability)*
- [ ] Optional: CI smoke or documented script calling `/api/health` against staging. *(Reliability)*
- [ ] Add `loading` fallback to dynamic imports in `mortgage-workspace.tsx` (and modeling workspace if applicable). *(Code / perceived reliability)*

### Data Integrity

- [ ] Decide and implement API parity for plan limits on `GET /api/properties` and `GET /api/deals`, or publish a non-code contract for integrators. *(Data integrity)*
- [ ] Clarify saved-deals vs `ownershipDisplayMode` in product copy or align deal metrics with user display mode. *(Data integrity)*
- [ ] Optional: extend CSV import to support a distinct `address line 2` column when present. *(Data integrity)*
- [ ] Document or query **effective tier** consistently for ops/analytics (override + Stripe). *(Data integrity)*

### Growth

- [ ] Add `FunnelCtaLink` (with `placement` / `cta_id` / `planIntent`) for pricing page footer “Create free account” and public calculator page inline “create a free account”. *(Growth)*
- [ ] Optionally add `FunnelCtaLink` for home “Simple pricing” → “View pricing” for consistent session-level CTA coverage. *(Growth)*
- [ ] Fix `user_signed_up` dedup key documentation in `docs/launch/analytics.md` to match `posthog-signup-once.tsx`. *(Growth)*

### Governance

- [ ] Update `docs/cursor-agent-setup.md` for **12 lanes** and Documentation + Legal audit rules, process docs, folders, and clone checklist (overlaps Documentation + Agent governance findings). *(Agent governance — High)*
- [ ] Reconcile full-audit lane count / Code-skip wording between `docs/process/full-audit-synthesis.md` §6 and `.cursor/rules/full-audit-agent.mdc`. *(Agent governance + Documentation)*

### Math

- [ ] Align `docs/reference/engineering-spec.md` §6 with current metrics policy or mark it superseded. *(Math)*
- [ ] Refresh `docs/process/math-logic-audit.md` module inventory and benchmark freshness phrasing. *(Math)*
- [ ] Add golden coverage for partial-ownership portfolio aggregation (if product priority). *(Math)*

### Business

- [ ] Create `docs/internal/business-metrics-snapshot.md` with MRR/subscribers/churn placeholders and refresh cadence. *(Business)*
- [ ] Update `docs/launch/launch-plan.md` §2.2 to reflect PostHog + paid-ads status as of 2026-03-30, or archive superseded language with date. *(Business)*
- [ ] Add Vitest coverage for `planTierFromPriceId` + webhook branches using Stripe fixtures (no live keys). *(Business)*

### Documentation

- [ ] Extend `docs/README.md` Process section with `documentation-audit-process.md` and `legal-compliance-audit-process.md`. *(Documentation)*
- [ ] Link `posthog-views-setup.md` from Launch & growth and/or `analytics.md`. *(Documentation)*
- [ ] Update `docs/audits/documentation/README.md` and `.cursor/rules/documentation-audit-agent.mdc` for optional `…-audit-N` same-day report naming. *(Documentation)*
- [ ] Add a latest-synthesis pointer to `docs/audits/synthesis/README.md` (or top-level `docs/README.md`). *(Documentation)*
- [ ] Refresh `docs/tasks.md` roadmap-priority table date label (or retitle to “last reviewed”) when next edited. *(Documentation)*
- [ ] Bump “Last updated” on `docs/visual-assets-guide.md` when content is next reviewed. *(Documentation)*

### Legal / Compliance

- [ ] Privacy Policy: add explicit **server-side PostHog** (Stripe webhook) disclosure and relationship to cookie consent. *(Legal)*
- [ ] Footer: align `©` year with current year / policy refresh (coordinate with Feature/UX footer copy). *(Legal + Feature/UX)*

### Code quality / hygiene

- [x] ~~Fix duplicate `notes` key in `app/app/api/properties/[id]/route.test.ts`~~ **Done** (2026-03-30): duplicate `notes` removed; `npx tsc --noEmit` and route tests pass.
- [ ] Remove or consolidate duplicate Prisma seed entry in `app/package.json` after CLI verification. *(Code)*
- [ ] Opportunistic extraction from `deal-analyzer-form.tsx` / long tab files on next feature touch. *(Code)*

---

## PM review

Review the consolidated list above. Promote approved items to [docs/tasks.md](../../tasks.md). The builder implements approved items.

**Run 4 note:** No **Critical** findings across lanes; recurring themes were **API list caps vs plan limits**, **CSP production verification**, **cursor-agent-setup** onboarding drift, and **billing route tests** / **metrics snapshot** for valuation readiness. The duplicate `notes` key in `route.test.ts` (TypeScript compile error) has been **fixed** post-synthesis.
