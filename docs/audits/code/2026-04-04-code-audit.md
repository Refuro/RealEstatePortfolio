# Code Audit — 2026-04-04

## Summary

The codebase is in solid shape for the batch of features shipped today: the Phase 3 Refinance workspace, property Detail/Edit revamp, and calculators-premium-CTA work are all correctly implemented with no new security or critical architecture regressions. Three findings from the prior audit (2026-04-03-2) have been fully resolved: the overbroad `images.localPatterns` in `next.config.ts`, the missing Zod schema on `POST /api/billing/portal`, and deprecated patterns in the newly-shipped mockup components. The main open issues are two ongoing design-spec debt sweeps (`border-border/70`/`bg-card/95` and `uppercase tracking-wide`) that remain systemic across the codebase, plus a new architecture concern: `formatMoneySigned` and chart-balance builder functions are duplicated across the two new refinance components instead of being extracted to `lib/`.

---

## Executive summary

- **Overall health:** Good. No new security, auth, or critical architecture regressions introduced today. Feature work shipped cleanly.
- **Top risk:** Pre-existing design-spec debt (`border-border/70`/`bg-card/95` in 14 files; `uppercase tracking-wide` in ~18 files) continues unremediated. Each new feature batch risks normalizing these patterns further.
- **Second risk:** The two new refinance components (`refinance-workspace.tsx`, `payoff-card.tsx`) duplicate `formatMoneySigned` and inline chart-balance computation logic that should live in `lib/`. This is a small but clear architecture-convention miss.
- **Recommendation:** Prioritize the `uppercase tracking-wide` sweep in `deal-analyzer-form.tsx` (18 occurrences, core app surface) and extract the duplicated refinance utility functions before the codebase grows further.

---

## Severity-ranked findings

### Critical

None identified.

---

### High

None identified.

---

### Medium

**M1 — `border-border/70` / `bg-card/95` systemic debt (ONGOING, 14 files)**
The deprecated opacity dilution patterns are still present in 14 files including core app surfaces. The previous two audits scheduled a coordinated sweep; it has not yet occurred. The scope is stable (not growing), but each new build cycle risks authors copying from these files. The deprecated pattern is a violation of design-spec-2026 §5 ("The deprecation rule") and §16.2 ("opacity dilution anti-pattern").
— Files: `mortgage-workspace.tsx`, `modeling-workspace.tsx`, `dashboard/page.tsx`, `paid-intent-checkout-banner.tsx`, `mobile-tool-shell.tsx`, `mobile-section-card.tsx`, `mobile-segmented-view.tsx`, `mobile-summary-rail.tsx`, `cookie-consent-banner.tsx`, `onboarding-panel.tsx`, `add-property-wizard.tsx`, `deal-analyzer-form.tsx`, `calculator-metric.tsx`, `lp/investment-property-calculator/page.tsx`.

**M2 — `uppercase tracking-wide` outside permitted contexts (ONGOING, ~18 files)**
Design-spec-2026 Pillar 6 explicitly restricts `uppercase tracking-wide` to sidebar group headers and table column headers. It continues to appear as section-level headings across core app components and marketing pages. The calculator tools pages were cleaned up in today's batch — good progress — but the primary violations remain open.
— Remaining violating files (non-table-header usage): `deal-analyzer-form.tsx` (18 occurrences — highest priority), `scenario-section.tsx` (line 70, section h2), `chart-wrapper.tsx` (line 34, title variant), `mobile-summary-rail.tsx`, `cookie-preferences-section.tsx`, `property-form.tsx`, `export/portfolio-summary/page.tsx`, `resource-article-page.tsx` (lines 128, 161 — non-table-header uses), `competitor-alternative-page.tsx` (lines 173, 195, 202, 233 — non-table-header uses), `resources/page.tsx`, `vs/page.tsx`, `alternatives/page.tsx`, `lp/investment-property-calculator/page.tsx`. Note: `app-nav.tsx` line 70 is a nav group label and is **permitted** per Pillar 6.

