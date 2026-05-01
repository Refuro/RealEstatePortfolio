# Documentation Audit — 2026-04-27

## Executive summary

- **Hub and synthesis “latest” links are still stale:** `docs/README.md` and `docs/audits/synthesis/README.md` point PMs and agents to `2026-04-03-audit-synthesis.md` as the primary consolidated triage surface, while a newer file `2026-04-09-audit-synthesis.md` exists on disk (and 2026-04-27 full-audit lane reports are in progress, so a future synthesis will add another “newest” generation).
- **Lane placement contract:** At audit time, two ad-hoc analysis files sat at `docs/audits/` root (`2026-04-05-quick-add-completion-gap-audit.md`, `2026-04-05-onboarding-friction-analysis.md`), conflicting with the lane-folder contract in `docs/audits/README.md`. **Update (2026-04-30 doc cleanup Phase G):** They were moved to [`docs/audits/feature/2026-04-05-quick-add-completion-gap-audit.md`](../feature/2026-04-05-quick-add-completion-gap-audit.md) and [`docs/audits/growth-funnel/2026-04-05-onboarding-friction-analysis.md`](../growth-funnel/2026-04-05-onboarding-friction-analysis.md).
- **Repeat follow-ups from prior doc audits are still open:** Missing `AVAILABLE_AGENTS.md` referenced by active plans, a broken `docs/tasks.md` link in the full-audit-synthesis template example, and broken plan `research:` / archive footer path patterns.
- **Overall recommendation:** Treat documentation hygiene as a small scheduled batch: refresh “latest synthesis” in both hubs, finish relocation or explicit indexing of root audit files, fix template and plan frontmatter links, and add the missing agent-model reference (or repoint references).

## Severity-ranked findings

### Critical

- None. Findings are governance, discoverability, and traceability risk—not application build or runtime blockers.

### High

- **`docs/README.md` “Latest audit synthesis” is stale** — The quick link targets `audits/synthesis/2026-04-03-audit-synthesis.md` and describes a “full run 2026-04-03”; the newest dated synthesis in `docs/audits/synthesis/` is `2026-04-09-audit-synthesis.md`. **Risk:** Task promotion and PM triage can follow the wrong document. **Evidence:** `docs/README.md` (Quick links, ~L5–6).

- **`docs/audits/synthesis/README.md` also labels 2026-04-03 as the latest full run** — Duplicates the stale entry point in a second high-traffic index. **Evidence:** `docs/audits/synthesis/README.md` (~L7).

- **Non-lane audit reports at `docs/audits/` root (historical)** — At audit time, `2026-04-05-quick-add-completion-gap-audit.md` and `2026-04-05-onboarding-friction-analysis.md` sat outside `docs/audits/<lane>/`. **Update (2026-04-30 Phase G):** Canonical paths are [`docs/audits/feature/2026-04-05-quick-add-completion-gap-audit.md`](../feature/2026-04-05-quick-add-completion-gap-audit.md) and [`docs/audits/growth-funnel/2026-04-05-onboarding-friction-analysis.md`](../growth-funnel/2026-04-05-onboarding-friction-analysis.md). **Evidence (at time of audit):** paths under `docs/audits/`; `docs/audits/README.md` (lane table, § Lane structure contract).

- **`docs/process/full-audit-synthesis.md` PM review example uses a broken relative path to tasks** — The embedded example links to `[docs/tasks.md](../../tasks.md)`; from `docs/process/`, `../../tasks.md` is the repo root, where `tasks.md` does not exist. **Risk:** PMs copying the template get a dead link. **Evidence:** `docs/process/full-audit-synthesis.md` (~L170); canonical file is `docs/tasks.md` (use `../tasks.md` or an absolute-style repo path in docs).

- **`AVAILABLE_AGENTS.md` referenced but absent** — **Risk:** First-step failure for staged tooling work. **Evidence:** `docs/tasks-tools-expansion.md` (~L5–6); `docs/plans/2026-04-09-audit-remediation-plan.md` (~L4); repository-wide file search: no `AVAILABLE_AGENTS.md`.

- **Active plan frontmatter: missing research file** — `docs/plans/2026-04-05-edit-page-completion-guidance.md` lists `research: docs/research/2026-04-05-edit-page-completion-ux.md`, which does not exist. **`audit:`** references `docs/audits/growth-funnel/2026-04-05-onboarding-friction-analysis.md` (lane path **as of 2026-04-30**). **Risk:** Broken traceability from plan to research evidence. **Evidence:** `docs/plans/2026-04-05-edit-page-completion-guidance.md` (frontmatter, ~L6–7); `docs/research/` has no matching filename.

