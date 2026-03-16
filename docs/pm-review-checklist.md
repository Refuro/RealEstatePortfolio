# PM review checklist

Use this checklist every time you review builder work (builder finished or user asked to check). Complete all items before approving.

---

## Before approving

- [ ] **Build & lint:** From `app/` run `npm run check`. Both build and lint must pass. Lint errors must be cleaned up before approval. If either fails, resume the builder with the failure output and request fixes; do not approve. (Ignore Prisma `schema.prisma` datasource URL warning — required for Prisma 6.)
- [ ] **Tests (if present):** If the project has `npm test`, run it. Failures → request fixes, then re-review.
- [ ] **Scope:** Compare builder output and code changes to `docs/tasks.md` and the assigned task. All task items must be done; no significant out-of-scope work.
- [ ] **Acceptance criteria (if applicable):** For tasks with explicit acceptance criteria (e.g. in `docs/tasks.md`), verify each criterion is met. Do not approve until all are satisfied.
- [ ] **Design compliance:** If the work includes UI, verify it aligns with `docs/design-spec.md`. Check: semantic tokens (not raw zinc/slate), typography scale, spacing, component patterns, no forbidden elements (heavy shadows, decorative gradients). Request changes if the design direction is violated.
- [ ] **Architecture compliance:** Verify new code follows `docs/architecture-and-build-practices.md`. Check: no duplicated logic (reuse lib/), API routes use getAppUser + Zod validation, components reuse existing patterns. Request refactor if spaghetti or pattern violations.
- [ ] **Context-specific checks:** If the work added a new third-party service, new page, or plan-gated feature, verify the builder followed §6.3: Privacy/Terms updated for new services; public pages in proxy + SEO metadata; auth pages noindex; upgrade links correct (/plans vs /pricing).
- [ ] **Docs:** If the builder added env vars, new commands, or setup steps, confirm they are in `app/.env.example` and/or `docs/manual-steps.md`. If the builder noted security or manual steps, confirm `docs/security-notes.md` or `docs/manual-steps.md` is updated.

---

## After approving

- Resume the builder with a clear instruction for the next task (or with requested fixes, then that instruction).

---

*Reference: [pm-agent-workflow.md](pm-agent-workflow.md).*