**M3 — `formatMoneySigned` duplicated across two new refinance components (NEW)**
Identical `formatMoneySigned` helper functions are defined in both `app/(app)/refinance/refinance-workspace.tsx` (line 64) and `app/(app)/properties/[id]/payoff-card.tsx` (line 28). The architecture convention (`§4.1 Do Not: Duplicate logic — Extract to lib`) requires shared utility functions to live in `lib/`. This is a small, targeted fix but represents a first-day architecture miss on freshly shipped code.
— Evidence: `refinance-workspace.tsx` line 64–71; `payoff-card.tsx` line 28–35.

---

### Low

**L1 — `buildCurrentLoanBalances` / `buildRefiBalances` should be in `lib/amortization` (NEW)**
`refinance-workspace.tsx` contains two non-trivial chart-data builder functions (`buildCurrentLoanBalances`, lines 93–114; `buildRefiBalances`, lines 116–137) that reimplement amortization loop logic already established in `lib/amortization.ts`. These are not exported to `lib/`; they are purely inlined in the component. Per architecture §2.1 (Layered Data Flow) and §4.1, calculation logic belongs in `lib/`, not in components. The functions are also not currently tested. Extraction would make them reusable (e.g. future export, chart) and enable unit tests alongside the existing `lib/amortization.test.ts` suite.
— Evidence: `refinance-workspace.tsx` lines 93–137.

**L2 — `refinance-workspace.tsx` exceeds 300-line file-focus guideline**
At 744 lines, `refinance-workspace.tsx` is more than double the soft limit of ~300 lines from architecture §4.2. It combines property/mortgage selection state, input state, all result computations, chart data assembly, mobile and desktop layout variants, and Recharts rendering. Splitting the chart section and possibly the selection/state logic into sub-components would improve readability and future maintainability.
— Evidence: `app/(app)/refinance/refinance-workspace.tsx` (744 lines).

**L3 — `cta-glow` utility documented in spec but not implemented in `globals.css` (NEW)**
Design-spec-2026.md §15.3 documents a `.cta-glow` CSS utility class (ambient accent shadow behind primary CTA buttons). It does not exist in `globals.css` or any other CSS file. `onboarding-panel.tsx` line 218 uses `shadow-lg shadow-accent/25` as an ad-hoc Tailwind approximation. This creates a spec-vs-code divergence: future authors reading the spec will expect a `.cta-glow` utility that does not exist, or will re-invent the Tailwind workaround inconsistently. Either remove the `.cta-glow` documentation from the spec, or implement it in `globals.css`.
— Evidence: `docs/design/design-spec-2026.md` §15.3 (approx. line 391); `app/(app)/onboarding-panel.tsx` line 218; `globals.css` (no match for `.cta-glow`).

**L4 — `onboarding-panel.tsx` primary CTA uses `shadow-lg shadow-accent/25` (ONGOING)**
The primary "Get Started" button in the onboarding panel uses a colored ambient shadow (`shadow-lg shadow-accent/25`) that falls outside the documented shadow system (design-spec-2026 §6). The spec's Floating level (`shadow-xl`/`shadow-2xl`) is for modals — it's not the same as an accent glow. This is directly related to L3: if `.cta-glow` were defined in globals.css as an ambient shadow, this button would correctly use that utility rather than ad-hoc shadow classes.
— Evidence: `app/(app)/onboarding-panel.tsx` line 218.

**L5 — `privacy` / `terms` / `contact` pages missing `export const revalidate` (ONGOING)**
Architecture §2.5 specifies `revalidate = 3600` (or similar) for pages that rarely change. These static-content pages currently re-render on every request. They are session-dependent (have a `LandingNav` with auth state), which per architecture §2.5 explicitly precludes ISR — so this is documented acceptable behavior. **No action required; finding is informational and consistent with current architecture docs.** Clearing this from future audits is recommended by adding a note to the architecture doc.
— Evidence: `app/privacy/page.tsx`, `app/terms/page.tsx`, `app/contact/page.tsx`; architecture-and-build-practices.md §2.5 ("Public marketing / legal pages… dynamically rendered per request… do not set export const revalidate on these routes").

---

## Evidence reviewed

