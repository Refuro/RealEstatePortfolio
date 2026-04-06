# Documentation Audit — 2026-04-05

## Executive summary

- **Coverage and governance:** All 14 audit lanes have process docs, `.cursor/rules/*-audit-agent.mdc` files, and the `docs/audits/README.md` table. Lane wiring is intact and `docs/process/command-integrity-check.md` continues to match the README mapping.
- **New systemic pattern — audit files at `docs/audits/` root:** Three successive audit-adjacent files from 2026-04-04 and 2026-04-05 are placed at the root of `docs/audits/` rather than in lane subfolders: `2026-04-04-polish-gap-audit.md`, `2026-04-05-quick-add-completion-gap-audit.md`, and `2026-04-05-onboarding-friction-analysis.md`. The prior audit flagged the first instance; it has now become a pattern and risks normalizing non-compliant placement.
- **Active plan has a dangling `research:` frontmatter reference:** `docs/plans/2026-04-05-edit-page-completion-guidance.md` points to `docs/research/2026-04-05-edit-page-completion-ux.md`, which does not exist. The research file was either not created or named differently.
- **Hub and prior open items:** `docs/README.md` "Latest audit synthesis" quick link still points to `2026-04-03-audit-synthesis.md`. DOC-1, DOC-2, and DOC-3 from the 2026-04-04 synthesis (Ship tier) remain unaddressed. Four new undiscovered top-level folders (`docs/research/`, `docs/test-plans/`, `docs/decisions/`, `docs/prompts/`) have no entry in the hub.
- **Recommendation:** Address the non-lane audit placement pattern before the next full-audit run; fix the dangling research reference; add the new directories and unlisted files to the hub README; carry the Ship-tier DOC-1/2/3 fixes forward.

---

## Severity-ranked findings

### Critical

- None. No documentation failure blocks production runtime.

---

### High

**H-1 — Systemic pattern: audit-adjacent files placed at `docs/audits/` root instead of lane subfolders**

Three files from back-to-back dates now sit outside the lane convention:

| File | Date | Expected location |
|------|------|-------------------|
| `docs/audits/2026-04-04-polish-gap-audit.md` | 2026-04-04 | `docs/audits/feature/` (or relevant lane) |
| `docs/audits/2026-04-05-quick-add-completion-gap-audit.md` | 2026-04-05 | `docs/audits/feature/` |
| `docs/audits/2026-04-05-onboarding-friction-analysis.md` | 2026-04-05 | `docs/audits/feature/` or `docs/audits/growth-funnel/` |

The 2026-04-04 instance was flagged as Medium in the prior audit with a suggestion to relocate or index it. The pattern has now repeated twice more, indicating that the lane-placement rule is not being applied for targeted / ad-hoc audits created outside the standard full-audit flow.

**Risk:** Readers browsing `docs/audits/<lane>/` will miss these reports. The synthesis lane index only scans lane subfolders. Agent governance audits and full-audit synthesis could miss relevant findings.

**Evidence:** [`docs/audits/README.md`](../README.md) § Lane structure contract; [`docs/audits/2026-04-05-quick-add-completion-gap-audit.md`](../2026-04-05-quick-add-completion-gap-audit.md); [`docs/audits/2026-04-05-onboarding-friction-analysis.md`](../2026-04-05-onboarding-friction-analysis.md); [`docs/audits/2026-04-04-polish-gap-audit.md`](../2026-04-04-polish-gap-audit.md).

---

**H-2 — Dangling `research:` frontmatter reference in active plan**

`docs/plans/2026-04-05-edit-page-completion-guidance.md` frontmatter contains:

```
research: docs/research/2026-04-05-edit-page-completion-ux.md
```

That file does not exist. The `docs/research/` directory contains only `2026-04-05-onboarding-form-ux-wizard-vs-scroll.md`. The edit-page completion UX research file was either never created or produced under a different name.

