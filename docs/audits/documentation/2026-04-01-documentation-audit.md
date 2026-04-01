# Documentation Audit — 2026-04-01

## Executive summary

- **Overall health:** The documentation system is in good shape. All five task candidates from the 2026-03-31 documentation audit are confirmed resolved (synthesis README link, main README synthesis pointer, command-integrity-check Mobile experience row, ai-process-workflow-setup optional rule list, cursor-agent-setup SEO row). Core policy docs, setup docs, process docs, and the audit governance infrastructure are accurate and internally consistent.
- **Top risk:** Eight implemented proposal docs remain in `docs/proposals/` rather than `docs/archive/proposals/`. The add-property experience overhaul (Epics A–G) and testing hardening Phase 1–2 plan are all marked Done in the roadmap and tasks.md but have not been archived. This creates a false active signal in the proposals folder and diverges from the established archive pattern.
- **Secondary risk:** `docs/internal/` has grown to eight docs but only two are listed in `docs/README.md`'s Internal section. Key references used in active tasks (`billing-matrix.md`, `api-list-contract.md`) are undiscoverable from the main index.
- **Recommendation:** One focused doc hygiene pass — archive implemented proposals, add missing internal docs to the README index, and move the persistent launch readout artifacts. No code changes required.

---

## Severity-ranked findings

### Critical

- None.

### High

- **Unarchived implemented proposal docs** — `docs/proposals/` contains eight docs for features fully marked as complete: `epic-a-discovery.md`, `add-property-experience-overhaul.md`, `epic-c-entry-qa.md`, `epic-d-entry-qa.md`, `epic-e-entry-qa.md`, `epic-f-overview-qa.md`, `epic-g-regression-matrix.md`, and `test-hardening-phase-1-2-plan.md`. The roadmap (`docs/reference/roadmap.md` §Completed) lists "Add-property experience overhaul (Epics A–G)" as Done; Testing hardening Phases 1–3 are all checked off in `docs/tasks.md`. These sit next to active proposals (`refinance-payoff-proposal.md`, `testing-implementation-plan.md`), sending a misleading signal about what is still "proposed." The archive convention is established at `docs/archive/proposals/` (README there lists seven implemented proposals). — `docs/proposals/`, `docs/archive/proposals/README.md`, `docs/reference/roadmap.md` §Completed, `docs/tasks.md` §Testing hardening Phases 1–3.

### Medium

- **`docs/internal/` discoverability gap** — `docs/README.md` Internal section lists only `project-grounding.md` and `demo-preparation-guide.md`, but `docs/internal/` contains six additional docs: `billing-matrix.md`, `api-list-contract.md`, `stripe-webhook-posthog-idempotency.md`, `effective-tier-analytics.md`, `differentiator-value-add-analysis.md`, `ai-operations-efficiency-analysis.md`. The first two are actively referenced in `docs/tasks.md` and `docs/internal/billing-matrix.md` was a 2026-03-31 synthesis deliverable (Phase 8). A builder or PM scanning the main README cannot discover these without knowing to look in `docs/internal/` directly. — `docs/README.md` §Internal vs `docs/internal/` directory listing.

- **Launch folder archive candidates (carry-over from 2026-03-31 audit)** — Four date-stamped paid-ads campaign artifacts remain in `docs/launch/` after being flagged as Low in the 2026-03-31 documentation audit: `paid-ads-readout-2026-03-30-round1.md`, `paid-ads-readout-2026-03-30-round1-2.md`, `paid-ads-readout-2026-03-30-round2-variant.md`, and `paid-ads-round2-search-ops-2026-03-30.md`. After campaign close, these increase folder noise alongside evergreen runbooks. Elevated from Low because the previous audit flagged them and no archiving occurred. — `docs/launch/` directory.

