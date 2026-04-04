# Documentation Audit — 2026-04-03 (second run)

## Executive summary

- **Overall:** The **synthesis index** and **doc hub** are now aligned on **2026-04-03** consolidated follow-ups; **`docs/cursor-agent-setup.md`** documents **`seo-audit-agent.mdc`** in the rules table and links SEO process/output rows. Morning Schedule items are **partially** closed: synthesis pointer is fixed; SEO rule is documented in the main inventory; **design governance** is **not** fully reconciled because **`docs/design/design-spec-2026.md`** exists as canonical v3 while **`docs/README.md`** and **`docs/policies/design-spec.md`** still frame older sources as primary.
- **Top risk:** **Stale asset and screenshot references** after embedded mockups shipped: multiple design/plan docs still cite **`/ScreenDashboard.png`** (and related PNGs) as if present, and **`docs/plans/2026-04-03-landing-mobile-cta-plan.md`** still prescribes PNG capture — **in tension** with the embedded-mockup approach documented in lane audits and the **`2026-04-03-embedded-mockups-plan.md`** inventory.
- **Broken references (remaining):** **`docs/visual-assets-guide.md`** footer still uses `(design-spec.md)` without `policies/`; **`docs/archive/proposals/benchmarking-proposal.md`** line 148 still links `docs/roadmap.md` (does not resolve from archive).
- **Recommendation:** Update **`docs/README.md`** Reference block to lead with **`design-spec-2026.md`** (or add explicit deprecation/redirect on **`policies/design-spec.md`** per sibling lane findings), refresh **`design-brief-2026.md`** metadata line to match its superseded banner, sweep PNG references in superseded guides and active plans, and fix the two confirmed broken links.

## Severity-ranked findings

### Critical

- None.

### High

- **Design source-of-truth split across four surfaces** — **`docs/design/design-spec-2026.md`** (v3.0, 2026-04-03) states it is **canonical** and supersedes phased briefs/guides. **`docs/README.md`** still lists **[Design spec](policies/design-spec.md)** as “**current** UI tokens” and **[Design brief 2026](design/design-brief-2026.md)** as “**future** … not yet implemented,” without naming **`design-spec-2026.md`**. **`docs/policies/design-spec.md`** (v2.0, 2026-03-19) remains **Active** and instructs consulting **`design-brief-2026.md`** first for superseded sections — conflicting with the brief’s own **SUPERSEDED** banner and **`design-spec-2026`** consolidation. **`docs/design/design-brief-2026.md`** opens with **SUPERSEDED** but still shows **`Status: Active — supersedes relevant visual sections`** in the header block. — **Risk:** Builders and audit agents follow the wrong file for nav, tokens, and marketing patterns. — **Evidence:** [`docs/README.md`](../../README.md) L17–18; [`docs/policies/design-spec.md`](../../policies/design-spec.md) L7–8; [`docs/design/design-spec-2026.md`](../../design/design-spec-2026.md) L5–8; [`docs/design/design-brief-2026.md`](../../design/design-brief-2026.md) L1–7.

- **Post-mockup documentation drift (PNG paths)** — Product marketing screenshots were removed in favor of React mockups (see [`docs/audits/code/2026-04-03-code-audit-2.md`](../code/2026-04-03-code-audit-2.md) / performance audit). Docs still reference deleted public PNGs: [`docs/design/design-brief-2026.md`](../../design/design-brief-2026.md) L313; [`docs/design/implementation-guide-2026.md`](../../design/implementation-guide-2026.md) L1042; [`docs/design/implementation-guide-2026-phase2.md`](../../design/implementation-guide-2026-phase2.md) L1416–1418; plan [`docs/plans/2026-04-03-landing-mobile-cta-plan.md`](../../plans/2026-04-03-landing-mobile-cta-plan.md) § Item 4 (lines 87–101) assumes **capture + `public/` PNG** and `ScreenDashboard.png` naming. — **Risk:** Execution guides and open plans contradict shipped architecture and mis-instruct future work.

### Medium

- **Broken markdown target in visual assets guide footer** — [`docs/visual-assets-guide.md`](../../visual-assets-guide.md) L237 uses `[design-spec.md](design-spec.md)`; from `docs/`, that implies `docs/design-spec.md`, which does not exist (canonical policy file is [`docs/policies/design-spec.md`](../../policies/design-spec.md), and consolidated spec is [`docs/design/design-spec-2026.md`](../../design/design-spec-2026.md)). — **Risk:** Broken link in a reference footer.