**Risk:** Anyone following the plan to understand design rationale will find a dead reference. If research was merged into another file, the frontmatter is misleading. If the research file was simply omitted, it represents a documentation gap for the shipped feature.

**Evidence:** [`docs/plans/2026-04-05-edit-page-completion-guidance.md`](../../plans/2026-04-05-edit-page-completion-guidance.md) frontmatter `research:` key (L6); `docs/research/` directory listing (one file only).

---

**H-3 — DOC-1, DOC-2, and DOC-3 from 2026-04-04 synthesis remain open (Ship tier)**

All three were classified as **Ship (next window)** in the 2026-04-04 synthesis:

| ID | Issue | Evidence |
|----|-------|----------|
| DOC-1 | `docs/README.md` still lists `policies/design-spec.md` as "**current** UI tokens" and `design/design-brief-2026.md` as "**future** … not yet implemented" without prominently linking `design/design-spec-2026.md` as primary | [`docs/README.md`](../../README.md) L16–18 |
| DOC-2 | Broken `docs/...` relative link targets in `docs/archive/plans/2026-04-04-property-detail-revamp-plan.md` and `docs/archive/plans/2026-04-04-refinance-payoff-insights-plan.md` footer sections | Archive plan footer sections |
| DOC-3 | `docs/process/full-audit-synthesis.md §4` embedded template uses `[docs/tasks.md](../../tasks.md)` (wrong relative depth from `docs/process/`) | [`docs/process/full-audit-synthesis.md`](../../process/full-audit-synthesis.md) L170 |

These are un-blocking workflow fixes that have now been carried through two consecutive documentation audit cycles.

**Evidence:** [`docs/audits/synthesis/2026-04-04-audit-synthesis.md`](../synthesis/2026-04-04-audit-synthesis.md) § Documentation, § Ship.

---

### Medium

**M-1 — `docs/README.md` "Latest audit synthesis" quick link is stale**

Line 6 of `docs/README.md` reads:

```
- [Latest audit synthesis](audits/synthesis/2026-04-03-audit-synthesis.md) — consolidated follow-ups (14 lanes; full run 2026-04-03, parallel agents)
```

The latest synthesis is `2026-04-04-audit-synthesis.md`, which closed multiple Ship items (SEO-1, MOB-1/3/4, UX-4, GOV-1, MATH-1, DOC-5). Readers of the hub who click this link get an outdated consolidated task list.

**Evidence:** [`docs/README.md`](../../README.md) L6; [`docs/audits/synthesis/2026-04-04-audit-synthesis.md`](../synthesis/2026-04-04-audit-synthesis.md).

---

**M-2 — Four undocumented top-level doc directories**

The following directories exist under `docs/` but have zero entry in `docs/README.md`:

| Directory | Contents | Notes |
|-----------|----------|-------|
| `docs/research/` | `2026-04-05-onboarding-form-ux-wizard-vs-scroll.md` | New; referenced in `2026-04-05-wizard-multi-step-refactor.md` frontmatter |
| `docs/test-plans/` | `2026-04-05-quick-add-completion-gap-test-plan.md` | New; manual QA checklist for shipped feature batch |
| `docs/decisions/` | `ownership-vacancy-percent-schema.md` | New; appears to be an ADR-style decision record |
| `docs/prompts/` | `onboarding-friction-analysis.md`, `copy-review-public-pages.md` | AI agent prompt source files |

None of these directories has a README or index. Builders and agents relying solely on `docs/README.md` will not discover them.

**Risk:** Research backing implementation decisions (`docs/research/`) and manual QA checklists (`docs/test-plans/`) are the least discoverable artifacts — exactly the ones future builders need when changing the same features.

**Evidence:** `docs/README.md` (no mention of these directories); file listing of `docs/research/`, `docs/test-plans/`, `docs/decisions/`, `docs/prompts/`.

---

**M-3 — `docs/plans/` still has no README or index**