- **Same-day documentation audit reruns from 2026-03-30 not cleaned up (carry-over)** — Five files from 2026-03-30 persist in `docs/audits/documentation/`: `2026-03-30-documentation-audit.md` and `-2` through `-5`. Flagged as Low in the 2026-03-31 audit; escalated to Medium because these continue to accumulate and the folder now has six 2026-03-30 entries plus one 2026-03-31 entry (this audit will add another). The naming convention is correct, but the older same-day reruns add noise once PM has picked the canonical report. — `docs/audits/documentation/`.

### Low

- **`docs/policies/` unlisted entries in README (carry-over)** — `calculator-metric-tones.md` and `csp-rollout.md` exist in `docs/policies/` but are not listed in `docs/README.md` Policies section. `calculator-metric-tones.md` is now an active production policy (feature shipped 2026-03-31; referenced in `docs/tasks.md` §Calculator & tools). Carry-over from 2026-03-31 audit (Low). — `docs/README.md` §Policies vs `docs/policies/` directory.

- **`docs/launch/changelog-process.md` not indexed** — This file defines the changelog entry convention referenced in `app/lib/changelog-data.ts` header comment (`docs/launch/changelog-process.md`), but it is not linked from `docs/README.md` or any process index. Low risk; discoverability gap only. — `docs/launch/changelog-process.md`, `docs/README.md` §Launch, `app/lib/changelog-data.ts` line 4.

- **Architecture doc "Last reviewed" date** — `docs/architecture-and-build-practices.md` states "Last reviewed: 2026-03-28 (Phase 9D observability, public images, export rate limits)". Three significant feature batches shipped after that date (2026-03-30, 2026-03-31: calculators, portfolio print, billing/Sentry improvements, CSV import fixes). The document's content and patterns remain accurate; only the header date is stale. — `docs/architecture-and-build-practices.md` line 6.

- **`docs/README.md` Process section omits `mobile-experience-audit-process.md`** — The docs/README.md Process section lists all audit process docs except `mobile-experience-audit-process.md`. This was added as an active audit lane in the 2026-03-31 audit fixes but was not back-filled into the main README's process listing. Discoverability gap only; the file is linked from `docs/audits/README.md`. — `docs/README.md` §Process vs `docs/process/mobile-experience-audit-process.md`, `docs/audits/README.md`.

---

## Evidence reviewed

- **Process & template:** `docs/process/documentation-audit-process.md`, `docs/process/audit-report-template.md`, `docs/process/command-integrity-check.md`, `docs/process/full-audit-synthesis.md` (partial).
- **Indices:** `docs/README.md`, `docs/audits/README.md`, `docs/audits/synthesis/README.md`, `docs/audits/documentation/README.md`.
- **Key policy docs:** `docs/architecture-and-build-practices.md`, `docs/policies/ownership-metrics.md`, `docs/policies/analytics-math-policy.md`, `docs/internal/billing-matrix.md`, `docs/setup/manual-steps.md`.
- **Active task state:** `docs/tasks.md` (full read), `docs/audits/synthesis/2026-03-31-audit-synthesis.md` (Documentation & Governance section — confirmed task candidates checked off).
- **Changelog vs shipped:** `app/lib/changelog-data.ts` (full read; cross-checked with `docs/tasks.md` §New calculators, §Full audit remediation phases 1–8).
- **Directory listings:** `docs/proposals/`, `docs/internal/`, `docs/launch/`, `docs/audits/documentation/`, `docs/archive/proposals/`, `docs/reference/`, `docs/policies/`, `docs/qa/`, `docs/setup/`, `docs/process/`.
- **Version/freshness check:** `app/package.json` — Next.js `16.1.6`, React 19 confirmed; architecture doc "Next.js 16, React 19" is accurate.
- **Confirmed resolved from 2026-03-31 audit:** (1) Synthesis README dead link — fixed to `../../../.cursor/rules/documentation-audit-agent.mdc`. (2) `docs/README.md` latest synthesis pointer — now `2026-03-31-audit-synthesis.md`. (3) `command-integrity-check.md` Mobile experience row — confirmed present. (4) `ai-process-workflow-setup.md` mobile-experience-audit-agent.mdc — confirmed in optional rules list. (5) `cursor-agent-setup.md` SEO rule row — confirmed present.
- **Assumptions / limits:** Link resolution was done by directory listing and file-existence checks, not end-to-end machine validation. Launch folder was sampled; not every file in every sub-folder was read in full.

