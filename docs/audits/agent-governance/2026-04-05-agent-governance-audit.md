# AI Agent Governance Audit — 2026-04-05

> **Run context:** Daily governance audit. Previous run: `docs/audits/agent-governance/2026-04-04-agent-governance-audit.md`.

---

## Executive summary

- **M1 from 2026-04-04 resolved:** `builder-agent.mdc` now includes a reference to `app/.agents/product-marketing-context.md` (line 50 — "do not invent features") — confirmed CLOSED.
- **Two new Medium findings:** (1) `builder-agent.mdc` and `pm-agent.mdc` both cite `docs/policies/design-spec.md` (v2.0, legacy) as the UI design authority, but that file's own status header defers to `docs/design/design-spec-2026.md` (v3.1) for all new UI work — creating a stale rule reference. (2) This workspace is confirmed on Windows (`win32`), but `.cursor/hooks.json` still points to the bash `.sh` subagentStop hook; if Git Bash or WSL is unavailable, the PM-review followup prompt silently fails.
- **Two new Low findings:** A growing `app/.agents/skills/` directory (7 domain SKILL.md files) has no documentation in governance setup docs, and informal "discovery audit" documents are accumulating in `docs/audits/` root without a placement policy.
- **Three carried findings remain open:** M3 (execution model inconsistency across README and lane rules), L3 (lane rename checklist discrepancy), L4 (`cursor-agent-setup.md` under-listing).

---

## Severity-ranked findings

### Critical

None.

### High

None.

### Medium

- **M1 (new) — `builder-agent.mdc` and `pm-agent.mdc` reference legacy design spec path**

  `builder-agent.mdc` item 2 ("Follow the design spec") and its References section both cite `docs/policies/design-spec.md` as the UI compliance authority. `pm-agent.mdc` line 70 does the same. However, `docs/policies/design-spec.md` lines 7–8 state: *"canonical visual and interaction rules live in `docs/design/design-spec-2026.md`. Use that document first for all new UI work"* and *"when they conflict, `design-spec-2026.md` wins."*

  The v2.0 policy doc is dated 2026-03-19; the canonical v3.1 spec (`docs/design/design-spec-2026.md`) was updated 2026-04-04. A builder agent reading only `builder-agent.mdc` is directed to a self-described secondary document when executing UI tasks. The four 2026-04-04 plans and `2026-04-04-polish-gap-audit.md` all correctly reference `docs/design/design-spec-2026.md`, amplifying the discrepancy between ad-hoc guidance and rule-level guidance.

  **Evidence:** `.cursor/rules/builder-agent.mdc` lines 13–14, 44; `.cursor/rules/pm-agent.mdc` line 70; `docs/policies/design-spec.md` lines 7–8; `docs/design/design-spec-2026.md` header (v3.1, 2026-04-04, "Canonical"); `docs/audits/2026-04-04-polish-gap-audit.md` line 5 (references `docs/design/design-spec-2026.md`).

- **M2 (new) — Windows workspace uses bash hook; PowerShell variant inactive**

  The workspace OS is confirmed Windows (`win32 10.0.26200`, PowerShell shell). `.cursor/hooks.json` `subagentStop` command is `.cursor/hooks/on-subagent-stop.sh` (bash). A PowerShell alternative exists at `.cursor/hooks/on-subagent-stop.ps1` but is not referenced in `hooks.json`. `docs/cursor-agent-setup.md` (line 120) and `docs/setup/ai-process-workflow-setup.md` (line 44–46) note: *"If the hook doesn't run, edit `.cursor/hooks.json` and change … to `.ps1`."* This is documented as user-responsibility, but there is no active confirmation that Git Bash or WSL is available in this environment. If the `.sh` script fails, the `subagentStop` hook outputs `{}` (empty) silently — the PM-review followup message is never sent, reducing PM oversight loop reliability without any visible error.

  **Evidence:** `c:\Users\Refur\OneDrive\Documents\RealEstateProject\RealEstatePortfolio\.cursor\hooks.json` line 6; `.cursor\hooks\on-subagent-stop.ps1` (exists, unused); `docs/cursor-agent-setup.md` lines 119–121; `docs/setup/ai-process-workflow-setup.md` lines 43–47; user OS context (win32).

