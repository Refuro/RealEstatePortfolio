---
title: Documentation link crawl report (Phase B snapshot + Phase K verification)
status: internal
generated: 2026-04-30
updated: 2026-04-30
---

**Internal — doc cleanup artifact.** Canonical hub remains [`docs/README.md`](../../README.md).

Raw machine output: [`_link-report-raw.json`](./_link-report-raw.json).

## Run metadata

| Field | Value |
|--------|--------|
| **Run date (Phase K)** | 2026-04-30 |
| **Method** | `npm run docs:linkcheck` or `node docs/process/_maintenance/check-doc-links.mjs` with cwd `RealEstatePortfolio/` (inline + reference-style links; BFS closure within `docs/**/*.md` from tier-1 seeds + `_maintenance/*.md`) |
| **scannedFiles** | 213 |
| **tier1ClosureFiles** | 213 |
| **orphanCount** | 286 |
| **orphanSample** | First 25 paths in JSON only; not a complete orphan list. |

## Summary counts (Phase K)

| Priority | Count | Delta vs first table in this file (Phase B-era) |
|----------|------:|-----------------------------------------------|
| P0 | **0** | −2 (hub directory links resolve via `plans/README.md` and `audits/seo/README.md`) |
| P1 | 14 | Plan + working-log workspace / directory-without-README noise (see **Known limitations**) |
| P2 | 30 | Residual archive + historic audit link patterns (see JSON) |
| **Total issue rows** | **44** | |

**Known limitations:** Treat remaining P1/P2 as acceptable noise unless you add READMEs under `app/` or rewrite workspace-only pointers. The crawler flags **links that leave `RealEstatePortfolio/`** (parent `.cursor/`, `docs/`, `claudeCode/`) and **directory targets** that lack `README.md` (e.g. `app/app`, `docs/runbooks` as a folder link). Historic **`docs/archive/plans/`** and **2026-04-03 documentation audits** still carry depth/`docs/`-prefix issues (P2).

---

## P0 — hub-critical

**None** — `counts.P0` in [`_link-report-raw.json`](./_link-report-raw.json) is **0**; `docs/README.md` and `docs/audits/synthesis/README.md` pass.

---

## P1 — secondary seeds + maintenance (summary)

**Count:** 16 rows.

### Real fixes under `docs/` (missing file or missing directory index)

- **`docs/audits/README.md`** — `seo/` directory link (Phase B): fixed by [`docs/audits/seo/README.md`](../../audits/seo/README.md).
- **`docs/process/_maintenance/2026-doc-cleanup-working-log.md`** — `../../decisions/`: folder exists but has **no** `README.md`; link is a naked directory URL.
- **`docs/process/_maintenance/2026-doc-cleanup-plan.md`** — `../../process/documentation-maintenance.md`: file **does not exist** yet (planned Phase K deliverable per cleanup plan).

### Intentional cross-tree / checker limitation (not “broken product docs”)

Many P1 rows come from **`2026-doc-cleanup-plan.md`** using links that either:

1. **`Resolves outside portfolio`** — targets such as `../../../../.cursor/skills`, `../../../../docs`, `../../../../.cursor`. These correctly describe the **workspace** tree; they are **not** errors for readers who clone only the portfolio repo unless you decide all such references must stay doc-only disclaimers.

2. **Directory links into `app/` or `.cursor/`** — e.g. `../../../app/app`, `../../../app/lib`, `../../../.cursor/rules`, plus `../../runbooks`, `../../security`, `../../plans`, `../../proposals`, `../../process` from the maintenance doc. The script treats a directory as valid only when it finds `README.md` inside `app/` subtree it does not recurse as “doc”; **many are folders without README** → reported as missing even when the folder exists.

**Recommendation:** Track these as **“intentional cross-tree / directory-without-README”** unless you explicitly want README stubs in `app/` for doc tooling.

---

## P2 — lower hub distance (top 20 rows + aggregates)

Sampler: twenty representative rows from the crawler (full list in JSON).

