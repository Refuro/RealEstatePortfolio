# Feature / UX / IA Audit — 2026-04-09

## Executive summary

- Core journeys (dashboard metrics, properties list/detail, modeling, mortgage, analyze/deals, plans/pricing) are generally coherent: clear primary CTAs, strong empty states, and nav grouped into Portfolio / Tools / Account in `app-nav.tsx`.
- The largest IA inconsistency is **URL state for the Modeling workspace**: changing the property in the desktop dropdown does not update `?propertyId=`, unlike Mortgage (`mortgage-workspace.tsx` uses `history.replaceState` via `syncMortgageWorkspaceQuery`). That weakens shareable links, refresh behavior, and parity between two similar tools.
- **Discoverability** for Modeling, Mortgage, Deals, and Print summary relies heavily on the sidebar/drawer (and dashboard’s desktop-only link strip); the mobile bottom bar only surfaces Dashboard, Properties, and Analyze (`mobile-bottom-nav.tsx`), so those tools are one extra tap away—acceptable but uneven vs. desktop.
- **Onboarding** is modal + optional re-engagement for zero-property accounts (`onboarding-panel.tsx`); post–first-property nudges use dashboard query param and property flows. No ship-blocking gaps found; several polish items below.

## Severity-ranked findings

### Critical

- None identified in this pass.

### High

- **Modeling workspace does not keep `propertyId` in the URL when the user changes property** — Users cannot bookmark or share “this property’s modeling view”; refresh returns to initial server-selected property only. Mortgage workspace explicitly syncs query params (`app/(app)/mortgage/mortgage-workspace.tsx` `syncMortgageWorkspaceQuery`). Modeling only uses local state in the desktop `<select>` (`app/(app)/modeling/modeling-workspace.tsx`, `onChange` → `setSelectedPropertyId` only). **Impact:** inconsistent mental model, broken expectations from Mortgage, weaker collaboration/support (“open this link”).
- **Plan-limited property sets in Modeling/Mortgage with no on-page explanation** — Both pages load properties with `take: propertyLimit` (`modeling/page.tsx`, `mortgage/page.tsx`) but neither workspace surfaces a message when the user’s total count exceeds the limit (contrast `properties/page.tsx` over-limit copy + `UpgradePlanLink`). **Impact:** users may think missing properties are a bug or that data failed to load.

### Medium

- **Dashboard “workspace” shortcuts are hidden below `md`** — Property / Modeling / Mortgage / Print summary links use `hidden … md:flex` (`dashboard/page.tsx`). Primary row still has Add property + Analyze; secondary tools require the hamburger **More** menu or remembering nav. **Impact:** friction for tablet/small-laptop users and uneven prominence vs. desktop.
- **Navigation label mismatch for the same route** — Sidebar: “Analyze deal” (`app-nav.tsx`); mobile bottom nav: “Analyze” (`mobile-bottom-nav.tsx`). **Impact:** minor consistency/copy issue for recognition and search/help docs alignment.
- **Saved deals page cognitive load** — Helpful disclaimer that deal metrics use proportional math and not portfolio “full liability” mode (`deals/page.tsx`) is correct but dense in the hero; new users may skim past it. **Impact:** potential confusion when comparing deal cards to dashboard numbers.
- **Properties list: single-property mode hides filters and aggregate metrics** — When `properties.length === 1`, toolbar and portfolio `MetricCard` row are suppressed (`properties/page.tsx`). **Impact:** intentional simplification, but users who later add a second property suddenly see new controls—acceptable with a small learning bump.

### Low

- **Account nav label vs page title** — Nav item “Plans” (`app-nav.tsx`) vs page H1 “Plans & billing” (`plans/page.tsx`). **Impact:** minor wayfinding mismatch.
- **Modeling page title hidden on small viewports** — H1 uses `hidden … md:block` (`modeling-workspace.tsx`); mobile relies on `MobileContextBar` title “Modeling”. **Impact:** generally OK; desktop/mobile title patterns differ slightly from Mortgage (same pattern).
- **“Print summary” only appears in dashboard link strip** — Not duplicated in main `app-nav.tsx`. **Impact:** low; export is a secondary action but slightly buried for users who never open dashboard.