- **Broken markdown target in archived benchmarking proposal** — [`docs/archive/proposals/benchmarking-proposal.md`](../../archive/proposals/benchmarking-proposal.md) L148: `[Rent gap email](docs/roadmap.md)` does not resolve relative to the archive path (compare fixed header link at L3 to [`../../reference/roadmap.md`](../../reference/roadmap.md)). — **Risk:** Dead link; same issue as morning audit (unfixed).

- **`docs/cursor-agent-setup.md` — incomplete clone checklist and summary vs full rule set** — The rules table includes **`seo-audit-agent.mdc`** (L37) and SEO process/folder rows (L71–72). **Step 1** file bullets (L92–107) **omit** `seo-audit-agent.mdc` when listing audit rules to copy. The closing **“Other focused audits”** paragraph (L146) names seven lanes and defers to **`docs/audits/README.md`** but does **not** mention mobile experience, SEO, documentation, or legal lanes by name. — **Risk:** Coworker setup misses files or underuses lanes despite “14 lanes” full-audit messaging.

- **`docs/tasks.md` roadmap table marker** — § **Roadmap priority** still says **last reviewed 2026-03-30** while synthesis and audits have advanced through **2026-04-03**. — **Risk:** Readers treat priority table as stale. — **Evidence:** [`docs/tasks.md`](../../tasks.md) L21.

- **Doc hub omits `docs/plans/` and canonical design-spec-2026** — No **`plans/`** link in [`docs/README.md`](../../README.md); three dated plans live under [`docs/plans/`](../../plans/) with no folder README. **`design-spec-2026.md`** is not linked from the hub Reference list. — **Risk:** Discoverability for PM/builder handoffs.

### Low

- **`docs/design/design-spec-2026.md` internal accuracy** — Sibling **code audit** flagged §13.6 PricingCards snippet (`bg-card/95`) vs live `pricing-cards.tsx` (`bg-card`) — documentation precision issue, not app code. — **Evidence:** [`docs/audits/code/2026-04-03-code-audit-2.md`](../code/2026-04-03-code-audit-2.md) L30, L120.

- **Same-day documentation audit artifacts** — This report is the **second** 2026-04-03 documentation audit; consistent with process for parallel/full runs. — **Risk:** Noise only if readers confuse filenames; mitigated by “-2” suffix and synthesis cross-links.

## Evidence reviewed

- [`docs/process/documentation-audit-process.md`](../../process/documentation-audit-process.md), [`docs/process/audit-report-template.md`](../../process/audit-report-template.md)
- Morning audit: [`docs/audits/documentation/2026-04-03-documentation-audit.md`](2026-04-03-documentation-audit.md)
- [`docs/audits/synthesis/README.md`](../../audits/synthesis/README.md); confirmed [`docs/audits/synthesis/2026-04-03-audit-synthesis.md`](../../audits/synthesis/2026-04-03-audit-synthesis.md) exists
- [`docs/README.md`](../../README.md); [`docs/cursor-agent-setup.md`](../../cursor-agent-setup.md)
- [`docs/visual-assets-guide.md`](../../visual-assets-guide.md); [`docs/archive/proposals/benchmarking-proposal.md`](../../archive/proposals/benchmarking-proposal.md)
- [`docs/design/design-brief-2026.md`](../../design/design-brief-2026.md), [`docs/design/design-spec-2026.md`](../../design/design-spec-2026.md), [`docs/policies/design-spec.md`](../../policies/design-spec.md)
- [`docs/design/implementation-guide-2026.md`](../../design/implementation-guide-2026.md), [`docs/design/implementation-guide-2026-phase2.md`](../../design/implementation-guide-2026-phase2.md) (PNG reference spots)
- Plans: [`docs/plans/2026-04-03-embedded-mockups-plan.md`](../../plans/2026-04-03-embedded-mockups-plan.md), [`docs/plans/2026-04-03-landing-mobile-cta-plan.md`](../../plans/2026-04-03-landing-mobile-cta-plan.md), [`docs/plans/2026-04-03-pricing-page-premium-plan.md`](../../plans/2026-04-03-pricing-page-premium-plan.md)
- [`docs/reference/roadmap.md`](../../reference/roadmap.md) (sampled §1–2, shipped markers)
- [`docs/tasks.md`](../../tasks.md) (roadmap priority header)
- Grep: `ScreenDashboard|ScreenMortgage|ScreenDeal` under `docs/**/*.md`
- Lane context: [`docs/audits/code/2026-04-03-code-audit-2.md`](../code/2026-04-03-code-audit-2.md), [`docs/audits/performance-cost/2026-04-03-performance-cost-audit-2.md`](../performance-cost/2026-04-03-performance-cost-audit-2.md)
- **Limits:** Not an exhaustive crawl of every `docs/**/*.md` link; directory-only targets and web URLs not validated.

