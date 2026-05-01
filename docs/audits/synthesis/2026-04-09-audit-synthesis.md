# Full Audit Synthesis — 2026-04-09

> **Run:** 14 lanes, max 7 parallel general-purpose agents (batch 1: Code, Math, Feature/UX, Mobile, Security, Performance-Cost, Reliability-Ops; batch 2: Data Integrity, Business, Growth, SEO, Documentation, Legal, Agent Governance). Writes enabled; no `app/` edits during lane runs.

## Audits included

- [x] Code — `docs/audits/code/2026-04-09-code-audit.md`
- [x] Math & Logic — `docs/audits/math/2026-04-09-math-logic-audit.md`
- [x] Feature / UX / IA — `docs/audits/feature/2026-04-09-feature-ux-audit.md`
- [x] Mobile experience — `docs/audits/feature/2026-04-09-mobile-experience-audit.md`
- [x] Security & Privacy — `docs/audits/security/2026-04-09-security-audit.md`
- [x] Performance & Cost — `docs/audits/performance-cost/2026-04-09-performance-cost-audit.md`
- [x] Reliability & Operations — `docs/audits/reliability-ops/2026-04-09-reliability-ops-audit.md`
- [x] Data Integrity & Reconciliation — `docs/audits/data-integrity/2026-04-09-data-integrity-audit.md`
- [x] Business & Valuation — `docs/audits/business/2026-04-09-business-valuation-audit.md`
- [x] Growth Funnel & Activation — `docs/audits/growth-funnel/2026-04-09-growth-funnel-audit.md`
- [x] SEO (search & discovery) — `docs/audits/seo/2026-04-09-seo-audit.md`
- [x] Documentation — `docs/audits/documentation/2026-04-09-documentation-audit.md`
- [x] Legal & Compliance — `docs/audits/legal-compliance/2026-04-09-legal-compliance-audit.md`
- [x] AI Agent Governance — `docs/audits/agent-governance/2026-04-09-agent-governance-audit.md`

---

## Cross-lane themes (deduplication notes)

| Theme | Lanes | Consolidated action |
|--------|--------|---------------------|
| **Signed-in calculator bundle** | Code, Performance | Single task: dynamic-load `RentVsBuyCalculator` on `app/app/(app)/calculators/rent-vs-buy/page.tsx` to match `/tools/rent-vs-buy` pattern; smoke both routes. |
| **Cron cost + observability** | Performance, Reliability | Pair: (1) `maxDuration`/monitoring for long crons (`monthly-refresh`, `winback-emails`); (2) Sentry or deploy-time signal when `CRON_SECRET` missing (500 with no alert). |
| **Admin rate limits** | Security | `checkRateLimit` uses actions not in `RATE_LIMITS` — limits never apply; fix table + doc sync. |
| **Privacy / analytics truth** | Legal, Business | One pass: Privacy processor list (incl. Google Places), server-side PostHog scope in Privacy, `docs/launch/analytics.md` ↔ `analytics-events.ts`. |
| **Digest vs dashboard cash flow** | Data Integrity | Monthly digest proportional-only vs `adjustSnapshotCashFlow` / display mode — align implementation or user-facing note. |
| **Design spec authority** | Agent Governance, Documentation | Point builder + PM checklist at `docs/design/design-spec-2026.md` (primary); fix README/synthesis/hook drift. |

---

## Consolidated task list (by domain)

### Security

- [ ] Add `RATE_LIMITS` entries for `admin:trial-patch`, `admin:trial-email-send`, `admin:billing-sync` (or equivalent); verify 429 in staging. *(Security)*
- [ ] Sync `docs/security/security-notes.md` (or project security audit doc) with `app/lib/rate-limit.ts` after the change. *(Security)*
- [ ] Optional: `validateEnv()` / Vercel assert for `CRON_SECRET` when crons deploy. *(Security + Reliability overlap)*

### Reliability / Operations

- [ ] On cron 500 from missing `CRON_SECRET`: `Sentry.captureMessage` / `captureException` (tagged). *(Reliability)*
- [ ] Deploy-time or startup warning for missing `CRON_SECRET` on Vercel production (mirror `assertStripeWebhookSecretForVercelDeploy`). *(Reliability)*
- [ ] Resolve **SEC-SHIP-3** (`docs/tasks.md`): unguarded read routes — concrete list + tests. *(Reliability)*
- [ ] Expand `docs/runbooks/incident-response.md`: migration rollback, PostHog degraded, Resend, RentCast, Google Places. *(Reliability — overlaps remediation plan Phase 2)*

