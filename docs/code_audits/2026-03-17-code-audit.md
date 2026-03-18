# Code Audit — 2026-03-17

## Summary

The codebase is generally healthy and aligned with design, architecture, and security practices. Auth and authorization are consistently applied; semantic design tokens are used throughout; and shared components (CurrencyInput, ChartWrapper, MortgageFormFields) are reused. Top findings: (1) **Benchmark refresh route returns HTTP 200 on error** — should return 4xx/5xx for proper error semantics; (2) **`shadow-lg` on amortization chart tooltip** conflicts with design spec’s “flat or very subtle shadow”; (3) **Several files exceed ~300 lines** (add-property-wizard ~1410, property-form ~815); (4) **BenchmarkDisplay duplicates logic** from `lib/benchmark-utils.ts` instead of reusing; (5) **Public pages (privacy, terms, pricing, contact) lack `revalidate`** — auth-dependent nav may block caching, but worth evaluating.

---

## Findings

### Design Compliance

- **Semantic tokens used consistently** — `text-muted`, `bg-subtle`, `border-border`, `text-positive`, `text-negative`, `bg-accent` appear across pages and components. No raw zinc/slate/emerald in components; only in `globals.css` for theme variables.
- **Heavy shadow on chart tooltip** — Design spec §9: “Prefer flat or very subtle shadow.” `components/charts/amortization-chart.tsx` line 89 uses `shadow-lg` on the Tooltip content div. — **low** — `components/charts/amortization-chart.tsx`
- **Typography** — Page titles use `text-2xl font-semibold`, section headers `text-sm font-semibold uppercase tracking-wide text-muted`, metric values `text-2xl`/`text-3xl`. Aligned with design spec.
- **No decorative gradients** — No violations of “avoid decorative gradients.”
- **Token naming** — Design spec mentions `border-default`; codebase uses `border-border`. Both map to `--border` in `globals.css`; behavior is correct. — **low**

### Architecture Compliance

- **Layered data flow** — Pages and API routes call `getAppUser()`/`getActiveAppUser()`, use lib for metrics/validations, and keep routes thin. Business logic in `lib/metrics/`, `lib/validations/`.
- **Single source of truth** — Metrics in `lib/metrics/`, plans in `lib/plans.ts`, pricing in `lib/pricing-display.ts`. No duplicated formulas in lib.
- **Benchmark logic duplication** — `benchmark-display.tsx` inlines `SIXTY_DAYS_MS`, `isFresh`, `getBenchmarkPct`, and label logic that exists in `lib/benchmark-utils.ts`. Should reuse `isBenchmarkFresh`, `getBenchmarkDaysAgo`, `getBenchmarkLabel`. — **medium** — `app/(app)/properties/benchmark-display.tsx`
- **Component reuse** — CurrencyInput used in deal-analyzer-form, property-form, add-property-wizard, mortgage-form-fields. ChartWrapper used by all chart components. MortgageFormFields reused.
- **API conventions** — All protected routes use `getActiveAppUser()` (or `getAppUser()` where appropriate for contact/restore); Zod validation on property, deal, mortgage, estimate, account, checkout, contact routes. `userId`-scoped queries throughout.
- **File size** — `add-property-wizard.tsx` ~1410 lines; `property-form.tsx` ~815 lines. Architecture doc: “If a file grows past ~300 lines, consider splitting.” — **medium** — `app/(app)/properties/add-property-wizard.tsx`, `app/(app)/properties/property-form.tsx`
- **Import route** — CSV parsing in `lib/import/csv-parser.ts`; route delegates to lib. Good separation.

### Efficiency

- **Server rendering** — Dashboard, properties, deals pages are server components; data fetched server-side. No unnecessary client fetches.
- **Prisma queries** — Properties use `include: { mortgages: true }`; no N+1 in list views.
- **formatCurrency** — Centralized in `lib/format-currency.ts`; used across dashboard, properties, deals, charts.
- **Layout caching** — App layout uses `unstable_cache` with 30s revalidate for banner data. Good.
- **Bundle** — `optimizePackageImports` includes lucide-react and recharts. No obvious bloat.

### Technical Debt & Corners

- **Large files** — `add-property-wizard.tsx` (1410 lines) and `property-form.tsx` (815 lines) exceed ~300-line guideline. Consider splitting into step components or extracting form sections. — **medium**
- **Benchmark refresh returns 200 on error** — `app/api/properties/[id]/benchmark/refresh/route.ts` line 88 returns `NextResponse.json({ error: message }, { status: 200 })` when RentCast fails. HTTP 200 implies success; clients may not treat this as an error. Should return 502 or 503. — **medium** — `app/api/properties/[id]/benchmark/refresh/route.ts`
- **Scaling** — No obvious blockers for 100 properties or 1000 users. Limit utils and plan checks in place.
- **No `any` types** — Grep found no `: any` or `as any` in the codebase. Type safety is strong.

### Security

- **Auth** — All protected API routes call `getActiveAppUser()` and return 401 if null. Billing webhook correctly excluded (Stripe signature verification).
- **Authorization** — All data access scoped by `userId`; no IDOR risk.
- **Validation** — Property, deal, mortgage, estimate, account, checkout, contact routes use Zod. Import route uses `parseRow` from lib.
- **Permanent delete** — `deletePermanentAccountSchema` validates `confirmText === "DELETE"`; server-side enforcement in place.
- **Secrets** — Env vars only; no secrets in client code. `NEXT_PUBLIC_*` used only for pricing display, app URL, Sentry DSN.
- **Rate limiting** — Rent estimate (hourly by tier) and contact form have rate limits. Good.

### Product Mantra