Six active plan files (`2026-04-04-*` and `2026-04-05-*`) sit in `docs/plans/` with no `README.md`. The `docs/README.md` hub links `plans/` only as "Active plans (current execution docs and gap analysis)" with no index. This was flagged as Medium in the 2026-04-04 audit and has grown from two files to six.

**Risk:** PM handoff and builder coordination depend on knowing which plans are active vs superseded. Without an index, the directory must be scanned manually.

**Evidence:** [`docs/plans/`](../../plans/) — 6 files, no README; [`docs/README.md`](../../README.md) L99–101.

---

**M-4 — `docs/design/` has 7 files not listed in `docs/README.md`**

The README hub lists only `design-brief-2026.md` and `design-spec-2026.md`. Seven additional files exist with no hub entry:

- `implementation-guide-2026.md`
- `implementation-guide-2026-phase2.md`
- `implementation-guide-2026-phase3.md`
- `implementation-guide-2026-phase3-rollout.md`
- `phase3-execution-playbook.md`
- `design-brief-2026-phase2.md`
- `design-brief-2026-phase3.md`

No file in `docs/design/` carries a README indicating which guides are current vs superseded. It is unclear whether Phase 3 guides supersede Phase 1/2 or are additive.

**Evidence:** `docs/design/` directory listing; [`docs/README.md`](../../README.md) L18–19.

---

**M-5 — `docs/internal/` has 5 files not listed in `docs/README.md`**

The hub lists 5 internal files but 5 more exist with no entry:

| Unlisted file | Why it matters |
|---------------|----------------|
| `api-list-contract.md` | Referenced as a canonical spec in `docs/tasks.md` testing-hardening section |
| `stripe-webhook-posthog-idempotency.md` | Operational idempotency context for webhook handling |
| `effective-tier-analytics.md` | Referenced context for analytics decisions |
| `differentiator-value-add-analysis.md` | Competitive positioning reference |
| `ai-operations-efficiency-analysis.md` | Process analysis artifact |

`api-list-contract.md` is the most impactful gap — it is cited as a correctness authority in the testing-hardening process section but is not reachable via the hub.

**Evidence:** `docs/internal/` directory listing; [`docs/README.md`](../../README.md) L44–48; [`docs/tasks.md`](../../tasks.md) testing-hardening correctness note.

---

**M-6 — `docs/policies/calculator-metric-tones.md` not in `docs/README.md` Policies section**

`docs/README.md` lists three policy files under "Policies (canonical)": `ownership-metrics.md`, `analytics-math-policy.md`, `shell-risk-policy.md`. `calculator-metric-tones.md` exists in the same folder but is absent from the hub. Builders picking display tone for calculator outputs won't find this policy unless they browse the directory directly.

**Evidence:** [`docs/README.md`](../../README.md) L22–26; `docs/policies/` directory listing.

---

**M-7 — `docs/reference/portfolio-csv-export.md` and `docs/reference/rentcast-quota.md` not in hub**

`docs/README.md` Reference section lists 5 files. Two more exist and are referenced in active synthesis tasks (DI-3 explicitly names `docs/reference/portfolio-csv-export.md`):

- `docs/reference/portfolio-csv-export.md` — Referenced in synthesis DI-3, which is an open Schedule item
- `docs/reference/rentcast-quota.md` — Operational quota guidance for RentCast API usage

**Evidence:** [`docs/README.md`](../../README.md) L13–20; [`docs/audits/synthesis/2026-04-04-audit-synthesis.md`](../synthesis/2026-04-04-audit-synthesis.md) DI-3; `docs/reference/` directory listing.

---

### Low

**L-1 — `docs/tasks.md` "Promoted from" line references 2026-03-31 synthesis but latest open-items work spans 2026-04-04**

