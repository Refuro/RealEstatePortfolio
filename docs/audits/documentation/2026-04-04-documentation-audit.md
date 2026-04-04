# Documentation Audit — 2026-04-04

## Executive summary

- **Lane wiring and governance:** All **14** audit lanes have matching process docs under `docs/process/`, `.cursor/rules/*-audit-agent.mdc` files (plus `full-audit-agent.mdc`), and the **`docs/audits/README.md`** table. **`docs/process/command-integrity-check.md`** documents **14** lanes and matches the README mapping.
- **Improvements since [2026-04-03-documentation-audit-2.md](./2026-04-03-documentation-audit-2.md):** **`docs/policies/design-spec.md`** and **`docs/design/design-brief-2026.md`** now clearly defer to **`docs/design/design-spec-2026.md`**. **`docs/visual-assets-guide.md`** footer links resolve **`design/design-spec-2026.md`**. **`docs/cursor-agent-setup.md`** Step 1 includes **`seo-audit-agent.mdc`** (Schedule item S25 completed).
- **Top gaps:** **`docs/README.md`** still lists **policies/design-spec** as “**current**” without elevating **`design/design-spec-2026.md`**, conflicting with the policy file’s own canonical rule. Archived plans under **`docs/archive/plans/`** (moved from **`docs/plans/`** 2026-04-05) may still use markdown targets like **`(docs/brainstorms/...)`**, which resolve incorrectly unless rewritten to **`../brainstorms/...`**. **`docs/process/full-audit-synthesis.md`** §4 embedded template links **`[docs/tasks.md](../../tasks.md)`** — wrong relative path from **`docs/process/`** (points at repo root).
- **Recommendation:** Treat follow-ups as **documentation and process hygiene** (hub copy, relative links in plans/archives, synthesis template). **No application code changes** are required for this audit’s findings.

## Severity-ranked findings

### Critical

- None. (Broken workflow links in docs do not affect production runtime.)

### High

- **`docs/README.md` — design source-of-truth vs hub copy** — Reference block still describes **[Design spec](policies/design-spec.md)** as “**current** UI tokens” and **[Design brief 2026](design/design-brief-2026.md)** as “**future** … not yet implemented,” with **no** prominent link to **`[Design spec 2026](design/design-spec-2026.md)`**. **`docs/policies/design-spec.md`** (L7–8) already states **`design-spec-2026.md`** is canonical for new UI work. — **Risk:** Readers use the hub ordering instead of the stated hierarchy. — **Evidence:** [`docs/README.md`](../../README.md) L16–18; [`docs/policies/design-spec.md`](../../policies/design-spec.md) L7–8.

- **`docs/plans/2026-04-04-*-plan.md` — broken `docs/...` link targets** — Footer “Origin / related” links use paths like **`(docs/brainstorms/...)`**, **`(docs/design/...)`**, **`(docs/proposals/...)`** from files under **`docs/plans/`**. Those resolve as **`docs/plans/docs/...`** (missing). — **Risk:** Active planning docs have dead cross-links. — **Evidence:** [`docs/archive/plans/2026-04-04-property-detail-revamp-plan.md`](../../archive/plans/2026-04-04-property-detail-revamp-plan.md) L719–722; [`docs/archive/plans/2026-04-04-refinance-payoff-insights-plan.md`](../../archive/plans/2026-04-04-refinance-payoff-insights-plan.md) L731–736.

- **`docs/process/full-audit-synthesis.md` — wrong `tasks.md` path in §4 template** — Embedded template uses **`[docs/tasks.md](../../tasks.md)`**, which from **`docs/process/`** targets **repo-root** `tasks.md` (not present). §3.5 correctly uses **[`docs/tasks.md`](../tasks.md)**. — **Risk:** PMs copying the synthesis skeleton open a non-existent path. — **Evidence:** [`docs/process/full-audit-synthesis.md`](../../process/full-audit-synthesis.md) L73 vs L170.

### Medium

