# AI Agent Governance Audit — 2026-03-31

## Executive summary

- **Overall:** PM/builder rules (`pm-agent.mdc`, `builder-agent.mdc`), **14** audit lane rules matching `docs/audits/README.md` (including **Mobile experience** and **SEO**), `full-audit-agent.mdc`, hooks (`subagentStop`, `beforeShellExecution`), and core process docs form a coherent stack. **`docs/policies/shell-risk-policy.md` and `.cursor/hooks.json` are aligned** on ALLOW / DENY / ASK, including **network-heavy / side-effect ASK** (the gap called out in `docs/audits/agent-governance/2026-03-20-agent-governance-audit.md` is **no longer present** in the current hook prompt).
- **Top risk:** **Onboarding and integrity-check drift** — `docs/process/command-integrity-check.md` lane→rule mapping **does not list Mobile experience**, so periodic integrity runs can **miss a lane** that `docs/audits/README.md` and `full-audit-synthesis.md` treat as part of the **14-lane** full audit.
- **Secondary risk:** **`docs/cursor-agent-setup.md`** and **`docs/setup/ai-process-workflow-setup.md`** are **partially stale** vs the live lane set (missing **SEO** row in the setup guide’s audit-doc table; missing **`mobile-experience-audit-agent.mdc`** in the optional rules bullet list).
- **Recommendation:** Update the three doc surfaces above in one pass; keep treating **`docs/audits/README.md`** as the lane contract and **`command-integrity-check.md`** as a complete mirror of it.

## Severity-ranked findings

### Critical

- *(none)*

### High

- **`command-integrity-check.md` mapping omits Mobile experience (and undercounts lanes)** — The “Lane → process → rule mapping” table lists 13 lanes and has **no row** for **Mobile experience** (`docs/process/mobile-experience-audit-process.md`, `.cursor/rules/mobile-experience-audit-agent.mdc`, reports under `docs/audits/feature/`). **`docs/audits/README.md`** and **`docs/process/full-audit-synthesis.md`** §6 define **14** lanes including Mobile experience. **Impact:** Anyone following only the mapping table may skip Mobile when validating wiring. **Evidence:** `docs/process/command-integrity-check.md` (mapping table); `docs/audits/README.md` (full audit + table); `.cursor/rules/mobile-experience-audit-agent.mdc` (exists).

### Medium

- **`docs/cursor-agent-setup.md` audit-doc inventory omits SEO** — The “Docs the PM rule and workflow reference” table lists processes from Code through Legal but **does not include** `docs/process/seo-audit-process.md` or `docs/audits/seo/`, unlike `docs/audits/README.md` and `.cursor/rules/seo-audit-agent.mdc`. **Impact:** Onboarding / copy-repo checklist can miss the SEO lane when reconciling files. **Evidence:** `docs/cursor-agent-setup.md` (table §2); `docs/audits/README.md` (SEO row); `docs/process/seo-audit-process.md` (exists).

- **`docs/setup/ai-process-workflow-setup.md` optional audit rules omit Mobile** — The “Optional but part of this repo's broader AI workflow” list includes `feature-audit-agent.mdc`, `seo-audit-agent.mdc`, etc., but **does not list** `.cursor/rules/mobile-experience-audit-agent.mdc`, though that file is present and indexed in `docs/audits/README.md`. **Impact:** Incomplete file copy list when reproducing the workflow. **Evidence:** `docs/setup/ai-process-workflow-setup.md` (§ Files you need); `.cursor/rules/mobile-experience-audit-agent.mdc` (exists).

### Low

- **`agent-governance-audit-process.md` does not state “14 lanes” or name SEO** — The process doc points at `docs/audits/README.md` and `.cursor/rules/` but does not restate the **SEO** lane or **14-lane** full-audit count (both are explicit in `docs/audits/README.md` and `full-audit-synthesis.md`). **Impact:** Minor discoverability only; no wiring bug. **Evidence:** `docs/process/agent-governance-audit-process.md`; `docs/audits/README.md` (14 lanes, SEO row).

