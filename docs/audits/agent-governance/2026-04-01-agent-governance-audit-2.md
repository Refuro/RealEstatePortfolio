# AI Agent Governance Audit — 2026-04-01

## Executive summary

- **Overall health remains strong.** This pass is the **full-audit run suffix `-2`** governance lane. Fourteen lanes are consistently enumerated in `docs/audits/README.md`, `.cursor/rules/full-audit-agent.mdc`, `docs/process/full-audit-synthesis.md` §6, `docs/process/command-integrity-check.md` (mapping table includes Mobile experience folder exception), and `docs/cursor-agent-setup.md` (Full audit bullet: **14** lanes). All fourteen lane process files exist under `docs/process/`. `docs/policies/shell-risk-policy.md` and `.cursor/hooks.json` `beforeShellExecution` remain aligned on ALLOW/DENY/ASK intent.
- **Top remaining gap:** Two canonical docs still describe lane outputs as uniformly under `docs/audits/<lane>/` without the **Mobile experience** exception in the same sentence (`docs/process/agent-governance-audit-process.md` §1; `docs/process/full-audit-synthesis.md` §6 step 2). `command-integrity-check.md` and `full-audit-synthesis.md` §1 already document the exception elsewhere—drift is localized.
- **Improvement since the same-day first pass (`2026-04-01-agent-governance-audit.md`):** `.cursor/rules/builder-agent.mdc` now lists **`docs/policies/calculator-metric-tones.md`** in References, resolving the prior “missing reference” note.
- **Recommendation:** Add the Mobile experience output path exception to the two oversimplified sentences; optionally document same-day report suffixes (`-2`, etc.) in `docs/audits/agent-governance/README.md` for repeat full-audit runs.

---

## Severity-ranked findings

### Critical

- *(none)*

### High

- *(none)*

### Medium

- **`docs/process/agent-governance-audit-process.md` §1 — uniform `docs/audits/<lane>/` wording** — Line 11 states lane outputs live under `docs/audits/<lane>/` without noting that **Mobile experience** reports go to `docs/audits/feature/YYYY-MM-DD-mobile-experience-audit.md`. **Risk:** Mis-filed expectations during lane renames or automation. **Evidence:** `docs/process/agent-governance-audit-process.md` §1; contrast `docs/process/command-integrity-check.md` (Mobile experience row); `docs/audits/README.md` (Mobile experience row); `.cursor/rules/mobile-experience-audit-agent.mdc`.

- **`docs/process/full-audit-synthesis.md` §6 — step 2 omits Mobile exception** — Step 2 says “Write each report to `docs/audits/<lane>/YYYY-MM-DD-*-audit.md`” without the same exception. §1 of the same file and `command-integrity-check.md` already state the exception. **Risk:** Same as above for anyone following only §6. **Evidence:** `docs/process/full-audit-synthesis.md` §6 (lines ~191–192); `docs/process/full-audit-synthesis.md` §1 (Mobile exception).

### Low

- **`docs/cursor-agent-setup.md` — “Other focused audits” is illustrative** — Lists a subset of lanes; defers to `docs/audits/README.md` for exact phrases. **Risk:** Skimmers may miss SEO, Legal, Documentation, or Mobile experience until they open the README. **Evidence:** `docs/cursor-agent-setup.md` (lines 146–147); `docs/audits/README.md` §Running audits.

- **`docs/policies/shell-risk-policy.md` vs `.cursor/hooks.json` — minor command wording** — Policy ALLOW includes `npm test`; hook prompt uses `npm run …/test` style bundling. **Risk:** Negligible when `test` script exists. **Evidence:** `docs/policies/shell-risk-policy.md` §ALLOW; `.cursor/hooks.json` `beforeShellExecution` prompt.

- **`beforeShellExecution` is prompt-based** — Alignment with written policy depends on model behavior. **Evidence:** `.cursor/hooks.json` (`"type": "prompt"`); `docs/policies/shell-risk-policy.md`.

- **`subagentStop` defaults to `.cursor/hooks/on-subagent-stop.sh`** — On Windows without Git Bash/WSL, follow-up may not run until switched to `on-subagent-stop.ps1` per setup docs. **Evidence:** `.cursor/hooks.json`; `docs/setup/ai-process-workflow-setup.md` (Windows); `docs/cursor-agent-setup.md`.

