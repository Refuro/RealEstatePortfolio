# Documentation Audit — 2026-04-09

## Executive summary

- **Hub and template drift remain the main risks:** `docs/README.md` still promotes `audits/synthesis/2026-04-03-audit-synthesis.md` as “Latest,” while `docs/audits/synthesis/2026-04-09-audit-synthesis.md` exists—PMs and agents can miss the current triage surface by **three** synthesis generations (03 → 07 → 09).
- **Lane contract partially improved, not closed:** `docs/audits/2026-04-04-polish-gap-audit.md` is **no longer present** (removed or relocated without updating every historical pointer), but **two** ad-hoc reports **were** at `docs/audits/` root through 2026-04-29 (`quick-add-completion-gap`, `onboarding-friction-analysis`). **Update (2026-04-30 Phase G):** Those two now live under `docs/audits/feature/` and `docs/audits/growth-funnel/`. Several older docs still cite legacy root paths or the deleted polish-gap path as if it existed.
- **Missing `AVAILABLE_AGENTS.md` now appears in multiple active plans:** `docs/tasks-tools-expansion.md` and `docs/plans/2026-04-09-audit-remediation-plan.md` both reference a file that does not exist anywhere in the repo.
- **Recommendation:** One documentation-hygiene batch: refresh the synthesis quick link and blurb, finish relocating or formally indexing the two remaining root audits, fix `full-audit-synthesis.md` §4 tasks link, repair plan frontmatter and archive footers, and replace or add the agent-model reference doc.

## Severity-ranked findings

### Critical

- None identified. Documentation issues found are governance and discoverability risk, not build/runtime blockers.

### High

- **`docs/README.md` “Latest audit synthesis” is stale (again)** — Quick link targets `audits/synthesis/2026-04-03-audit-synthesis.md` and describes a “full run 2026-04-03”; newest consolidated synthesis on disk is `docs/audits/synthesis/2026-04-09-audit-synthesis.md`. **Risk:** Triage and task promotion follow the wrong document. **Evidence:** `docs/README.md` L5–6; `docs/audits/synthesis/` directory listing.

- **Non-lane audit reports at `docs/audits/` root (historical)** — At audit time, two markdown files were still outside lane subfolders. **Update (2026-04-30 Phase G):** Canonical locations are [`docs/audits/feature/2026-04-05-quick-add-completion-gap-audit.md`](../feature/2026-04-05-quick-add-completion-gap-audit.md) and [`docs/audits/growth-funnel/2026-04-05-onboarding-friction-analysis.md`](../growth-funnel/2026-04-05-onboarding-friction-analysis.md). **Evidence:** `docs/audits/README.md` (lane table and § Lane structure contract).

- **Removed artifact still referenced in living synthesis/tasks narrative** — `docs/audits/2026-04-04-polish-gap-audit.md` is **not** in the tree (glob/search: no file). `docs/audits/synthesis/2026-04-05-audit-synthesis.md` and several dated documentation audit reports still name all three root files including polish-gap. **Risk:** Broken expectations when following older synthesis checklists; confusion about whether work is “done.” **Evidence:** repository glob for `**/polish-gap*.md` — 0 files; `docs/audits/synthesis/2026-04-05-audit-synthesis.md` L142, L160.

- **Active plan frontmatter: missing research file** — `docs/plans/2026-04-05-edit-page-completion-guidance.md` declares `research: docs/research/2026-04-05-edit-page-completion-ux.md`, which does not exist (`docs/research/` has no matching file). `audit:` references `docs/audits/growth-funnel/2026-04-05-onboarding-friction-analysis.md` (lane path **as of 2026-04-30**). **Risk:** Broken traceability from plan to research evidence. **Evidence:** `docs/plans/2026-04-05-edit-page-completion-guidance.md` L6–7; `docs/research/` listing.

- **`docs/process/full-audit-synthesis.md` §4 example uses wrong relative path to tasks** — PM review block: “Promote … to [docs/tasks.md](../../tasks.md)”. From `docs/process/`, `../../tasks.md` is repo root, where no `tasks.md` exists; canonical file is `docs/tasks.md` (`../tasks.md`). **Evidence:** `docs/process/full-audit-synthesis.md` L170 vs L73; `docs/tasks.md` exists at `docs/tasks.md`.