- **`docs/archive/proposals/benchmarking-proposal.md` — broken roadmap link** — L148: `[Rent gap email](docs/roadmap.md)` does not resolve from **`docs/archive/proposals/`** (needs e.g. **`../../reference/roadmap.md`**). — **Evidence:** [`docs/archive/proposals/benchmarking-proposal.md`](../../archive/proposals/benchmarking-proposal.md) L148.

- **`docs/archive/launch/paid-ads-readouts/README.md` — wrong depth to evergreen launch docs** — Uses **`../../launch/`**; from **`docs/archive/launch/paid-ads-readouts/`** that resolves under **`docs/archive/launch/`**, not **`docs/launch/`**. — **Evidence:** [`docs/archive/launch/paid-ads-readouts/README.md`](../../archive/launch/paid-ads-readouts/README.md) L3, L12.

- **`docs/archive/proposals/add-property-experience-overhaul.md` — wrong depth to `qa/`** — L3 and L207 use **`../qa/...`**, which resolves under **`docs/archive/qa/`** (missing). Correct path from **`docs/archive/proposals/`** is **`../../qa/...`**. — **Evidence:** [`docs/archive/proposals/add-property-experience-overhaul.md`](../../archive/proposals/add-property-experience-overhaul.md) L3, L207.

- **`docs/tasks.md` — stale roadmap “last reviewed”** — § **Roadmap priority** still says **last reviewed 2026-03-30** while the doc hub links **2026-04-03** synthesis and April workstreams have progressed. — **Evidence:** [`docs/tasks.md`](../../tasks.md) L21.

- **`docs/README.md` — Process section omits Mobile experience lane process** — QA links **[Mobile experience audit](qa/mobile-experience-audit.md)** but the Process list has no **[Mobile experience audit process](process/mobile-experience-audit-process.md)** row (other lanes have both process + audit folder links in different sections). — **Evidence:** [`docs/README.md`](../../README.md) L56–79.

- **`docs/plans/` — no index and no hub link** — Twelve plan files (2026-04-02–2026-04-04) under [`docs/plans/`](../../plans/) with **no** `README.md`; **`docs/README.md`** does not link **`plans/`**. — **Risk:** Discoverability for PM/builder handoffs.

- **`docs/audits/2026-04-04-polish-gap-audit.md` — non-lane placement** — Sits at **`docs/audits/`** root beside lane folders; naming diverges from **`docs/audits/<lane>/YYYY-MM-DD-*-audit.md`**. — **Evidence:** [`docs/audits/README.md`](../README.md) naming convention; file [`docs/audits/2026-04-04-polish-gap-audit.md`](../2026-04-04-polish-gap-audit.md).

- **`docs/archive/plans/2026-04-03-landing-mobile-cta-plan.md` — Item 4 vs embedded mockups** — § Item 4 (L89–100) still describes **`ScreenDashboard.png`** capture and filename checks; product shipped **React mockups** (`DashboardMockup`, etc.). — **Risk:** Future execution follows obsolete acceptance criteria. — **Evidence:** [`docs/archive/plans/2026-04-03-landing-mobile-cta-plan.md`](../../archive/plans/2026-04-03-landing-mobile-cta-plan.md) L89–100; compare [`docs/archive/plans/2026-04-03-embedded-mockups-plan.md`](../../archive/plans/2026-04-03-embedded-mockups-plan.md).

### Low

- **Older synthesis snapshots** — [`docs/audits/synthesis/2026-04-03-audit-synthesis-2.md`](../../audits/synthesis/2026-04-03-audit-synthesis-2.md) may still list doc items later closed in **`docs/tasks.md`**; historical artifact, not current truth.

- **Markdown and `app/(app)/...` paths** — Some audit reports link routes with parentheses; unescaped `()` in markdown links can break in strict parsers. — **Risk:** Click failure in a few reports; backtick paths remain valid.

- **Same-day documentation audit files** — Multiple `2026-03-30-documentation-audit-*.md` entries are allowed per [`docs/audits/documentation/README.md`](./README.md); minor reader confusion only.

## Evidence reviewed

