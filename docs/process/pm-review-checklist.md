# PM review checklist

Use this checklist every time you review builder work (builder finished or user asked to check). Complete all items before approving.

**Last reviewed:** 2026-03-19
**Review cadence:** Monthly

---

## Before approving

- [ ] **Build & lint:** From `app/` run `npm run check`. Both build and lint must pass. Lint errors must be cleaned up before approval. If either fails, resume the builder with the failure output and request fixes; do not approve. (Ignore Prisma `schema.prisma` datasource URL warning — required for Prisma 6.)
- [ ] **Unit tests:** From `app/` run `npm run test` (Vitest). Failures → request fixes, then re-review. If the task changed `lib/metrics/`, `lib/amortization.ts`, or `lib/validations/property.ts`, tests must pass or be updated per [`docs/proposals/testing-implementation-plan.md`](../proposals/testing-implementation-plan.md).
- [ ] **Test / CI scope (when applicable):** If the task changes `.github/workflows`, Vitest config, or global test strategy, verify alignment with [`docs/qa/test-infrastructure-review.md`](../qa/test-infrastructure-review.md) and update that doc’s change log (§10). If completing items under [`docs/tasks.md`](../tasks.md) *Test infrastructure follow-up*, check off those bullets there.
- [ ] **Scope:** Compare builder output and code changes to `docs/tasks.md` and the assigned task. All task items must be done; no significant out-of-scope work.
- [ ] **Acceptance criteria (if applicable):** For tasks with explicit acceptance criteria (e.g. in `docs/tasks.md`), verify each criterion is met. Do not approve until all are satisfied.
- [ ] **Design compliance:** If the work includes UI, verify it aligns with `docs/policies/design-spec.md`. Check: semantic tokens (not raw zinc/slate), typography scale, spacing, component patterns, no forbidden elements (heavy shadows, decorative gradients). Request changes if the design direction is violated.
- [ ] **Architecture compliance:** Verify new code follows `docs/architecture-and-build-practices.md`. Check: no duplicated logic (reuse lib/), API routes use getAppUser + Zod validation, components reuse existing patterns. Request refactor if spaghetti or pattern violations.
- [ ] **Ownership semantics (when applicable):** If the task touches metrics/ownership behavior or copy, verify formulas and labels against `docs/policies/ownership-metrics.md` (canonical policy for proportional vs full-liability behavior).
- [ ] **Analytics math consistency (when applicable):** If the task touches projections/metrics/ratios, verify contracts against `docs/policies/analytics-math-policy.md` (time windows, debt-service source, and UI/API/export reconciliation).
- [ ] **Audit compatibility (required):** If task scope introduces or changes a major domain (security, UX, performance/cost, reliability, data integrity, business metrics), confirm corresponding audit process/docs in `docs/audits/README.md` and `docs/process/` are still accurate.
- [ ] **Audit gate (required):** Run required audits per cadence in [docs/audits/README.md](../audits/README.md) before release. If this release includes major risk-bearing changes, ensure relevant lane audits were run recently and reports exist in `docs/audits/<lane>/`.
- [ ] **Property flows (when applicable):** If the task touches add property (`/properties/new`), full edit (`/properties/[id]/edit`), property detail tabs, or property CRUD APIs, run or spot-check [Property flow regression matrix](../qa/property-flow-regression-matrix.md) before release.
- [ ] **Context-specific checks:** If the work added a new third-party service, new page, or plan-gated feature, verify the builder followed §6.3: Privacy/Terms updated for new services; public pages in proxy + SEO metadata; auth pages noindex; upgrade links correct (/plans vs /pricing).
- [ ] **Docs:** If the builder added env vars, new commands, or setup steps, confirm they are in `app/.env.example` and/or `docs/setup/manual-steps.md`. If the builder noted security or manual steps, confirm `docs/security/security-notes.md` or `docs/setup/manual-steps.md` is updated.

---

## After approving

- Resume the builder with a clear instruction for the next task (or with requested fixes, then that instruction).

---

*Reference: [pm-agent-workflow.md](pm-agent-workflow.md).*
