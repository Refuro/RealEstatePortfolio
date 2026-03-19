# Code Audit — 2026-03-19

## Summary

The codebase is generally healthy with strong auth, authorization, and design token usage. Recent intensive rebuilds have introduced technical debt in large files and duplicated logic. Top findings: (1) **projections-tab-content.tsx (887 lines)** and **mortgage-tab-content.tsx (660 lines)** contain substantial business logic (loan projection, amortization simulation) that belongs in `lib/`; (2) **getRemainingTermMonths** and mortgage simulation logic are duplicated across projections and mortgage tab components; (3) **add-property-wizard (1000 lines)** and **property-form (547 lines)** remain oversized with duplicated validation and estimate logic; (4) **projections-tab-content** imports Recharts directly at top level (no `next/dynamic`) — heavy bundle on property detail page; (5) **onboarding-panel** uses `shadow-lg shadow-accent/25` which conflicts with design spec’s “flat or very subtle shadow.”

---

## Findings

### Design Compliance

- **Semantic tokens used consistently** — `text-muted`, `bg-subtle`, `border-border`, `text-positive`, `text-negative`, `bg-accent` appear across pages. No raw zinc/slate/emerald in components; only in `globals.css` for theme variables.
- **Heavy shadow on onboarding CTA** — Design spec §9: “Prefer flat or very subtle shadow.” `app/(app)/onboarding-panel.tsx` line 93 uses `shadow-lg shadow-accent/25` on primary button. — **low** — `app/(app)/onboarding-panel.tsx`
- **shadow-sm widespread** — Many cards use `shadow-sm` (modeling-workspace, mortgage-workspace, projections-tab-content, mortgage-tab-content, dashboard, etc.). Design spec allows “very subtle shadow”; `shadow-sm` is acceptable. No violation.
- **Token naming** — Design spec mentions `border-default`; codebase uses `border-border`. Both map to `--border` in globals.css. — **low**
- **Typography** — Page titles `text-2xl font-semibold`, section headers `text-sm font-semibold uppercase tracking-wide text-muted`. Aligned with design spec.
- **Modern drift** — `rounded-xl`, `border-border/70`, `bg-card/95`, `bg-background/60` suggest intentional modern polish (opacity variants). Consistent across modeling, mortgage, dashboard. Acceptable drift.

### Architecture Compliance

- **Layered data flow** — Pages and API routes call `getAppUser()`/`getActiveAppUser()`, use lib for metrics/validations. Business logic in `lib/metrics/`, `lib/amortization.ts`, `lib/validations/`.
- **Logic in components** — `projections-tab-content.tsx` contains `getRemainingTermMonths`, `buildSimMortgages`, `projectLoanSeriesByMonth` (lines 94–185) — ~90 lines of mortgage projection logic. `mortgage-tab-content.tsx` contains `getRemainingTermMonths`, `simulateMortgage`, `yearsBetween` (lines 64–128) — ~65 lines of simulation logic. These belong in `lib/amortization.ts` or `lib/projections.ts`. — **high** — `app/(app)/properties/[id]/projections-tab-content.tsx`, `app/(app)/properties/[id]/mortgage-tab-content.tsx`
- **Duplicated getRemainingTermMonths** — Implemented separately in projections-tab-content (line 94) and mortgage-tab-content (line 64). Should be single function in `lib/amortization.ts`. — **medium**
- **Single source of truth** — Metrics in `lib/metrics/`, plans in `lib/plans.ts`, pricing in `lib/pricing-display.ts`. Amortization in `lib/amortization.ts`; projections logic not yet extracted.
- **Component reuse** — CurrencyInput, ChartWrapper, MortgageFormFields reused. ProjectionsTabContent and MortgageTabContent reused by modeling/mortgage workspaces. Good.
- **API conventions** — All protected routes use `getActiveAppUser()` (or `getAppUser()` for contact/restore); Zod validation on property, deal, mortgage, estimate, account, checkout, contact. `userId`-scoped queries throughout.
- **File size** — `projections-tab-content.tsx` 887 lines; `mortgage-tab-content.tsx` 660 lines; `details-tab-content.tsx` 509 lines; `add-property-wizard.tsx` 1000 lines; `property-form.tsx` 547 lines. Architecture doc: “If a file grows past ~300 lines, consider splitting.” — **high** for projections/mortgage (logic + size); **medium** for details, wizard, form.