---

## Risk & impact assessment

- **Business impact:** None of these findings affect runtime or user-facing behavior. All risks are operational: slower onboarding, PM/builder confusion about what is active vs done, and missed discoverability of key internal governance docs.
- **Likelihood of drift:** High — without archiving implemented proposals, the `docs/proposals/` folder will continue to grow as more features ship. The internal docs discoverability gap will worsen as more internal reference docs are created without being added to the main README.
- **Exposure window:** The carry-over Medium findings (launch folder, same-day reruns) demonstrate that unfixed Low findings from one cycle persist and escalate. The proposed archive pass is low-risk and bounded.

---

## Recommendations (prioritized)

1. **Archive implemented proposal docs** — Move the eight completed-feature docs from `docs/proposals/` to `docs/archive/proposals/` and add them to `docs/archive/README.md`. Candidates: `epic-a-discovery.md`, `add-property-experience-overhaul.md`, `epic-c-entry-qa.md`, `epic-d-entry-qa.md`, `epic-e-entry-qa.md`, `epic-f-overview-qa.md`, `epic-g-regression-matrix.md`, `test-hardening-phase-1-2-plan.md`. Verify no active `docs/tasks.md` cross-reference before moving.
2. **Extend `docs/README.md` Internal section** — Add the six unlisted `docs/internal/` docs; at minimum `billing-matrix.md` and `api-list-contract.md` (actively used in builder workflow). Group with a brief description ("Commercial & API governance") to distinguish from human/project-context docs.
3. **Archive dated launch readout artifacts** — Move `paid-ads-readout-2026-03-30-round1.md`, `...-round1-2.md`, `...-round2-variant.md`, and `paid-ads-round2-search-ops-2026-03-30.md` to `docs/archive/` or a `docs/launch/archive/` subfolder per the existing archive pattern.
4. **Clean up `docs/audits/documentation/` same-day reruns** — After PM selects canonical 2026-03-30 report (or confirms `-5` is final), optionally archive or delete the superseded suffixes to keep the folder readable.
5. **Add missing policy and process links to `docs/README.md`** — Add `docs/policies/calculator-metric-tones.md` and `docs/policies/csp-rollout.md` to Policies section; add `docs/process/mobile-experience-audit-process.md` to Process section; add `docs/launch/changelog-process.md` to Launch section. One line each.

---

## Task candidates

- [ ] Move completed epic/proposal docs from `docs/proposals/` to `docs/archive/proposals/`; update `docs/archive/README.md`.
- [ ] Add `billing-matrix.md`, `api-list-contract.md`, and remaining `docs/internal/` docs to `docs/README.md` §Internal.
- [ ] Archive/move dated paid-ads readout files from `docs/launch/` per archive convention.
- [ ] Add `calculator-metric-tones.md`, `csp-rollout.md`, `mobile-experience-audit-process.md`, and `changelog-process.md` to appropriate `docs/README.md` sections.

---

## Re-test checklist

- [ ] Confirm `docs/proposals/` contains only active (not-yet-built) proposals after archive pass.
- [ ] Confirm `docs/README.md` §Internal links resolve to existing files after update.
- [ ] Confirm `docs/archive/README.md` lists all newly moved proposals.
- [ ] No code changes made; `npm run check` not required for doc-only fixes.

---

## Next trigger and cadence

- **Trigger:** Large doc reorg, new audit lane, new internal governance doc added, or repeated stale-reference reports from builders/PM.
- **Recommended next run date/window:** 2026-05-01 (monthly cadence per `docs/audits/README.md` Documentation lane row), or earlier if a significant doc restructuring pass is made.
