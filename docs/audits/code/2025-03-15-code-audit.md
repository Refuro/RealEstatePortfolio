# Code Audit — 2025-03-15

## Summary

The codebase is generally healthy and aligned with design, architecture, and security practices. Auth and authorization are consistently applied; semantic design tokens are used throughout; and shared components (CurrencyInput, ChartWrapper) are reused. Top findings: (1) **Permanent delete API lacks server-side confirmation validation** — a security gap; (2) **Several files exceed ~300 lines** (add-property-wizard ~1356, import route ~382); (3) **formatCurrency duplicated** in six+ places; (4) **shadow-lg on modals** conflicts with design spec’s “flat or very subtle shadow”; (5) **`any` types in settings page** for Prisma calls.

---

## Findings

### Design Compliance

- **Semantic tokens used consistently** — `text-muted`, `bg-subtle`, `border-border`, `text-positive`, `text-negative`, `bg-accent` appear across pages and components. No raw zinc/slate/emerald.
- **Heavy shadows on modals** — `draft-context.tsx` (lines 265, 305), `metric-help-modal.tsx` (line 69) use `shadow-lg`. Design spec §9: “Prefer flat or very subtle shadow.” — **medium** — `app/(app)/draft-context.tsx`, `components/metric-help-modal.tsx`
- **Token naming** — Design spec mentions `border-default`; codebase uses `border-border`. Both map to `--border` in `globals.css`; behavior is correct. — **low**
- **Typography** — Page titles use `text-2xl font-semibold`, section headers `text-sm font-semibold uppercase tracking-wide text-muted`, metric values `text-2xl`/`text-3xl`. Aligned with design spec.
- **No decorative gradients** — No violations of “avoid decorative gradients.”

### Architecture Compliance

- **Layered data flow** — Pages and API routes call `getAppUser()`, use lib for metrics/validations, and keep routes thin. Business logic in `lib/metrics/`, `lib/validations/`.
- **Single source of truth** — Metrics in `lib/metrics/`, plans in `lib/plans.ts`, pricing in `lib/pricing-display.ts`. No duplicated formulas.
- **Component reuse** — CurrencyInput used in deal-analyzer-form, property-form, add-property-wizard, mortgage-form-fields. ChartWrapper used by all chart components.
- **API conventions** — All protected routes use `getAppUser()` first; Zod validation on property, deal, mortgage, estimate routes. `userId`-scoped queries throughout.
- **File size** — `add-property-wizard.tsx` ~1356 lines; `api/import/portfolio/route.ts` ~382 lines. Architecture doc: “If a file grows past ~300 lines, consider splitting.” — **medium** — `app/(app)/properties/add-property-wizard.tsx`, `app/api/import/portfolio/route.ts`
- **Import route logic** — CSV parsing and row validation live in the route. Could be moved to `lib/` for reuse and testability. — **low**

### Efficiency

- **Server rendering** — Dashboard, properties, deals pages are server components; data fetched server-side. No unnecessary client fetches.
- **Prisma queries** — Properties use `include: { mortgages: true }`; no N+1 in list views.
- **Import bulk create** — Loop with `create` inside `$transaction` is intentional for bulk import; sequential creates needed for property IDs.
- **Caching** — No explicit `revalidate` or cache headers observed; acceptable for user-specific data that should be fresh.
- **Bundle** — No obvious bloat; CurrencyInput, ChartWrapper shared.

### Technical Debt & Corners

- **formatCurrency duplication** — Same `Intl.NumberFormat` logic in dashboard/page.tsx, properties/page.tsx, deals-list.tsx, property-metrics-section.tsx, scenario-section.tsx, dashboard-charts.tsx. Add-property-wizard has a variant (string input). Extract to `lib/format-currency.ts`. — **medium**
- **`any` types in settings** — `(prisma as any).savedDeal.count` (line 21), `data: { cancelAtPeriodEnd: willCancel } as any` (line 38). Comment notes “Prisma client may need regenerate.” — **low** — `app/(app)/settings/page.tsx`
- **MetricCard duplication** — Similar MetricCard components in dashboard/page.tsx and properties/page.tsx. Could be extracted to shared component. — **low**
- **Scaling** — No obvious blockers for 100 properties or 1000 users. Limit utils and plan checks in place.

### Security

