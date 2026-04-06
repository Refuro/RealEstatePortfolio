# Code Audit — 2026-04-05

**Auditor:** Code Audit Lane (automated)  
**Scope:** `app/app/`, `app/components/`, `app/lib/`, `app/prisma/`  
**References:** `docs/policies/design-spec.md`, `docs/architecture-and-build-practices.md`, `docs/security/security-notes.md`

---

## Summary

The codebase is architecturally sound: auth, authorization, and Zod validation are applied consistently across all API routes; design tokens are properly configured and used; Recharts and other heavy libraries are correctly lazy-loaded. Two issues demand prompt attention: (1) the `/api/unsubscribe` route is not listed as a public route in `proxy.ts`, meaning email unsubscribe links silently 401 for users who click them outside an active session — a CAN-SPAM/GDPR compliance gap; (2) the `places/autocomplete` and `places/details` API routes call the Google Places API on every request with no per-user rate limit, creating uncapped external API cost exposure. Beyond these, the dominant theme is **file-size debt**: `add-property-wizard.tsx` is 2,864 lines (nearly 10× the 300-line guideline), and several other form/workspace files are similarly oversized. There is also minor logic duplication (`parseCurrencyNum`, `WizardData` type) that should be consolidated.

---

## Findings

### Security

#### SEC-1 — `/api/unsubscribe` not in public route list — **Critical**

**File:** `app/proxy.ts` (isPublicRoute list) + `app/app/api/unsubscribe/route.ts`

`proxy.ts` uses Clerk middleware. Non-public routes call `auth.protect()`. For API routes, Clerk returns **HTTP 401** to unauthenticated callers. The `/api/unsubscribe` route is intentionally auth-free (HMAC token in URL provides security), but it is **not** listed in `isPublicRoute`. Any user who clicks an unsubscribe link from an email when they are not currently signed in to the app receives a 401. Opt-out intent is silently dropped. This is both a functional bug and a potential CAN-SPAM / GDPR compliance gap.

```
// proxy.ts — current isPublicRoute (excerpt)
"/api/billing/webhook",
"/api/contact",
"/api/csp-report",
"/api/health",
// "/api/unsubscribe" is missing
```

**Fix:** Add `"/api/unsubscribe"` to `isPublicRoute` in `proxy.ts`. The HMAC token in the URL provides the necessary security; no Clerk auth needed.

---

#### SEC-2 — `places/autocomplete` and `places/details` routes have no rate limit — **High**

**Files:** `app/app/api/places/autocomplete/route.ts`, `app/app/api/places/details/route.ts`

Both routes proxy requests to the Google Places API. They are authenticated (require `getActiveAppUser()`), but there is no per-user rate limit. A logged-in user can call these endpoints in rapid succession, generating unbounded Google API usage. Client-side debouncing is the only current guard; a motivated caller bypassing the UI has none. The equivalent `RATE_LIMITS` entries (`places:autocomplete`, `places:details`) do not exist in `lib/rate-limit.ts`.

**Fix:** Add `places:autocomplete` and `places:details` actions to `RATE_LIMITS` (e.g., 300 and 60 per hour respectively) and add `checkRateLimit`/`recordRateLimit` calls in both routes.

---

#### SEC-3 — Hardcoded production URL in `/api/unsubscribe/route.ts` — **Low**

**File:** `app/app/api/unsubscribe/route.ts` line 67

The "Return to Veld Portfolio" link in the HTML response hardcodes `https://veldportfolio.com`. This works in production but breaks in staging/preview deployments; the user gets a link back to the wrong environment. The helper `getAppOrigin()` from `lib/app-url.ts` (or `process.env.NEXT_PUBLIC_APP_URL`) is the correct source of truth. The same fallback pattern exists in `lib/emails/onboarding-reengagement.ts` line 17.

---

### Architecture Compliance

#### ARCH-1 — `add-property-wizard.tsx` massively exceeds file-size guideline — **High**

**File:** `app/app/(app)/properties/add-property-wizard.tsx` — **2,864 lines / 103 KB**

The architecture guideline flags files over ~300 lines for splitting consideration. At nearly 10× that, this file contains: form state management, 4+ render steps, inline validation logic, client-side API calls (rent/value estimate, places autocomplete), analytics event firing, mortgage form orchestration, unit-rent management, and all JSX. This creates:

- High cognitive overhead when making localized changes (e.g., adding a new wizard step or editing validation)
- Risk of merging conflicts if two tasks touch this file simultaneously
- No reusability of the step sub-components