- **Archived plan footers: `docs/...` links break from `docs/archive/plans/`** — “Sources & References” use targets like `(docs/brainstorms/...)` and `(docs/design/...)`, which resolve as `docs/archive/plans/docs/...` in standard relative resolution. **Evidence:** `docs/archive/plans/2026-04-04-property-detail-revamp-plan.md` L717–722 (compare to actual file at `docs/brainstorms/2026-04-04-property-detail-revamp-requirements.md`).

### Medium

- **Docs hub omits topical folders and major execution docs** — `docs/README.md` has no quick links for `docs/research/`, `docs/test-plans/`, `docs/decisions/`, or `docs/prompts/`, and does not mention `docs/tasks-tools-expansion.md` or `docs/plans/2026-04-09-audit-remediation-plan.md`. **Risk:** Onboarding and tooling work miss shared context. **Evidence:** `docs/README.md` full structure; `grep` for `tasks-tools-expansion` in `docs/README.md` — no matches.

- **`AVAILABLE_AGENTS.md` referenced but absent** — `docs/tasks-tools-expansion.md` L5–6 and `docs/plans/2026-04-09-audit-remediation-plan.md` L4 reference `AVAILABLE_AGENTS.md`; repo-wide search finds no such file. **Risk:** First-step failure for staged execution. **Evidence:** grep `AVAILABLE_AGENTS` across repo; file glob — no matches.

- **Process list on hub omits Mobile experience audit process** — `docs/audits/README.md` lists Mobile experience as a full lane with `mobile-experience-audit-process.md`, but `docs/README.md` Process section does not link that process doc (unlike other lanes). **Risk:** Discoverability gap for mobile audit lane. **Evidence:** `docs/README.md` L61–80; `docs/audits/README.md` L12.

- **Design reference hierarchy on hub is easy to misread** — Reference section lists `[Design spec](policies/design-spec.md)` as **current**; that policy defers to `design/design-spec-2026.md`, but the hub does not list `design/design-spec-2026.md` as the primary shipped spec. **Evidence:** `docs/README.md` L16–19; `docs/policies/design-spec.md` L7–8.

### Low

- **Documentation audit rule vs process: subagent wording** — `.cursor/rules/documentation-audit-agent.mdc` may instruct launching a subagent; `docs/process/documentation-audit-process.md` §4 does not require it. Minor operational drift. **Evidence:** compare `.cursor/rules/documentation-audit-agent.mdc` with `docs/process/documentation-audit-process.md`.

- **Synthesis folder proliferation** — Many dated and suffixed synthesis files under `docs/audits/synthesis/` increase “which file is latest?” friction unless the hub link is maintained. **Evidence:** `docs/audits/synthesis/` listing (`2026-04-03-audit-synthesis.md`, `2026-04-03-audit-synthesis-2.md`, etc.).

- **`docs/reference/location-data-update-april-2026.md` not on hub** — Exists but is not linked from `docs/README.md` Reference or Launch/SEO sections. **Evidence:** file under `docs/reference/`; `docs/README.md`.

- **Root `README.md` vs `app/README.md`** — Root README documents `cd app`, `npm install`, `npm run dev` and points to `docs/setup/run-and-smoke-test.md` and `app/README.md`; `app/README.md` script table omits `npm run check` / `db:migrate` that `run-and-smoke-test.md` emphasizes. Minor drift between entry points. **Evidence:** root `README.md`; `app/README.md` L16–23; `docs/setup/run-and-smoke-test.md` L11–12.

## Evidence reviewed

- `docs/process/documentation-audit-process.md`, `docs/process/audit-report-template.md`
- `docs/README.md`, `docs/audits/README.md`, `docs/audits/documentation/README.md`
- `docs/process/command-integrity-check.md` (lane mapping)
- `docs/process/full-audit-synthesis.md` (§3.5, §4 embedded example)
- Root `README.md`, `app/README.md`, `docs/setup/run-and-smoke-test.md`
- `docs/tasks.md` (spot check: no references to root audit filenames)
- `docs/reference/roadmap.md` (not deep-read; hub cross-check)
- `docs/plans/2026-04-05-edit-page-completion-guidance.md`, `docs/plans/2026-04-09-audit-remediation-plan.md`
- `docs/tasks-tools-expansion.md`, `docs/audits/synthesis/` (filenames through 2026-04-09)
- `docs/audits/` root `*.md` (PowerShell listing via glob)
- `docs/archive/README.md`, `docs/archive/plans/2026-04-04-property-detail-revamp-plan.md` (footer links)
- Prior lane report: `docs/audits/documentation/2026-04-07-documentation-audit.md` (continuity)
- Repository-wide grep for `AVAILABLE_AGENTS`, `polish-gap`