- **Auth** — All protected API routes call `getAppUser()` and return 401 if null. Billing webhook correctly excluded (Stripe signature verification).
- **Authorization** — All data access scoped by `userId`; no IDOR risk.
- **Validation** — Property, deal, mortgage, estimate routes use Zod. Import route uses custom `parseRow` validation.
- **Permanent delete missing server-side confirmText** — `/api/account/delete-permanent` does not validate `confirmText === "DELETE"`. Client enforces it; direct API calls could bypass. — **high** — `app/api/account/delete-permanent/route.ts`
- **Account delete routes** — Password validated via Clerk `verifyPassword`; body not Zod-validated. Basic type checks present. Consider Zod for consistency. — **low**
- **Secrets** — Env vars only; no secrets in client code. `NEXT_PUBLIC_*` used only for pricing display and app URL.
- **CSV import** — `selectedIndices` parsed and filtered to valid range; no injection risk. `escapeCsvCell` used in export.

### Product Mantra

- **Thoughtful** — Edge cases (plan limits, vacancy, ownership) handled. Empty states and CTAs are clear.
- **Robust** — Stripe fetch failures in settings fall back to DB value. Error boundaries and not-found pages exist.
- **Modern** — Next.js App Router, React 19, TypeScript. No deprecated patterns observed.
- **Frictionless** — Progressive disclosure (expandable sections), clear CTAs. Permanent delete confirmation is client-only, which weakens robustness.

---

## Recommendations

1. **Add server-side confirmText validation to permanent delete** — In `/api/account/delete-permanent/route.ts`, require `body.confirmText === "DELETE"` before proceeding. Return 400 if missing or incorrect.
2. **Extract formatCurrency to lib** — Create `lib/format-currency.ts` with `formatCurrency(n: number): string` and use it across dashboard, properties, deals, charts, scenario section.
3. **Split add-property-wizard** — Break into smaller components (e.g., step components, shared wizard layout) or move step logic to separate files. Target files under ~300 lines.
4. **Move import parsing to lib** — Extract `parseRow`, `parseDate`, `parseNum`, `getCol`, `parseAddressFromCombined` from `api/import/portfolio/route.ts` to `lib/import/csv-parser.ts` or similar. Route stays thin.
5. **Reduce modal shadows** — Replace `shadow-lg` with `shadow-sm` or remove on draft-context and metric-help-modal to match design spec.
6. **Resolve Prisma `any` in settings** — Run `npx prisma generate`; if `savedDeal` and `cancelAtPeriodEnd` types are correct, remove `as any`. If schema/client mismatch, document and fix.
7. **Consider Zod for account delete routes** — Add Zod schemas for delete and delete-permanent request bodies for consistency with other routes.

---

## Files Audited

- **Pages:** `app/(app)/dashboard/page.tsx`, `properties/page.tsx`, `properties/[id]/page.tsx`, `properties/new/page.tsx`, `deals/page.tsx`, `analyze/page.tsx`, `settings/page.tsx`, `pricing/page.tsx`, `admin/page.tsx`, `billing/success/page.tsx`
- **Components:** `add-property-wizard.tsx`, `property-form.tsx`, `mortgage-form-fields.tsx`, `deal-analyzer-form.tsx`, `dashboard-charts.tsx`, `metric-help-modal.tsx`, `currency-input.tsx`, `chart-wrapper.tsx`, `draft-context.tsx`, `delete-account-section.tsx`, `import-csv-section.tsx`
- **API routes:** `api/properties/route.ts`, `api/properties/[id]/route.ts`, `api/deals/route.ts`, `api/deals/[id]/route.ts`, `api/import/portfolio/route.ts`, `api/export/portfolio/route.ts`, `api/account/delete/route.ts`, `api/account/delete-permanent/route.ts`, `api/billing/webhook/route.ts`, `api/estimates/rent/route.ts`, `api/estimates/value/route.ts`
- **Lib:** `lib/auth.ts`, `lib/metrics/portfolio-metrics.ts`, `lib/metrics/property-metrics.ts`, `lib/plans.ts`, `lib/pricing-display.ts`, `lib/validations/property.ts`, `lib/validations/deal.ts`, `lib/validations/mortgage.ts`
- **Styles:** `app/globals.css`
- **Config:** `next.config.ts`
