# Full Audit Synthesis — 2026-03-20

## Audits included

- Code — `docs/audits/code/2026-03-20-code-audit.md`
- Math & Logic — `docs/audits/math/2026-03-20-math-logic-audit.md`
- Feature / UX / IA — `docs/audits/feature/2026-03-20-feature-ux-audit.md`
- Security & Privacy — `docs/audits/security/2026-03-20-security-audit.md`
- Performance & Cost — `docs/audits/performance-cost/2026-03-20-performance-cost-audit.md`
- Reliability & Operations — `docs/audits/reliability-ops/2026-03-20-reliability-ops-audit.md`
- Data Integrity & Reconciliation — `docs/audits/data-integrity/2026-03-20-data-integrity-audit.md`
- Business & Valuation — `docs/audits/business/2026-03-20-business-valuation-audit.md`
- Growth Funnel & Activation — `docs/audits/growth-funnel/2026-03-20-growth-funnel-audit.md`
- AI Agent Governance — `docs/audits/agent-governance/2026-03-20-agent-governance-audit.md`

---

## Consolidated task list (deduplicated)

### Security

- [ ] Gradually move from **CSP Report-Only** to **enforced CSP** after tuning `script-src` / `connect-src` for Clerk, Stripe, Sentry; add violation reporting (`report-to` / Sentry) before flipping enforcement. *(Security)*
- [ ] Document a **public route checklist** for new `app/api/*` and pages (must update `proxy.ts` `isPublicRoute` when appropriate). *(Security)*
- [ ] Run **`npm audit`** in `app/` on a schedule; address high/critical advisories. *(Security)*

### UX / Feature

- [ ] **Deals** list: product review for **sort**, **filter/search**, and **empty state** (may overlap existing backlog). *(Feature)*

### Performance

- [ ] Lazy-load **Recharts** sections in `projections-tab-content.tsx` and `mortgage-tab-content.tsx` via `next/dynamic` (`ssr: false`). *(Performance + Code)*
- [ ] Run **`@next/bundle-analyzer`** on an `app/` production build quarterly or before major releases. *(Performance)*
- [ ] Replace marketing **`<img>`** screenshots on `/` and `/pricing` with **`next/image`** (or document explicit exceptions). *(Performance + Code + Growth)*

### Reliability

- [ ] Add external **uptime monitoring** ping to production `/api/health` when launch is public. *(Reliability)*
- [ ] Revisit **CI `next build`** when GitHub secrets + DB strategy supports a compile or migrate-and-build job. *(Reliability)*

### Data integrity

- [ ] Add/extend **import** tests: sample CSV → expected parsed shape for POST import (mock DB). *(Data)*
- [ ] Document **CSV column alias** matrix for portfolio import in `docs/setup/` or ops doc. *(Data)*

### Growth

- [ ] Review **Open Graph / meta** tags for `/` and `/pricing` before broad public launch. *(Growth)*

### Governance

- [ ] Add **`AGENTS.md`** (or a short section in `docs/README.md`) pointing to audit triggers and `docs/audits/README.md`. *(Governance)*
- [ ] When process changes: update **both** `.cursor/rules/full-audit-agent.mdc` and `docs/process/full-audit-synthesis.md` / lane docs. *(Governance)*

### Math

- [ ] **Consolidate** duplicated projection/simulation helpers from property detail tabs into **`lib/`** (single source of truth); add/extend Vitest coverage on extracted module. *(Math + Code)*
- [ ] Confirm or add **golden** multi-mortgage / portfolio case in metrics tests if not already covered. *(Math)*

### Business

- [ ] Internal **plans matrix** doc: tier → limits → Stripe price IDs (monthly/annual). *(Business)*
- [ ] Verify **marketing pricing** copy matches Stripe products (annual vs monthly). *(Business)*

---

## PM review

Review the consolidated list above. Promote approved items to [`docs/tasks.md`](../../tasks.md). The builder implements approved items.

**Note:** Many **Batch 1 / 2** items from `2026-03-19-audit-synthesis.md` are already implemented (CSP report-only, rate limits, Sentry in `error.tsx`, `/api/health`, `proxy.ts`, sign-in URL, etc.). This synthesis focuses on **remaining** and **ongoing** work as of 2026-03-20.