**Limits:** No exhaustive markdown link crawler across all of `docs/`; external URLs not verified. No edits under `app/` per audit scope.

## Risk & impact assessment

Unresolved **High** items skew **internal governance**: wrong synthesis entry point, incomplete lane placement, broken promotion example in the synthesis template, broken plan-to-artifact traceability, and archive footers that do not resolve from their directory. **Medium** gaps affect tools/remediation workflows and mobile-lane discoverability. End-user product risk is indirect.

## Recommendations (prioritized)

1. **Update `docs/README.md`:** Point “Latest audit synthesis” to `audits/synthesis/2026-04-09-audit-synthesis.md` (or whatever is newest after the next full run) and refresh the one-line description (date, lane count) so it matches that file.
2. **Close out root-audit drift (2026-04-05 pair):** **Done (2026-04-30 Phase G).** Remaining root-level `docs/audits/*.md` (e.g. polish-gap) may still need relocation or README indexing. Update `audit:` if further moves occur. Annotate or fix older synthesis bullets that still mention three root files including the removed polish-gap report.
3. **Fix `docs/process/full-audit-synthesis.md` §4** so the example uses `../tasks.md` (or `[docs/tasks.md](../tasks.md)`).
4. **Plan traceability:** Create or retarget `research:` in `docs/plans/2026-04-05-edit-page-completion-guidance.md`; align `audit:` after any audit file move.
5. **Repair archived plan footers** to use paths relative to `docs/archive/plans/` (e.g. `../../brainstorms/...`, `../../design/design-spec-2026.md`).
6. **Resolve `AVAILABLE_AGENTS.md`:** Add the file (e.g. under `docs/`) or replace references in `docs/tasks-tools-expansion.md` and `docs/plans/2026-04-09-audit-remediation-plan.md` with an in-repo substitute.
7. **Hub hygiene:** Add Mobile experience audit process to the Process list; add short links for `research/`, `test-plans/`, `decisions/`, `prompts/`, `tasks-tools-expansion.md`, and prominent `design/design-spec-2026.md`.

## Task candidates

- [ ] Update `docs/README.md` synthesis quick link and blurb to `2026-04-09-audit-synthesis.md` (or latest).
- [x] Relocated the 2026-04-05 quick-add and onboarding friction audits from `docs/audits/` root into `feature/` and `growth-funnel/` (2026-04-30 Phase G); updated plan `audit:` and inbound links.
- [ ] Patch `docs/process/full-audit-synthesis.md` §4 embedded link to `docs/tasks.md`.
- [ ] Resolve `research:` / `audit:` frontmatter in `docs/plans/2026-04-05-edit-page-completion-guidance.md`.
- [ ] Patch footer links in `docs/archive/plans/2026-04-04-property-detail-revamp-plan.md` (and sibling archived plans with the same `docs/...` pattern).
- [ ] Address `AVAILABLE_AGENTS.md` in `docs/tasks-tools-expansion.md` and `docs/plans/2026-04-09-audit-remediation-plan.md`.
- [ ] Add Mobile experience process link and optional hub sections (`research`, `test-plans`, `design-spec-2026` prominence).

## Re-test checklist

- [ ] Open `docs/README.md` in markdown preview; confirm synthesis link opens the intended newest file.
- [ ] After audit moves: grep for old root paths and confirm no broken references in **active** plans and hub docs.
- [ ] Open `docs/process/full-audit-synthesis.md` §4 in preview and confirm tasks link resolves to `docs/tasks.md`.
- [ ] `npm run check` only if application code changes (not required for doc-only fixes).

## Next trigger and cadence

- **Trigger:** Per `docs/audits/README.md` — monthly, or after large doc reorganization / repeated stale-reference drift.
- **Recommended next run:** 2026-05-09 or immediately after the next full-audit synthesis if documentation follow-ups are promoted from synthesis to `docs/tasks.md`.
