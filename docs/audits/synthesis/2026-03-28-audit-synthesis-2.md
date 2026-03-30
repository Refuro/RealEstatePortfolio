# Full Audit Synthesis — 2026-03-28 (run 2)

## Audits included

- Code — `docs/audits/code/2026-03-28-code-audit-2.md`
- Math & Logic — `docs/audits/math/2026-03-28-math-logic-audit-2.md`
- Feature / UX / IA — `docs/audits/feature/2026-03-28-feature-ux-audit-2.md`
- Security & Privacy — `docs/audits/security/2026-03-28-security-audit-2.md`
- Performance & Cost — `docs/audits/performance-cost/2026-03-28-performance-cost-audit-2.md`
- Reliability & Operations — `docs/audits/reliability-ops/2026-03-28-reliability-ops-audit-2.md`
- Data Integrity & Reconciliation — `docs/audits/data-integrity/2026-03-28-data-integrity-audit-2.md`
- Business & Valuation — `docs/audits/business/2026-03-28-business-valuation-audit-2.md`
- Growth Funnel & Activation — `docs/audits/growth-funnel/2026-03-28-growth-funnel-audit-2.md`
- AI Agent Governance — `docs/audits/agent-governance/2026-03-28-agent-governance-audit-2.md`

---

## Consolidated task list

### Security

- [ ] Add `/api/csp-report` to `isPublicRoute` in `app/proxy.ts` so anonymous browsers can POST CSP violation reports (sources: Code, Security, Reliability). Alternatively, document an intentional decision that only authenticated sessions report and accept gaps on public pages.

### UX / Feature

- [ ] Ship roadmap **benchmarking v2**: shared benchmark-eligibility contract (`isRented`, rent present, `marketRent` validity) across dashboard, properties list, and property detail (sources: Feature, Data Integrity, Math note).
- [ ] Improve single-property dashboard discoverability per roadmap when prioritized (source: Feature).
- [ ] Split `app/app/(app)/properties/[id]/mortgage-tab-content.tsx` into smaller components/hooks (source: Code).

### Performance

- [ ] Surface remaining RentCast hourly quota (or uses-left) on estimate/refresh flows to reduce surprise quota exhaustion (sources: Performance & Cost, Growth).

### Reliability

- [ ] Optionally forward CSP violation reports to Sentry (sampled) in production when CSP enforcement tightens (source: Reliability).

### Data Integrity

- [ ] (Covered under UX) Centralize `isBenchmarkComparable(property)` (or equivalent) once benchmarking v2 is implemented.

### Growth

- [ ] (Merged with Performance) RentCast quota hint near estimate/refresh actions.

### Governance

- [ ] When audit lane names or folders change, update `docs/audits/README.md` and `.cursor/rules/*` in the same change (source: Agent Governance).

### Math

- [ ] Add/adjust tests for benchmark display when benchmarking v2 is shipped (source: Math).

### Business

- [ ] Prepare a one-page extrinsic metrics snapshot (MRR, churn, users) for the next business valuation audit; not stored in repo if preferred (source: Business).

---

## PM review

Review the consolidated list above. Promote approved items to [docs/tasks.md](../../tasks.md). The builder implements approved items.

**Business valuation reference (run 2):** Base-case **USD $225,000** (range **$90k–$380k**) — see `docs/audits/business/2026-03-28-business-valuation-audit-2.md` for assumptions and confidence.