The "Full audit remediation" section header in `docs/tasks.md` says: *"Promoted from: `docs/audits/synthesis/2026-03-31-audit-synthesis.md` and `docs/audits/synthesis/2026-04-01-audit-synthesis.md`."* This is accurate for the origin, but new items from the 2026-04-04 synthesis (e.g. the Ship-tier DOC items above) were added to `tasks.md` as inline tasks without a corresponding "Promoted from 2026-04-04" header. Finding source provenance for those items requires cross-referencing the synthesis directly.

**Evidence:** [`docs/tasks.md`](../../tasks.md) L63–64; [`docs/audits/synthesis/2026-04-04-audit-synthesis.md`](../synthesis/2026-04-04-audit-synthesis.md) § Documentation.

---

**L-2 — `docs/audits/documentation/` subfolder has no README**

The `docs/audits/synthesis/` subfolder has a `README.md` explaining the synthesis structure. The `docs/audits/documentation/` subfolder does not. Minor: lane README is an optional convention, but adding one would be consistent with the synthesis subfolder pattern.

**Evidence:** `docs/audits/synthesis/README.md` exists; `docs/audits/documentation/README.md` does not exist.

---

**L-3 — `docs/plans/2026-04-05-onboarding-activation-rollout.md` frontmatter `audit:` points to non-lane path**

The plan's frontmatter correctly lists `docs/audits/2026-04-05-onboarding-friction-analysis.md` as its source audit. The file exists, but because it is at the root of `docs/audits/` (see H-1), any automated tooling that scans `docs/audits/<lane>/` to find the backing audit will miss it. The reference is technically correct but inherits the H-1 misplacement.

**Evidence:** [`docs/plans/2026-04-05-onboarding-activation-rollout.md`](../../plans/2026-04-05-onboarding-activation-rollout.md) frontmatter L3; H-1 above.

---

**L-4 — `docs/tasks-archived.md` is referenced 10+ times in `docs/tasks.md` but not linked in `docs/README.md`**

`tasks-archived.md` is treated as the canonical historical record for completed task batches. It is heavily cross-linked from `docs/tasks.md` but absent from `docs/README.md`. New contributors would not know where completed tasks are stored.

**Evidence:** [`docs/tasks.md`](../../tasks.md) L11, L17, L47, L63, L161; [`docs/README.md`](../../README.md) (no mention).

---

## Evidence reviewed

- [`docs/process/documentation-audit-process.md`](../../process/documentation-audit-process.md) — process reference
- [`docs/process/audit-report-template.md`](../../process/audit-report-template.md) — report structure
- [`docs/audits/README.md`](../README.md) — lane structure contract, naming conventions
- [`docs/process/command-integrity-check.md`](../../process/command-integrity-check.md) — lane → process → rule mapping (all 14 lanes verified present)
- [`docs/README.md`](../../README.md) — full hub; all Quick links, Reference, Policies, Launch, Internal, Process, Audits, Plans sections
- [`docs/tasks.md`](../../tasks.md) — active tasks, promoted items, archive cross-references
- [`docs/audits/documentation/2026-04-04-documentation-audit.md`](./2026-04-04-documentation-audit.md) — prior run; open items carried forward
- [`docs/audits/synthesis/2026-04-04-audit-synthesis.md`](../synthesis/2026-04-04-audit-synthesis.md) — DOC-1/2/3/5 status and PM triage
- `docs/audits/` root listing — confirmed three non-lane files
- `docs/plans/` listing — 6 files, no README
- `docs/research/` listing — 1 file (`2026-04-05-onboarding-form-ux-wizard-vs-scroll.md`); confirmed missing `2026-04-05-edit-page-completion-ux.md`
- `docs/test-plans/` listing — 1 file
- `docs/decisions/` listing — 1 file
- `docs/prompts/` listing — 2 files
- `docs/design/` listing — 9 files (2 in hub, 7 unlisted)
- `docs/internal/` listing — 12 files (5 in hub §Internal engineering + 2 in hub §Internal owner/operator, 5 unlisted)
- `docs/policies/` listing — 6 files (3 in hub Policies section, 3 unlisted: `design-spec.md` is listed in Reference, `csp-rollout.md` in tasks, `calculator-metric-tones.md` not linked)
- `docs/reference/` listing — 7 files (5 in hub, 2 unlisted)
- [`docs/plans/2026-04-05-edit-page-completion-guidance.md`](../../plans/2026-04-05-edit-page-completion-guidance.md) — frontmatter dangling reference verified
- [`docs/plans/2026-04-05-onboarding-activation-rollout.md`](../../plans/2026-04-05-onboarding-activation-rollout.md) — frontmatter cross-reference verified
- **Limits:** No machine-based link crawl; web URLs and dynamic routes not checked. Archive plans from 2026-04-04 (broken footer links, DOC-2) not re-verified in detail; prior audit evidence accepted.

