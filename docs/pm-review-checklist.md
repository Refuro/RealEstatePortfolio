# PM review checklist

Use this checklist every time you review a phase (builder finished or user asked to check). Complete all items before approving.

---

## Before approving a phase

- [ ] **Build:** From `app/` run `npm run build`. It must pass. If it fails, resume the builder with the failure output and request fixes; do not approve.
- [ ] **Lint:** From `app/` run `npm run lint`. It must pass. If it fails, same as above.
- [ ] **Tests (if present):** If the project has `npm test`, run it. Failures → request fixes, then re-review.
- [ ] **Scope:** Compare builder output and code changes to `docs/current-phase.md` and `docs/engineering-spec.md` for this phase. All phase items must be done; no significant out-of-scope work.
- [ ] **Docs:** If the builder added env vars, new commands, or setup steps, confirm they are in `app/.env.example` and/or `docs/manual-steps.md`. If the builder noted security or manual steps, confirm `docs/security-notes.md` or `docs/manual-steps.md` is updated.
- [ ] **Builder handoff:** If the builder added a **Handoff** section (in `docs/current-phase.md` or `docs/builder-handoff.md`), read it and ensure any required manual steps are recorded in `docs/manual-steps.md` and that you’ve noted any follow-ups.

---

## After approving

- **If user asked to pause after this phase (e.g. after Phase 3):** Do **not** resume the builder with the next phase. Say the phase is approved and that we’re pausing; next phase starts when the user says to continue.
- **If Phase 4 (Stripe / monetization):** Do **not** auto-advance to Phase 5. Report “Phase 4 ready for approval” and wait for the user to explicitly approve (or run a smoke test) before sending the builder to Phase 5.
- **Otherwise:** Resume the builder with one message: “Approved. Proceed to Phase N — [scope from engineering-spec].” (or with requested fixes, then that same instruction).

---

*Reference: [pm-agent-workflow.md](pm-agent-workflow.md).*