- **Removed `polish-gap` artifact still named in historical synthesis** — `docs/audits/2026-04-04-polish-gap-audit.md` is not in the tree; `docs/audits/synthesis/2026-04-05-audit-synthesis.md` still lists relocation tasks for three root files including that name. **Risk:** Readers following older checklists see inconsistent “done” state. **Evidence:** repository search for `*polish-gap*` under `docs/audits` — 0 files; `docs/audits/synthesis/2026-04-05-audit-synthesis.md` (e.g. ~L142, ~L160).

### Medium

- **`docs/README.md` Process list omits Mobile experience audit process** — `docs/audits/README.md` includes Mobile experience as a full lane, but the docs hub Process section does not link `docs/process/mobile-experience-audit-process.md`. **Evidence:** `docs/README.md` (Process, ~L61–80); `docs/audits/README.md` (~L12).

- **Design reference hierarchy on the hub is easy to misread** — Reference links `[Design spec](policies/design-spec.md)` as current; that policy defers to `design/design-spec-2026.md` for shipped UI. The hub does not list `design/design-spec-2026.md` as the primary canonical spec. **Evidence:** `docs/README.md` (~L16–19); `docs/policies/design-spec.md` (~L7–8).

- **Hub omits large execution and reference surfaces** — No quick links for `docs/reference/complete-engineering-reference.md`, `docs/tasks-tools-expansion.md`, or topical areas such as `docs/research/` (when used). **Risk:** Onboarding and deep dives miss central artifacts. **Evidence:** `docs/README.md` (no matches for those paths).

- **`.cursor/rules/documentation-audit-agent.mdc` vs process doc: execution mode** — The rule instructs launching a `generalPurpose` subagent; `docs/process/documentation-audit-process.md` does not require a subagent. **Risk:** Minor operational drift for humans vs Cursor rule defaults. **Evidence:** `.cursor/rules/documentation-audit-agent.mdc` (~L16–17); `docs/process/documentation-audit-process.md` §4.

- **Archive plan footers may break when resolved relative to `docs/archive/plans/`** — Some archived plans use targets like `(docs/brainstorms/...)`; depending on the markdown resolver, that can look for `docs/archive/plans/docs/...`. **Evidence pattern:** `docs/archive/plans/2026-04-04-property-detail-revamp-plan.md` (Sources & References, ~L719–720) uses `docs/brainstorms/...` form; correct fix is typically `../../brainstorms/...` from the archive file.

### Low

- **Synthesis file proliferation** — Many dated and suffixed files under `docs/audits/synthesis/` increase “which file is latest?” friction unless hub links are updated after each full run. **Evidence:** `docs/audits/synthesis/` directory listing (multiple 2026-04-03* files, 2026-04-01*, etc.).

- **`docs/tasks.md` Phase 18 — same-day documentation audit cleanup** — Open item references cleanup of superseded same-day doc audit reruns; aligns with the naming convention in `docs/audits/documentation/README.md` (`-2`, `-3`). **Evidence:** `docs/tasks.md` (Phase 18, ~L99–102).

- **Downstream doc references (historical)** — Prior plans cited root-level paths for the 2026-04-05 analyses. **Update (2026-04-30 Phase G):** Canonical paths are under `docs/audits/feature/` and `docs/audits/growth-funnel/`; active plans and citations should use those paths. **Evidence:** e.g. `docs/plans/2026-04-05-quick-add-completion-plan.md`; `docs/audits/feature/2026-04-05-feature-ux-audit.md` (citations).

## Evidence reviewed

- `docs/process/documentation-audit-process.md`, `docs/process/audit-report-template.md`
- `docs/README.md`, `docs/audits/README.md`, `docs/audits/documentation/README.md`, `docs/audits/synthesis/README.md`
- `docs/process/command-integrity-check.md` (lane mapping)
- `docs/process/full-audit-synthesis.md` (§4 PM review embedded example)
- `docs/tasks.md` (Phases 18, documentation-related open items; spot check)
- `docs/plans/2026-04-05-edit-page-completion-guidance.md` (frontmatter)
- `docs/plans/2026-04-09-audit-remediation-plan.md`, `docs/tasks-tools-expansion.md`
- `docs/audits/synthesis/` (filenames through 2026-04-09; no 2026-04-27 synthesis at time of this pass)
- `docs/audits/` root listing for stray `*.md` (2026-04-05 quick-add, onboarding)
- `docs/audits/synthesis/2026-04-05-audit-synthesis.md` (historical polish-gap / root-file bullets)
- `docs/archive/plans/2026-04-04-property-detail-revamp-plan.md` (footer link pattern)
- `docs/policies/design-spec.md` (pointer to 2026 spec)
- `.cursor/rules/documentation-audit-agent.mdc`
- `docs/reference/roadmap.md` (workflow cross-check: points to `docs/tasks.md`)
- Prior doc lane: `docs/audits/documentation/2026-04-09-documentation-audit.md` (continuity with earlier findings)

