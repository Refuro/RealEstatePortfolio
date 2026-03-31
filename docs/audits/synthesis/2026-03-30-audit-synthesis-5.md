# Full Audit Synthesis — 2026-03-30 (Run 5)

## Audits included

All **12** core lane reports were completed in parallel (same day, Run **5** suffix to preserve prior runs). **Process update:** the full-audit command now includes a **13th** lane — **Mobile experience** (`docs/process/mobile-experience-audit-process.md`); that lane was **not** re-executed in this batch (see Run 4 mobile report if needed). Future full audits should produce **13** reports before synthesis.

- Code — `docs/audits/code/2026-03-30-code-audit-5.md`
- Math & Logic — `docs/audits/math/2026-03-30-math-logic-audit-5.md`
- Feature / UX / IA — `docs/audits/feature/2026-03-30-feature-audit-5.md`
- Security & Privacy — `docs/audits/security/2026-03-30-security-audit-5.md`
- Performance & Cost — `docs/audits/performance-cost/2026-03-30-performance-cost-audit-5.md`
- Reliability & Operations — `docs/audits/reliability-ops/2026-03-30-reliability-ops-audit-5.md`
- Data Integrity & Reconciliation — `docs/audits/data-integrity/2026-03-30-data-integrity-audit-5.md`
- Business & Valuation — `docs/audits/business/2026-03-30-business-valuation-audit-5.md`
- Growth Funnel & Activation — `docs/audits/growth-funnel/2026-03-30-growth-funnel-audit-5.md`
- Documentation — `docs/audits/documentation/2026-03-30-documentation-audit-5.md`
- Legal & Compliance — `docs/audits/legal-compliance/2026-03-30-legal-compliance-audit-5.md`
- AI Agent Governance — `docs/audits/agent-governance/2026-03-30-agent-governance-audit-5.md`

*(Mobile experience — no Run 5 report; optional reference: `docs/audits/feature/2026-03-30-mobile-experience-audit-4.md` or earlier mobile passes.)*

**Business valuation ($) headline (illustrative, from business audit Run 5):** replacement-style **software / IP** band with **zero paying users** — **$45,000–$120,000**; see `docs/audits/business/2026-03-30-business-valuation-audit-5.md` for ARR cross-checks, comparables, and disclaimers.

---

## Context since Run 4 / Batch 14

Many items from **Run 4 synthesis** were implemented in **Batch 14** (tier-capped DB queries, Prisma indexes, `getAppUser` optimization, mobile shell, deal analyzer dirty state, CSV line 2, health smoke runbook, etc.). Run 5 confirms **residual** risks and **new** nits; it does not re-list completed Batch 14 work as open tasks.

**Addressed during synthesis (2026-03-30):** Code audit flagged `npx tsc --noEmit` failing on `HTMLAsideElement` / hook order in `app-layout-client.tsx`. **Fixed:** `drawerPanelRef` is `useRef<HTMLElement | null>(null)` and declared with other top-level hooks before effects; `tsc` and ESLint pass.

---

## Consolidated task list

Deduplicated from lane “Task candidates” sections; verification-only bullets omitted. Severity follows source audits.

### Security

- [ ] Verify production `CSP_ENFORCEMENT` and `NEXT_PUBLIC_APP_URL` for correct `report-uri` and enforcement intent (`docs/policies/csp-rollout.md`). *(Security)*
- [ ] Optionally cap or sample `POST /api/csp-report` body size if monitoring shows abuse. *(Security)*

### UX / Feature

- [ ] Onboarding / welcome panel: dialog semantics, focus trap, Escape, `aria-*` (`onboarding-panel.tsx`). *(Feature)*
- [ ] Align **Deals** nav label with `deals/page.tsx` heading or add clarifying subcopy. *(Feature)*
- [ ] Add `aria-expanded` / `aria-controls` to `MobileCollapsible` (`mobile-collapsible.tsx`). *(Feature)*
- [ ] Logged-in `/pricing` CTA to `/plans` + FAQ alignment (`pricing`, `landing-nav` as needed). *(Feature — confirm vs Growth below for overlap)*
- [ ] Mobile analyze: reconcile “Analyze deal” page title vs “Deal Analyzer” in shell (`analyze/page.tsx`, `deal-analyzer-form.tsx`). *(Feature)*
- [ ] Unify empty-state styling across workspaces where still inconsistent (Feature Run 5 notes mixed cards). *(Feature)*

### Performance

