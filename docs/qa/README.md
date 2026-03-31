# QA & regression

Long-lived checklists that outlive individual epics or batches.

**Process:** Test/CI follow-up Phases 1–2 are **done** (see [`docs/tasks-archived.md`](../tasks-archived.md) § **Tasks.md archive (2026-03-20)**). Ongoing context: [Test infrastructure review](test-infrastructure-review.md).

| Doc | Use |
|-----|-----|
| [Testing hardening proposal](testing-hardening-proposal.md) | Phased roadmap to **high confidence**: P0 billing/account/APIs, P1 import/export, P2 lib/coverage gates, optional Playwright smoke. |
| [Test infrastructure review](test-infrastructure-review.md) | How tests are set up, what they prove vs don’t, alignment with math/policies, CI gaps, Docker/Playwright notes, recommended next coverage. |
| [Property flow regression matrix](property-flow-regression-matrix.md) | Add / edit / property detail (Overview & Details) / workspaces / APIs — run when those surfaces change or before release. |
| [Mobile shell verification](mobile-shell-verification.md) | Manual matrix for four `MobileToolShell` surfaces + Phase A/B test notes; ties UI to existing `lib/` math tests. |
| [Mobile experience audit](mobile-experience-audit.md) | Full **audit criteria** (layout, touch, forms, charts, a11y, billing, parity); use for formal runs → `docs/audits/feature/YYYY-MM-DD-mobile-experience-audit.md`. |
