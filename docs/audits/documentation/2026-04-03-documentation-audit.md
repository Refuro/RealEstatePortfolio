# Documentation Audit — 2026-04-03

## Executive summary

- **Overall:** The doc hub (`docs/README.md`) is usable and cross-links most canonical policies, setup, and audit lanes; the **2026-04-02** full-run synthesis is linked from the hub while the **synthesis sub-index** still highlights **2026-04-01** as “latest,” causing discoverability drift.
- **Top risk:** **Conflicting design governance** between `docs/README.md` (design brief = *future / not yet implemented*), `docs/design/design-brief-2026.md` (*Active*; *supersedes* parts of `design-spec`), and `docs/policies/design-spec.md` (*Active*; *all UI work must align* + *superseded sections*). Builders need one explicit rule for “what governs shipped CSS today.”
- **Broken references (confirmed):** At least two file-level markdown targets are wrong: `docs/visual-assets-guide.md` → `design-spec.md`, and `docs/archive/proposals/benchmarking-proposal.md` → `docs/roadmap.md`.
- **Recommendation:** Refresh `docs/audits/synthesis/README.md`, fix the two broken relative paths, and add a short **Design** subsection or footnote that reconciles README vs brief header (implementation status).

## Severity-ranked findings

### Critical

- None.

### High

- **Synthesis “latest” pointer split across two entry points** — `docs/README.md` Quick links use [`audits/synthesis/2026-04-02-audit-synthesis.md`](../../audits/synthesis/2026-04-02-audit-synthesis.md) as the latest consolidated follow-up; [`docs/audits/synthesis/README.md`](../../audits/synthesis/README.md) still states **Latest full run (PM):** `2026-04-01-audit-synthesis.md`. — **Risk:** PM/agents open the wrong synthesis when starting from the sub-index. — **Evidence:** [`docs/README.md`](../../README.md) L6; [`docs/audits/synthesis/README.md`](../../audits/synthesis/README.md) L7.

### Medium

- **Design brief vs design-spec vs hub — governance wording conflict** — [`docs/README.md`](../../README.md) L17–18 frames **Design brief 2026** as **future** and **not yet implemented** and says it does not replace **design-spec** until migration. [`docs/design/design-brief-2026.md`](../../design/design-brief-2026.md) L5–6 states **Active** and that it **supersedes relevant visual sections** of [`docs/policies/design-spec.md`](../../policies/design-spec.md). [`docs/policies/design-spec.md`](../../policies/design-spec.md) L7–8 says **Status: Active — all UI work must align with this spec** while naming sections **superseded** by the brief and instructing to consult the brief first. — **Risk:** Inconsistent agent/human decisions on tokens, typography, and color for new UI. — **Evidence:** paths above; compare L17–18 of hub vs L5–8 of brief vs L7–8 of design-spec.

- **Broken cross-link:** [`docs/visual-assets-guide.md`](../../visual-assets-guide.md) references `[design-spec.md](design-spec.md)` from `docs/` — there is no `docs/design-spec.md`; canonical file is [`docs/policies/design-spec.md`](../../policies/design-spec.md). — **Risk:** Broken link in a reference footer.

- **Broken cross-link (archive):** [`docs/archive/proposals/benchmarking-proposal.md`](../../archive/proposals/benchmarking-proposal.md) L148 uses `[Rent gap email](docs/roadmap.md)` — relative to that file, `docs/roadmap.md` does not resolve to [`docs/reference/roadmap.md`](../../reference/roadmap.md). — **Risk:** Dead link in archived proposal (low product impact, high doc-hygiene signal).

### Low

- **Hub does not index design implementation companions** — [`docs/design/implementation-guide-2026.md`](../../design/implementation-guide-2026.md), phase 2/3 briefs and guides exist under [`docs/design/`](../../design/) but [`docs/README.md`](../../README.md) only links **Design brief 2026** and **Design spec**, not the implementation guides or phased briefs. — **Risk:** Extra search cost when kicking off visual work. — **Evidence:** glob under `docs/design/*.md` vs hub Reference section.

- **`docs/tasks.md` roadmap table date marker** — [`docs/tasks.md`](../../tasks.md) § **Roadmap priority** header says **last reviewed 2026-03-30** while adjacent work (synthesis, audits) progressed through 2026-04-02. — **Risk:** Readers assume roadmap priorities are stale. — **Evidence:** [`docs/tasks.md`](../../tasks.md) L21.

- **Same-day / multi-file documentation audit artifacts** — Under [`docs/audits/documentation/`](./) there are multiple 2026-03-30 and 2026-04-01 dated reports (`-2` suffixes). [`docs/tasks.md`](../../tasks.md) Phase 18 notes optional cleanup of superseded same-day reruns. — **Risk:** Noise only; not incorrect if treated as historical audit evidence.

## Evidence reviewed

