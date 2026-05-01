# Documentation Audit — 2026-04-30

## Executive summary

- **Primary doc hub is two synthesis generations behind:** `docs/README.md` and `docs/audits/synthesis/README.md` still point PMs and agents at `2026-04-03-audit-synthesis.md`, while `2026-04-27-audit-synthesis.md` and **`2026-04-29-audit-synthesis.md`** exist on disk—the latter is the current full-run synthesis (14 lanes, dated 2026-04-29).
- **Partially resolved (2026-04-30 Phase G):** The 2026-04-05 quick-add and onboarding friction reports were moved into `docs/audits/feature/` and `docs/audits/growth-funnel/`. **Still open:** other governance items below (e.g. `AVAILABLE_AGENTS.md`, template `tasks.md` link, missing plan `research:` file).
- **Synthesis folder clutter:** `docs/audits/synthesis/2026-04-29-user-clarifications-and-technical-notes.md` sits beside canonical synthesis files without a clear index distinction—a minor discoverability risk on top of stale “latest” links.
- **Overall recommendation:** One doc-only housekeeping batch (no `app/` changes): advance “latest synthesis” in both hubs after every full run; fix template and dangling references; relocate or formally index root-level audit files; add Mobile experience to the hub Process list and tighten design-spec hierarchy wording if still ambiguous.

## Severity-ranked findings

### Critical

- None. Findings are documentation governance, discoverability, and traceability—not runtime product failure.

### High

- **`docs/README.md` “Latest audit synthesis” is stale** — Quick link still targets `audits/synthesis/2026-04-03-audit-synthesis.md` and describes the 2026-04-03 run. **Actual newest full synthesis:** `docs/audits/synthesis/2026-04-29-audit-synthesis.md`. **Risk:** PM promotes tasks from obsolete triage; duplicate work. **Evidence:** `docs/README.md` (lines 5–6).

- **`docs/audits/synthesis/README.md` “Latest full run” is stale** — Still lists `2026-04-03-audit-synthesis.md` as the PM entry point; omits 2026-04-27 and 2026-04-29 syntheses. **Evidence:** `docs/audits/synthesis/README.md` (lines 5–7).

- **Stray markdown may remain at `docs/audits/` root (e.g. `2026-04-04-polish-gap-audit.md`)** — Lane structure contract in `docs/audits/README.md` expects dated reports under `docs/audits/<lane>/`. **Update (Phase G):** The 2026-04-05 quick-add and onboarding friction reports now live under `docs/audits/feature/` and `docs/audits/growth-funnel/`. **Evidence:** paths; `docs/audits/README.md` (lines 25–36).

- **`docs/process/full-audit-synthesis.md` PM review example uses a broken `tasks.md` path** — Fenced/template line uses `[docs/tasks.md](../../tasks.md)`; from `docs/process/`, `../../tasks.md` is repo root, not `docs/tasks.md`. **Risk:** Copy/paste dead links. **Evidence:** `docs/process/full-audit-synthesis.md` (line 170); prose elsewhere in the same file correctly uses `../tasks.md` (e.g. line 73).

- **`AVAILABLE_AGENTS.md` referenced but absent** — **Risk:** Onboarding/tooling steps fail at first reference. **Evidence:** `docs/tasks-tools-expansion.md` (line 5); `docs/plans/2026-04-09-audit-remediation-plan.md` (line 4); repository glob: no `AVAILABLE_AGENTS.md`.

- **Draft plan frontmatter: missing research file** — `docs/plans/2026-04-05-edit-page-completion-guidance.md` lists `research: docs/research/2026-04-05-edit-page-completion-ux.md` (file not present). `audit:` references `docs/audits/growth-funnel/2026-04-05-onboarding-friction-analysis.md` (lane-compliant **as of Phase G**). **Risk:** Broken traceability plan → research evidence. **Evidence:** plan frontmatter (lines 1–8); glob for `2026-04-05-edit-page-completion-ux.md`: no matches.