### Efficiency

- **Server rendering** — Dashboard, properties, modeling, mortgage pages are server components; data fetched server-side. No unnecessary client fetches.
- **Prisma queries** — Properties use `include: { mortgages: true }`; no N+1 in list views.
- **Recharts import in projections-tab-content** — `projections-tab-content.tsx` imports Recharts (Area, AreaChart, CartesianGrid, Legend, Line, etc.) at top level. Property detail page loads this chunk for Overview tab even when user may never open Projections. Dashboard uses `next/dynamic` for charts; property detail does not. — **medium** — `app/(app)/properties/[id]/projections-tab-content.tsx`
- **mortgage-tab-content** — Same pattern: Recharts imported at top level. Property detail loads mortgage chart chunk for Overview tab. — **medium** — `app/(app)/properties/[id]/mortgage-tab-content.tsx`
- **Layout caching** — App layout uses `unstable_cache` with 30s revalidate for banner data. Good.
- **optimizePackageImports** — `next.config.ts` includes `lucide-react` and `recharts`. Compliant.

### Technical Debt & Corners

- **Large files** — projections-tab-content (887), mortgage-tab-content (660), details-tab-content (509), add-property-wizard (1000), property-form (547). All exceed ~300-line guideline. — **medium**
- **Duplicated estimate logic** — add-property-wizard and property-form both implement `handleEstimateValue`, `handleEstimateRent`, `parseCurrencyNum`, address validation. Could be extracted to shared hook or lib. — **medium**
- **Duplicated validation** — add-property-wizard has `validateStep1`–`validateStep4`; property-form uses FormData + inline checks. Wizard uses `createMortgageSchema` from lib; property-form does not use Zod for form validation. — **low**
- **PRESETS in projections** — `projections-tab-content.tsx` lines 61–86 define PRESETS (conservative, base, upside). Could move to `lib/projections.ts` or `lib/constants.ts` for reuse. — **low**
- **No `any` types** — Grep found no `: any` or `as any`. Type safety is strong.
- **window.confirm in details-tab** — `details-tab-content.tsx` uses `window.confirm` for discard-unsaved (lines 189, 195, 203). Works but is not a design-spec modal pattern. — **low**

### Security

- **Auth** — All protected API routes call `getActiveAppUser()` and return 401 if null. Billing webhook correctly excluded (Stripe signature verification). Contact and restore use `getAppUser()` appropriately.
- **Authorization** — All data access scoped by `userId`; no IDOR risk. `getPropertyForUser` pattern used in properties API.
- **Validation** — Property, deal, mortgage, estimate, account, checkout, contact routes use Zod. Import route uses `parseRow` from lib.
- **Permanent delete** — `deletePermanentAccountSchema` validates `confirmText === "DELETE"`. Server-side enforcement.
- **Secrets** — Env vars only; no secrets in client code.
- **Rate limiting** — Rent estimate (hourly by tier) and contact form have rate limits. Security headers in next.config.

### Product Mantra

- **Thoughtful** — Edge cases (plan limits, vacancy, ownership, reinvestment) handled. Empty states and CTAs are clear. Modeling and mortgage workspaces have good progressive disclosure.
- **Robust** — Error handling in forms; `router.refresh()` after mutations. Potential: details-tab inline edit forms could show loading state more consistently.
- **Modern** — Next.js App Router, React 19, TypeScript. Workspace pattern (modeling, mortgage) is a good UX.
- **Frictionless** — Links between property detail, modeling workspace, mortgage workspace reduce context switching. Preset buttons in projections speed exploration.

### Performance