| # | Source | Target | Issue (short) |
|---|--------|--------|----------------|
| 1 | `docs/archive/launch/paid-ads-readouts/README.md` | `../../launch/` | directory / path — launch relative from archive |
| 2 | `docs/archive/launch/paid-ads-readouts/README.md` | `../../launch/paid-ads-test-readout-template.md` | missing target from archive vantage |
| 3 | `docs/onboarding/properties-vertical-slice.md` | `../app/app/(app…` | `../app` from `docs/onboarding/` → wrong depth (should ascend to repo root before `app/`) |
| 4 | `docs/onboarding/properties-vertical-slice.md` | `../app/app/api/properties/route.ts` | same depth issue |
| 5 | `docs/onboarding/properties-vertical-slice.md` | `../app/lib/amortization.ts` | same |
| 6 | `docs/onboarding/properties-vertical-slice.md` | `../app/lib/metrics/property-metrics.ts` | same |
| 7 | `docs/onboarding/properties-vertical-slice.md` | `../app/app/api/export/portfolio/route.test.ts` | same |
| 8 | `docs/onboarding/vitest-vs-route-handlers.md` | `../app/` | same (`../app` vs `../../app`) |
| 9 | `docs/archive/plans/README.md` | `../plans/2026-04-04-product-gap-discovery.md` | archived README relative vs live `plans/` layout |
| 10 | `docs/archive/README.md` | `../plans/` | directory without `plans/README.md` |
| 11 | `docs/tasks-archived.md` | `../audits/synthesis/2026-04-04-audit-synthesis.md` | wrong/missing synthesis path |
| 12 | `docs/tasks-archived.md` | `design-spec.md` | bare filename — resolves wrong from `docs/` root context |
| 13 | `docs/audits/synthesis/2026-04-09-audit-synthesis.md` | `../tasks.md` | from `audits/synthesis/` need `../../tasks.md` |
| 14 | `docs/audits/synthesis/2026-04-05-audit-synthesis.md` | `../tasks.md` | same |
| 15 | `docs/archive/plans/2026-04-04-property-detail-revamp-plan.md` | `docs/brainstorms/...` | `docs/`-prefix paths from archive (wrong anchor directory) |
| 16 | `docs/archive/plans/2026-04-04-refinance-payoff-insights-plan.md` | `docs/proposals/...` | same class |
| 17 | `docs/audits/documentation/2026-04-03-documentation-audit.md` | `design-spec.md` | depth / wrong relative |
| 18 | `docs/audits/documentation/2026-04-03-documentation-audit.md` | `docs/roadmap.md` | canonical roadmap is under `reference/`, not `docs/roadmap.md` |
| 19 | `docs/audits/documentation/2026-04-03-documentation-audit.md` | `../../design/` | `design/` lacks index README |
| 20 | `docs/audits/documentation/2026-04-03-documentation-audit-2.md` | `../../plans/` | directory index gap |

### P2 bulk themes (beyond the sample)

| Theme | Typical cause |
|-------|----------------|
| **`../app` depth** | Onboarding/feature audit docs one `..` short of repo root (`../../app/...`). |
| **`docs/...` from `docs/archive/`** | Paths anchored as if cwd were repo root; should be `../../...` style. |
| **Bare `design-spec.md` / `policies/design-spec.md` mix** | Inconsistent depth fromlane-specific audit dirs. |
| **`docs/roadmap.md`** | Stale alias; canonical is [`reference/roadmap.md`](../../reference/roadmap.md). |
| **Directory URLs** | `plans/`, `design/`, `archive/proposals/` without `README.md`. |
| **`(app` / route paths** | Malformed markdown link truncation (parentheses in path) breaks parsing. |

---

## Top 5 Phase C recommendations (concrete edits)

Ordered for maximum hub impact; **no `app/` code changes assumed** — doc-only unless you adopt README stubs in code trees.

1. **Add [`docs/plans/README.md`](../../plans/README.md)** — Short index of active plans + pointer to archive. Clears **`docs/README.md` → Active plans** P0 and several P2 directory hits.
2. **Add [`docs/audits/seo/README.md`](../../audits/seo/README.md)** — Lane index (latest audit + naming policy). Clears **`docs/README.md` → SEO audits** P0 and **`docs/audits/README.md` → `seo/`** (Phase B).
3. **Optional: [`docs/decisions/README.md`](../../decisions/README.md)** — One-liner + bullets to existing decisions. Clears working-log directory link without changing prose.
4. **Stage or stub [`docs/process/documentation-maintenance.md`](../../process/documentation-maintenance.md)** — Either minimal stub with “Phase K expands this” or retarget Phase K links until the doc exists — removes a real **`internal_missing`** from the cleanup plan itself.
5. **Batch-fix synthesis → tasks** — In `docs/audits/synthesis/2026-04-09-audit-synthesis.md` and `2026-04-05-audit-synthesis.md`, change `../tasks.md` → `../../tasks.md` (verified wrong relative depth).

---

## Blockers

None for progressing to **Phase C** — broken links are prioritized and actionable; orphans are informational for hub/index strategy (checkpoint B in plan).
