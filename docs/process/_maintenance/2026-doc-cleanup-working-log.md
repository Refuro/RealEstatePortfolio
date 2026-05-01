---
title: Doc cleanup — working log (session state)
status: signed-off
updated: 2026-04-30
---

**Internal — doc cleanup running state; not the product hub.**  
Operators and readers should use [`docs/README.md`](../../README.md). This file is for agents and maintainers executing the workspace documentation cleanup program only.

## Plan link

- Canonical phase detail: [`docs/process/_maintenance/2026-doc-cleanup-plan.md`](./2026-doc-cleanup-plan.md)  
  (From **portfolio repo root** `RealEstatePortfolio/`, same path without prefix: `docs/process/_maintenance/2026-doc-cleanup-plan.md`.) **Phase K complete** — program signed off for this iteration; see [Appendix — Phase K](#appendix--phase-k-final-verification).

## Program status

**Signed off for this iteration (2026-04-30).** Phases A–K complete per plan; ongoing maintenance: [`docs/process/documentation-maintenance.md`](../documentation-maintenance.md).

## Current phase / next actions

| Item | State |
|------|--------|
| **Phase A** | **Complete** (2026-04-30) — working log, inventory manifest, tier-1 crawl seeds documented in [`2026-doc-cleanup-inventory.md`](./2026-doc-cleanup-inventory.md). |
| **Checkpoint A** | **Resolved** (2026-04-30) — see **Resolved PM judgements**; extraction into canonical docs prioritized over moving `claudeCode/`. |
| **Phase B** | **Complete** (2026-04-30) — link checker run recorded; [`2026-doc-cleanup-link-report.md`](./2026-doc-cleanup-link-report.md) + [`_link-report-raw.json`](./_link-report-raw.json). |
| **Phase C** | **Complete** (2026-04-30) — hub + synthesis README + secondary indexes; P0 link-report items cleared (`plans/README`, `audits/seo/README`, `documentation-maintenance.md` stub, synthesis→tasks depth fix). |
| **Phase D** | **Complete** (2026-04-30) — roadmap / product-overview / valuation-brief / tasks / mvp-spec / engineering-spec / launch §9 + doc control. |
| **Phase E** | **Complete** (2026-04-30) — architecture / policies / billing matrix / onboarding links / runbooks vs code. |
| **Phase F** | **Complete** (2026-04-30) — QA matrices + shell naming, test-infra narratives vs Vitest/CI, `docs/security/*` vs 2026-04-30 audit + **`tasks.md`**. |
| **Phase G** | **Complete** (2026-04-30) — lane contract for `2026-04-05-*` root audits; `full-audit-synthesis` PM two-file rule; lane README reading order (`feature/`, `growth-funnel/`); link check P0 = 0. |
| **Phase H** | **Complete** (2026-04-30) — plan frontmatter/research traceability, proposal shipped pointers, workspace `claudeCode/README.md`; link check P0 = 0. |
| **Phase I** | **Complete** (2026-04-30) — cursor-agent-setup + audits README deferral; `AVAILABLE_AGENTS.md`; process ↔ rule cross-links; monorepo skills in setup docs; agent-governance ↔ command-integrity; link check P0 = 0. |
| **Phase J** | **Complete** (2026-04-30) — `docs:linkcheck` + `docs:metrics` npm scripts (`RealEstatePortfolio/` + `app/`); metrics helper [`generate-metrics-snapshot.mjs`](./generate-metrics-snapshot.mjs); maintenance doc § metrics + § CI gate (optional); link checker **unchanged**. |
| **Phase K** | **Complete** (2026-04-30) — final link crawl (`counts.P0 = 0`), link-report + raw JSON refresh, spot sample 20 paths, audit synthesis Schedule/Business doc items closed per Phase D–K scope, [`documentation-maintenance.md`](../documentation-maintenance.md) finalized, plan checklist **K** checked. |

No further phases in this program. Prefer a **new dated working log** for the next mega-cleanup (see maintenance doc).

## Resolved PM judgements

- **2026-04-30 — Checkpoint A (`claudeCode/`)** — PM direction: **carry the substance forward, not necessarily the folder layout.** Durable outcomes, scope decisions, and follow-ups from `claudeCode/**` should be **surfaced in sources of truth** inside the portfolio repo — especially [`docs/reference/roadmap.md`](../../reference/roadmap.md), [`docs/architecture-and-build-practices.md`](../../architecture-and-build-practices.md), and new or existing [`docs/decisions/`](../../decisions/) entries as appropriate. **Bulk-moving** `claudeCode/` is **optional**, not required for success; it can stay as **read-only historical context** while canonical truth lives under `docs/`. During **Phase H**, builders do **targeted extraction** (per subtree: PropertyRedesign, DashRedesign, InsightsGating, etc.) rather than assuming a single mechanical “move everything” step. Optional later: add **`claudeCode/README.md`** at workspace root indexing folders and pointing readers to where ideas landed in `docs/`.

## Open questions for PM

- **2026-04-30 — Activation / funnel snapshot vs `tasks.md` owner QA** — `docs/reference/valuation-brief.md` §10 historically described **zero** activated users among an early signup cohort; `docs/tasks.md` **Owner QA** sections reference trial users **with properties**. Reconcile via PostHog/DB and refresh the brief’s Q&A numbers when authoritative (do not infer from prose here).

## Session appendix

### 2026-04-30 — PM (Checkpoint A resolution)

- **Decision:** Hybrid — **extract/sync into `RealEstatePortfolio/docs/` + roadmap** as primary outcome; **do not require** relocating `claudeCode/` to archive for this program to succeed.

### 2026-04-30 — Phase A (Builder)

- **Created:** [`2026-doc-cleanup-working-log.md`](./2026-doc-cleanup-working-log.md) (this file), [`2026-doc-cleanup-inventory.md`](./2026-doc-cleanup-inventory.md).
- **Scope:** Filesystem + `git ls-files` under portfolio repo for `docs/`; filesystem enumeration for workspace `claudeCode/`, `docs/`, and both `.cursor` trees.
- **Noted:** `claudeCode/` and workspace-level `docs/` / `.cursor/skills` are **outside** the `RealEstatePortfolio` git repo root; manifest still lists them per Phase A workspace boundary.
- **Verified:** `docs/` on-disk file count **495** after adds (matches expected `git` total once staged/committed).

### 2026-04-30 — Phase B (Builder)

- **Link report:** [`2026-doc-cleanup-link-report.md`](./2026-doc-cleanup-link-report.md).
- **Raw JSON:** [`_link-report-raw.json`](./_link-report-raw.json) (`node docs/process/_maintenance/check-doc-links.mjs` from `RealEstatePortfolio/`).
- **Crawl highlights:** scannedFiles/tier1ClosureFiles **186**; orphans **306** (sample-only in JSON); P0 **2**, P1 **16**, P2 **48**.

### 2026-04-30 — Phase C (Builder)

- **Hub / indexes:** [`docs/README.md`](../../README.md) (design hierarchy + mobile process — confirmed), [`docs/audits/synthesis/README.md`](../../audits/synthesis/README.md), [`docs/qa/README.md`](../../qa/README.md), [`docs/archive/README.md`](../../archive/README.md), [`docs/archive/plans/README.md`](../../archive/plans/README.md) (fixed `../../plans/` links).
- **New lane / folder indexes:** [`docs/plans/README.md`](../../plans/README.md), [`docs/audits/seo/README.md`](../../audits/seo/README.md), [`docs/decisions/README.md`](../../decisions/README.md), [`docs/process/documentation-maintenance.md`](../../process/documentation-maintenance.md).
- **Workspace root:** [`docs/README.md`](../../../../docs/README.md) under `RealEstateProject/docs/` → points to portfolio hub.
- **Link fix:** [`docs/audits/synthesis/2026-04-09-audit-synthesis.md`](../../audits/synthesis/2026-04-09-audit-synthesis.md) — `tasks.md` relative depth.
- **Plan checklist:** Phases **B** and **C** marked complete in [`2026-doc-cleanup-plan.md`](./2026-doc-cleanup-plan.md).

### 2026-04-30 — Phase D (Builder)

- **Routes / surfaces:** Inventoried `app/app/` pages + cron routes; reconciled **`docs/reference/roadmap.md`** §1 (Tools hub shipped, App Router + cron footnote), **`docs/reference/product-overview.md`** §6–7 (pricing env + missing public/in-app calculator routes, `mortgage/quick`, `about`, `lp/...`).
- **Roadmap narrative:** Reverse trial + retention sections updated to **shipped / partial** vs code; Vitest counts → **`npm run test`** + snapshot **85 files / 618 tests** (2026-04-30 run); tools table extended (wholesale, rent-vs-buy, cap-rate, CoC, DSCR).
- **Valuation:** Aligned backlog (PDF vs print), testing (Vitest vs E2E), trial in account section; **softened** hard user/revenue claims with **verify source**; §10 activation framed as **reconcile analytics** (see **Open questions**).
- **Tasks / specs / launch:** [`docs/tasks.md`](../../tasks.md) roadmap slice de-duplicated vs full roadmap; [`mvp-spec.md`](../../reference/mvp-spec.md) payments example; [`engineering-spec.md`](../../reference/engineering-spec.md) maintenance note; [`docs/launch/launch-plan.md`](../../launch/launch-plan.md) §9 + last reviewed + v1.4 doc control.
- **Plan checklist:** Phase **D** marked complete in [`2026-doc-cleanup-plan.md`](./2026-doc-cleanup-plan.md).

### 2026-04-30 — Phase E (Builder)

- **Architecture:** [`docs/architecture-and-build-practices.md`](../../architecture-and-build-practices.md) — Next/React/Prisma pins from `app/package.json`, nested `app/app` layout, `proxy.ts` (not `middleware.ts`), `vercel.json` cron paths, `CRON_SECRET`, `GET|HEAD /api/health` + `app/app/api/health/route.ts`, `global-error` path fix.
- **Policies:** [`ownership-metrics.md`](../../policies/ownership-metrics.md), [`analytics-math-policy.md`](../../policies/analytics-math-policy.md) — cross-link [`math-logic-audit.md`](../../process/math-logic-audit.md); verification matrix updated (removed `full_liability` mode).
- **Billing:** [`billing-matrix.md`](../../internal/billing-matrix.md) — env vars from `stripe-config` / `pricing-display` / `env.ts`; `POST` checkout/portal/webhook; cron checklist item; [`manual-steps.md`](../../setup/manual-steps.md) already documents `CRON_SECRET` (confirmed in Hosting section).
- **Onboarding:** [`properties-vertical-slice.md`](../../onboarding/properties-vertical-slice.md) `../../app/...` link depth; [`vitest-vs-route-handlers.md`](../../onboarding/vitest-vs-route-handlers.md) refreshed counts (50 / 27 / 86) and route lists.
- **Runbooks:** [`health-check-smoke.md`](../../runbooks/health-check-smoke.md) health route link; incident/smoke language matches liveness-only health handler.
- **Link checker:** Re-ran `check-doc-links.mjs` after Phase E — **P0 = 0**; script unchanged (no post-run P0 from checker edits).

### 2026-04-30 — Phase F (Builder)

- **QA:** [`property-flow-regression-matrix.md`](../../qa/property-flow-regression-matrix.md) → property **scroll + edit drawer** (no Overview/Details tabs); mobile **Dashboard / Properties / Analyze / More**; [`mobile-shell-verification.md`](../../qa/mobile-shell-verification.md) app paths (`app/app/(app)/…`); [`mobile-experience-audit.md`](../../qa/mobile-experience-audit.md) nav + deep links + surface list (`/refinance`, `/tools`).
- **Tests:** [`test-infrastructure-review.md`](../../qa/test-infrastructure-review.md), [`testing-hardening-proposal.md`](../../qa/testing-hardening-proposal.md) → **`~85` files / `~600+` tests**, CI path; Vitest **`app/**/*.test.ts`** include.
- **Security:** [`security-notes.md`](../../security/security-notes.md), [`security-audit.md`](../../security/security-audit.md) → CSP **`checkCspRateLimit`** vs `ApiRateLimitEntry`, **`RATE_LIMITS`** table (+ Places), §7 **`{ status: "ok" }`**; audit lane cross-links; **`SEC-2026-04-30-1`** added to [`tasks.md`](../../tasks.md).
- **Other:** **`UX-SHIP-2`** touch path → `property-detail-content.tsx`; [`2026-04-30-security-audit.md`](../../audits/security/2026-04-30-security-audit.md) task section → promoted / doc-done note.
- **Link checker:** Re-ran `check-doc-links.mjs` — **P0 = 0**; **`check-doc-links.mjs` unchanged**.
- **Plan checklist:** Phase **F** marked complete in [`2026-doc-cleanup-plan.md`](./2026-doc-cleanup-plan.md).

### 2026-04-30 — Phase G (Builder)

- **Moves:** `docs/audits/2026-04-05-quick-add-completion-gap-audit.md` → `docs/audits/feature/2026-04-05-quick-add-completion-gap-audit.md`; `docs/audits/2026-04-05-onboarding-friction-analysis.md` → `docs/audits/growth-funnel/2026-04-05-onboarding-friction-analysis.md`.
- **References:** Plans (`audit:` ×3 files + body), feature/growth/business audits, documentation lane continuity, agent-governance L2, audits hub bookmark redirects, lane README reading order; `full-audit-synthesis.md` step 6 (two-file PM rule).
- **Link checker:** `node docs/process/_maintenance/check-doc-links.mjs` from `RealEstatePortfolio/` — **P0 = 0** (P1/P2 unchanged from pre-existing `_maintenance`/archive drift).
- **Plan checklist:** Phase **G** marked complete in [`2026-doc-cleanup-plan.md`](./2026-doc-cleanup-plan.md).

### 2026-04-30 — Phase H (Builder)

- **Plans:** Added [`docs/research/2026-04-05-edit-page-completion-ux.md`](../../research/2026-04-05-edit-page-completion-ux.md) so [`2026-04-05-edit-page-completion-guidance.md`](../../plans/2026-04-05-edit-page-completion-guidance.md) `research:` resolves; wizard/onboarding plans already had valid `audit:` / `research:` targets. [`2026-04-29-ownership-percent-resurfacing-plan.md`](../../plans/2026-04-29-ownership-percent-resurfacing-plan.md) — clickable canonical links (`../…`).
- **Proposals:** Shipped pointers + path fixes — [`refinance-payoff-proposal.md`](../../proposals/refinance-payoff-proposal.md), [`testing-implementation-plan.md`](../../proposals/testing-implementation-plan.md), [`test-hardening-phase-1-2-plan.md`](../../proposals/test-hardening-phase-1-2-plan.md).
- **Workspace:** [`claudeCode/README.md`](../../../../claudeCode/README.md) at `RealEstateProject/claudeCode/` (historical index → `RealEstatePortfolio/docs/`). **No new** `docs/decisions/*` (insights naming etc. already covered in roadmap / handoffs).
- **Link checker:** `node docs/process/_maintenance/check-doc-links.mjs` from `RealEstatePortfolio/` — **P0 = 0**.
- **Plan checklist:** Phase **H** marked complete in [`2026-doc-cleanup-plan.md`](./2026-doc-cleanup-plan.md).

### 2026-04-30 — Phase I (Builder)

- **Agent onboarding:** [`docs/cursor-agent-setup.md`](../../cursor-agent-setup.md) — “Other focused audits” defers to [`docs/audits/README.md`](../../audits/README.md); monorepo **skills** note (`RealEstateProject/.cursor/skills/`); hub table row for [`AVAILABLE_AGENTS.md`](../AVAILABLE_AGENTS.md).
- **`AVAILABLE_AGENTS.md`:** [`docs/process/AVAILABLE_AGENTS.md`](../AVAILABLE_AGENTS.md) — rule ↔ process map; links from [`docs/tasks-tools-expansion.md`](../../tasks-tools-expansion.md), [`docs/plans/2026-04-09-audit-remediation-plan.md`](../../plans/2026-04-09-audit-remediation-plan.md); `tasks-tools-expansion` skills paths corrected to workspace.
- **Process ↔ rules:** `*`-audit-process docs + `math-logic-audit.md` → `.cursor/rules/*-audit-agent.mdc`; [`documentation-audit-agent.mdc`](../../../.cursor/rules/documentation-audit-agent.mdc) + [`agent-governance-audit-agent.mdc`](../../../.cursor/rules/agent-governance-audit-agent.mdc) References link back to process + integrity checklist.
- **Governance:** [`agent-governance-audit-process.md`](../agent-governance-audit-process.md) — Cursor rule line + **Recurring command integrity** → [`command-integrity-check.md`](../command-integrity-check.md).
- **Setup:** [`docs/setup/ai-process-workflow-setup.md`](../../setup/ai-process-workflow-setup.md) — **Workspace skills (Veld UI)** section.
- **Link checker:** `node docs/process/_maintenance/check-doc-links.mjs` from `RealEstatePortfolio/` — **P0 = 0**.
- **Plan checklist:** Phase **I** marked complete in [`2026-doc-cleanup-plan.md`](./2026-doc-cleanup-plan.md).

### 2026-04-30 — Phase J (Builder)

- **Automation:** **`docs:linkcheck`** and **`docs:metrics`** added to [`package.json`](../../../package.json) (portfolio root) and [`app/package.json`](../../../app/package.json).
- **Helper:** [`generate-metrics-snapshot.mjs`](./generate-metrics-snapshot.mjs) — Vitest-aligned globs, regex **approx** case counts, collapsible **`app/app/`** route list (`page.tsx` / `route.ts`).
- **Maintenance doc:** [`documentation-maintenance.md`](../documentation-maintenance.md) — § Metrics snapshots, § Doc link crawl, § **CI gate (optional)** (`docs:linkcheck` on PRs touching `docs/**` or weekly manual).
- **Link checker:** `check-doc-links.mjs` **unchanged**; re-run from `RealEstatePortfolio/` — **P0 = 0**.
- **Plan checklist:** Phase **J** marked complete in [`2026-doc-cleanup-plan.md`](./2026-doc-cleanup-plan.md).

### 2026-04-30 — Phase K (Builder)

- **Link crawl:** `node docs/process/_maintenance/check-doc-links.mjs` → [`_link-report-raw.json`](./_link-report-raw.json); **`counts.P0 = 0`**, P1 = 14, P2 = 30, total = 44. [`2026-doc-cleanup-link-report.md`](./2026-doc-cleanup-link-report.md) top section + Phase K metadata; removed spurious `](seo/)` markdown fragments in historical P1 bullets.
- **Synthesis:** [`2026-04-30-audit-synthesis.md`](../../audits/synthesis/2026-04-30-audit-synthesis.md) — Business/valuation doc bullets + Documentation Schedule bundle marked done per cleanup Phases C–H,K; **Governance** Schedule row left open for `agent-governance-audit-agent.mdc` step 1.
- **Maintenance:** [`documentation-maintenance.md`](../documentation-maintenance.md) — quarterly link check, two-file rule, metrics, command integrity, `_maintenance/` log convention.
- **Plan checklist:** Phase **K** marked complete in [`2026-doc-cleanup-plan.md`](./2026-doc-cleanup-plan.md).

---

## Appendix — Phase K (final verification)

### Phase K spot sample (stratified)

| Path | Note |
|------|------|
| `docs/README.md` | Looks current — 2026-04-30 synthesis pointer; process list includes mobile audit process. |
| `docs/audits/synthesis/README.md` | Looks current — latest run + supplemental one-liner. |
| `docs/cursor-agent-setup.md` | Looks current — workspace skills + audits README deferral. |
| `docs/reference/roadmap.md` | Looks current — App Router inventory + cron footnote. |
| `docs/reference/product-overview.md` | Looks current — aligns with Phase D route narrative. |
| `docs/reference/mvp-spec.md` | Looks current — payments / surfaces wording post Phase D. |
| `docs/reference/engineering-spec.md` | Looks current — maintenance cross-links. |
| `docs/reference/valuation-brief.md` | Minor drift noted — §10 activation still tied to PM/analytics reconcile (open question in this log). |
| `docs/qa/README.md` | Minor drift noted — index table still says “Overview & Details” while matrix doc describes scroll/drawer. |
| `docs/qa/property-flow-regression-matrix.md` | Looks current — scroll + edit drawer, mobile tabs. |
| `docs/qa/mobile-shell-verification.md` | Looks current — `app/app` paths. |
| `docs/qa/test-infrastructure-review.md` | Looks current — ~85 files / ~600+ tests, CI. |
| `docs/archive/README.md` | Looks current — live pointers to `tasks`, `roadmap`, `plans`. |
| `docs/archive/plans/README.md` | Looks current — active vs archived guidance. |
| `docs/archive/launch/paid-ads-readouts/README.md` | Minor drift noted — `../../launch/` links flagged P2 by crawler (archive-relative). |
| `docs/audits/README.md` | Looks current — lane table + bookmark redirects. |
| `docs/audits/synthesis/2026-04-30-audit-synthesis.md` | Looks current — Schedule/Business doc cleanup markers updated Phase K. |
| `docs/audits/documentation/2026-04-30-documentation-audit.md` | Looks current — hub / governance narrative for this run. |
| `docs/audits/security/2026-04-30-security-audit.md` | Looks current — CSP / rate-limit follow-ups. |
| `docs/audits/feature/README.md` | Looks current — reading order + mobile report naming. |

### Phase K program summary

- **P0:** **0** in final `_link-report-raw.json` — hub navigation targets pass checker.
- **P1/P2:** Accepted with documented limitations (workspace paths, `app/` dirs without README, archive `docs/`\-prefix heritage).
- **Audit synthesis:** Documentation-heavy Schedule row and consolidated Governance/Documentation items closed where addressed by Phases C–K; **one** Governance checkbox remains (`agent-governance-audit-agent.mdc` step 1).
- **Handoff:** Operators use [`docs/process/documentation-maintenance.md`](../documentation-maintenance.md) for recurring tasks.

Prefer new dated log for next mega-cleanup.