- [`docs/process/documentation-audit-process.md`](../../process/documentation-audit-process.md), [`docs/process/audit-report-template.md`](../../process/audit-report-template.md)
- [`docs/README.md`](../../README.md) (hub), [`docs/audits/README.md`](../README.md), [`docs/audits/synthesis/README.md`](../synthesis/README.md)
- [`docs/policies/design-spec.md`](../../policies/design-spec.md), [`docs/design/design-brief-2026.md`](../../design/design-brief-2026.md)
- [`docs/tasks.md`](../../tasks.md) (pointers to synthesis, roadmap, archived tasks, Phase 18 housekeeping)
- [`docs/archive/README.md`](../../archive/README.md), listing under [`docs/archive/proposals/`](../../archive/proposals/)
- [`docs/visual-assets-guide.md`](../../visual-assets-guide.md), [`docs/archive/proposals/benchmarking-proposal.md`](../../archive/proposals/benchmarking-proposal.md)
- Prior lane report: [`2026-04-02-documentation-audit.md`](2026-04-02-documentation-audit.md)
- **Limits:** No exhaustive automated crawl of all `docs/**/*.md` links; directory targets (e.g. `audits/code/`) are valid for repo browsers but were not validated as web URLs. Parentheses in some paths (e.g. `app/(app)/`) can confuse naive link extractors.

## Risk & impact assessment

- **Unresolved split on “latest synthesis”** causes wrong triage from the synthesis folder alone — **medium** likelihood, **medium** impact for PM workflow.
- **Design doc conflict** affects **every UI/CSS change** until one narrative wins — **high** confusion surface, mitigated if team already has informal agreement.
- **Two broken file links** are **low** user impact (one in archive, one in a guide footer) but are quick fixes.

## Recommendations (prioritized)

1. **Update [`docs/audits/synthesis/README.md`](../../audits/synthesis/README.md)** so “Latest full run (PM)” matches the hub: include **`2026-04-02-audit-synthesis.md`** (and keep prior pointers coherent, e.g. 2026-04-01 as same-day batch or predecessor as appropriate).
2. **Reconcile design governance in one place** — Either adjust [`docs/README.md`](../../README.md) Reference lines **or** the **Status** line on [`docs/design/design-brief-2026.md`](../../design/design-brief-2026.md) / header of [`docs/policies/design-spec.md`](../../policies/design-spec.md) so “future vs active,” “supersedes,” and “shipped code” are not contradictory. Prefer a single sentence: *what tokens/layouts apply in production today* vs *what is planned*.
3. **Fix broken paths:** `visual-assets-guide.md` → `policies/design-spec.md`; `archive/proposals/benchmarking-proposal.md` → `../../reference/roadmap.md` (or equivalent correct relative path).
4. **Optional:** Add **Implementation guide 2026** (and optionally phase 2/3 docs) to [`docs/README.md`](../../README.md) under Reference when design execution is active.

## Task candidates (optional)

- [ ] Align `docs/audits/synthesis/README.md` with `docs/README.md` on latest synthesis filename/date.
- [ ] Fix `docs/visual-assets-guide.md` and `docs/archive/proposals/benchmarking-proposal.md` markdown targets.
- [ ] PM edits design brief / design-spec / README header to remove “future vs supersedes” conflict; re-run spot-check on new PRs referencing design tokens.

## Re-test checklist

- [ ] After synthesis README update, open hub and synthesis README and confirm both point to the same “latest” file.
- [ ] Click fixed links from `visual-assets-guide.md` and archived benchmarking proposal.
- [ ] `npm run check` — only if application code changes (not required for doc-only fixes).

## Next trigger and cadence

- **Trigger:** After next full-audit synthesis drop, or when design-brief migration starts.
- **Recommended next run:** Within **one month** or after any large `docs/` reorganization.

---

## Appendix: Specific stale or conflicting doc paths

| Path | Issue |
|------|--------|
| [`docs/audits/synthesis/README.md`](../../audits/synthesis/README.md) | **Stale:** “Latest full run” still **2026-04-01**; hub uses **2026-04-02** synthesis. |
| [`docs/README.md`](../../README.md) vs [`docs/design/design-brief-2026.md`](../../design/design-brief-2026.md) vs [`docs/policies/design-spec.md`](../../policies/design-spec.md) | **Conflicting:** “Future / not implemented” vs “Active / supersedes” vs “Active / align with spec” + partial supersession. |
| [`docs/tasks.md`](../../tasks.md) § Roadmap priority | **Stale marker:** “last reviewed **2026-03-30**” vs later April audit/synthesis activity. |
| [`docs/visual-assets-guide.md`](../../visual-assets-guide.md) | **Broken link:** `(design-spec.md)` — file not at `docs/design-spec.md`. |
| [`docs/archive/proposals/benchmarking-proposal.md`](../../archive/proposals/benchmarking-proposal.md) | **Broken link:** `(docs/roadmap.md)` from archive context. |
| [`docs/tasks-archived.md`](../../tasks-archived.md) (historical checkbox text) | **Stale wording:** references “**12 lanes**” in older agent-setup task; current full audit is **14** lanes per [`docs/audits/README.md`](../README.md). |
