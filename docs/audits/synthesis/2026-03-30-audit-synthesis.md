# Full Audit Synthesis — 2026-03-30

## Audits included

- Code — `docs/audits/code/2026-03-30-code-audit.md`
- Math & Logic — `docs/audits/math/2026-03-30-math-logic-audit.md`
- Feature / UX / IA — `docs/audits/feature/2026-03-30-feature-ux-audit.md`
- Security & Privacy — `docs/audits/security/2026-03-30-security-audit.md`
- Performance & Cost — `docs/audits/performance-cost/2026-03-30-performance-cost-audit.md`
- Reliability & Operations — `docs/audits/reliability-ops/2026-03-30-reliability-ops-audit.md`
- Data Integrity & Reconciliation — `docs/audits/data-integrity/2026-03-30-data-integrity-audit.md`
- Business & Valuation — `docs/audits/business/2026-03-30-business-valuation-audit.md`
- Growth Funnel & Activation — `docs/audits/growth-funnel/2026-03-30-growth-funnel-audit.md`
- Documentation — `docs/audits/documentation/2026-03-30-documentation-audit.md`
- Legal & Compliance — `docs/audits/legal-compliance/2026-03-30-legal-compliance-audit.md`
- AI Agent Governance — `docs/audits/agent-governance/2026-03-30-agent-governance-audit.md`

---

## Consolidated task list

### Security

- [ ] Re-verify CSP reporting and Sentry `signal=csp` triage in **production** after next CSP policy change (sources: Security, Reliability).

### UX / Feature

- [ ] When prioritized, promote **single-property dashboard** improvements from `docs/reference/roadmap.md` into `docs/tasks.md` with acceptance criteria (sources: Feature, roadmap).
- [ ] Continue incremental extraction/split of very large property/mortgage UI modules when those files are touched (source: Code).

### Performance

- [ ] Periodic review of bundle and `optimizePackageImports` when adding heavy client dependencies (source: Performance & Cost).

### Reliability

- [ ] Document or enforce **Node.js version** alignment for Vitest/Vite (e.g. `engines` in `app/package.json` and/or `docs/setup/run-and-smoke-test.md`) so `npm run test` is reliable across machines (sources: Math & Logic, Reliability & Ops).

### Data Integrity

- [ ] If gaps remain in CI, add or extend **benchmark display** automated coverage per shared comparability contract (source: Data Integrity; cross-check `docs/tasks.md` for any open benchmark-display test item).

### Growth

- [ ] When assets exist, promote **trust strip / testimonials / logos** from deferred state in `docs/tasks.md` (source: Growth).

### Governance

- [ ] On the next change to **shell risk** or **hooks**, update `docs/policies/shell-risk-policy.md` and `.cursor/hooks.json` in the same pass (source: Agent Governance).

### Math

- [ ] Keep **policy + golden fixtures** updated together when metrics formulas change (source: Math & Logic).

### Business

- [ ] **Prepare business metrics snapshot for next valuation pass** — lightweight template or external pointer for MRR, churn, active users; blocked until owner has numbers (source: Business & Valuation, `docs/tasks.md`).

### Documentation

- [ ] Add **docs index** links to key internal owner docs (`docs/internal/project-grounding.md`, `docs/internal/demo-preparation-guide.md`) if not already linked from `docs/README.md` (source: Documentation).

### Legal / Compliance

- [ ] Before major launch or new jurisdictions, schedule **human legal review** of privacy/terms and marketing claims if anything material changed (source: Legal & Compliance; not a builder task).

---

## PM review

Review the consolidated list above. Promote approved items to [docs/tasks.md](../../tasks.md). The builder implements approved items.

**Note:** Several items above already exist or overlap with `docs/tasks.md` (e.g. business metrics snapshot, deferred trust strip). Deduplicate before assigning work.
