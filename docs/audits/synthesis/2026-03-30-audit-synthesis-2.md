# Full Audit Synthesis — 2026-03-30 (Run 2, post-merge)

## Audits included

- Code — `docs/audits/code/2026-03-30-code-audit-2.md`
- Math & Logic — `docs/audits/math/2026-03-30-math-logic-audit-2.md`
- Feature / UX / IA — `docs/audits/feature/2026-03-30-feature-ux-audit-2.md`
- Security & Privacy — `docs/audits/security/2026-03-30-security-audit-2.md`
- Performance & Cost — `docs/audits/performance-cost/2026-03-30-performance-cost-audit-2.md`
- Reliability & Operations — `docs/audits/reliability-ops/2026-03-30-reliability-ops-audit-2.md`
- Data Integrity & Reconciliation — `docs/audits/data-integrity/2026-03-30-data-integrity-audit-2.md`
- Business & Valuation — `docs/audits/business/2026-03-30-business-valuation-audit-2.md`
- Growth Funnel & Activation — `docs/audits/growth-funnel/2026-03-30-growth-funnel-audit-2.md`
- Documentation — `docs/audits/documentation/2026-03-30-documentation-audit-2.md`
- Legal & Compliance — `docs/audits/legal-compliance/2026-03-30-legal-compliance-audit-2.md`
- AI Agent Governance — `docs/audits/agent-governance/2026-03-30-agent-governance-audit-2.md`

---

## Consolidated task list

### Security

- [ ] Re-verify CSP production triage workflow after the next CSP policy change (`/api/csp-report` signal handling + runbook flow).

### UX / Feature

- [ ] Promote the next single-property dashboard improvement from roadmap to active tasks when prioritized.

### Performance

- [ ] Remove deprecated `package.json#prisma` config and keep Prisma configuration solely in `prisma.config.ts`.

### Reliability

- [ ] Add explicit Node version guidance (or `engines`) to keep local Vitest behavior consistent with CI expectations.

### Data Integrity

- [ ] Extend/confirm automated benchmark display-state coverage if CI still has gaps.

### Growth

- [ ] Promote deferred trust strip/testimonial/logo work when assets/copy are ready.

### Governance

- [ ] Add explicit same-day rerun naming guidance (`-2`, `-3`) in audit docs to preserve history.

### Math

- [ ] Keep policy docs and golden fixtures updated together for any metrics/amortization formula change.

### Business

- [ ] Prepare and maintain a lightweight business metrics snapshot (MRR/churn/active users) for valuation readiness.

### Documentation

- [ ] Add a "latest full audit" pointer in docs index/synthesis readme for easier report discoverability.

### Legal / Compliance

- [ ] Add PM reminder: trigger legal-compliance lane whenever analytics/billing disclosure changes materially.

---

## PM review

Review the consolidated list above and promote approved implementation items to [docs/tasks.md](../../tasks.md). Deduplicate against existing backlog before assignment.
