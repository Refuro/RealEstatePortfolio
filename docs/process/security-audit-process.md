# Security & Privacy Audit Process

**Purpose:** Validate application security posture, privacy-safe handling, and security-operational readiness.

**Status:** Active.

**Cursor rule:** [`.cursor/rules/security-audit-agent.mdc`](../../.cursor/rules/security-audit-agent.mdc) — see [Audits README § Running audits](../audits/README.md#running-audits).

---

## 1. Scope

Audit:

- AuthN/AuthZ patterns
- API validation and data scoping
- Secret handling
- Security headers and abuse controls
- Sensitive flows (billing, account delete, admin)
- Security documentation freshness

Reference docs:

- `docs/security/security-notes.md`
- `docs/security/security-audit.md`
- `docs/architecture-and-build-practices.md`

---

## 2. Audit dimensions

- Authentication and authorization coverage
- Input validation and injection controls
- Secret/key handling
- Rate limiting and abuse prevention
- Privacy and data exposure risks
- Operational response readiness (logging/runbooks)

---

## 3. Output

Write report to:

- `docs/audits/security/YYYY-MM-DD-security-audit.md`

Use the shared report template in `docs/process/audit-report-template.md`.

---

## 4. Execution

1. Review security references first.
2. Verify critical routes and flows against policy.
3. Record severity-ranked findings and mitigation guidance.
4. List immediate hardening tasks and follow-up tasks.
5. Audit only; no code changes.