- **`subagentStop` defaults to Bash (`.sh`)** — `.cursor/hooks.json` invokes `.cursor/hooks/on-subagent-stop.sh`. Windows hosts without a compatible runner may not get the PM follow-up; **`docs/setup/ai-process-workflow-setup.md`** and **`docs/cursor-agent-setup.md`** document switching to `on-subagent-stop.ps1`. **Impact:** Workflow ergonomics, not policy. **Evidence:** `.cursor/hooks.json`; `docs/setup/ai-process-workflow-setup.md` (Windows note).

- **Prompt-based `beforeShellExecution` is probabilistic** — The gate depends on the model following the prompt; parity with `shell-risk-policy.md` reduces but does not remove misclassification risk. **Evidence:** `.cursor/hooks.json` (`type`: `prompt`).

## Evidence reviewed

- **Rules:** All `.cursor/rules/*-audit-agent.mdc`, `full-audit-agent.mdc`, `pm-agent.mdc`, `builder-agent.mdc` (grep of `docs/process/` references in audit rules; spot-check of process filenames).
- **Hooks:** `.cursor/hooks.json`, `.cursor/hooks/on-subagent-stop.sh` (sample).
- **Policies & process:** `docs/policies/shell-risk-policy.md`, `docs/process/agent-governance-audit-process.md`, `docs/process/audit-report-template.md`, `docs/process/command-integrity-check.md`, `docs/process/full-audit-synthesis.md`, `docs/process/pm-agent-workflow.md`.
- **Index & setup:** `docs/audits/README.md`, `docs/cursor-agent-setup.md`, `docs/setup/ai-process-workflow-setup.md`, `docs/tasks.md` (header / workflow pointers).
- **SEO / 14-lane note:** `docs/audits/README.md` (full audit: **14** lanes, explicit **SEO**); `.cursor/rules/full-audit-agent.mdc` (14 lanes including Mobile experience and SEO); `docs/process/full-audit-synthesis.md` §6 (14 lanes).

## Risk & impact assessment

- **High (doc integrity):** An incomplete `command-integrity-check.md` table undermines the stated purpose of that doc (“verify … for each lane”) and conflicts with the **lane structure contract** in `docs/audits/README.md`.
- **Medium (onboarding):** Missing SEO / Mobile entries in setup docs increase the chance of **partial** workflow copies or stale mental models, not runtime app failure.
- **Likelihood:** Drift will recur when lanes change unless **README + command-integrity-check + setup guides** are edited together (as README already requires).

## Recommendations (prioritized)

1. **Extend `docs/process/command-integrity-check.md`** so the mapping table includes **Mobile experience** (process path, rule file, and note that reports live under `docs/audits/feature/` with `YYYY-MM-DD-mobile-experience-audit.md`), and confirm the table matches **all 14** lanes in `docs/audits/README.md` (excluding Synthesis as a report lane).
2. **Update `docs/cursor-agent-setup.md`** — Add `docs/process/seo-audit-process.md` and `docs/audits/seo/` to the reference table in the same style as other lanes.
3. **Update `docs/setup/ai-process-workflow-setup.md`** — Insert `.cursor/rules/mobile-experience-audit-agent.mdc` in the optional audit rules list (e.g. after `feature-audit-agent.mdc`).
4. **Optional:** Add a single sentence to `docs/process/agent-governance-audit-process.md` under Reference docs that full audits use **14** lanes per `docs/audits/README.md` (including **SEO** and **Mobile experience**), to reduce cross-doc hunting.

## Task candidates

- [ ] Refresh `docs/process/command-integrity-check.md` lane mapping for **Mobile experience** and parity with **14** README lanes.
- [ ] Add **SEO** process and report folder rows to `docs/cursor-agent-setup.md`.
- [ ] Add **`mobile-experience-audit-agent.mdc`** to `docs/setup/ai-process-workflow-setup.md` optional rules list.

## Re-test checklist

- [ ] Re-run this governance audit after edits; confirm mapping table row count vs `docs/audits/README.md`.
- [ ] Spot-check that every `*-audit-agent.mdc` still points at an existing `docs/process/*` file.
- [ ] `npm run check` only if accompanying code/config changes are made (not required for doc-only fixes).

## Next trigger and cadence

- **Trigger:** After changes to `.cursor/rules`, `.cursor/hooks.json`, or audit/PM workflow docs; otherwise monthly per `docs/audits/README.md`.
- **Recommended next run:** 2026-04-30 or next governance-affecting change.
