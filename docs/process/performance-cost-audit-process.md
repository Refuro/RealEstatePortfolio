# Performance & Cost Audit Process

**Purpose:** Identify frontend/backend performance regressions and avoidable cost drivers.

**Status:** Active.

**Cursor rule:** [`.cursor/rules/performance-cost-audit-agent.mdc`](../../.cursor/rules/performance-cost-audit-agent.mdc) — see [Audits README § Running audits](../audits/README.md#running-audits).

---

## 1. Scope

Audit:

- Page performance and loading behavior
- Rendering and data-fetch strategy
- Heavy dependency usage
- External API usage and cost pressure
- Build/runtime patterns impacting speed and spend

Reference docs:

- `docs/architecture-and-build-practices.md` (performance section)

---

## 2. Audit dimensions

- Bundle/load efficiency
- SSR/CSR strategy and caching
- Hot-path API cost and throttling
- Recompute/re-fetch inefficiencies
- Expensive queries and potential N+1 behavior

---

## 3. Output

Write report to:

- `docs/audits/performance-cost/YYYY-MM-DD-performance-cost-audit.md`

Use the shared report template in `docs/process/audit-report-template.md`.

---

## 4. Execution

1. Review performance practices in architecture docs.
2. Inspect critical pages/routes and likely cost hotspots.
3. Document findings with severity and estimated impact.
4. Recommend prioritized fixes and measurable targets.
5. Audit only; no code changes.
