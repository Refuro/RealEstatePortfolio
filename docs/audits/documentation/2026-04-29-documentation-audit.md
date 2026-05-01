# Documentation Audit — 2026-04-29

## Executive summary

- **Primary hub links are materially stale:** `docs/README.md` and `docs/audits/synthesis/README.md` still promote `2026-04-03-audit-synthesis.md` as the latest consolidated triage surface, while `2026-04-27-audit-synthesis.md` exists (and additional 2026-04-29 lane reports are landing in parallel). PM and agent workflows risk promoting work from the wrong synthesis generation.
- **Repeat governance gaps from prior documentation audits remain partially addressed:** Some non–lane-folder reports may still live at `docs/audits/*.md` root (e.g. polish-gap). **Phase G (2026-04-30)** relocated the two 2026-04-05 root analyses into `feature/` and `growth-funnel/`. Other gaps noted in this audit may remain: broken `[docs/tasks.md](../../tasks.md)` example inside `full-audit-synthesis.md`, missing `AVAILABLE_AGENTS.md`, draft plan `research:` target.
- **Discoverability:** The docs hub Process section still omits a direct link to `mobile-experience-audit-process.md` despite Mobile experience being a first-class lane in `docs/audits/README.md`; design-spec hierarchy on the hub remains easy to misread versus `policies/design-spec.md` + `design/design-spec-2026.md`.
- **Overall recommendation:** Batch documentation cleanup only (no `app/` changes): refresh both synthesis entry points after each full run; fix template + plan frontmatter + orphan audit placement or indexing; add or repoint `AVAILABLE_AGENTS.md`; tighten synthesis README’s cross-reference to the correct process/rule for naming.

## Severity-ranked findings

### Critical

- None. Issues are governance, discoverability, and traceability—not runtime product failure.

### High

- **`docs/README.md` “Latest audit synthesis” is stale** — Quick link targets `audits/synthesis/2026-04-03-audit-synthesis.md`. Newest synthesis file observed on disk: `docs/audits/synthesis/2026-04-27-audit-synthesis.md`. **Risk:** Wrong backlog promotion and duplicated/conflicting triage. **Evidence:** `docs/README.md` (~L5–6).

- **`docs/audits/synthesis/README.md` “Latest full run” is stale** — Still lists `2026-04-03-audit-synthesis.md` as the PM entry point; does not surface `2026-04-27-audit-synthesis.md`. **Evidence:** `docs/audits/synthesis/README.md` (~L6).

- **Non-lane audit artifacts at `docs/audits/` root (historical)** — At audit time, `2026-04-05-quick-add-completion-gap-audit.md` and `2026-04-05-onboarding-friction-analysis.md` were at repo root. **Update (2026-04-30 Phase G):** Canonical paths are [`docs/audits/feature/2026-04-05-quick-add-completion-gap-audit.md`](../feature/2026-04-05-quick-add-completion-gap-audit.md) and [`docs/audits/growth-funnel/2026-04-05-onboarding-friction-analysis.md`](../growth-funnel/2026-04-05-onboarding-friction-analysis.md). **Evidence:** `docs/audits/README.md` (~L25–36).

- **`docs/process/full-audit-synthesis.md` PM review template embed uses a broken `tasks.md` path** — The fenced example at §4 uses `[docs/tasks.md](../../tasks.md)`; from `docs/process/`, `../../tasks.md` resolves to repo root, where `tasks.md` is not the canonical file (`docs/tasks.md` is). Line 73 in the prose correctly uses `../tasks.md`. **Risk:** Copy/paste from the template yields dead links. **Evidence:** `docs/process/full-audit-synthesis.md` (~L170 vs ~L73).

- **`AVAILABLE_AGENTS.md` referenced but absent** — **Risk:** Tooling/onboarding steps fail immediately. **Evidence:** `docs/tasks-tools-expansion.md` (~L5); `docs/plans/2026-04-09-audit-remediation-plan.md` (~L4); repo-wide search: no `AVAILABLE_AGENTS.md`.