- [`docs/process/documentation-audit-process.md`](../../process/documentation-audit-process.md); [`docs/process/audit-report-template.md`](../../process/audit-report-template.md)
- [`docs/audits/README.md`](../README.md); [`docs/process/command-integrity-check.md`](../../process/command-integrity-check.md) — lane count and mapping table
- All 14 lane process filenames under `docs/process/` (excluding `full-audit-synthesis.md`); 14 `*-audit-agent.mdc` under `.cursor/rules/` plus `full-audit-agent.mdc`
- [`.cursor/rules/documentation-audit-agent.mdc`](../../../.cursor/rules/documentation-audit-agent.mdc); [`.cursor/rules/full-audit-agent.mdc`](../../../.cursor/rules/full-audit-agent.mdc) — 14-lane wording and paths
- [`docs/README.md`](../../README.md); [`docs/tasks.md`](../../tasks.md) (roadmap header)
- [`docs/reference/roadmap.md`](../../reference/roadmap.md) — sample §1–1a
- [`docs/policies/design-spec.md`](../../policies/design-spec.md); [`docs/design/design-brief-2026.md`](../../design/design-brief-2026.md); [`docs/visual-assets-guide.md`](../../visual-assets-guide.md)
- [`docs/cursor-agent-setup.md`](../../cursor-agent-setup.md) — Step 1 rule list
- [`docs/setup/ai-process-workflow-setup.md`](../../setup/ai-process-workflow-setup.md) — optional audit rules list
- [`docs/process/full-audit-synthesis.md`](../../process/full-audit-synthesis.md) — §3.5 vs §4 template
- Plans: [`docs/archive/plans/2026-04-04-property-detail-revamp-plan.md`](../../archive/plans/2026-04-04-property-detail-revamp-plan.md), [`docs/archive/plans/2026-04-04-refinance-payoff-insights-plan.md`](../../archive/plans/2026-04-04-refinance-payoff-insights-plan.md); [`docs/archive/plans/2026-04-03-landing-mobile-cta-plan.md`](../../archive/plans/2026-04-03-landing-mobile-cta-plan.md)
- Archives: [`docs/archive/proposals/benchmarking-proposal.md`](../../archive/proposals/benchmarking-proposal.md); [`docs/archive/launch/paid-ads-readouts/README.md`](../../archive/launch/paid-ads-readouts/README.md); [`docs/archive/proposals/add-property-experience-overhaul.md`](../../archive/proposals/add-property-experience-overhaul.md)
- Setup/runbooks sample: [`docs/setup/run-and-smoke-test.md`](../../setup/run-and-smoke-test.md); [`docs/runbooks/health-check-smoke.md`](../../runbooks/health-check-smoke.md)
- Ad hoc: [`docs/audits/2026-04-04-polish-gap-audit.md`](../2026-04-04-polish-gap-audit.md)
- Prior report: [`docs/audits/documentation/2026-04-03-documentation-audit-2.md`](./2026-04-03-documentation-audit-2.md)
- **Limits:** Not every `docs/**/*.md` link was machine-validated end-to-end; web URLs and dynamic routes not checked.

## Risk & impact assessment

- **Hub and plan/archive link quality** affects **PM, builder, and agent** workflows; wrong design ordering can cause **inconsistent UI guidance** until the README is aligned with **`design-spec-2026.md`**.
- **Synthesis template `tasks.md` bug** wastes time when drafting synthesis from the embedded example.
- **Stale `tasks.md` “last reviewed”** is **low product risk** but **medium process noise** for prioritization.

## Recommendations (prioritized)

