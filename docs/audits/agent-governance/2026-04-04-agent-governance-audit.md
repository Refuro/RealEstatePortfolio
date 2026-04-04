# AI Agent Governance Audit — 2026-04-04

> **Run context:** Daily governance audit. Previous run: `docs/audits/agent-governance/2026-04-03-agent-governance-audit-2.md`.

---

## Executive summary

- **S25 resolved:** The previous audit's only Medium finding — `seo-audit-agent.mdc` missing from `docs/cursor-agent-setup.md` Step 1 — was closed by task **Sched 4-03-2 #S25** (done 2026-04-04, Phase G). All 14 lane rules now appear in the Step 1 clone list.
- **Infrastructure health is strong:** All 17 `.cursor/rules/*.mdc` files are present (14 lane rules + `full-audit-agent`, `pm-agent`, `builder-agent`). Process docs, hook policy, and `docs/audits/README.md` lane table are internally consistent. `docs/process/command-integrity-check.md` maps all 14 lanes.
- **One new Medium gap:** `app/.agents/product-marketing-context.md` (introduced as a product-claim guard in today's 2026-04-04 plans) is not referenced in `builder-agent.mdc`. Without this reference, builder agents working on marketing-surface tasks may produce content claims that contradict the established product context.
- **Two Medium items remain open from previous audits:** (1) Audit execution model inconsistency across `agent-governance-audit-agent.mdc`, `docs/audits/README.md`, and the `agent-governance-audit-process.md`. (2) `builder-agent.mdc` does not reference `app/.agents/product-marketing-context.md`. Three Low items are also carried forward.

---

## Severity-ranked findings

### Critical

- None.

### High

- None.

### Medium

- **M1 — `app/.agents/product-marketing-context.md` not referenced in `builder-agent.mdc` (new, 2026-04-04)**

  All four 2026-04-04 plans (`calculators-premium-cta-plan.md`, `changelog-polish-plan.md`, `property-detail-revamp-plan.md`, `refinance-payoff-insights-plan.md`) include a governance block that tells implementers to read `app/.agents/product-marketing-context.md` and "do not invent features." This is a valid product-accuracy constraint. However, `builder-agent.mdc` contains no reference to this file, so builder agents launched from the PM rule — without a plan doc open — have no rule-level instruction to read it. The risk is subtle: a builder working on a marketing-surface task may silently produce copy or claims that contradict the product context guard the plan authors expected to be enforced.

  **Evidence:** `docs/archive/plans/2026-04-04-calculators-premium-cta-plan.md` line 20; `docs/archive/plans/2026-04-04-changelog-polish-plan.md`; `app/.agents/product-marketing-context.md` exists; `.cursor/rules/builder-agent.mdc` — no reference to `.agents/` path.

- **M2 — Audit execution model inconsistency (carried from 2026-04-03 run 2)**

  `docs/audits/README.md` § Running audits states: *"Run them in Agent chat with edits enabled — not Ask mode, not read-only subagents."* `.cursor/rules/full-audit-agent.mdc` reinforces this with "Execution mode (required): Run in Agent mode." However, `.cursor/rules/agent-governance-audit-agent.mdc` — and the majority of single-lane audit rules — have the instruction **"1. Launch one subagent (generalPurpose) with read-only disabled."** This creates a subtle conflict: the README default is *in-thread Agent*; the individual lane rules default is *Task subagent*. Both paths produce reports if read-only is off, but the discrepancy causes confusion about the canonical execution model when running a single lane.

  **Evidence:** `docs/audits/README.md` § Running audits; `.cursor/rules/agent-governance-audit-agent.mdc` § What to do item 1; `.cursor/rules/code-audit-agent.mdc` § What to do item 1; `docs/process/agent-governance-audit-process.md` § 4 — no execution-mode mandate.

### Low

- **L1 — Lane rename checklist discrepancy (carried)**

  `docs/audits/README.md` § Lane structure contract lists **six** update targets when renaming a lane (including "referenced process doc or lane README.md"). `docs/process/command-integrity-check.md` § Lane rename rule lists **five** items and omits explicit mention of lane-level README files. A contributor following only `command-integrity-check.md` during a rename may skip a lane's `README.md` update.

  **Evidence:** `docs/audits/README.md` lines 25–34; `docs/process/command-integrity-check.md` lines 5–12.

- **L2 — `cursor-agent-setup.md` summary sentence under-lists audit lanes (carried)**

  Lines 146–147 of `docs/cursor-agent-setup.md` ("Other focused audits") name only eight lanes (feature/UX, security, performance-cost, reliability-ops, data-integrity, business-valuation, growth-funnel, agent-governance) and defers to `docs/audits/README.md`. SEO, Mobile experience, Documentation, and Legal are absent from the prose sentence, even though Mobile and SEO are called out in the "Full audit" paragraph on the same page. The Step 1 clone list (now fixed) and the `docs/audits/README.md` are the canonical references, so the impact is low, but the sentence can mislead someone scanning the summary.

  **Evidence:** `docs/cursor-agent-setup.md` lines 146–148.

- **L3 — Veld skill paths not in `RealEstatePortfolio/.cursor/skills/` (carried; reinforced by 2026-04-04 plans)**

  All 2026-04-04 plans (`calculators-premium-cta-plan.md`, etc.) reference `.cursor/skills/veld-landing-cta/SKILL.md`, `.cursor/skills/veld-ui/SKILL.md`, and `.cursor/skills/veld-mobile/SKILL.md`. These paths exist under the parent workspace at `RealEstateProject/.cursor/skills/`, not under `RealEstatePortfolio/.cursor/`. A checkout of only `RealEstatePortfolio` (single-repo, not monorepo root) will not resolve these skill paths. `docs/cursor-agent-setup.md` makes no note of this layout dependency.

  **Evidence:** `RealEstatePortfolio/.cursor/` glob — rules and hooks only; `RealEstateProject/.cursor/skills/veld-*` — present; four 2026-04-04 plans reference `.cursor/skills/veld-*/SKILL.md`.

---

## Evidence reviewed

| Document / file | Purpose |
|-----------------|---------|
| `docs/process/agent-governance-audit-process.md` | Process spec for this lane |
| `docs/process/audit-report-template.md` | Canonical report structure |
| `docs/audits/agent-governance/2026-04-03-agent-governance-audit-2.md` | Previous run — baseline for carried findings |
| `docs/audits/README.md` | Lane table, structure contract, running audits |
| `docs/cursor-agent-setup.md` | Clone list, table of files, summary paragraphs |
| `docs/setup/ai-process-workflow-setup.md` | Optional audit lanes list (14 + full-audit ✓) |
| `docs/process/command-integrity-check.md` | Lane→process→rule mapping (14 lanes ✓) |
| `docs/process/pm-agent-workflow.md` | PM/builder operating model |
| `docs/policies/shell-risk-policy.md` | ALLOW/DENY/ASK policy source of truth |
| `.cursor/hooks.json` | Hook definitions and beforeShellExecution prompt |
| `.cursor/rules/*.mdc` — all 17 files | Full rule corpus: pm-agent, builder-agent, full-audit-agent, 14 lane rules |
| `docs/tasks.md` | Active tasks including S25 resolution |
| `docs/process/full-audit-synthesis.md` | 14-lane synthesis template |
| `docs/plans/2026-04-04-*.md` — all 8 files | New plans created today; governance-fit check |
| `app/.agents/product-marketing-context.md` | Existence confirmed; not referenced in rules |

**Scope limits:** Did not re-execute hooks in Cursor UI. Did not verify `.cursor/hooks/on-subagent-stop.sh` runtime behavior on this machine. Did not validate process docs beyond their referencing structure.

---

## Risk & impact assessment

**M1** (`app/.agents/product-marketing-context.md` unregistered) is the most actionable new risk. As product scope expands into marketing-surface work (calculators, changelogs, pricing pages), builder agents that aren't directed to this file may introduce copy or capability claims that misrepresent the product. The fix is a one-line addition to `builder-agent.mdc`.

**M2** (execution model inconsistency) is a repeatability risk. If an agent runs a lane as a read-only subagent (misinterpreting the rule), the report file won't be written. The existing clarification in `docs/audits/README.md` and individual rule "Execution mode (required)" blocks mitigates this in practice, but the contradicting "Launch one subagent" instruction remains noise.

**L1–L3** are low-exposure clarity issues. L3 (skill paths) grows in practical impact each time a new plan is added that references the skills, but because the Cursor workspace is the monorepo root in practice, agents running there resolve paths correctly.

---

## Recommendations (prioritized)

1. **Add `app/.agents/product-marketing-context.md` to `builder-agent.mdc` references** — Add a one-line entry in the "References" section of `builder-agent.mdc`: `- **Product marketing context (marketing-surface tasks):** app/.agents/product-marketing-context.md — do not invent features or capabilities`. This makes the guard rule-level, not just plan-level.

2. **Resolve audit execution model inconsistency** — Choose one canonical default and propagate it. Option A: Keep Task subagent as the default (current lane rules); update `docs/audits/README.md` § Running audits to clarify that launching a Task subagent with read-only off is the lane-level default. Option B: Remove "Launch one subagent" from individual lane rules and state that the parent Agent runs lanes in-thread. Either choice removes the conflict. Update `docs/process/agent-governance-audit-process.md` § 4 to match.

3. **Reconcile lane rename checklists** — Either extend `docs/process/command-integrity-check.md` § Lane rename rule to include lane-level README files (matching `docs/audits/README.md`), or replace the rename rule with a pointer: *"See `docs/audits/README.md` § Lane structure contract for the full update target list."* Prevents drift from having two independent checklists.

4. **Broaden `cursor-agent-setup.md` "Other focused audits" sentence** — Either name all 14 lanes, or replace with: *"You can also run any of the 14 audit lanes listed in `docs/audits/README.md`."* This closes the under-listing without enumerating all names.

5. **Document skill path layout in `docs/cursor-agent-setup.md`** — Add a note in the setup guide that `veld-ui`, `veld-mobile`, and `veld-landing-cta` skills live at `<workspace-root>/.cursor/skills/` (i.e., the `RealEstateProject` monorepo root, one level above `RealEstatePortfolio`). This avoids confusion for anyone following the single-repo clone path.

---

## Task candidates

- [ ] Add `app/.agents/product-marketing-context.md` reference to `builder-agent.mdc` § References (guards marketing-surface builder work against feature invention). **Doc-only; low effort; high value.**
- [ ] Align audit execution wording: update `docs/audits/README.md` OR individual lane rules so "in-thread Agent" vs "Task subagent" default is stated once. Update `agent-governance-audit-process.md` § 4 to match.
- [ ] Reconcile `command-integrity-check.md` lane rename list with `docs/audits/README.md` § Lane structure contract (one source of truth or explicit pointer).

---

## Resolved since last run

| Finding | Resolution |
|---------|------------|
| **Medium: `cursor-agent-setup.md` Step 1 missing `seo-audit-agent.mdc`** | Closed by task **Sched 4-03-2 #S25** (done 2026-04-04, Phase G). `docs/cursor-agent-setup.md` lines 94–111 now list all 14 lane rules + `full-audit-agent.mdc`. |

---

## Re-test checklist

- [ ] Re-read `.cursor/rules/builder-agent.mdc` after any update to confirm `app/.agents/product-marketing-context.md` is referenced.
- [ ] Re-read `docs/audits/README.md` § Running audits and one lane `*-audit-agent.mdc` after execution model change to confirm alignment.
- [ ] Re-read `docs/process/command-integrity-check.md` § Lane rename rule after any reconciliation with `docs/audits/README.md` § Lane structure contract.
- [ ] `npm run check` — not required for these doc-only changes.

---

## Next trigger and cadence

- **Trigger:** Monthly per `docs/audits/README.md`; or after changes to `.cursor/rules/`, `.cursor/hooks.json`, PM/builder process docs, or bulk updates to `docs/cursor-agent-setup.md` / `docs/setup/ai-process-workflow-setup.md`.
- **Recommended next run:** 2026-05-04 or when M1/M2 fixes are shipped (verify changes resolved by re-test checklist above).