Primary candidate areas for extraction: each numbered wizard step as a sub-component, the `parseCurrencyNum` helper (see ARCH-3), and the estimate-fetching logic.

---

#### ARCH-2 — Other form/workspace files well over size guideline — **Medium**

| File | Lines (approx) | KB |
|---|---|---|
| `add-property-wizard.tsx` | ~2,864 | 103 |
| `deal-analyzer-form.tsx` | ~1,615 | 63 |
| `projections-tab-content.tsx` | ~50 KB | ~1,300 |
| `property-form.tsx` | ~1,159 | 43 |
| `mortgage-tab-content.tsx` | ~37 KB | ~950 |
| `refinance-workspace.tsx` | ~744 | 28 |

All are over the 300-line guideline. The deal analyzer and projections tab are the highest-priority after the wizard. These are not urgent individually, but over time they accumulate coupling and make individual feature changes riskier.

---

#### ARCH-3 — `parseCurrencyNum` duplicated across files — **Medium**

**Files:** `app/app/(app)/properties/add-property-wizard.tsx` line 63, `app/app/(app)/properties/property-form.tsx` line 153

Identical function defined twice:

```ts
function parseCurrencyNum(s: string): number {
  const cleaned = String(s ?? "").replace(/,/g, "").replace(/[^0-9.]/g, "");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}
```

This belongs in `lib/format-currency.ts` (or a new `lib/currency-utils.ts`) so both files import it from a single source. Per architecture principles: "if the same logic appears in two places, move it."

---

#### ARCH-4 — `WizardData` type duplicated in two files — **Medium**

**Files:** `app/app/(app)/properties/add-property-wizard.tsx` line 32, `app/app/(app)/draft-context.tsx` line 46

Both files define `export type WizardData` with identical shapes. The wizard already imports `useDraft` from `draft-context`, so the type should live only in `draft-context.tsx` and be re-exported from there. `add-property-wizard.tsx` should import it rather than redefining it.

---

#### ARCH-5 — `properties/page.tsx` processes mortgage data twice — **Medium**

**File:** `app/app/(app)/properties/page.tsx` lines ~162–183 and ~197–215

`totalMortgageBalance` and `totalMonthlyPayment` are each computed with separate `.reduce()` calls in the `portfolioInput` mapping block, then computed a **second time** identically in the `propertyCards` mapping block just 15 lines later. The two loops iterate over every property's mortgages array twice. This is harmless at 1–20 properties but adds unnecessary overhead and signals the logic should be refactored into a single pass or a shared computed property:

```ts
// currently done twice:
const totalMortgageBalance = p.mortgages.reduce((sum, m) => sum + getEffectiveBalance(m), 0);
const totalMonthlyPayment = p.mortgages.reduce((sum, m) => sum + Number(m.monthlyPayment), 0);
```

**Fix:** Compute these once per property in a single preparatory `map`, then use the pre-computed values in both `portfolioInput` and `propertyCards`.

---

#### ARCH-6 — Admin page uses `getAppUser()` while layout uses `getActiveAppUser()` — **Low**

**Files:** `app/app/(app)/admin/layout.tsx` (uses `getActiveAppUser()`), `app/app/(app)/admin/page.tsx` line 20 (uses `getAppUser()`)

The admin layout correctly uses `getActiveAppUser()` (blocks soft-deleted accounts) and the layout guard runs before the page. The page then calls `getAppUser()` for a second user check. This is functionally safe because the layout guard already fired, but it is inconsistent: the page's check will not catch soft-deleted users if ever called outside the layout. Best to use `getActiveAppUser()` uniformly in admin pages for clarity.

---

#### ARCH-7 — Admin stats use JS-side averaging instead of DB aggregation — **Low**

**File:** `app/app/(app)/admin/page.tsx` lines 92–96

`usersWithPropertiesForAvg` fetches up to 500 user rows with `_count: { select: { properties: true } }` purely to compute an average property count in JavaScript. A single Prisma aggregation query (`_avg` on the count or a raw SQL `AVG`) would be cheaper and would scale past 500 users:

```ts
// current approach: fetch 500 rows, average in JS
prisma.user.findMany({ ..., take: 500 })
// then .reduce to avg
```

Low priority (admin-only, low traffic), but a database aggregate is the correct solution.

---

### Technical Debt & Corners

#### DEBT-1 — Onboarding cron route has serial per-user DB writes — **Low**