## Risk & impact assessment

- **Unresolved design-doc hierarchy** affects **every UI and marketing doc consumer** until the hub and **`policies/design-spec.md`** explicitly defer to **`design-spec-2026.md`** (or equivalent deprecation path).
- **PNG references in plans and historical guides** create **medium** likelihood of wrong implementation tasks (reintroducing screenshots or wrong acceptance criteria).
- **Broken links** in **`visual-assets-guide`** and **benchmarking archive** are **low** product impact but **high** hygiene signal and quick fixes.

## Recommendations (prioritized)

1. **Reconcile hub + policy + consolidated spec** — Update [`docs/README.md`](../../README.md) Reference lines to prioritize [`docs/design/design-spec-2026.md`](../../design/design-spec-2026.md) as the canonical design language doc; add a deprecation/supersession pointer at the top of [`docs/policies/design-spec.md`](../../policies/design-spec.md) (or narrow its role per feature-ux audit suggestions). Align [`docs/design/design-brief-2026.md`](../../design/design-brief-2026.md) status metadata with the superseded banner (remove contradictory “Active / supersedes”).
2. **Sweep PNG / mockup documentation** — Replace or annotate references to **`/ScreenDashboard.png`**, **`/ScreenMortgage.png`**, **`/ScreenDeal.png`** in superseded guides and in [`docs/plans/2026-04-03-landing-mobile-cta-plan.md`](../../plans/2026-04-03-landing-mobile-cta-plan.md) Item 4 so they describe **`DashboardMockup`** (and siblings) / embedded frames instead of static files; mark [`docs/plans/2026-04-03-embedded-mockups-plan.md`](../../plans/2026-04-03-embedded-mockups-plan.md) as completed or archive if execution is done.
3. **Fix broken links:** [`docs/visual-assets-guide.md`](../../visual-assets-guide.md) L237 → correct relative targets for design spec(s); [`docs/archive/proposals/benchmarking-proposal.md`](../../archive/proposals/benchmarking-proposal.md) L148 → `../../reference/roadmap.md` (or equivalent).
4. **Tighten [`docs/cursor-agent-setup.md`](../../cursor-agent-setup.md)** — Add **`seo-audit-agent.mdc`** to the Step 1 clone list; optionally expand the “Other focused audits” sentence to name mobile, SEO, documentation, and legal or state “all lanes in `docs/audits/README.md`.”
5. **Optional discoverability** — Link **`docs/plans/`** from the doc hub or add `docs/plans/README.md` indexing 2026-04-03 plans; bump **`docs/tasks.md`** “last reviewed” when PM next touches roadmap priorities.
6. **Optional spec precision** — Align [`docs/design/design-spec-2026.md`](../../design/design-spec-2026.md) §13.6 PricingCards class list with live code if the code audit finding remains accurate.

## Task candidates (optional)

- [ ] Update `docs/README.md` + `docs/policies/design-spec.md` + `docs/design/design-brief-2026.md` metadata for single canonical `design-spec-2026.md` story.
- [ ] Remove or rewrite PNG path references in `design-brief-2026.md`, `implementation-guide-2026*.md`, and `2026-04-03-landing-mobile-cta-plan.md` Item 4; align `2026-04-03-embedded-mockups-plan.md` status with shipped state.
- [ ] Fix `visual-assets-guide.md` and `archive/proposals/benchmarking-proposal.md` links.
- [ ] Add `seo-audit-agent.mdc` to `docs/cursor-agent-setup.md` Step 1 list; optionally clarify “other audits” paragraph.
- [ ] Refresh `docs/tasks.md` roadmap “last reviewed” date when priorities are next confirmed.

## Re-test checklist

- [ ] After hub/policy updates, open `docs/README.md` links to design docs in order: consolidated spec → policies/spec → brief (historical).
- [ ] Grep `docs/` for `ScreenDashboard|ScreenMortgage|ScreenDeal` and confirm only intentional historical/audit mentions remain.
- [ ] Click-test `visual-assets-guide.md` footer and benchmarking proposal L148 from the repo file tree.
- [ ] `npm run check` — only if application code changes (not required for doc-only fixes).

## Next trigger and cadence

- **Trigger:** After next full-audit synthesis, after major `docs/design/` consolidation edits, or when marketing implementation changes (mockups, landing, pricing).
- **Recommended next documentation audit:** Within **one month** or after the design-doc reconciliation tasks above land.