---

## Risk & impact assessment

- **H-1 (non-lane audit files):** Low operational risk today; growing reputational risk for the audit system. If the pattern continues, future synthesis passes may silently under-count findings. Three instances in two days suggests the lane rule is not being applied under time pressure.
- **H-2 (dangling research reference):** Medium PM/builder risk. A builder implementing or extending the edit-page completion guidance feature has no research backing available from the plan. Absent research means design rationale is lost.
- **H-3 (DOC-1/2/3 still open):** DOC-1 misleads contributors on which design spec is canonical. DOC-2 creates dead links in active planning artifacts. DOC-3 is a PM workflow bug that will recur every synthesis run. Combined, these impose ongoing friction with each new documentation or synthesis pass.
- **M-2 (undocumented directories):** Research and test-plans are the most impactful gaps — they contain decision-backing and QA checklists for features that will be revisited. Without hub entries, they will be rediscovered only by accident.
- **M-5 (`api-list-contract.md` unlisted):** Low probability of error today, medium probability of drift. The testing-hardening process explicitly names this file as a correctness authority but does not link it from the hub — a contributor setting up tests from scratch cannot find it via the README.

---

## Recommendations (prioritized)

1. **Relocate or index the three root-level audit files (H-1)** — Either move `2026-04-04-polish-gap-audit.md`, `2026-04-05-quick-add-completion-gap-audit.md`, and `2026-04-05-onboarding-friction-analysis.md` into the correct lane subfolder (e.g. `docs/audits/feature/`), or add a `docs/audits/README.md` entry explicitly acknowledging root-level targeted audits. Add a note to the Documentation audit process doc that ad-hoc targeted audits must still use lane subfolders.
2. **Create or relocate the missing research file (H-2)** — Either create `docs/research/2026-04-05-edit-page-completion-ux.md` (if the research was done but not written up), update the frontmatter of `docs/plans/2026-04-05-edit-page-completion-guidance.md` to point to the correct existing file, or remove the `research:` key with a note that no separate research doc exists.
3. **Clear DOC-1, DOC-2, DOC-3 in the next implementation window (H-3)** — These are the three highest-impact documentation fixes carried over from the 2026-04-04 Ship tier. See [`docs/audits/synthesis/2026-04-04-audit-synthesis.md`](../synthesis/2026-04-04-audit-synthesis.md) for specific line references.
4. **Add hub entries for new directories (M-2)** — Add a "Research" section to `docs/README.md` for `docs/research/`, a line under "QA & regression" for `docs/test-plans/`, and an "Architecture decisions" section for `docs/decisions/`. Optionally add a note about `docs/prompts/` under the Process or Internal sections.
5. **Update `docs/README.md` Latest audit synthesis link (M-1)** — Change the Quick links entry to point to `audits/synthesis/2026-04-04-audit-synthesis.md`.
6. **Add a `docs/plans/README.md` index (M-3)** — List active plans with one-line summaries and status. This was recommended in the 2026-04-04 audit and has now grown to 6 files.
7. **Add unlisted `docs/internal/`, `docs/design/`, `docs/policies/`, and `docs/reference/` files to hub (M-4, M-5, M-6, M-7)** — At minimum: `api-list-contract.md` (correctness authority), `calculator-metric-tones.md` (builder-facing policy), `portfolio-csv-export.md` (referenced in open DI-3), and `rentcast-quota.md`. Design phase guides can be added under a "Design implementation" subsection or linked from the existing design entries.
8. **Add `docs/tasks-archived.md` to the hub (L-4)** — A single line under the Tasks section noting it as the historical record for completed batches.