**File:** `app/app/api/cron/onboarding-emails/route.ts` lines 74–111

The cron handler loops over candidate users and, for each sent email, runs two sequential DB writes (`prisma.user.update` + `captureServerEvent`). The candidate set is bounded by a time window (at most a few days of new zero-property users), so the absolute volume is small. However, a burst in signups could push this to dozens of DB calls sequentially. A batched approach (`updateMany` with an array of IDs to update the sentinel field after all emails are sent) would reduce round-trips. Not urgent given cron timing, but worth noting as user growth scales.

---

#### DEBT-2 — Motion tokens defined in CSS but not exposed to Tailwind utilities — **Low**

**File:** `app/app/globals.css` lines 27–31

`--duration-fast`, `--duration-base`, `--duration-slow`, `--ease-out`, `--ease-in-out` are defined as CSS custom properties but are **not** mapped in the `@theme inline` block (lines 131–154). They can only be used as `var(--duration-fast)` in inline styles or raw CSS, not as Tailwind classes like `duration-fast`. The `@theme inline` block already maps all color and font tokens; adding motion tokens would make them first-class Tailwind utilities consistent with the rest of the design system.

---

#### DEBT-3 — Unsubscribe HTML response uses raw stone colors — **Low**

**File:** `app/app/api/unsubscribe/route.ts` lines 58–60

The inline `<style>` block in the HTML unsubscribe response uses raw hex colors (`#fafaf9`, `#1c1917`, `#57534e`, `#e7e5e4`) that are not design-system tokens. Since this is a plain-HTML server response (not a React component), CSS variables can't be used — but the specific values used don't match the design token definitions (e.g., `--background` is `#fafafa`, not `#fafaf9`; `#57534e` is stone-600, not `--foreground-muted`). Low risk but results in a slightly off-brand unsubscribe page.

---

### Design Compliance

#### DESIGN-1 — Raw `shadow-md` on hover in app property cards — **Low**

**Files:** `app/app/(app)/properties/page.tsx` lines 439, 540; `app/app/(app)/dashboard/page.tsx` lines 138, 147

Property cards use `shadow-sm` base + `hover:shadow-md` for hover elevation. The design spec says "prefer flat or very subtle shadow." `shadow-sm` is on the acceptable edge; `hover:shadow-md` on hover is a mild violation. The `transition-shadow duration-150` makes this feel modern, but the spec explicitly flags `shadow-md` as "heavy." Consider replacing with a `hover:border-foreground/20` or `hover:bg-subtle/40` approach already used elsewhere in the codebase.

**Note:** The address autocomplete dropdown (`components/property/address-autocomplete-input.tsx`) and consent banner also use `shadow-lg` / `shadow-md` for overlay positioning — these are contextually appropriate (dropdowns and floating banners benefit from elevation) and are acceptable exceptions.

---

#### DESIGN-2 — Design tokens correctly configured and applied — **Pass**

`globals.css` maps all required design tokens (`--background`, `--foreground-muted`, `--accent`, `--positive`, `--negative`, `--border`, chart tokens, etc.) in both light and dark mode. The `@theme inline` block exposes them as Tailwind utilities (`text-muted`, `bg-subtle`, `text-positive`, etc.). A search across all `.tsx` files found **no raw zinc/slate/emerald/gray utility classes** in component or page code. Design token compliance is strong.

---

#### DESIGN-3 — Typography scale used consistently — **Pass**

Spot checks on dashboard, properties, analyze, and admin pages confirm page titles use `text-2xl font-semibold`, section headers use the `text-sm font-semibold uppercase tracking-wide text-muted` pattern, and metric values use `text-2xl`/`text-lg font-medium` as specified. No ad-hoc font sizes observed.

---

### Efficiency

#### EFF-1 — Heavy libraries are correctly lazy-loaded — **Pass**

All Recharts consumers that render at page load are wrapped in `next/dynamic` with `ssr: false` and loading placeholders:

- `dashboard-charts.tsx` — `EquityChart`, `DebtVsValueChart`, `CashFlowChart` all dynamic
- `modeling-workspace.tsx` — `ProjectionsTabContent` dynamic
- `mortgage-workspace.tsx` — `MortgageTabContent` dynamic
- `refinance-workspace-loader.tsx` — `RefinanceWorkspace` dynamic
- `amortization-chart-dynamic.tsx` — dedicated dynamic loader