### Medium

- **`docs/README.md` Process list omits Mobile experience audit process** — Mobile experience is a first-class lane in `docs/audits/README.md`, but the hub Process section does not link `docs/process/mobile-experience-audit-process.md`. **Evidence:** `docs/README.md` (lines 63–81); `docs/audits/README.md` (line 12).

- **Design reference hierarchy on the hub can still mislead skimmers** — Hub lists `policies/design-spec.md` as “**current** UI tokens”; that policy file states canonical visual rules live in `docs/design/design-spec-2026.md` first. **Evidence:** `docs/README.md` (lines 16–19); `docs/policies/design-spec.md` (lines 7–8).

- **`docs/audits/synthesis/README.md` footnote cites the wrong rule for synthesis naming** — Points at `.cursor/rules/documentation-audit-agent.mdc` for same-day `-2`/`-3` naming; that convention applies to **documentation lane** reports; synthesis naming is owned by the full-audit / synthesis process. **Evidence:** `docs/audits/synthesis/README.md` (line 5).

- **`.cursor/rules/documentation-audit-agent.mdc` vs `documentation-audit-process.md`** — Rule requires launching a `generalPurpose` subagent; `docs/process/documentation-audit-process.md` §4 describes execution without mandating a subagent. **Evidence:** `.cursor/rules/documentation-audit-agent.mdc` (lines 14–17); `docs/process/documentation-audit-process.md` (lines 47–54).

- **Ancillary synthesis-adjacent file without index** — `docs/audits/synthesis/2026-04-29-user-clarifications-and-technical-notes.md` is not distinguished in `docs/audits/synthesis/README.md` from the canonical `YYYY-MM-DD-audit-synthesis.md` pattern. **Risk:** Operators open the wrong file when triaging. **Evidence:** synthesis directory listing; `docs/audits/synthesis/README.md` (no mention).

### Low

- **`docs/tasks.md` Phase 18** — Open housekeeping item on superseded same-day documentation audit reruns; aligns with `docs/audits/documentation/README.md` suffix convention. **Evidence:** `docs/tasks.md` (lines 99–101).

- **Synthesis file proliferation** — Many dated files under `docs/audits/synthesis/` increase “which file is latest?” friction unless hub entries are updated after each full run. **Evidence:** directory listing (multiple generations from 2026-03-19 through 2026-04-29).

- **Continuity with 2026-04-29 documentation lane** — `docs/audits/documentation/2026-04-29-documentation-audit.md` listed similar items; this pass confirms they remain open as of 2026-04-30, with hub staleness **worse** (new synthesis published but hubs not updated).

## Evidence reviewed

- `docs/process/documentation-audit-process.md`, `docs/process/audit-report-template.md`
- `docs/README.md`, `docs/audits/README.md`, `docs/audits/documentation/README.md`, `docs/audits/synthesis/README.md`
- `docs/audits/synthesis/` (including `2026-04-29-audit-synthesis.md`, `2026-04-27-audit-synthesis.md`, `2026-04-29-user-clarifications-and-technical-notes.md`)
- `docs/process/command-integrity-check.md`, `.cursor/rules/documentation-audit-agent.mdc`
- `docs/process/full-audit-synthesis.md` (embedded PM example link)
- `docs/tasks.md` (Phase 18 snippet), `docs/reference/roadmap.md` (workflow cross-check)
- `docs/plans/2026-04-05-edit-page-completion-guidance.md`, `docs/tasks-tools-expansion.md`, `docs/plans/2026-04-09-audit-remediation-plan.md`
- `docs/policies/design-spec.md`, `docs/setup/ai-process-workflow-setup.md` (14-lane spot-check)
- Prior continuity: `docs/audits/documentation/2026-04-29-documentation-audit.md`