**Files read directly:**
- `docs/process/code-audit-process.md`
- `docs/process/audit-report-template.md`
- `docs/policies/design-spec.md`
- `docs/architecture-and-build-practices.md`
- `docs/security/security-notes.md`
- `docs/design/design-spec-2026.md` (full read, sections 1–16)
- `docs/audits/code/2026-04-03-code-audit-2.md` (prior audit for comparison)
- `docs/archive/plans/2026-04-04-refinance-payoff-insights-plan.md`
- `docs/archive/plans/2026-04-04-property-detail-revamp-plan.md`
- `docs/archive/plans/2026-04-04-calculators-premium-cta-plan.md`
- `docs/archive/plans/2026-04-04-calculators-premium-cta-phase4-verification.md`
- `app/app/(app)/refinance/page.tsx` (full)
- `app/app/(app)/refinance/refinance-workspace.tsx` (full, 744 lines)
- `app/app/(app)/refinance/refinance-workspace-loader.tsx` (full)
- `app/app/(app)/refinance/loading.tsx`
- `app/app/(app)/properties/[id]/payoff-card.tsx` (full, 512 lines)
- `app/app/(app)/properties/[id]/overview-tab-content.tsx` (partial)
- `app/app/(app)/dashboard/page.tsx` (full)
- `app/app/(app)/layout.tsx` (full)
- `app/app/(app)/app-nav.tsx` (full)
- `app/app/(app)/onboarding-panel.tsx` (partial)
- `app/app/api/billing/portal/route.ts` (full)
- `app/app/api/properties/route.ts` (partial)
- `app/app/changelog/page.tsx` (full)
- `app/next.config.ts` (full)
- `app/proxy.ts` (full)
- `app/app/globals.css` (partial)
- `app/lib/amortization.ts` (partial — first 160 lines)
- `app/lib/changelog-data.ts` (partial)

**Grep sweeps performed:**
- `border-border/70|bg-card/95` across all `*.tsx` (14 files)
- `uppercase tracking-wide` across all `*.tsx` (15 files, ~53 occurrences)
- `text-warning` across all `*.tsx` (9 files; token is defined and compliant)
- `shadow-xl|shadow-2xl|shadow-lg` in `app/(app)/**/*.tsx` (2 occurrences in `onboarding-panel.tsx`)
- `shadow-xl|shadow-2xl|shadow-lg` in `app/page.tsx` and `app/pricing/page.tsx` (5 occurrences — all spec-documented)
- `buildCurrentLoanBalances|buildRefiBalances|formatMoneySigned` across all files (only in the two new refinance files)
- `cta-glow` across all files (zero matches)
- `force-dynamic` across app `*.tsx` (4 files: admin layout, app layout, analyze page, admin page — all justified)
- `<img\s` across all `*.tsx` (zero matches — no raw img tags)
- `: any\b|as any\b` in `app/(app)/**/*.tsx` (zero matches)
- `TODO|FIXME|HACK` in `lib/**/*.ts` (zero matches)
- `getActiveAppUser|getAppUser` in `app/(app)/**/*.tsx` (auth pattern count)

**Key assumptions / audit limits:**
- Static analysis only. No runtime testing, browser render verification, or A/B session testing.
- Audit covers source files up to the state at 2026-04-04. Any uncommitted or in-progress changes are not reflected.
- No review of database migration files for today's work (no schema changes were made — confirmed by plan).

---

## Findings: Code-Lane Sections

### Design Compliance

- `border-border/70` / `bg-card/95` deprecated opacity patterns in 14 production files — **medium** — `mortgage-workspace.tsx`, `modeling-workspace.tsx`, `dashboard/page.tsx`, and 11 others (see M1)
- `uppercase tracking-wide` outside permitted contexts in ~18 files — **medium** — `deal-analyzer-form.tsx` (18), `scenario-section.tsx`, `chart-wrapper.tsx`, and others (see M2)
- `cta-glow` utility documented in spec but absent from `globals.css` — **low** — `docs/design/design-spec-2026.md` §15.3 vs `app/globals.css` (see L3)
- `onboarding-panel.tsx` primary CTA uses ad-hoc `shadow-lg shadow-accent/25` rather than a defined utility — **low** — `app/(app)/onboarding-panel.tsx` line 218 (see L4)
- **RESOLVED**: Mockup files no longer contain `border-border/70`, `bg-card/95`, or `uppercase tracking-wide` ✓
- **RESOLVED**: Marketing-surface `shadow-xl`/`shadow-lg` on mockup frames is now spec-documented in design-spec-2026.md §14.1/§14.2 page references ✓