The only direct Recharts imports are inside components that are themselves already lazily loaded. No above-the-fold Recharts bundle impact detected.

---

#### EFF-2 — `optimizePackageImports` configured — **Pass**

`next.config.ts` line 62:

```ts
experimental: {
  optimizePackageImports: ["lucide-react", "recharts"],
},
```

Both major icon and chart libraries are covered.

---

#### EFF-3 — `force-dynamic` used appropriately — **Pass**

`force-dynamic` appears in `app/(app)/layout.tsx` (required — user-specific session data), `app/(app)/admin/layout.tsx` (required — admin data), and `app/(app)/analyze/page.tsx` (required — deal count query). Not set at root layout or on static marketing pages. This is correct per architecture practices.

---

#### EFF-4 — App layout uses `unstable_cache` for banner data — **Pass**

`app/(app)/layout.tsx` wraps property/deal count and subscription queries in `unstable_cache` with a 30-second TTL. This avoids re-fetching these counts on every navigation while keeping the layout data reasonably fresh.

---

### Performance

#### PERF-1 — `revalidate` missing on privacy/terms pages — **Informational (by design)**

`app/privacy/page.tsx` and `app/terms/page.tsx` call `auth()` from Clerk to serve different nav for signed-in vs guest users. Per `docs/architecture-and-build-practices.md` §2.5, these pages are intentionally dynamic (session-dependent HTML is not snapshot-stable) and do not use `export const revalidate`. This is documented and correct — no change needed.

---

#### PERF-2 — Preconnect/dns-prefetch configured for all major third parties — **Pass**

`app/layout.tsx` lines 160–178 set preconnect for RentCast and Clerk, `dns-prefetch` for Stripe, and conditional preconnect for PostHog. This covers the main external origins.

---

### Product Mantra

#### PM-1 — Wizard friction concentrated in one massive file — **Medium**

The add-property wizard is the primary onboarding and conversion flow, yet its entire implementation (all steps, validation, API calls, analytics, mobile handling) lives in one 2,864-line file. This makes it harder to iterate on the onboarding experience (a product priority per `docs/plans/2026-04-05-onboarding-activation-rollout.md`). The file's size creates friction for safe iteration: a developer making a step-1 change risks touching code for steps 2–5.

---

### Schema & Prisma

#### SCHEMA-1 — Schema is well-indexed and normalized — **Pass**

All models have `@@index([userId])` where appropriate. Foreign keys use `onDelete: Cascade` to prevent orphaned records. The `RentCastApiCall` model uses `@@index([userId, createdAt])` matching the quota query pattern. `ApiRateLimitEntry` uses `@@index([identifier, action, createdAt])` matching the rate-limit lookup. No N+1 query patterns detected in Prisma usage — all relational data is fetched via `include` or batch queries.

---

#### SCHEMA-2 — `hasMortgage` field is semi-derived and nullable — **Low**

**Model:** `Property.hasMortgage Boolean?`

`hasMortgage` is set to `true` when a mortgage is created (via a second `prisma.property.update` after `prisma.mortgage.create` in `api/properties/route.ts` lines 194–198). It can be `null` (unknown), `true` (user said yes but mortgage may not exist), or `false` (explicitly confirmed no mortgage). This tri-state is intentional (drives the completeness score in `lib/property-completeness.ts`), but the double-write pattern (create property, create mortgage, then patch `hasMortgage`) introduces a window where a property could exist with `hasMortgage: null` but a mortgage row already attached if the update fails. Low risk given Prisma's reliability, but a transaction would be cleaner.

---

## Recommendations

Prioritized list for PM consideration. SEC-1 should be addressed promptly.

### P0 — Fix before next deploy
1. **SEC-1:** Add `/api/unsubscribe` to `isPublicRoute` in `proxy.ts`. (< 1 line change)

### P1 — High value / low effort
2. **SEC-2:** Add rate limit entries for `places:autocomplete` and `places:details` in `lib/rate-limit.ts` and call them in both routes. (30–60 min)
3. **SEC-3 + DEBT-related:** Replace hardcoded `https://veldportfolio.com` in `api/unsubscribe/route.ts` with `getAppOrigin()`. (5 min)
4. **ARCH-3:** Move `parseCurrencyNum` to `lib/format-currency.ts` (or `lib/currency-utils.ts`) and replace both inline definitions with an import. (15 min)
5. **ARCH-4:** Remove duplicate `WizardData` type from `add-property-wizard.tsx`; import it from `draft-context.tsx`. (10 min)