## Evidence reviewed

- Process: `docs/process/feature-ux-audit-process.md`
- Template: `docs/process/audit-report-template.md`
- Policy cross-check: `docs/policies/design-spec.md` (§1.1 audit alignment)
- **Dashboard:** `app/(app)/dashboard/page.tsx`, `dashboard-empty-state-ctas.tsx`, `metric-help-link.tsx`
- **Properties:** `app/(app)/properties/page.tsx`, `app/(app)/properties/[id]/page.tsx`, `property-detail-tabs.tsx`, `details-tab-content.tsx` (mortgages `#mortgages`)
- **Modeling / Mortgage:** `app/(app)/modeling/page.tsx`, `modeling-workspace.tsx`, `app/(app)/mortgage/page.tsx`, `mortgage-workspace.tsx`
- **Analyze / Deals:** `app/(app)/analyze/page.tsx`, `deal-analyzer-form.tsx` (sample), `app/(app)/deals/page.tsx`, `deals-list.tsx`
- **Pricing / plans:** `app/pricing/page.tsx`, `app/(app)/plans/page.tsx`
- **Onboarding / shell:** `app/(app)/onboarding-panel.tsx`, `app/(app)/layout.tsx`, `app/(app)/app-layout-client.tsx`, `app-nav.tsx`, `mobile-bottom-nav.tsx`

**Limits:** Static code review only; no live browser session or authenticated screenshots. Clerk/session-specific behavior inferred from components.

## Risk & impact assessment

Unresolved **High** items mainly affect **power users and support** (linking, refresh) and **paying users near limits** (silent truncation in tools). Likelihood is moderate where multi-property modeling is common. **Medium** items affect **scanability and first-time comprehension** more than core task completion.

## Recommendations (prioritized)

1. **Align Modeling with Mortgage for URL sync** — When the selected property changes in `ModelingWorkspace`, update `propertyId` in the query string (same pattern as `syncMortgageWorkspaceQuery` in `mortgage-workspace.tsx`), including desktop `<select>` and mobile context bar `onChange`.
2. **Surface plan limit context in Modeling and Mortgage** — Reuse or mirror the properties-list pattern: short inline message + upgrade link when `totalCount > propertyLimit` (data already available at page level via Prisma count + `getPropertyLimit`).
3. **Reduce dashboard tool fragmentation on sub-`md` widths** — Either expose a compact row of text links (not only `md+`), or add Modeling/Mortgage (or a “Tools” entry point) to the mobile bottom bar with careful iconography—trade off clutter vs discoverability.
4. **Normalize “Analyze” naming** — Use the same label in `app-nav.tsx` and `mobile-bottom-nav.tsx` (e.g. both “Analyze deal” or both “Analyze”).
5. **Optional: shorten or progressive-disclose the deals disclaimer** — Keep accuracy; move detail behind a “How metrics are calculated” disclosure on `deals/page.tsx`.

## Task candidates

- [ ] Sync `propertyId` query param in `modeling-workspace.tsx` on property change (parity with mortgage workspace).
- [ ] Add over-limit / truncated-property notice to `modeling/page.tsx` + `modeling-workspace.tsx` and `mortgage/page.tsx` + `mortgage-workspace.tsx` when applicable.
- [ ] Unify Analyze nav labels in `app-nav.tsx` and `mobile-bottom-nav.tsx`.
- [ ] Audit dashboard secondary actions for `< md` (expose Modeling/Mortgage/Print or document intentional “More only” pattern).

## Re-test checklist

- [ ] Verify Modeling URL updates when switching properties; refresh preserves selection; deep link opens correct property.
- [ ] Verify over-limit users see clear messaging on Properties, Modeling, and Mortgage.
- [ ] Verify no regression in Mortgage URL sync or property detail `?tab=` / `#mortgages` behavior.
- [ ] `npm run check` (when code changes are made)

## Next trigger and cadence

- **Trigger:** After meaningful navigation or workspace changes, or quarterly per `design-spec.md`.
- **Recommended next run:** 2026-07-09 (quarterly) or before a major IA/nav redesign.