### Performance / Code

- [ ] Dynamic chart loading on signed-in `app/app/(app)/calculators/rent-vs-buy/page.tsx`. *(Code + Performance)*
- [ ] Optional: `maxDuration` + monitoring for `/api/cron/monthly-refresh` and `/api/cron/winback-emails`. *(Performance)*
- [ ] Finite per-user property cap in `processUserRefresh` (product decision + ops comms). *(Performance)*
- [ ] Refactor `captureServerEvent` to reduce client construction in hot cron paths. *(Performance)*
- [ ] Optional: merge/cache dashboard portfolio + snapshot queries where safe. *(Performance)*
- [ ] Milestone PRs: `deal-analyzer-form.tsx`, `add-property-wizard.tsx` splits. *(Code — optional)*
- [ ] Env-based app URL in `app/app/api/unsubscribe/route.ts` HTML. *(Code — Low)*
- [ ] Remove redundant `force-dynamic` on child routes (optional clarity). *(Code — Low)*

### Data integrity

- [ ] CSV: columns + importer mappings for market rent, value-as-of, benchmark-as-of; update `docs/reference/portfolio-csv-export.md`. *(Data)*
- [ ] Digest: `adjustSnapshotCashFlow` + `ownershipDisplayMode` / `ownershipPct` parity with dashboard, or explicit reconciliation copy. *(Data)*
- [ ] `PATCH /api/deals/[id]`: return `portfolioContext` via same helpers as GET. *(Data)*

### Math

- [ ] Milestone emails: disclose tolerance (or strict payoff) when using `getToleranceAwarePayoffProjection`. *(Math)*
- [ ] Align process doc text for `getBalanceSource` tiers with implementation. *(Math — doc)*

### UX / Feature

- [ ] Modeling: sync `propertyId` query param on property change (parity with mortgage workspace). *(Feature)*
- [ ] Over-limit / truncated-property notices on modeling + mortgage pages when applicable. *(Feature)*
- [ ] Unify Analyze labels in `app-nav.tsx` and `mobile-bottom-nav.tsx`. *(Feature)*
- [ ] Dashboard secondary actions on small viewports (expose shortcuts vs “More only”). *(Feature)*

### Mobile experience

- [ ] Manual viewport matrix + one real device for **Pending** criteria (screenshots on fail). *(Mobile — human QA)*
- [ ] Focus trap + focus return for `#app-mobile-nav-drawer` in `app-layout-client.tsx`. *(Mobile)*
- [ ] `min-h-[44px]` / padding for `ExpandButton` in `dashboard-charts.tsx`; review `MobileModeSwitcher` hit areas. *(Mobile)*
- [ ] `app-respect-reduced-motion` on `MobileCollapsible` chevron. *(Mobile)*
- [ ] Evaluate hydration layout swap on `/analyze` (CSS-first or skeleton). *(Mobile)*

### Growth

- [ ] Experiment: calculator → `/analyze` prefill. *(Growth)*
- [ ] Copy: dashboard empty-state for authenticated users (`dashboard-empty-state-ctas.tsx`). *(Growth)*
- [ ] Copy: trial/value line on sign-in (`sign-in-view.tsx`). *(Growth)*
- [ ] Optional: billing success branch when zero properties. *(Growth)*

### SEO

- [ ] Production `NEXT_PUBLIC_APP_URL`, Search Console, URL Inspection samples (home, calculator, state, resource). *(SEO)*
- [ ] Improve `lastModified` in `app/app/sitemap.ts` (per-section or static meaningful dates). *(SEO)*
- [ ] After 4–8 weeks: content differentiation `/tools/investment-property/*` vs `/investment-property-calculator` via Search Console. *(SEO)*

### Business / Documentation

- [ ] `docs/reference/valuation-brief.md` vs `changelog-data.ts`, `vercel.json`, Vitest counts. *(Business)*
- [ ] `docs/reference/roadmap.md` §2 + completed-table test counts. *(Business)*
- [ ] `docs/launch/analytics.md` ↔ `app/lib/analytics-events.ts` (server/cron appendix). *(Business + Legal)*
- [ ] `docs/README.md` → latest synthesis; relocate root `docs/audits/*.md` into lane folders; fix `full-audit-synthesis.md` §4 link to `docs/tasks.md`; plan frontmatter; archive footers; `AVAILABLE_AGENTS.md` refs in `tasks-tools-expansion.md` / remediation plan. *(Documentation)*

### Legal / Compliance