### P2 — Medium effort / medium value
6. **ARCH-5:** Refactor `properties/page.tsx` to compute `totalMortgageBalance`/`totalMonthlyPayment` once per property in a preparatory map, reuse in both `portfolioInput` and `propertyCards`.
7. **DEBT-2:** Map motion tokens (`--duration-*`, `--ease-*`) in `globals.css` `@theme inline` so they're available as Tailwind utilities.
8. **ARCH-1/PM-1:** Begin splitting `add-property-wizard.tsx` — extract each step as a sub-component file. This is a multi-session effort; suggest tackling one step per task.

### P3 — Lower priority / good hygiene
9. **ARCH-2:** Incrementally split `deal-analyzer-form.tsx` (~1,615 lines) and other over-limit files.
10. **ARCH-6:** Use `getActiveAppUser()` consistently in admin pages, not just admin layout.
11. **ARCH-7:** Replace JS-side property average calculation in `admin/page.tsx` with a DB aggregation.
12. **DEBT-1:** Batch the sentinel-field updates in the onboarding cron handler.
13. **DESIGN-1:** Replace `hover:shadow-md` on app property cards with a non-shadow hover indicator.

---

## Task Candidates

- [ ] SEC-1: Add `/api/unsubscribe` to `isPublicRoute` in `proxy.ts`
- [ ] SEC-2: Add rate limits for `places:autocomplete` and `places:details` (add entries to `RATE_LIMITS`, add `checkRateLimit`/`recordRateLimit` calls in both route files)
- [ ] SEC-3: Replace hardcoded `https://veldportfolio.com` in `api/unsubscribe/route.ts` with `getAppOrigin()`
- [ ] ARCH-3: Move `parseCurrencyNum` to `lib/format-currency.ts`; update both consumers
- [ ] ARCH-4: Remove duplicate `WizardData` type from `add-property-wizard.tsx`; import from `draft-context.tsx`
- [ ] ARCH-5: Refactor `properties/page.tsx` to avoid computing mortgage totals twice per property
- [ ] DEBT-2: Map motion tokens in `globals.css` `@theme inline` block
- [ ] ARCH-1 (multi-task): Split `add-property-wizard.tsx` into per-step sub-components
- [ ] ARCH-2: Incrementally split `deal-analyzer-form.tsx`
- [ ] ARCH-6: Use `getActiveAppUser()` in `admin/page.tsx` for consistency
- [ ] ARCH-7: Replace JS-side average in admin stats with DB aggregation
- [ ] DEBT-1: Batch DB writes in onboarding cron handler
- [ ] DESIGN-1: Replace `hover:shadow-md` on property cards with non-shadow hover state

---

## Files Audited

| Area | Key files reviewed |
|---|---|
| Config | `next.config.ts`, `proxy.ts`, `prisma/schema.prisma`, `package.json` |
| CSS / tokens | `app/globals.css` |
| Root layout | `app/layout.tsx`, `app/(app)/layout.tsx` |
| API routes | `api/properties/route.ts`, `api/properties/[id]/route.ts`, `api/places/autocomplete/route.ts`, `api/places/details/route.ts`, `api/estimates/rent/route.ts`, `api/onboarding/route.ts`, `api/unsubscribe/route.ts`, `api/cron/onboarding-emails/route.ts`, `api/admin/export/users/route.ts`, `api/billing/*` |
| App pages | `(app)/properties/page.tsx`, `(app)/dashboard/page.tsx`, `(app)/analyze/page.tsx`, `(app)/admin/page.tsx`, `(app)/admin/layout.tsx` |
| Form/wizard | `add-property-wizard.tsx`, `property-form.tsx`, `deal-analyzer-form.tsx` |
| Workspaces | `refinance-workspace.tsx`, `refinance-workspace-loader.tsx`, `modeling-workspace.tsx`, `mortgage-workspace.tsx`, `dashboard-charts.tsx` |
| Lib | `lib/plans.ts`, `lib/rate-limit.ts`, `lib/metrics/property-metrics.ts`, `lib/metrics/portfolio-metrics.ts`, `lib/property-completeness.ts`, `lib/format-currency.ts`, `lib/auth.ts`, `lib/emails/onboarding-reengagement.ts` |
| Components | `components/currency-input.tsx`, `components/metric-card.tsx`, `components/mobile-tool-shell.tsx` |
| Draft context | `(app)/draft-context.tsx` |