- **M3 (carried from 2026-04-04) — Audit execution model inconsistency**

  `docs/audits/README.md` § Running audits states: *"Run them in Agent chat with edits enabled — not Ask mode, not read-only subagents."* Yet the majority of single-lane audit rules (including `agent-governance-audit-agent.mdc`, `code-audit-agent.mdc`, `security-audit-agent.mdc`, et al.) begin their "What to do" section with: *"1. Launch one subagent (generalPurpose) with read-only disabled."* Both paths produce reports if read-only is off, but the in-thread vs. Task-subagent discrepancy remains an undocumented fork in execution model. `docs/process/agent-governance-audit-process.md` § 4 does not specify an execution mode at all, leaving the question open.

  **Evidence:** `docs/audits/README.md` § Running audits; `.cursor/rules/agent-governance-audit-agent.mdc` § What to do item 1; `.cursor/rules/code-audit-agent.mdc` § What to do item 1; `docs/process/agent-governance-audit-process.md` § 4 (no execution-mode mandate).

---

### Low

- **L1 (new) — `app/.agents/skills/` directory undocumented in governance setup**

  `app/.agents/skills/` contains 7 domain-specific skill directories, each with a `SKILL.md`, `evals/evals.json`, and `references/` subfolder:
  - `onboarding-cro/`, `paywall-upgrade-cro/`, `page-cro/`, `signup-flow-cro/`
  - `free-tool-strategy/`, `copywriting/`, `competitor-alternatives/`

  None of these are referenced in `builder-agent.mdc`, `pm-agent.mdc`, `docs/cursor-agent-setup.md`, or `docs/setup/ai-process-workflow-setup.md`. These sit under `app/` rather than `.cursor/skills/` (where the `veld-ui`, `veld-mobile`, and `veld-landing-cta` skills live), meaning they may not appear in the standard Cursor skills panel. The `2026-04-05-onboarding-activation-rollout.md` plan does not reference any `app/.agents/skills/` file despite being a high-relevance onboarding plan. Without documentation, there is no governance contract over when/how builders should load these skills, and it is unclear whether they are functional or dormant.

  **Evidence:** `app/.agents/skills/` glob (7 directories with SKILL.md); `docs/cursor-agent-setup.md` (no reference to `app/.agents/skills/`); `.cursor/rules/builder-agent.mdc` References section (only `app/.agents/product-marketing-context.md`; no skills paths); `docs/plans/2026-04-05-onboarding-activation-rollout.md` § Skills to Load (references only `veld-ui` and `veld-mobile`).

- **L2 (new) — Informal analysis documents accumulating in `docs/audits/` root without placement policy**

  At audit time, three date-stamped analysis documents were outside the standard lane layout: `2026-04-04-polish-gap-audit.md` at `docs/audits/` root, plus two 2026-04-05 reports at the same root. **Update (2026-04-30 doc cleanup Phase G):** The 2026-04-05 pair now lives under [`docs/audits/feature/2026-04-05-quick-add-completion-gap-audit.md`](../feature/2026-04-05-quick-add-completion-gap-audit.md) and [`docs/audits/growth-funnel/2026-04-05-onboarding-friction-analysis.md`](../growth-funnel/2026-04-05-onboarding-friction-analysis.md). Polish-gap placement may still need reconciliation.

  These are cross-referenced from plan docs (e.g., `2026-04-05-onboarding-activation-rollout.md` frontmatter: `audit: docs/audits/growth-funnel/2026-04-05-onboarding-friction-analysis.md`) and are clearly useful artifacts. However, `docs/audits/README.md` defines only the lane-based structure and does not address ad-hoc discovery or analysis reports. Without a policy for this pattern, the root will accumulate undifferentiated files over time, and future auditors cannot determine whether root-level files are formal lane reports that were misfiled or intentional freeform analyses.

  **Evidence:** `docs/audits/` glob; `docs/audits/README.md` (lane-based structure only, no freeform/discovery category); `docs/plans/2026-04-05-onboarding-activation-rollout.md` frontmatter.

- **L3 (carried from 2026-04-04 L1) — Lane rename checklist discrepancy**

  `docs/audits/README.md` § Lane structure contract lists **six** update targets when renaming a lane (including "referenced process doc or lane README.md"). `docs/process/command-integrity-check.md` § Lane rename rule lists only **five** items — omitting explicit mention of lane-level README files. A contributor following only `command-integrity-check.md` may skip updating a lane's `README.md` during a rename.

  **Evidence:** `docs/audits/README.md` lines 25–34; `docs/process/command-integrity-check.md` lines 5–12.

- **L4 (carried from 2026-04-04 L2) — `cursor-agent-setup.md` "Other focused audits" under-lists lanes**

  Lines 146–148 of `docs/cursor-agent-setup.md` name only eight audit lanes in the "Other focused audits" prose sentence, omitting SEO, Mobile experience, Documentation, and Legal/Compliance. The Step 1 clone list (fixed by S25 on 2026-04-04) and `docs/audits/README.md` are the canonical references, so practical impact is low, but a reader scanning the summary paragraph may miss four lanes.

  **Evidence:** `docs/cursor-agent-setup.md` lines 146–148.

