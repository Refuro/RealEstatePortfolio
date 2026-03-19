# Data Integrity & Reconciliation Audit Process

**Purpose:** Verify consistency across data model, API responses, UI displays, imports/exports, and derived metrics.

**Status:** Active.

---

## 1. Scope

Audit:

- Schema-model-to-UI consistency
- API/UI/export/import field alignment
- Math/policy contract reconciliation at boundaries
- Backward-compatibility and data drift risks

Reference docs:

- `docs/policies/ownership-metrics.md`
- `docs/policies/analytics-math-policy.md`
- `docs/architecture-and-build-practices.md`

---

## 2. Audit dimensions

- Contract parity across surfaces
- Input/output naming and semantic consistency
- Missing/ambiguous assumptions in exports
- Data edge cases (nulls, stale fields, legacy imports)
- Reconciliation path clarity for users

---

## 3. Output

Write report to:

- `docs/audits/data-integrity/YYYY-MM-DD-data-integrity-audit.md`

Use the shared report template in `docs/process/audit-report-template.md`.

---

## 4. Execution

1. Review canonical policies and contracts.
2. Inspect representative UI/API/export/import surfaces.
3. Document mismatches and user-reconciliation risks.
4. Recommend remediation tasks by severity.
5. Audit only; no code changes.