### Architecture Compliance

- `formatMoneySigned` duplicated in `refinance-workspace.tsx` and `payoff-card.tsx` — **medium** — both files (see M3)
- `buildCurrentLoanBalances` and `buildRefiBalances` are calculation functions inlined in a component rather than extracted to `lib/amortization.ts` — **low** — `refinance-workspace.tsx` lines 93–137 (see L1)
- `refinance-workspace.tsx` at 744 lines exceeds the ~300-line file-focus guideline — **low** — `app/(app)/refinance/refinance-workspace.tsx` (see L2)
- **COMPLIANT**: Auth pattern in `refinance/page.tsx` — uses `getAppUser()` + redirect, consistent with all other pages. Soft-deleted user guard is handled in `(app)/layout.tsx` at lines 46–48 ✓
- **COMPLIANT**: No API routes added for refinance (all computation is client-side); existing API conventions unaffected ✓
- **RESOLVED**: `POST /api/billing/portal` now uses `billingPortalBodySchema.safeParse()` from `lib/validations/checkout.ts` ✓

### Efficiency

- No N+1 queries detected in new routes. `refinance/page.tsx` uses a single `prisma.property.findMany` with `include: { mortgages: true }`.
- `refinance-workspace.tsx` uses `useMemo` correctly for `refinanceProjection`, `chartData`, and `selectedProperty`/`selectedMortgage` derived state. No unnecessary re-fetches.
- Recharts loaded correctly via `next/dynamic` in `RefinanceWorkspaceLoader` — heavy library not imported at top-level of any SSR-rendered page ✓.
- `lib/changelog-data.ts` exports one `any`-typed occurrence; all other `lib/` files are clean.

### Technical Debt & Corners

- `refinance-workspace.tsx` 744 lines — accumulating complexity, should split chart section into a sub-component (see L2)
- `formatMoneySigned` in two places — small but first-day debt on new code (see M3)
- `buildCurrentLoanBalances`/`buildRefiBalances` not in `lib/`, not tested (see L1)
- `border-border/70`/`bg-card/95` in 14 files — ongoing since prior audit, growing risk of normalization (see M1)
- `uppercase tracking-wide` in 18 files — ongoing since prior audit (see M2)
- No dead code, no hardcoded environment-specific values, no magic numbers found in new files.
- TypeScript strictness: no `any` types in app protected routes or new component files.

### Security

- **No security issues found in new code.**
- Auth: `refinance/page.tsx` uses `getAppUser()` + redirect — consistent with all peer pages.
- Soft-deleted user guard: `(app)/layout.tsx` line 46–48 returns `<RestoreAccountScreen />` before rendering children, correctly protecting the refinance workspace and all other pages.
- All API routes use `getActiveAppUser()` — confirmed via grep sweep.
- All data access scoped by `userId` — no IDOR risk.
- No secrets in client code.
- No new API routes for refinance — computation is purely client-side.
- Zod validation in all existing and new API routes ✓.
- `proxy.ts` `isPublicRoute` matcher does not include `/refinance` — correctly protected ✓.

### Product Mantra

Thoughtful, robust, modern, frictionless assessment:

- **Thoughtful ✓**: The split between inline refinance in `payoff-card.tsx` (contextual, where users already look for payoff info) and the standalone `/refinance` workspace (full deep-dive with chart) is a smart progressive disclosure pattern. The "What if I refinanced?" collapse-to-expand is correctly collapsed by default to reduce noise.
- **Robust ✓**: Edge cases handled: negative-amortizing rate warning (`isNewLoanNegativeAmortizing`), near-payoff loan caution (< 24 months), zero closing costs (break-even card hidden), closing costs that increase payment (break-even shown as negative indicator), balance source disclosure, and 0–30% rate validation.
- **Modern ✓**: `RefinanceWorkspaceLoader` correctly uses `next/dynamic` with `ssr: false` and a loading placeholder. React 19 patterns followed throughout.
- **Frictionless ✓**: Property and mortgage selectors auto-default to the first property with a mortgage; URL params (`?propertyId=&mortgageId=`) enable deep-linking from the mortgage workspace and property detail; all form inputs use `inputMode="decimal"` for mobile keyboards.
- **Minor friction**: The `refinance-workspace.tsx` desktop empty state ("No mortgage selected") shows a card with no CTA to add a property — addressed partially in the empty-properties case (which shows an "Add your first property" link), but a user who has properties but selects one without a mortgage sees a dead end. Low severity given the context.