- **`docs/audits/agent-governance/README.md` — naming** — Describes only `YYYY-MM-DD-agent-governance-audit.md`; does not mention optional **`-N` suffixes** for same-day repeat runs (convention used elsewhere under `docs/audits/agent-governance/`). **Risk:** Minor confusion when comparing multiple 2026-04-01 files. **Evidence:** `docs/audits/agent-governance/README.md`; sibling filenames in `docs/audits/agent-governance/`.

- **Historical synthesis snapshots** — Older files under `docs/audits/synthesis/` may cite prior lane counts; canonical policy is `docs/audits/README.md` + `full-audit-agent.mdc`. **Evidence:** `docs/audits/README.md` §Full audit.

- **PM/builder phase model vs `docs/tasks.md` queue** — `pm-agent.mdc` and `on-subagent-stop.sh` still anchor “next phase” language to `docs/reference/engineering-spec.md` §8; operational work is heavily **`docs/tasks.md`**-driven. **Risk:** Low—both patterns coexist. **Evidence:** `.cursor/rules/pm-agent.mdc`; `.cursor/hooks/on-subagent-stop.sh`; `docs/tasks.md` §Active tasks.

---

## Evidence reviewed

- **Rules:** `.cursor/rules/` — `full-audit-agent.mdc`, `agent-governance-audit-agent.mdc`, `pm-agent.mdc`, `builder-agent.mdc`, `mobile-experience-audit-agent.mdc` (spot-check); remaining `*-audit-agent.mdc` files enumerated via workspace listing.
- **Hooks:** `.cursor/hooks.json`; `.cursor/hooks/on-subagent-stop.sh`.
- **Policies & process:** `docs/policies/shell-risk-policy.md`; `docs/process/command-integrity-check.md`; `docs/process/agent-governance-audit-process.md`; `docs/process/full-audit-synthesis.md`; `docs/process/audit-report-template.md`; `docs/process/pm-agent-workflow.md` (referenced in governance process).
- **Setup & index:** `docs/cursor-agent-setup.md`; `docs/setup/ai-process-workflow-setup.md`; `docs/audits/README.md`; `docs/audits/agent-governance/README.md`.
- **Working files:** `docs/tasks.md` (structure spot-check); no edits under `app/` for this audit.

**Assumptions / limits:** Static consistency review; hooks were not executed. This report is **audit-only** per `docs/process/agent-governance-audit-process.md` §4.8.

---

## Risk & impact assessment

- **Medium (path wording):** Incomplete exception text in two process sections could mislead maintainers who edit only those paragraphs; fix is a small doc clarification.
- **Low findings:** Ergonomics, platform hook behavior, and known limitations of prompt-based gating—not structural gaps in the 14-lane rule set.

---

## Recommendations (prioritized)

1. **Amend `docs/process/agent-governance-audit-process.md` §1** — After the path sentence, add the Mobile experience exception (reports under `docs/audits/feature/`, filename pattern `YYYY-MM-DD-mobile-experience-audit.md`), mirroring `docs/audits/README.md`.
2. **Amend `docs/process/full-audit-synthesis.md` §6 step 2** — Add the same exception in one line or footnote so §6 matches §1 and `command-integrity-check.md`.
3. **Optional:** In `docs/cursor-agent-setup.md`, qualify “Other focused audits” as non-exhaustive or replace the list with a pointer to the README table.
4. **Optional:** In `docs/audits/agent-governance/README.md`, note that same-day repeat reports may use a `-2`, `-3`, … suffix before `.md` when needed.

---

## Task candidates (optional)

- [ ] Add Mobile experience report path exception to `docs/process/agent-governance-audit-process.md` §1.
- [ ] Add Mobile experience exception to `docs/process/full-audit-synthesis.md` §6 step 2.
- [ ] (Optional) Document `-N` suffix convention in `docs/audits/agent-governance/README.md`.

---

## Re-test checklist

- [ ] After doc edits, grep for `docs/audits/<lane>/` in `docs/process/` and confirm Mobile exception appears wherever lane output paths are stated in imperative steps.
- [ ] If `.cursor/hooks.json` or `shell-risk-policy.md` changes, verify both stay in sync per `docs/process/command-integrity-check.md` §Shell policy ↔ hooks sync.
- [ ] `npm run check` when any change touches `app/` (not required for doc-only governance fixes).

---

## Next trigger and cadence

- **Trigger:** Changes to `.cursor/rules/`, `.cursor/hooks.json`, audit lane names or folders, or PM/builder workflow docs; otherwise monthly per `docs/audits/README.md`.
- **Recommended next run:** 2026-05-01 or the next governance-affecting change, whichever is sooner.