- **Thoughtful** — Edge cases (plan limits, vacancy, ownership) handled. Empty states and CTAs are clear.
- **Robust** — Stripe fetch failures in settings fall back to DB value. Error boundaries and not-found pages exist.
- **Modern** — Next.js App Router, React 19, TypeScript. No deprecated patterns observed.
- **Frictionless** — Progressive disclosure (expandable sections), clear CTAs. Deleted-user restore flow in place.

### Performance

- **Heavy libraries (charts)** — `dashboard-charts.tsx` and `amortization-chart-dynamic.tsx` use `next/dynamic` with `ssr: false` for Recharts. Loading placeholders shown. Compliant.
- **force-dynamic on app layout** — `app/(app)/layout.tsx` exports `dynamic = "force-dynamic"` with documented rationale (user-specific banner data, subscription). Architecture doc §2.5: “Do not add force-dynamic to root layout unless required.” Rationale documented; acceptable.
- **force-dynamic on admin/analyze** — `admin/page.tsx`, `admin/layout.tsx`, `analyze/page.tsx` also export `force-dynamic`. Redundant if parent layout is already dynamic; acceptable for clarity. — **low**
- **Public pages lack revalidate** — Privacy, Terms, Pricing, Contact pages do not export `revalidate`. Architecture doc: “For pages that rarely change (Privacy, Terms), add `export const revalidate = 3600`.” These pages call `auth()` for nav state, which may force dynamic. If nav can be client-side or deferred, consider `revalidate` for static content. — **medium**
- **Images** — No user-facing raw `<img>` tags found. Metadata uses `/favicon.png`, `/og-image.png`, `/logo.png`. Compliant.
- **optimizePackageImports** — `next.config.ts` includes `lucide-react` and `recharts`. Compliant.
- **Preconnect/dns-prefetch** — Root layout has `preconnect` for `api.rentcast.io` and `dns-prefetch` for `js.stripe.com`. RentCast and Stripe Checkout covered. Compliant.
- **Blocking calls** — Dashboard and property pages fetch from Prisma server-side; no slow external API calls blocking render. RentCast/Stripe are called from API routes or client-initiated requests. Compliant.

---

## Recommendations

1. **Fix benchmark refresh error status** — Change `app/api/properties/[id]/benchmark/refresh/route.ts` to return 502 or 503 (not 200) when RentCast fails. Clients (e.g. BenchmarkRefreshButton) already check `json.error`; returning proper status improves HTTP semantics and observability.
2. **Reduce shadow on amortization chart tooltip** — Replace `shadow-lg` with `shadow-sm` in `components/charts/amortization-chart.tsx` line 89 to align with design spec.
3. **Refactor BenchmarkDisplay to use lib/benchmark-utils** — Replace inline `SIXTY_DAYS_MS`, `isFresh`, and label logic with `isBenchmarkFresh`, `getBenchmarkDaysAgo`, `getBenchmarkLabel` from `lib/benchmark-utils.ts`. Single source of truth.
4. **Split add-property-wizard and property-form** — Break into smaller components (e.g., step components, shared wizard layout, form sections). Target files under ~300 lines.
5. **Evaluate revalidate for static content pages** — For Privacy, Terms (and optionally Pricing, Contact if content is static), add `export const revalidate = 3600` if auth/nav can be handled without forcing dynamic. May require refactoring nav to not block static generation. *Deferred in prior audit: auth-dependent nav makes caching unsafe.*

---

## Files Audited

- **Pages:** `app/(app)/dashboard/page.tsx`, `properties/page.tsx`, `properties/[id]/page.tsx`, `properties/new/page.tsx`, `deals/page.tsx`, `analyze/page.tsx`, `settings/page.tsx`, `plans/page.tsx`, `admin/page.tsx`, `billing/success/page.tsx`, `app/page.tsx`, `app/privacy/page.tsx`, `app/terms/page.tsx`, `app/pricing/page.tsx`, `app/contact/page.tsx`
- **Components:** `add-property-wizard.tsx`, `property-form.tsx`, `mortgage-form-fields.tsx`, `deal-analyzer-form.tsx`, `dashboard-charts.tsx`, `amortization-chart-dynamic.tsx`, `metric-help-modal.tsx`, `currency-input.tsx`, `chart-wrapper.tsx`, `metric-card.tsx`, `draft-context.tsx`, `delete-account-section.tsx`, `import-csv-section.tsx`, `landing-nav.tsx`, `footer.tsx`, `pricing-cards.tsx`, `benchmark-display.tsx`, `benchmark-refresh-button.tsx`
- **API routes:** `api/properties/route.ts`, `api/properties/[id]/route.ts`, `api/properties/[id]/benchmark/refresh/route.ts`, `api/properties/[id]/mortgage/route.ts`, `api/properties/[id]/mortgage/[mortgageId]/route.ts`, `api/deals/route.ts`, `api/deals/[id]/route.ts`, `api/import/portfolio/route.ts`, `api/export/portfolio/route.ts`, `api/account/delete/route.ts`, `api/account/delete-permanent/route.ts`, `api/billing/webhook/route.ts`, `api/billing/create-checkout-session/route.ts`, `api/estimates/rent/route.ts`, `api/estimates/value/route.ts`, `api/contact/route.ts`, `api/portfolio/summary/route.ts`, `api/billing/sync/route.ts`, `api/billing/portal/route.ts`
- **Lib:** `lib/auth.ts`, `lib/metrics/portfolio-metrics.ts`, `lib/metrics/property-metrics.ts`, `lib/plans.ts`, `lib/pricing-display.ts`, `lib/format-currency.ts`, `lib/benchmark-utils.ts`, `lib/validations/*`, `lib/import/csv-parser.ts`, `lib/integrations/rentcast.ts`
- **Config:** `next.config.ts`, `app/layout.tsx`, `app/globals.css`, `proxy.ts` (middleware)