- **Heavy libraries (charts)** — `dashboard-charts.tsx` and `amortization-chart-dynamic.tsx` use `next/dynamic` with `ssr: false` for Recharts. Loading placeholders shown. Compliant.
- **projections-tab-content and mortgage-tab-content** — Import Recharts at top level. Property detail page (`property-detail-tabs.tsx`) imports both; both render when tab is active. No dynamic import. Initial bundle includes Recharts for property detail even if user stays on Overview. — **medium**
- **force-dynamic on app layout** — `app/(app)/layout.tsx` exports `dynamic = "force-dynamic"` with documented rationale (user-specific banner data). Acceptable.
- **Images** — No user-facing raw `<img>` tags found. Compliant.
- **Preconnect/dns-prefetch** — Root layout has `preconnect` for `api.rentcast.io` and `dns-prefetch` for `js.stripe.com`. Compliant.
- **Blocking calls** — Modeling and mortgage pages fetch from Prisma server-side; no slow external API blocking render.

---

## Recommendations

1. **Extract projection logic to lib** — Move `getRemainingTermMonths`, `buildSimMortgages`, `projectLoanSeriesByMonth` from `projections-tab-content.tsx` to `lib/amortization.ts` or new `lib/projections.ts`. Single source of truth; testable.
2. **Extract mortgage simulation to lib** — Move `simulateMortgage`, `yearsBetween`, `getRemainingTermMonths` from `mortgage-tab-content.tsx` to `lib/amortization.ts`. Reuse from projections if overlap.
3. **Use next/dynamic for projections and mortgage charts** — Lazy-load `ProjectionsTabContent` and `MortgageTabContent` (or their chart subcomponents) so Recharts is not in initial property-detail bundle. Show skeleton when tab is selected.
4. **Split projections-tab-content** — Extract controls panel, summary cards, chart, and advanced breakdown into subcomponents. Target file under ~300 lines.
5. **Split mortgage-tab-content** — Extract controls panel, summary cards, chart into subcomponents. Share `MortgageSimulationControls` if similar to projections.
6. **Split add-property-wizard** — Step components (StepAddressBasics, StepPurchase, etc.) are already separate; consider moving to `add-property-wizard/steps/` directory. Extract validation to `lib/validations/wizard.ts`.
7. **Reduce shadow on onboarding CTA** — Replace `shadow-lg shadow-accent/25` with `shadow-sm` in `onboarding-panel.tsx` to align with design spec.
8. **Extract shared estimate logic** — Create `usePropertyEstimates` hook or `lib/estimates-client.ts` for value/rent estimate API calls, used by both add-property-wizard and property-form.
9. **Evaluate revalidate for static pages** — Privacy, Terms (and optionally Pricing, Contact) could use `revalidate = 3600` if nav/auth can be deferred. Deferred in prior audits due to auth-dependent nav.

---

## Files Audited

**Pages & layouts:** `app/(app)/modeling/page.tsx`, `modeling-workspace.tsx`, `mortgage/page.tsx`, `mortgage-workspace.tsx`, `layout.tsx`, `app/layout.tsx`

**Large tab content:** `properties/[id]/projections-tab-content.tsx`, `mortgage-tab-content.tsx`, `details-tab-content.tsx`, `property-detail-tabs.tsx`

**Forms & wizard:** `add-property-wizard.tsx`, `property-form.tsx`, `mortgage-form-fields.tsx`

**API routes:** `api/properties/route.ts`, `api/properties/[id]/route.ts`, `api/properties/[id]/mortgage/route.ts`, `api/estimates/value/route.ts`, `api/estimates/rent/route.ts`, `api/import/portfolio/route.ts`

**Components:** `dashboard-charts.tsx`, `metric-card.tsx`, `metric-help-modal.tsx`, `currency-input.tsx`, `chart-wrapper.tsx`, `amortization-chart.tsx`, `amortization-chart-dynamic.tsx`

**Lib:** `lib/auth.ts`, `lib/amortization.ts`, `lib/metrics/portfolio-metrics.ts`, `lib/metrics/property-metrics.ts`, `lib/validations/property.ts`, `lib/validations/mortgage.ts`

**Config:** `next.config.ts`, `globals.css`