---

## Task candidates

Doc and governance follow-ups (promote to [`docs/tasks.md`](../../tasks.md) if approved):

- [ ] **Relocate three root-level audit files** into `docs/audits/feature/` (or appropriate lane): `2026-04-04-polish-gap-audit.md`, `2026-04-05-quick-add-completion-gap-audit.md`, `2026-04-05-onboarding-friction-analysis.md`. Update any plan frontmatter `audit:` keys that reference the old paths.
- [ ] **Resolve dangling research reference** in `docs/plans/2026-04-05-edit-page-completion-guidance.md` — create, rename, or remove `docs/research/2026-04-05-edit-page-completion-ux.md` and update frontmatter accordingly.
- [ ] **DOC-1** — Update `docs/README.md` Reference block: elevate `design/design-spec-2026.md` as primary design source; adjust `policies/design-spec.md` and `design/design-brief-2026.md` lines to match hierarchy *(carried from 2026-04-04 synthesis Ship tier)*.
- [ ] **DOC-2** — Fix broken `docs/...` relative link targets in `docs/archive/plans/2026-04-04-property-detail-revamp-plan.md` and `docs/archive/plans/2026-04-04-refinance-payoff-insights-plan.md` footer sections *(carried from 2026-04-04 synthesis Ship tier)*.
- [ ] **DOC-3** — Fix `tasks.md` link in `docs/process/full-audit-synthesis.md §4` embedded template: `[docs/tasks.md](../../tasks.md)` → `[docs/tasks.md](../tasks.md)` *(carried from 2026-04-04 synthesis Ship tier)*.
- [ ] **Update `docs/README.md` Latest audit synthesis quick link** — point to `2026-04-04-audit-synthesis.md`.
- [ ] **Add hub entries for `docs/research/`, `docs/test-plans/`, `docs/decisions/`, `docs/prompts/`** in `docs/README.md`.
- [ ] **Create `docs/plans/README.md`** with a one-line-per-file index of active plans.
- [ ] **Add `api-list-contract.md`** to `docs/README.md` Internal section (correctness authority).
- [ ] **Add `calculator-metric-tones.md`** to `docs/README.md` Policies section.
- [ ] **Add `portfolio-csv-export.md` and `rentcast-quota.md`** to `docs/README.md` Reference section.
- [ ] **Add a note to `docs/process/documentation-audit-process.md`** clarifying that ad-hoc targeted audits must use lane subfolders, not `docs/audits/` root.
- [ ] **Add `docs/tasks-archived.md`** link to `docs/README.md` under the Tasks section.

---

## Re-test checklist

- [ ] After hub update, click all Quick links and Reference section links in `docs/README.md` and verify they resolve.
- [ ] Verify that `docs/plans/2026-04-05-edit-page-completion-guidance.md` frontmatter `research:` key resolves to an existing file.
- [ ] From `docs/process/full-audit-synthesis.md §4`, confirm the `tasks.md` link resolves from `docs/process/` depth.
- [ ] Confirm relocated audit files appear under their new lane subfolder and any `audit:` frontmatter references are updated.
- [ ] `npm run check` — only when application code changes (not required for doc-only fixes).

---

## Next trigger and cadence

- **Trigger:** After the next full-audit synthesis, any large `docs/README.md` reorganization, addition of a new top-level docs directory, or if the non-lane audit file pattern is not resolved before the next full-audit run.
- **Recommended next documentation audit:** Within **one month** (standard cadence), or immediately after the DOC-1/2/3 + hub-update batch lands.