- [ ] Admin: replace full RentCast `groupBy` + JS slice with bounded SQL top-N by user (or document acceptance). *(Performance)*
- [ ] Document or tighten `usersWithPropertiesForAvg` sampling (500 cap) vs exact aggregates. *(Performance)*
- [ ] Spike: paginated or slim `GET /api/properties` for very large accounts if product requires it. *(Performance)*

### Reliability

- [ ] Evaluate Stripe `event.id` deduplication for `captureServerEvent` vs documented duplicate acceptance (`docs/internal/stripe-webhook-posthog-idempotency.md`). *(Reliability + Business)*
- [ ] Optional: Sentry on RentCast upstream failures in estimate routes. *(Reliability)*
- [ ] Optional: CI / post-deploy smoke for staging `/api/health` (`docs/runbooks/health-check-smoke.md`). *(Reliability — partial doc exists; automation optional)*

### Data integrity

- [ ] Add response metadata on portfolio summary/export (and/or capped list APIs) so totals are not mistaken for full inventory when over plan cap. *(Data integrity — High in lane report)*
- [ ] Align `GET /api/deals` with plan-effective `take` + metadata, **or** document full list as intentional for integrators. *(Data integrity)*
- [ ] Confirm saved-deals **proportional-only** metrics in docs / `ownership-metrics.md` cross-links. *(Data integrity)*
- [ ] Optional: CSV import for multiple mortgages per property if in scope. *(Data integrity)*

### Growth

- [ ] Add `FunnelCtaLink` (or equivalent) for public calculator inline sign-up copy (`investment-property-calculator/page.tsx`). *(Growth)*
- [ ] Add `FunnelCtaLink` for home “Simple pricing” → “View pricing” (`page.tsx`) if not already instrumented end-to-end. *(Growth — verify against current code)*
- [ ] Decide whether `PricingCards` sign-up rows should emit `funnel_cta_clicked` with distinct `placement` / `cta_id`. *(Growth)*
- [ ] Plan trust / social proof for landing and pricing when assets exist. *(Growth)*

### Governance

- [ ] Align same-day audit filename guidance across `documentation-audit-process.md` §3, `documentation-audit-agent.mdc`, and `agent-governance-audit-agent.mdc` (optional; lane READMEs already mention `…-audit-N`). *(Documentation + Agent governance)*

### Math

- [ ] Replace or banner obsolete content in `docs/reference/engineering-spec.md` §6 with canonical policy links. *(Math)*
- [ ] Expand `docs/process/math-logic-audit.md` §1.1–§2.4 (module list, payoff wording). *(Math)*

### Business

- [ ] Create `docs/internal/business-metrics-snapshot.md` with MRR / subscribers / churn placeholders and cadence — **optional;** owner has previously preferred no placeholder until real numbers exist (see `docs/tasks.md` / Batch 12 note). *(Business)*
- [ ] Update `docs/reference/roadmap.md` Priority 15 to reflect current Vitest coverage vs remaining gaps (e.g. billing route tests). *(Business)*
- [ ] Optional: persist processed Stripe `event.id` for PostHog-emitting webhook branches if duplicates become material. *(Business + Reliability)*

### Documentation

- [ ] Surface round 2 paid-ads ops/readout docs via `docs/README.md` Launch & growth (or cross-links from an indexed launch doc). *(Documentation)*
- [x] ~~Update “Latest audit synthesis” pointer in `docs/audits/synthesis/README.md`~~ — **done** with Run 5 synthesis.

### Legal / Compliance

- [ ] Privacy Policy: replace literal `**…**` in PostHog list item with valid JSX emphasis (no asterisks in rendered text). *(Legal)*
- [ ] When operating entity is known, resolve Terms `TODO(legal)` and align contact blocks. *(Legal)*

### Code quality / hygiene

- [x] ~~`drawerPanelRef` typing / hook order in `app-layout-client.tsx`~~ — **fixed 2026-03-30** (`HTMLElement`, ref declared before effects); `npx tsc --noEmit` passes.
- [ ] Opportunistic extraction from `deal-analyzer-form.tsx` / `add-property-wizard.tsx` / `property-form.tsx` on next feature touch. *(Code)*
- [ ] Document or align Prisma 6 vs `@prisma/adapter-pg` 7 when upgrading. *(Code)*

---

## PM review

Promote approved items to [`docs/tasks.md`](../tasks.md). Deduplicate against the existing backlog (including deferred CSP and owner exclusions). Traceability: **Run 5** lane reports above; prior same-day syntheses: `2026-03-30-audit-synthesis-4.md`, etc.