**Assumptions and limits:** No exhaustive automated crawl of all markdown under `docs/` (hundreds of files). External URLs not verified. Per lane instructions, no edits under `app/`. This pass is audit-only (report file only).

## Risk & impact assessment

Unresolved **High** items skew **internal governance and PM throughput**: triage from the wrong synthesis generation, lane-contract exceptions without explicit indexing, broken paths in the synthesis template, and dangling references (`AVAILABLE_AGENTS.md`, missing research file). **End-user product risk is indirect**; impact is mis-prioritized work, wasted builder cycles, and onboarding friction.

## Recommendations (prioritized)

1. **Refresh both synthesis entry points** (`docs/README.md`, `docs/audits/synthesis/README.md`) so “Latest” points at **`docs/audits/synthesis/2026-04-29-audit-synthesis.md`** (newest full run on disk at audit time); repeat whenever a new synthesis lands.
2. **Root audits:** Relocate any **remaining** `docs/audits/*.md` root reports (e.g. `2026-04-04-polish-gap-audit.md`) into lane folders **or** add an explicit exception in `docs/audits/README.md`; confirm inbound `audit:` / citations after any move. *(Phase G completed relocation of the two 2026-04-05 reports.)*
3. **Fix `docs/process/full-audit-synthesis.md` embedded example** so the tasks link resolves to `docs/tasks.md` (e.g. `../tasks.md` from `docs/process/`), consistent with prose.
4. **Resolve `AVAILABLE_AGENTS.md`:** add the file where the team expects it **or** replace references in `docs/tasks-tools-expansion.md` and `docs/plans/2026-04-09-audit-remediation-plan.md` with a living substitute (e.g. `AGENTS.md` / documented model table).
5. **Plan traceability:** Create `docs/research/2026-04-05-edit-page-completion-ux.md` or retarget/remove `research:` in `docs/plans/2026-04-05-edit-page-completion-guidance.md`.
6. **Hub and synthesis README hygiene:** Add Mobile experience audit process to `docs/README.md` Process list; clarify primary UI spec vs `policies/design-spec.md`; repoint synthesis README naming footnote to full-audit/synthesis docs; optionally index `2026-04-29-user-clarifications-and-technical-notes.md` as non-canonical.

## Task candidates (optional)

- [ ] Update `docs/README.md` and `docs/audits/synthesis/README.md` to **`2026-04-29-audit-synthesis.md`** as latest full run; adjust descriptive text (lane count/date) to match.
- [x] Relocated `docs/audits/feature/2026-04-05-quick-add-completion-gap-audit.md` and `docs/audits/growth-funnel/2026-04-05-onboarding-friction-analysis.md` from repo root (doc cleanup Phase G); dependent frontmatter/links updated.
- [ ] Fix embedded `[docs/tasks.md](../../tasks.md)` in `docs/process/full-audit-synthesis.md`.
- [ ] Add or replace `AVAILABLE_AGENTS.md` references in tooling docs/plans.
- [ ] Fix `2026-04-05-edit-page-completion-guidance.md` `research:` target or drop the field with rationale.
- [ ] Add a one-line note under `docs/audits/synthesis/README.md` for `2026-04-29-user-clarifications-and-technical-notes.md` (supplemental vs synthesis).

## Re-test checklist

- [ ] After hub updates, open “Latest audit synthesis” from `docs/README.md` and `docs/audits/synthesis/README.md` and confirm the file matches the newest dated **`*-audit-synthesis.md`** on disk.
- [ ] After any audit file moves, search for old paths and confirm no stale references in active plans.
- [ ] `npm run check` when documentation changes ship alongside code in the same PR (doc-only batches may omit).

## Next trigger and cadence

- **Trigger:** Large doc reorg, repeated stale-reference drift, or completion of a **full** audit (new `*-audit-synthesis.md` published).
- **Recommended next run:** Within one month, or **immediately** after publishing the next synthesis—**re-verify hub links in the same pass** so “latest” cannot lag by multiple generations again.
