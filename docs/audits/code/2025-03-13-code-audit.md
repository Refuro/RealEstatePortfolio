# Code Audit — 2025-03-13

## Summary

The codebase is generally healthy and aligned with design, architecture, and security practices. Auth and authorization are consistently applied; semantic design tokens are used throughout; and shared components (CurrencyInput, ChartWrapper, MortgageFormFields) are reused. Top findings: (1) **`force-dynamic` on app layout** forces all protected pages to be dynamic — consider scoping to layout only or pages that need request-time data; (2) **Several files exceed ~300 lines** (add-property-wizard ~1356, property-form ~778); (3) **Public pages (privacy, terms, pricing, contact) lack `revalidate`** — could be cached for better performance; (4) **`shadow-lg` on landing-nav mobile menu** conflicts with design spec’s “flat or very subtle shadow”; (5) **Create-checkout-session uses manual validation** instead of Zod — minor consistency gap.

**Issues addressed (post-audit):** See [Issues Addressed](#issues-addressed-post-audit) below.

---

## Findings

### Design Compliance

- **Semantic tokens used consistently** — `text-muted`, `bg-subtle`, `border-border`, `text-positive`, `text-negative`, `bg-accent` appear across pages and components. No raw zinc/slate/emerald in components; only in `globals.css` for theme variables.
- **Heavy shadow on mobile nav** — **Addressed:** Verified mobile drawer uses `shadow-sm`; compliant with design spec. Design spec §9: “Prefer flat or very subtle shadow.” — **low** — `components/landing-nav.tsx`
- **Modals use subtle shadow** — `metric-help-modal.tsx` and `draft-context.tsx` use `shadow-sm`; acceptable per spec.
- **Token naming** — Design spec mentions `border-default`; codebase uses `border-border`. Both map to `--border` in `globals.css`; behavior is correct. — **low**
- **Typography** — Page titles use `text-2xl font-semibold`, section headers `text-sm font-semibold uppercase tracking-wide text-muted`, metric values `text-2xl`/`text-3xl`. Aligned with design spec.
- **No decorative gradients** — No violations of “avoid decorative gradients.”

### Architecture Compliance

- **Layered data flow** — Pages and API routes call `getAppUser()`/`getActiveAppUser()`, use lib for metrics/validations, and keep routes thin. Business logic in `lib/metrics/`, `lib/validations/`.
- **Single source of truth** — Metrics in `lib/metrics/`, plans in `lib/plans.ts`, pricing in `lib/pricing-display.ts`. No duplicated formulas.
- **Component reuse** — CurrencyInput used in deal-analyzer-form, property-form, add-property-wizard, mortgage-form-fields. ChartWrapper used by all chart components. MortgageFormFields reused.
- **API conventions** — All protected routes use `getActiveAppUser()` (or `getAppUser()` where appropriate); Zod validation on property, deal, mortgage, estimate, account routes. `userId`-scoped queries throughout.
- **File size** — `add-property-wizard.tsx` ~1356 lines; `property-form.tsx` ~778 lines. Architecture doc: “If a file grows past ~300 lines, consider splitting.” — **medium** — `app/(app)/properties/add-property-wizard.tsx`, `app/(app)/properties/property-form.tsx`
- **Import route** — CSV parsing in `lib/import/csv-parser.ts`; route delegates to lib. Good separation.

### Efficiency

- **Server rendering** — Dashboard, properties, deals pages are server components; data fetched server-side. No unnecessary client fetches.
- **Prisma queries** — Properties use `include: { mortgages: true }`; no N+1 in list views.
- **formatCurrency** — Centralized in `lib/format-currency.ts`; used across dashboard, properties, deals, charts.
- **Layout caching** — App layout uses `unstable_cache` with 30s revalidate for banner data. Good.
- **Bundle** — `optimizePackageImports` includes lucide-react and recharts. No obvious bloat.

### Technical Debt & Corners

- **Large files** — `add-property-wizard.tsx` (1356 lines) and `property-form.tsx` (778 lines) exceed ~300-line guideline. Consider splitting into step components or extracting form sections. — **medium**
- **Scaling** — No obvious blockers for 100 properties or 1000 users. Limit utils and plan checks in place.
- **No `any` types** — Grep found no `: any` or `as any` in the codebase. Type safety is strong.

### Security

- **Auth** — All protected API routes call `getActiveAppUser()` and return 401 if null. Billing webhook correctly excluded (Stripe signature verification).
- **Authorization** — All data access scoped by `userId`; no IDOR risk.
- **Validation** — Property, deal, mortgage, estimate, account routes use Zod. Import route uses `parseRow` from lib. Contact uses `contactFormSchema`.
- **Permanent delete** — `deletePermanentAccountSchema` validates `confirmText === "DELETE"`; server-side enforcement in place.
- **Create-checkout-session** — ~~Uses manual validation instead of Zod.~~ **Addressed:** Added `lib/validations/checkout.ts` with Zod schema; route now uses `createCheckoutSessionSchema` for validation. — `app/api/billing/create-checkout-session/route.ts`
- **Secrets** — Env vars only; no secrets in client code. `NEXT_PUBLIC_*` used only for pricing display and app URL.
- **Rate limiting** — Rent estimate (20/hr) and contact form (5/hr) have rate limits. Good.

### Product Mantra

- **Thoughtful** — Edge cases (plan limits, vacancy, ownership) handled. Empty states and CTAs are clear.
- **Robust** — Stripe fetch failures in settings fall back to DB value. Error boundaries and not-found pages exist.
- **Modern** — Next.js App Router, React 19, TypeScript. No deprecated patterns observed.
- **Frictionless** — Progressive disclosure (expandable sections), clear CTAs. Deleted-user restore flow in place.

### Performance

- **Heavy libraries (charts)** — `dashboard-charts.tsx` and `amortization-chart-dynamic.tsx` use `next/dynamic` with `ssr: false` for Recharts. Loading placeholders shown. Compliant. — `app/(app)/dashboard/dashboard-charts.tsx`, `app/(app)/properties/[id]/amortization-chart-dynamic.tsx`
- **force-dynamic on app layout** — **Addressed:** Comment added documenting rationale. `app/(app)/layout.tsx` exports `dynamic = "force-dynamic"`. Architecture doc §2.5: “Do not add force-dynamic to root layout unless required.” The app layout needs user-specific data (banner counts, subscription), so dynamic is justified. However, this forces all child pages (dashboard, properties, etc.) to be dynamic. Rationale now documented in code. — `app/(app)/layout.tsx`
- **force-dynamic on admin/analyze** — `admin/page.tsx`, `admin/layout.tsx`, `analyze/page.tsx` also export `force-dynamic`. Redundant if parent layout is already dynamic; acceptable for clarity. — **low**
- **Public pages lack revalidate** — Privacy, Terms, Pricing, Contact pages do not export `revalidate`. Architecture doc: “For pages that rarely change (Privacy, Terms), add `export const revalidate = 3600`.” These pages call `auth()` or `getAppUser()` for nav state, which may force dynamic. If nav can be client-side or deferred, consider `revalidate` for static content. — **medium** — `app/privacy/page.tsx`, `app/terms/page.tsx`, `app/pricing/page.tsx`, `app/contact/page.tsx`
- **Images** — No user-facing `<img>` or `next/image` in body content. Metadata uses `/favicon.png`, `/og-image.png`, `/logo.png` (in JSON-LD). No raw `<img>` tags found. — **compliant**
- **optimizePackageImports** — `next.config.ts` includes `lucide-react` and `recharts`. Compliant.
- **Preconnect/dns-prefetch** — Root layout has `preconnect` for `api.rentcast.io` and `dns-prefetch` for `js.stripe.com`. RentCast and Stripe Checkout covered. — **compliant**
- **Blocking calls** — Dashboard and property pages fetch from Prisma server-side; no slow external API calls blocking render. RentCast/Stripe are called from API routes or client-initiated requests. — **compliant**

---

## Recommendations

1. **Add `revalidate` to static content pages** — For Privacy, Terms (and optionally Pricing, Contact if content is static), add `export const revalidate = 3600` if auth/nav can be handled without forcing dynamic. May require refactoring nav to not block static generation. *Deferred: auth-dependent nav makes caching unsafe.*
2. **Split add-property-wizard and property-form** — Break into smaller components (e.g., step components, shared wizard layout, form sections). Target files under ~300 lines.
3. ~~**Reduce shadow on mobile nav**~~ — **Done.** Mobile drawer verified to use `shadow-sm`.
4. ~~**Consider Zod for create-checkout-session**~~ — **Done.** Added `lib/validations/checkout.ts` and updated route.
5. ~~**Document force-dynamic rationale**~~ — **Done.** Comment added in `app/(app)/layout.tsx`.

---

## Issues Addressed (Post-Audit)

The following findings were addressed after the audit:

| Finding | Resolution |
|---------|------------|
| **Mobile nav shadow** | Verified `landing-nav.tsx` mobile drawer uses `shadow-sm`; no change needed. Compliant with design spec. |
| **Document force-dynamic** | Added comment above `export const dynamic = "force-dynamic"` in `app/(app)/layout.tsx` explaining rationale: user-specific banner data (property/deal counts, subscription status) and getAppUser(). |
| **Create-checkout-session validation** | Created `lib/validations/checkout.ts` with `createCheckoutSessionSchema` (plan: investor \| pro, billingCycle: monthly \| yearly with default). Route now uses Zod `safeParse`; returns 400 with error message on invalid input. |

---

## Files Audited

- **Pages:** `app/(app)/dashboard/page.tsx`, `properties/page.tsx`, `properties/[id]/page.tsx`, `properties/new/page.tsx`, `deals/page.tsx`, `analyze/page.tsx`, `settings/page.tsx`, `plans/page.tsx`, `admin/page.tsx`, `billing/success/page.tsx`, `app/page.tsx`, `app/privacy/page.tsx`, `app/terms/page.tsx`, `app/pricing/page.tsx`, `app/contact/page.tsx`
- **Components:** `add-property-wizard.tsx`, `property-form.tsx`, `mortgage-form-fields.tsx`, `deal-analyzer-form.tsx`, `dashboard-charts.tsx`, `amortization-chart-dynamic.tsx`, `metric-help-modal.tsx`, `currency-input.tsx`, `chart-wrapper.tsx`, `metric-card.tsx`, `draft-context.tsx`, `delete-account-section.tsx`, `import-csv-section.tsx`, `landing-nav.tsx`, `footer.tsx`, `pricing-cards.tsx`
- **API routes:** `api/properties/route.ts`, `api/properties/[id]/route.ts`, `api/properties/[id]/mortgage/route.ts`, `api/properties/[id]/mortgage/[mortgageId]/route.ts`, `api/deals/route.ts`, `api/deals/[id]/route.ts`, `api/import/portfolio/route.ts`, `api/export/portfolio/route.ts`, `api/account/delete/route.ts`, `api/account/delete-permanent/route.ts`, `api/billing/webhook/route.ts`, `api/billing/create-checkout-session/route.ts`, `api/estimates/rent/route.ts`, `api/estimates/value/route.ts`, `api/contact/route.ts`
- **Lib:** `lib/auth.ts`, `lib/metrics/portfolio-metrics.ts`, `lib/metrics/property-metrics.ts`, `lib/plans.ts`, `lib/pricing-display.ts`, `lib/format-currency.ts`, `lib/validations/*`, `lib/import/csv-parser.ts`, `lib/integrations/rentcast.ts`
- **Config:** `next.config.ts`, `app/layout.tsx`, `app/globals.css`, `proxy.ts` (middleware)