- [ ] Privacy: Google Places / Maps Platform as processor; audit other env-gated vendors. *(Legal)*
- [ ] Privacy: server-side PostHog scope vs `captureServerEvent` call sites. *(Legal)*
- [ ] Terms: trial terms; governing law / venue (after counsel). *(Legal)*
- [ ] Align contact SLA (`contact/page.tsx`) with Terms/Privacy or soften copy. *(Legal)*

### Governance

- [ ] Builder + PM checklist: primary UI compliance → `docs/design/design-spec-2026.md`. *(Governance)*
- [ ] `docs/process/agent-governance-audit-process.md`: execution mode + `docs/audits/` write requirements. *(Governance)*
- [ ] `docs/cursor-agent-setup.md`: list all audit lanes or defer to `docs/audits/README.md`. *(Governance)*
- [ ] Sync `command-integrity-check.md` lane-rename bullets with `docs/audits/README.md`. *(Governance)*
- [ ] Optional: `npm test` on `beforeShellExecution` ALLOW line vs `shell-risk-policy.md`. *(Governance)*

---

## PM triage (this run)

Classify per `docs/process/full-audit-synthesis.md` §3.5.

### Ship (next window)

- [ ] **Admin rate limits:** Add missing `RATE_LIMITS` keys for admin trial / trial-email / billing-sync; verify 429 behavior. *(Security — effective bypass today.)*
- [ ] **SEC-SHIP-3:** Close unguarded read-route item in `docs/tasks.md` with tests. *(Reliability)*
- [ ] **Legal/Privacy alignment:** Privacy processors (incl. Places) + server PostHog disclosure + coordinated `analytics.md` update. *(Legal + Business — user-facing accuracy.)*

### Schedule (next batch)

- [ ] Signed-in rent-vs-buy page: dynamic chart import (parity with tools route). *(Code, Performance)*
- [ ] **Cron observability:** Sentry on missing `CRON_SECRET`; optional deploy assert; optional `maxDuration` on long crons. *(Reliability, Performance)*
- [ ] **Data:** Digest cash-flow basis vs dashboard; deals `PATCH` `portfolioContext`; CSV benchmark columns (product call). *(Data)*
- [ ] **Feature:** Modeling `propertyId` URL sync; over-limit notices; Analyze nav label parity. *(Feature)*
- [ ] **Mobile:** Drawer focus trap; chart expand touch targets; reduced-motion on collapsible. *(Mobile)*
- [ ] **SEO:** `sitemap.ts` `lastModified` strategy; production Search Console checks. *(SEO)*
- [ ] **Documentation hub:** README synthesis link, stray audit files, `full-audit-synthesis.md` tasks link, `AVAILABLE_AGENTS.md`. *(Documentation)*
- [ ] **Governance:** Design-spec-2026 primary references; agent-governance process execution clarity. *(Governance)*
- [ ] **Math:** Milestone email tolerance disclosure. *(Math)*
- [ ] **Growth experiments:** Calculator → analyze prefill; copy polish on empty state / sign-in. *(Growth)*

### Optional / backlog

- [ ] Mega-file component extractions; unsubscribe env URL; redundant `force-dynamic` cleanup. *(Code)*
- [ ] `captureServerEvent` refactor; dashboard query merge/cache. *(Performance)*
- [ ] Math process doc `getBalanceSource` text alignment. *(Math)*
- [ ] CSP tightening / `connect-src` hardening; IP spoofing notes — evaluate. *(Security)*
- [ ] Hydration strategy on `/analyze` (mobile). *(Mobile)*

### Human-only / deferred

- [ ] Terms governing law / venue — **counsel.** *(Legal)*
- [ ] **BIZ-5:** LLC + Stripe entity — **owner** (`docs/business-launch-checklist.md`). *(Business)*
- [ ] **Launch §9** verification — **owner** (`docs/launch/launch-plan.md`). *(Business)*
- [ ] Full mobile device matrix; VoiceOver/TalkBack — **QA.** *(Mobile)*
- [ ] Search Console performance decisions after traffic — **PM.** *(SEO)*
- [ ] Production analytics truth in PostHog UI — **owner.** *(Business)*

---

## PM review

Review triage above. Promote **Ship** and **Schedule** items to [docs/tasks.md](../../tasks.md) when approved. The builder implements approved items.

Individual lane reports under `docs/audits/<lane>/2026-04-09-*-audit.md` contain severity tables, evidence paths, and re-test checklists.

---

*Generated: 2026-04-09 | 14 lanes | 7+7 parallel general-purpose agents | Synthesis follows `docs/process/full-audit-synthesis.md`.*