- **Draft plan frontmatter: missing research file** — `docs/plans/2026-04-05-edit-page-completion-guidance.md` lists `research: docs/research/2026-04-05-edit-page-completion-ux.md`; that path does not exist. `audit:` points at `docs/audits/growth-funnel/2026-04-05-onboarding-friction-analysis.md` (lane path **as of 2026-04-30**). **Risk:** Broken traceability from plan to research evidence. **Evidence:** plan frontmatter (~L6–7); glob under repo for `2026-04-05-edit-page-completion-ux.md`: no matches.

### Medium

- **`docs/README.md` Process list omits Mobile experience audit process** — Mobile experience is a documented lane in `docs/audits/README.md`, but the hub Process section does not link `docs/process/mobile-experience-audit-process.md` (criteria doc `qa/mobile-experience-audit.md` appears under QA only). **Evidence:** `docs/README.md` (~L63–81); `docs/audits/README.md` (~L12).

- **Design reference hierarchy on the hub remains ambiguous** — Hub lists `[Design spec](policies/design-spec.md)` as “**current** UI tokens”; `policies/design-spec.md` explicitly states canonical visual rules live in `docs/design/design-spec-2026.md` first. **Evidence:** `docs/README.md` (~L16–19); `docs/policies/design-spec.md` (~L7–8).

- **`docs/audits/synthesis/README.md` cites the wrong rule for synthesis naming** — Footnote points at `.cursor/rules/documentation-audit-agent.mdc` for same-day `-2`/`-3` naming; documentation lane reports use that convention, but synthesis naming is the concern of the full-audit / synthesis process; cross-link may confuse operators. **Evidence:** `docs/audits/synthesis/README.md` (~L5).

- **`.cursor/rules/documentation-audit-agent.mdc` vs `documentation-audit-process.md`** — Rule mandates launching a `generalPurpose` subagent; the process doc §4 describes execution steps without requiring a subagent. **Evidence:** `.cursor/rules/documentation-audit-agent.mdc` (~L16–17); `docs/process/documentation-audit-process.md` §4.

### Low

- **`docs/tasks.md` Phase 18** — Open housekeeping item references superseded same-day documentation audit reruns; aligns with `docs/audits/documentation/README.md` naming convention for `-2`, `-3`. **Evidence:** `docs/tasks.md` (~L99–102).

- **Synthesis file proliferation** — Many dated files under `docs/audits/synthesis/` increase “which file is latest?” friction unless hub entries are updated after each full run. **Evidence:** directory listing includes multiple generations (2026-03-20 through 2026-04-27).

- **Continuity with 2026-04-27 documentation lane** — The prior lane report (`docs/audits/documentation/2026-04-27-documentation-audit.md`) listed similar items; this pass confirms key gaps remain open as of 2026-04-29.

## Evidence reviewed

- `docs/process/documentation-audit-process.md`, `docs/process/audit-report-template.md`
- `docs/README.md`, `docs/audits/README.md`, `docs/audits/documentation/README.md`, `docs/audits/synthesis/README.md`
- `docs/process/command-integrity-check.md` (lane mapping consistency spot-check)
- `docs/process/full-audit-synthesis.md` (embedded PM review example vs prose links)
- `docs/tasks.md` (Phase 18)
- `docs/reference/roadmap.md` (workflow cross-check — promotes to `docs/tasks.md`)
- `docs/plans/2026-04-05-edit-page-completion-guidance.md`, `docs/tasks-tools-expansion.md`, `docs/plans/2026-04-09-audit-remediation-plan.md`
- `docs/audits/synthesis/` (filenames through `2026-04-27-audit-synthesis.md`)
- `docs/audits/` root listing (`2026-04-05-*.md` strays)
- `docs/policies/design-spec.md`, `docs/design/design-spec-2026.md`
- `docs/qa/README.md` (QA index health)
- `.cursor/rules/documentation-audit-agent.mdc`
- Prior continuity: `docs/audits/documentation/2026-04-27-documentation-audit.md`