**Assumptions and limits:** No exhaustive automated link crawl of all 400+ markdown files under `docs/`. External URLs not verified. No edits under `app/` per audit scope. This pass was conducted during a parallel 2026-04-27 multi-lane audit: hub “latest” should be updated again after a new synthesis file exists for that run.

## Risk & impact assessment

Unresolved **High** items skew **internal governance**: wrong synthesis entry point, incomplete adherence to the audit folder contract, broken promotion example in the synthesis template, missing agent model reference for tooling plans, and broken plan-to-artifact traceability. **Medium** items affect discoverability of mobile audit process, canonical design spec, and large reference docs. End-user product risk is **indirect**; the main cost is time lost to follow-up, mistaken triage, and broken links in internal workflows.

## Recommendations (prioritized)

1. **Update `docs/README.md` and `docs/audits/synthesis/README.md`** so “Latest” / “Latest full run” point at the actual newest synthesis on disk (`2026-04-09-audit-synthesis.md` today), with a one-line blurb (date, lane set). Re-run this update after the 2026-04-27 full-audit synthesis is written.
2. **Root-audit placement (2026-04-05 pair):** **Done (2026-04-30 Phase G)** — files moved to `docs/audits/feature/` and `docs/audits/growth-funnel/`; plan `audit:` and citations updated. Remaining root strays (e.g. `2026-04-04-polish-gap-audit.md`) are out of scope for that pass.
3. **Fix `docs/process/full-audit-synthesis.md` §4** so the example uses `[docs/tasks.md](../tasks.md)` (or equivalent valid relative path from `docs/process/`).
4. **Resolve `AVAILABLE_AGENTS.md`:** add under `docs/` (or project root, if that matches team convention) or replace references in `docs/tasks-tools-expansion.md` and `docs/plans/2026-04-09-audit-remediation-plan.md` with a living substitute (e.g. pointer to `AGENTS.md` / rules table).
5. **Plan traceability:** Create `docs/research/2026-04-05-edit-page-completion-ux.md` or retarget `research:` in the edit-page plan; fix archive plan footers to use `../../` relative paths from `docs/archive/plans/`.
6. **Hub hygiene:** Add Mobile experience audit process to the Process list; add `design/design-spec-2026.md` to Reference; add `reference/complete-engineering-reference.md` and `tasks-tools-expansion.md` where appropriate.

## Task candidates (optional)

- [ ] Refresh both synthesis entry points (`docs/README.md`, `docs/audits/synthesis/README.md`) to newest file; repeat after 2026-04-27 synthesis exists.
- [ ] Relocate or formally index the two `docs/audits/*.md` root reports; update inbound plan and audit citations.
- [ ] Fix `docs/process/full-audit-synthesis.md` embedded `tasks.md` link.
- [ ] Add or replace `AVAILABLE_AGENTS.md` references.
- [ ] Fix `2026-04-05-edit-page-completion-guidance.md` frontmatter (`research:`, `audit:` after any audit moves); repair `docs/archive/plans/*` “Sources & References” link roots.

## Re-test checklist

- [ ] After hub updates, click “Latest audit synthesis” from `docs/README.md` and from `docs/audits/synthesis/README.md` and confirm the file matches the described run.
- [ ] After any audit file moves, `grep` for old paths and confirm no stale references in active plans.
- [ ] `npm run check` (when documentation changes are paired with code in the same PR—no code change required for doc-only batch).

## Next trigger and cadence

- **Trigger:** After large doc reorg, repeated stale-reference drift, or each **full** audit completion (synthesis file published).
- **Recommended next run:** Within two weeks, or immediately after `docs/audits/synthesis/2026-04-27-audit-synthesis.md` (or the dated synthesis for this audit wave) is added—re-verify hub links in the same pass.
