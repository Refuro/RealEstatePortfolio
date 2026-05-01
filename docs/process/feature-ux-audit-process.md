# Feature / UX / IA Audit Process

**Purpose:** Evaluate feature discoverability, UX clarity, information architecture, and flow friction across the application.

**Status:** Active.

**Cursor rule:** [`.cursor/rules/feature-audit-agent.mdc`](../../.cursor/rules/feature-audit-agent.mdc) — see [Audits README § Running audits](../audits/README.md#running-audits).

---

## 1. Scope

Audit core app journeys:

- Dashboard
- Properties list and property detail
- Modeling and Mortgage workspaces
- Analyze + Deals flows
- Plans/Pricing conversion surfaces
- Onboarding and first-value path

Reference docs:

- `docs/policies/design-spec.md`
- `docs/architecture-and-build-practices.md`
- `docs/policies/analytics-math-policy.md` (for label density + context clarity)
- **`docs/qa/mobile-experience-audit.md`** — when the audit scope is **mobile-only** (viewports &lt;768px, `MobileToolShell`, touch, keyboards), use this checklist; output may be `docs/audits/feature/YYYY-MM-DD-mobile-experience-audit.md`.

---

## 2. Audit dimensions

- Information hierarchy (what is primary/secondary)
- Discoverability of high-value actions
- Label and copy clarity
- Input/control usability
- Empty states, helpers, and error paths
- Mobile responsiveness and scanability
- Cross-page consistency

---

## 3. Output

Write report to:

- `docs/audits/feature/YYYY-MM-DD-feature-ux-audit.md`

Use the shared report template in `docs/process/audit-report-template.md`.

---

## 4. Execution

1. Review references and current layout.
2. Audit each core surface.
3. Record severity-ranked findings with concrete evidence.
4. Recommend prioritized fixes and task candidates.
5. Audit only; no code changes.