**Assumptions and limits:** No exhaustive automated crawl of all markdown under `docs/` (400+ files). External URLs not verified. Per lane instructions, no edits under `app/`. This pass ran alongside partial 2026-04-29 lane outputs; if a new synthesis file is added for that wave, hub “latest” pointers should advance again in the same housekeeping batch.

## Risk & impact assessment

Unresolved **High** items skew **internal governance and PM throughput**: wrong synthesis entry point, folder-contract exceptions without an explicit index, broken copy/paste paths in the synthesis template, and dangling references (`AVAILABLE_AGENTS.md`, missing research file). End-user product risk is **indirect**; cost is mis-triage, wasted builder cycles, and onboarding friction.

## Recommendations (prioritized)

1. **Refresh both synthesis entry points** (`docs/README.md`, `docs/audits/synthesis/README.md`) so “Latest” points at the newest `YYYY-MM-DD-audit-synthesis.md` on disk (`2026-04-27-audit-synthesis.md` at time of review); repeat whenever a new synthesis lands (including after any 2026-04-29 full synthesis).
2. **Resolve root-audit placement:** **Done (Phase G, 2026-04-30)** for the two `docs/audits/2026-04-05-*.md` reports; remaining root strays (e.g. polish-gap) may still need indexing. Confirm inbound `audit:` / citations after any future move.
3. **Fix `docs/process/full-audit-synthesis.md` §4 embedded example** so the tasks link matches the prose (`../tasks.md` or equivalent valid relative path from `docs/process/`).
4. **Resolve `AVAILABLE_AGENTS.md`:** add the file where the team expects it **or** replace references in `docs/tasks-tools-expansion.md` and `docs/plans/2026-04-09-audit-remediation-plan.md` with a living substitute (e.g. `AGENTS.md` / documented model table).
5. **Plan traceability:** Create `docs/research/2026-04-05-edit-page-completion-ux.md` or retarget/remove `research:` in `docs/plans/2026-04-05-edit-page-completion-guidance.md`.
6. **Hub hygiene:** Add Mobile experience audit process to the Process list; clarify primary UI spec (`design/design-spec-2026.md`) versus `policies/design-spec.md` on the hub; optionally correct `docs/audits/synthesis/README.md` rule cross-reference to full-audit/synthesis docs.

## Task candidates (optional)

- [ ] Update `docs/README.md` and `docs/audits/synthesis/README.md` latest synthesis links to `2026-04-27-audit-synthesis.md` (and bump again when newer synthesis exists).
- [x] Relocated the 2026-04-05 quick-add and onboarding friction audits into `docs/audits/feature/` and `docs/audits/growth-funnel/`; fixed dependent frontmatter/links (Phase G, 2026-04-30).
- [ ] Fix embedded `[docs/tasks.md](../../tasks.md)` in `docs/process/full-audit-synthesis.md` PM review example.
- [ ] Add or replace `AVAILABLE_AGENTS.md` references in tooling docs/plans.
- [ ] Fix `2026-04-05-edit-page-completion-guidance.md` `research:` target or drop the field with rationale.

## Re-test checklist

- [ ] After hub updates, open “Latest audit synthesis” from `docs/README.md` and `docs/audits/synthesis/README.md` and confirm the file matches the newest dated synthesis on disk.
- [ ] After any audit file moves, search for old paths and confirm no stale references in active plans.
- [ ] `npm run check` when documentation changes ship alongside code in the same PR (doc-only batches may omit).

## Next trigger and cadence

- **Trigger:** Large doc reorg, repeated stale-reference drift, or completion of a **full** audit (new synthesis published).
- **Recommended next run:** Within one month, or immediately after publishing `docs/audits/synthesis/YYYY-MM-DD-audit-synthesis.md` for the current audit wave—**re-verify hub links in the same pass.**