- **L5 (carried from 2026-04-04 L3) — Veld workspace-level skills location undocumented**

  `veld-ui`, `veld-mobile`, and `veld-landing-cta` skills live under the **parent workspace** at `RealEstateProject/.cursor/skills/`, not under `RealEstatePortfolio/.cursor/`. All 2026-04-05 plans reference them at `.cursor/skills/veld-*/SKILL.md`. `docs/cursor-agent-setup.md` does not document this layout dependency. A checkout of `RealEstatePortfolio` alone (not the monorepo root) will not resolve the skill paths, and no setup doc warns of this.

  **Evidence:** `RealEstatePortfolio/.cursor/` glob (rules and hooks only — no skills); `RealEstateProject/.cursor/skills/veld-*` (present); `docs/plans/2026-04-05-onboarding-activation-rollout.md` lines 23–24.

---

## Evidence reviewed

| Document / file | Purpose |
|-----------------|---------|
| `docs/process/agent-governance-audit-process.md` | Process spec for this lane |
| `docs/process/audit-report-template.md` | Canonical report structure |
| `docs/audits/agent-governance/2026-04-04-agent-governance-audit.md` | Previous run — baseline for carried and resolved findings |
| `docs/audits/README.md` | Lane table, structure contract, running audits guidance |
| `docs/cursor-agent-setup.md` | Clone list, files table, summary paragraphs |
| `docs/setup/ai-process-workflow-setup.md` | Optional audit lanes list, hook setup guidance |
| `docs/process/command-integrity-check.md` | Lane→process→rule mapping (14 lanes) |
| `docs/process/pm-agent-workflow.md` | PM/builder operating model |
| `docs/policies/shell-risk-policy.md` | ALLOW/DENY/ASK policy source of truth |
| `.cursor/hooks.json` | Hook definitions and beforeShellExecution prompt |
| `.cursor/hooks/on-subagent-stop.sh` | Bash subagentStop script (active) |
| `.cursor/hooks/on-subagent-stop.ps1` | PowerShell subagentStop variant (present, inactive) |
| `.cursor/rules/*.mdc` — all 17 files | Full rule corpus: pm-agent, builder-agent, full-audit-agent, 14 lane rules |
| `docs/policies/design-spec.md` | Legacy design spec (v2.0, 2026-03-19) |
| `docs/design/design-spec-2026.md` | Canonical design spec (v3.1, 2026-04-04) |
| `app/.agents/product-marketing-context.md` | Confirmed referenced in builder-agent.mdc (M1 resolved) |
| `app/.agents/skills/` | 7 domain skill directories (undocumented) |
| `docs/audits/` root files | 3 informal analysis docs (outside lane folders) |
| `docs/plans/2026-04-05-*.md` — 4 files | New plans for governance-fit check |
| `docs/process/full-audit-synthesis.md` | 14-lane synthesis process |

**Scope limits:** Hook runtime behavior not verified in Cursor UI. Git Bash / WSL availability on this Windows machine not confirmed. Process doc content (beyond referencing structure) not validated for correctness. `app/.agents/skills/` SKILL.md contents not fully read.

---

## Risk & impact assessment

**M1** (design spec pointer drift) is the highest-impact new finding. The v3.1 canonical spec updated April 4 contains Phase 1–3 reconciled design rules; a builder loading the v2.0 policy doc may apply outdated typography, token, or component rules to new UI. Given that the 2026-04-05 plans are all UI-heavy (onboarding, edit-page, wizard refactor), the risk window is now open. Fix is a one-line update to each of two rule files.

**M2** (Windows hook mismatch) is an operational reliability risk. If the `subagentStop` hook silently fails, the PM sees no auto-prompt to review builder output — the oversight loop degrades to manual follow-up only. This is not caught visibly; the agent proceeds normally, it simply stops sending the review reminder.

**M3** (execution model inconsistency, carried) is a repeatability risk affecting audit reliability. Low probability of causing a missed report in practice (read-only is explicitly off in all individual lane rules), but the divergence continues to add cognitive noise.

**L1–L5** are low-exposure clarity issues. L1 (undocumented `app/.agents/skills/`) grows in impact as those skills accumulate; if they are meant to be builder-accessible, the governance gap will compound with each new skill added.

---

## Recommendations (prioritized)

