# Reliability & Operations Audit Process

**Purpose:** Assess resilience and operational readiness (error handling, observability, recovery posture).

**Status:** Active.

---

## 1. Scope

Audit:

- Failure handling patterns
- Observability and diagnostics
- Degraded-mode user behavior
- Operational runbook/doc readiness
- Release and rollback confidence

Reference docs:

- `docs/architecture-and-build-practices.md`
- `docs/setup/manual-steps.md`

---

## 2. Audit dimensions

- Error boundaries and fallback UX
- API failure behavior and retry semantics
- Logging/tracing signal quality
- Incident readiness and key manual runbooks
- Critical dependency failure scenarios

---

## 3. Output

Write report to:

- `docs/audits/reliability-ops/YYYY-MM-DD-reliability-ops-audit.md`

Use the shared report template in `docs/process/audit-report-template.md`.

---

## 4. Execution

1. Review reliability-relevant docs.
2. Inspect key failure-prone pathways.
3. Capture gaps in robustness and ops readiness.
4. Recommend hardening tasks and operational checks.
5. Audit only; no code changes.