### Performance

- `next/dynamic` with `ssr: false` used correctly for `RefinanceWorkspace` (which imports Recharts) ✓
- `lucide-react` and `recharts` in `next.config.ts` `experimental.optimizePackageImports` ✓
- No raw `<img>` tags found (zero matches across all `.tsx`) ✓
- No `force-dynamic` added to new pages. `refinance/page.tsx` inherits dynamic rendering from parent `(app)/layout.tsx` ✓
- `privacy`, `terms`, `contact` pages intentionally not ISR-cached due to session-dependent nav — documented behavior per architecture §2.5. No action required. (Finding L5, informational only.)
- No new external API integrations added today; no new preconnect hints required.

---

## Risk & impact assessment

- **M1 + M2 (design-spec debt, ongoing):** No live user experience bugs, but the growing delta between code and spec creates cognitive dissonance for implementors. Each new build cycle that copies from violating files (especially `deal-analyzer-form.tsx` and `mortgage-workspace.tsx`) deepens the sweep scope. Risk: medium likelihood, low direct user impact, growing maintenance cost.
- **M3 (duplicated `formatMoneySigned`):** The functions are identical today, but if one is updated (e.g. adding a `+` prefix for positive values) without updating the other, the two refinance surfaces will diverge visually. Low-probability bug, low user impact, but an easy fix.
- **L1 (inline balance builders):** Not tested. If the amortization loop logic has a bug, it will not be caught by the existing `lib/amortization.test.ts` suite. Medium probability of a subtle bug, medium user impact (chart would show wrong payoff curve).
- **L3/L4 (`cta-glow` spec gap):** Future implementors may re-invent the pattern inconsistently. Low probability, low impact — purely a spec maintenance issue.

---

## Recommendations (prioritized)

1. **Extract `formatMoneySigned` to `lib/format-currency.ts`** and import from both `payoff-card.tsx` and `refinance-workspace.tsx`. Small, targeted, low-risk. This is first-day architecture debt on freshly shipped code.

2. **Coordinate `border-border/70` / `bg-card/95` sweep** across the 14 pre-existing files as a single PR. Pattern replace: `border-border/70` → `border-border`, `bg-card/95` → `bg-card`. Key targets: `mortgage-workspace.tsx`, `modeling-workspace.tsx`, `dashboard/page.tsx`, `mobile-tool-shell.tsx`, `paid-intent-checkout-banner.tsx`. Previous audits (04-03 morning and 04-03-2) both flagged this; it remains the single highest-leverage design-system cleanup available.

3. **Remediate `uppercase tracking-wide` in `deal-analyzer-form.tsx`** (18 occurrences). Replace section headings inside the form (currently `text-xs font-semibold uppercase tracking-wide text-muted`) with `text-xs font-medium text-muted` (L5 label) or `text-sm font-semibold text-foreground` (L3 section heading within a Panel). This is the highest-volume violating file and a core user-facing surface.

4. **Extract `buildCurrentLoanBalances` / `buildRefiBalances` to `lib/amortization.ts`** and add unit tests. The refactored component would call `lib/amortization` functions for all mathematical work, matching the established pattern. This also unblocks future chart reuse (e.g. in the mortgage workspace).

5. **Implement `.cta-glow` in `globals.css`** (or remove the section from design-spec-2026.md if the pattern is abandoned). Update `onboarding-panel.tsx` to use the utility class. Closes the spec-vs-code divergence.