1. **Update [`docs/README.md`](../../README.md)** — Add **`design/design-spec-2026.md`** as the primary design reference in the Reference block; adjust **`policies/design-spec.md`** and **design-brief** lines to match the policy file’s canonical wording (legacy vs historical).
2. **Fix relative links in [`docs/archive/plans/2026-04-04-property-detail-revamp-plan.md`](../../archive/plans/2026-04-04-property-detail-revamp-plan.md) and [`docs/archive/plans/2026-04-04-refinance-payoff-insights-plan.md`](../../archive/plans/2026-04-04-refinance-payoff-insights-plan.md)** — Use **`../brainstorms/...`**, **`../design/...`**, **`../proposals/...`**, etc., or a consistent repo-root convention.
3. **Fix [`docs/process/full-audit-synthesis.md`](../../process/full-audit-synthesis.md) §4** — Change the PM review line to **`[docs/tasks.md](../tasks.md)`** (or equivalent) so it matches §3.5.
4. **Repair archive links** — [`docs/archive/proposals/benchmarking-proposal.md`](../../archive/proposals/benchmarking-proposal.md) L148; [`docs/archive/launch/paid-ads-readouts/README.md`](../../archive/launch/paid-ads-readouts/README.md) (use **`../../../launch/`** for `docs/launch/`); [`docs/archive/proposals/add-property-experience-overhaul.md`](../../archive/proposals/add-property-experience-overhaul.md) (`../../qa/...`).
5. **Optional hygiene** — Add **[Mobile experience audit process](process/mobile-experience-audit-process.md)** to the Process list; add **`docs/plans/README.md`** or a **Plans** quick link; relocate or index [`docs/audits/2026-04-04-polish-gap-audit.md`](../2026-04-04-polish-gap-audit.md) from [`docs/audits/README.md`](../README.md) if it is a recurring artifact.
6. **Plans archive / refresh** — Mark **[`docs/archive/plans/2026-04-03-embedded-mockups-plan.md`](../../archive/plans/2026-04-03-embedded-mockups-plan.md)** completed or move to **`docs/archive/`**; update or archive **Item 4** in **[`docs/archive/plans/2026-04-03-landing-mobile-cta-plan.md`](../../archive/plans/2026-04-03-landing-mobile-cta-plan.md)** to describe **mockup components**, not PNG capture.
7. **Refresh [`docs/tasks.md`](../../tasks.md)** — When PM next confirms priorities, bump **Roadmap priority — last reviewed**; ensure Schedule doc rows (e.g. S26) do not describe work already shipped (benchmarking archive link may remain if still broken).

## Task candidates (optional)

Doc and governance follow-ups (promote to [`docs/tasks.md`](../../tasks.md) if approved):

- [ ] `docs/README.md` — elevate `design-spec-2026.md`; align brief/policy lines with canonical hierarchy.
- [ ] `docs/plans/2026-04-04-*-plan.md` — fix `docs/...` markdown targets to valid relative paths from `docs/plans/`.
- [ ] `docs/process/full-audit-synthesis.md` — correct `tasks.md` link in §4 embedded template.
- [ ] `docs/archive/proposals/benchmarking-proposal.md` — fix roadmap link (e.g. `../../reference/roadmap.md`).
- [ ] `docs/archive/launch/paid-ads-readouts/README.md` — fix depth to `docs/launch/` evergreen files.
- [ ] `docs/archive/proposals/add-property-experience-overhaul.md` — fix `qa/` regression matrix links to `../../qa/...`.
- [ ] `docs/tasks.md` — refresh roadmap “last reviewed” when PM confirms.
- [ ] `docs/archive/plans/2026-04-03-landing-mobile-cta-plan.md` — rewrite Item 4 for embedded mockups; optionally archive completed mockup plan.

## Re-test checklist

- [ ] After hub update, click Reference and Policies links in [`docs/README.md`](../../README.md).
- [ ] From each updated `docs/plans/2026-04-04-*.md`, verify footer “Origin / related” links open the intended files.
- [ ] Open [`docs/process/full-audit-synthesis.md`](../../process/full-audit-synthesis.md) §4 code block and confirm `tasks.md` resolves from `docs/process/`.
- [ ] Spot-check archive README and proposals under `docs/archive/` for 404s.
- [ ] `npm run check` — only when application code changes (not required for doc-only fixes).

## Next trigger and cadence

- **Trigger:** After the next **full-audit synthesis**, large **`docs/plans/`** or **`docs/README.md`** edits, or repeated **stale-reference** drift.
- **Recommended next documentation audit:** Within **one month**, or immediately after the doc-hub / plan-link batch above lands.
