# Full Audit Synthesis — 2026-03-30 (Run 3)

## Audits included

- Code — `docs/audits/code/2026-03-30-code-audit-3.md`
- Math & Logic — `docs/audits/math/2026-03-30-math-logic-audit-3.md`
- Feature / UX / IA — `docs/audits/feature/2026-03-30-feature-ux-audit-3.md`
- Security & Privacy — `docs/audits/security/2026-03-30-security-audit-3.md`
- Performance & Cost — `docs/audits/performance-cost/2026-03-30-performance-cost-audit-3.md`
- Reliability & Operations — `docs/audits/reliability-ops/2026-03-30-reliability-ops-audit-3.md`
- Data Integrity & Reconciliation — `docs/audits/data-integrity/2026-03-30-data-integrity-audit-3.md`
- Business & Valuation — `docs/audits/business/2026-03-30-business-valuation-audit-3.md`
- Growth Funnel & Activation — `docs/audits/growth-funnel/2026-03-30-growth-funnel-audit-3.md`
- Documentation — `docs/audits/documentation/2026-03-30-documentation-audit-3.md`
- Legal & Compliance — `docs/audits/legal-compliance/2026-03-30-legal-compliance-audit-3.md`
- AI Agent Governance — `docs/audits/agent-governance/2026-03-30-agent-governance-audit-3.md`

---

## Consolidated task list

*Deduplicated across lanes. Same topic (e.g. footer year, doc indices) appears once.*

### Security

- [ ] Re-verify production `CSP_ENFORCEMENT` / `NEXT_PUBLIC_APP_URL` against `docs/policies/csp-rollout.md` after any header or env change.
- [ ] Optionally add a request body size guard for `POST /api/csp-report` if abuse appears in logs.

### Legal / Compliance

- [ ] Privacy Policy: disclose **server-side PostHog** events from the Stripe webhook path and how that relates to cookie consent (aligns with `docs/launch/analytics.md`; Legal + Growth context).

### UX / Feature

- [ ] Unify empty-state card styling across modeling workspace, mortgage workspace, deals page, and (optionally) dashboard/properties empty blocks.
- [ ] Clarify **Pricing vs Plans** entry points and copy for logged-in users (single canonical term or explicit cross-links).
- [ ] **Footer © year:** update to current year or make dynamic (called out in Feature, Legal, Documentation — one implementation).

### Performance

- [ ] Refactor portfolio list / export / summary data loading to use DB-level `orderBy` + `take` aligned with plan `propertyLimit` instead of loading all rows then trimming in memory (Performance; related Data Integrity verification for capped vs uncapped APIs).
- [ ] Add Prisma indexes on `Property.userId`, `SavedDeal.userId`, and `Mortgage.propertyId` (with migration + plan verification).
- [ ] Spike: reduce `getAppUser` → `upsert` churn (profile diff / conditional update) if metrics warrant.

### Reliability

- [ ] Add `Sentry.captureException` on Resend failure in `app/app/api/contact/route.ts` when DSN is configured.
- [ ] Evaluate Stripe webhook **idempotency** for `captureServerEvent` (store `event.id` or document acceptance of duplicate server analytics).

### Data integrity

- [ ] Decide and implement **API parity** for plan limits on `GET /api/properties` and `GET /api/deals`, *or* publish a non-code contract for integrators (full list vs capped list).
- [ ] Align saved-deals metrics with **ownership display mode** (`computePropertyMetrics` uses proportional for deals) via product copy or code alignment.

### Growth

- [ ] Wire **`FunnelCtaLink`** (with `placement` / `cta_id` / `planIntent`) for pricing footer “Create free account”, calculator inline “create a free account”, and optionally home “View pricing” where still plain `<Link>`.
- [ ] Fix `user_signed_up` dedup key documentation in `docs/launch/analytics.md` to match `posthog-signup-once.tsx`.

### Governance / Documentation

- [ ] Update `docs/cursor-agent-setup.md` to **12 lanes** and include Documentation + Legal/Compliance audit rules and process links (Agent Governance **High**).
- [ ] Reconcile **full-audit lane count** wording between `docs/process/full-audit-synthesis.md` §6 and `.cursor/rules/full-audit-agent.mdc` (always 12 vs “11 if Code skipped”).
- [ ] Extend `docs/README.md` Process section with `documentation-audit-process.md` and `legal-compliance-audit-process.md`.
- [ ] Add Launch cross-links for `posthog-views-setup.md` (and/or from `analytics.md`).
- [ ] Document optional same-day report naming (`…-audit-2`, `…-audit-3`) in `docs/audits/documentation/README.md` and matching rule text.
- [ ] Add a **“latest full audit run”** pointer in `docs/audits/synthesis/README.md` or `docs/README.md`.

### Math

- [ ] Align `docs/reference/engineering-spec.md` §6 with current metrics policy **or** mark it explicitly superseded.
- [ ] Refresh `docs/process/math-logic-audit.md` module inventory and payoff/benchmark naming to match code (`getMonthsToPayoffWithExtraStrict`, benchmark window).
- [ ] Optional: golden test coverage for **partial-ownership** portfolio aggregation if product prioritizes it.

### Business

- [ ] Create a lightweight **business metrics snapshot** doc (MRR, subscribers, churn placeholders, refresh cadence) for valuation readiness.
- [ ] Reconcile `docs/launch/launch-plan.md` §2.2 with current PostHog + paid-ads status (or archive dated “ads off” language with note).
- [ ] Add Vitest coverage for Stripe webhook / `planTierFromPriceId` branches using fixtures, or extend billing release checklist for webhook failure monitoring.

### Code quality (implementation hygiene)

- [ ] Clear ESLint `no-unused-vars` warnings in `mortgage-tab-content.tsx` and `projections-tab-content.tsx`.
- [ ] Remove deprecated duplicate Prisma config from `app/package.json` once `prisma.config.ts` is confirmed authoritative for seed/CI.
- [ ] Add `loading` fallbacks to `next/dynamic` imports in `mortgage-workspace.tsx` and `modeling-workspace.tsx` (parity with dashboard charts pattern).
- [ ] Opportunistically split or extract subcomponents from `deal-analyzer-form.tsx` and other very large tab files on next edit (no mandatory big-bang refactor).

---

## PM review

Review the consolidated list above and promote approved items to [docs/tasks.md](../../tasks.md). Deduplicate against the existing backlog (including Batch 12 / audit follow-ups) before assignment. For traceability, this is **Run 3** on **2026-03-30**; prior same-day syntheses: `2026-03-30-audit-synthesis.md`, `2026-03-30-audit-synthesis-2.md`.