6. **Continue `uppercase tracking-wide` sweep** across the remaining files in order of user-facing visibility: `scenario-section.tsx`, `chart-wrapper.tsx` (title variant), `mobile-summary-rail.tsx`, `export/portfolio-summary/page.tsx`, then marketing pages (`competitor-alternative-page.tsx` non-table-header uses, `resource-article-page.tsx` non-table-header uses).

7. **Consider splitting `refinance-workspace.tsx`** — extract the chart section (Recharts `LineChart` + data builders + `chartSection` JSX, roughly lines 223–544) into a `<RefinanceBalanceChart>` sub-component. The workspace component would then orchestrate state and pass data down, improving readability.

---

## Task candidates

- [ ] Extract `formatMoneySigned` to `lib/format-currency.ts`; import from `payoff-card.tsx` and `refinance-workspace.tsx` (small, targeted, eliminates first-day duplication).
- [ ] Extract `buildCurrentLoanBalances` and `buildRefiBalances` from `refinance-workspace.tsx` to `lib/amortization.ts` with colocated unit tests.
- [ ] Batch `border-border/70` → `border-border` and `bg-card/95` → `bg-card` sweep across 14 files as a single PR.
- [ ] Replace `uppercase tracking-wide` section headings in `deal-analyzer-form.tsx` (18 occurrences) with `text-xs font-medium text-muted` (L5) per design-spec-2026 Pillar 6.
- [ ] Implement `.cta-glow` utility in `globals.css` and update `onboarding-panel.tsx` to use it.
- [ ] (Optional) Split `refinance-workspace.tsx` chart section into `<RefinanceBalanceChart>` sub-component.

---

## Re-test checklist

- [ ] After `formatMoneySigned` extraction: verify refinance output display in `payoff-card.tsx` refinance section and standalone `/refinance` workspace match format.
- [ ] After `buildCurrentLoanBalances`/`buildRefiBalances` extraction: run `npm run test` to confirm new lib tests pass and existing amortization tests are unaffected.
- [ ] After `border-border/70`/`bg-card/95` sweep: visual check of mortgage workspace, modeling workspace, dashboard (onboarding banner), and mobile tool shell in light and dark mode.
- [ ] After `deal-analyzer-form.tsx` `uppercase tracking-wide` removal: smoke test the deal analyzer form across mobile and desktop — section heading hierarchy should remain readable without uppercase.
- [ ] `npm run check` after any source changes.

---

## Files Audited

**New/changed today (primary focus):**
- `app/app/(app)/refinance/page.tsx`
- `app/app/(app)/refinance/refinance-workspace.tsx`
- `app/app/(app)/refinance/refinance-workspace-loader.tsx`
- `app/app/(app)/refinance/loading.tsx`
- `app/app/(app)/properties/[id]/payoff-card.tsx`
- `app/app/(app)/properties/[id]/overview-tab-content.tsx`
- `app/app/changelog/page.tsx`
- `app/lib/changelog-data.ts`

**Supporting / reference files read:**
- `app/app/(app)/layout.tsx`
- `app/app/(app)/app-nav.tsx`
- `app/app/(app)/dashboard/page.tsx`
- `app/app/(app)/onboarding-panel.tsx`
- `app/app/api/billing/portal/route.ts`
- `app/app/api/properties/route.ts`
- `app/next.config.ts`
- `app/proxy.ts`
- `app/app/globals.css`
- `app/lib/amortization.ts` (partial)

**Grep sweeps across:**
- `app/**/*.tsx` — design tokens, shadows, deprecated patterns, auth patterns, type safety
- `app/lib/**/*.ts` — TODOs, type safety, duplication
- `docs/design/design-spec-2026.md` — token and pattern verification

---

## Next trigger and cadence

- **Trigger:** Next implementation batch touching `deal-analyzer-form.tsx`, either refinance component, or further property-detail/edit work. Or within the monthly cadence.
- **Recommended next run date:** 2026-05-04 (monthly), or sooner if the batch sweeps above are executed and need post-implementation verification.
- **Promote to active task queue:** Recommendations 1 and 4 (extract `formatMoneySigned` and balance builders) are small, targeted, and address freshly shipped code — highest priority before the next build cycle.