1. **Update `builder-agent.mdc` and `pm-agent.mdc` to reference `docs/design/design-spec-2026.md` as the primary design authority** — Change the "Follow the design spec" item in `builder-agent.mdc` to cite `docs/design/design-spec-2026.md` first (with the legacy `docs/policies/design-spec.md` retained or removed from the rule). Update `pm-agent.mdc` reference similarly. This closes M1 and aligns rules with all plan docs and audit artifacts.

2. **Resolve the Windows hook mismatch** — Either (a) update `.cursor/hooks.json` `subagentStop` command to `.cursor/hooks/on-subagent-stop.ps1` for this Windows workspace, or (b) confirm Git Bash / WSL is present and document this in `docs/cursor-agent-setup.md` § Windows note so the conditional is explicit. This closes M2.

3. **Resolve audit execution model inconsistency (M3)** — Choose one canonical model and propagate it. The simplest fix: update `docs/audits/README.md` § Running audits to explicitly acknowledge that launching a generalPurpose Task subagent with read-only off is the valid per-lane default (matching all 14 lane rules). Update `docs/process/agent-governance-audit-process.md` § 4 to include an execution-mode mandate.

4. **Document `app/.agents/skills/` in governance setup** — Add a short section to `docs/cursor-agent-setup.md` (and optionally `builder-agent.mdc`) explaining what `app/.agents/skills/` contains, how these skills differ from workspace-level `.cursor/skills/`, and when/how a builder should load them. If they are intentionally inaccessible from the skills panel, note this explicitly.

5. **Add a freeform/discovery category to `docs/audits/README.md`** — Define an accepted home for informal analysis reports (either `docs/audits/` root with a brief policy note, or redirect to `docs/research/`). The current three root-level files should either be endorsed with a policy sentence or moved to their appropriate lane folder.

6. **Reconcile `command-integrity-check.md` lane rename list with `docs/audits/README.md`** — Add lane-level README files as item 6 in `command-integrity-check.md`, or replace the rename rule with a pointer to `docs/audits/README.md` § Lane structure contract. Closes L3.

---

## Task candidates

- [ ] Update `builder-agent.mdc` § item 2 and References to cite `docs/design/design-spec-2026.md` as the primary design spec (and optionally demote or remove the `docs/policies/design-spec.md` reference). **Doc-only; low effort; eliminates M1.**
- [ ] Update `pm-agent.mdc` References to cite `docs/design/design-spec-2026.md` alongside or instead of `docs/policies/design-spec.md`. **Doc-only; low effort; closes M1 fully.**
- [ ] Resolve Windows hook: update `.cursor/hooks.json` `subagentStop.command` to `.cursor/hooks/on-subagent-stop.ps1` (or confirm and document bash availability). **Config-only; low effort; closes M2.**
- [ ] Align audit execution model: update `docs/audits/README.md` § Running audits and `docs/process/agent-governance-audit-process.md` § 4 to acknowledge Task-subagent execution as the per-lane default. **Doc-only; closes M3.**
- [ ] Add `app/.agents/skills/` documentation to `docs/cursor-agent-setup.md` (or `docs/setup/ai-process-workflow-setup.md`) — describe what these are, how they differ from workspace-level skills, and when builders should load them. **Doc-only; closes L1.**

---

## Resolved since last run (2026-04-04)

| Finding | Resolution |
|---------|------------|
| **M1 (2026-04-04) — `app/.agents/product-marketing-context.md` not referenced in `builder-agent.mdc`** | Closed. `.cursor/rules/builder-agent.mdc` line 50 now reads: `- **Product marketing context (marketing surfaces — do not invent features):** app/.agents/product-marketing-context.md`. Confirmed by direct file read. |

---

## Re-test checklist

- [ ] Re-read `builder-agent.mdc` § item 2 and References after design-spec update to confirm `design-spec-2026.md` is the cited authority.
- [ ] Re-read `pm-agent.mdc` after update to confirm same.
- [ ] Confirm `.cursor/hooks.json` `subagentStop.command` value after Windows hook fix.
- [ ] Re-read `docs/audits/README.md` § Running audits and one lane rule after execution model update to confirm alignment.
- [ ] `npm run check` — not applicable; all changes are documentation only.

---

## Next trigger and cadence

- **Trigger:** Monthly per `docs/audits/README.md`; or immediately after changes to `.cursor/rules/`, `.cursor/hooks.json`, PM/builder process docs, or bulk design-spec/policy updates.
- **Recommended next run:** 2026-05-05 or when M1–M3 fixes ship (verify via re-test checklist above).
