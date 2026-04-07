# Code Audit — 2026-04-07

**Lane:** Code audit (review-only; no application source edits)  
**Workspace:** `c:\Users\Refur\OneDrive\Documents\RealEstateProject\RealEstatePortfolio`  
**Process:** `docs/process/code-audit-process.md`  
**References read:** `docs/process/audit-report-template.md`, `docs/policies/design-spec.md`, `docs/architecture-and-build-practices.md`, `docs/security/security-notes.md`, `docs/design/design-spec-2026.md` (shadow/elevation + hero gradient sections)

---

## Executive summary

- **Overall health:** Layered flow, auth, and validation patterns remain strong: protected APIs consistently use `getActiveAppUser()`, portfolio summary delegates to `lib/server/portfolio-summary-payload.ts`, and `next.config.ts` already enables `experimental.optimizePackageImports` for `lucide-react` and `recharts`. The **2026-04-05** finding that `/api/unsubscribe` must be public is **resolved** — `"/api/unsubscribe"` appears in `app/proxy.ts`.
- **Top risk:** **`GET /api/places/autocomplete` and `GET /api/places/details` still have no `RATE_LIMITS` entry or `checkRateLimit` usage** (`app/lib/rate-limit.ts`, `app/app/api/places/autocomplete/route.ts`, `app/app/api/places/details/route.ts`). Authenticated users can drive unbounded Google Places billing via the API.
- **Maintainability:** Several UI surfaces remain far above the ~300-line guideline (`add-property-wizard.tsx` ~2,875 lines, `deal-analyzer-form.tsx` ~1,645, `projections-tab-content.tsx` ~1,349, etc.), with **duplicated `parseCurrencyNum`**, **duplicated `WizardData`**, and **duplicate mortgage aggregates** on the properties list page still present.
- **Recommendation:** Treat Places API rate limiting as the highest-priority fix; schedule incremental extraction of mega-files and shared helpers to reduce regression risk on property/deal flows.

---

## Severity-ranked findings

### Critical

- **None identified this pass.** Prior critical gap (unsubscribe blocked by Clerk when not signed in) is mitigated by public listing of `/api/unsubscribe` in `app/proxy.ts` (e.g. alongside other public API paths).

### High

- **Unbounded Google Places usage via authenticated API** — A logged-in caller can hammer `app/app/api/places/autocomplete/route.ts` and `app/app/api/places/details/route.ts`; neither imports `checkRateLimit` / `recordRateLimit`, and `app/lib/rate-limit.ts` `RATE_LIMITS` has no `places:*` actions. **Impact:** Cost abuse and quota exhaustion on the Google Cloud project; no server-side throttle beyond Zod query validation.

### Medium

- **Monolithic components vs architecture file-size guidance** — `docs/architecture-and-build-practices.md` §4.2 suggests reconsidering files past ~300 lines. Measured line counts (including blanks) under `app/`: `app/app/(app)/properties/add-property-wizard.tsx` (~2,875), `app/app/(app)/analyze/deal-analyzer-form.tsx` (~1,645), `app/app/(app)/properties/[id]/projections-tab-content.tsx` (~1,349), `app/app/(app)/properties/property-form.tsx` (~1,175), `app/app/(app)/properties/[id]/mortgage-tab-content.tsx` (~1,009), `app/app/(app)/properties/page.tsx` (~656), `app/app/(app)/refinance/refinance-workspace.tsx` (~755), `app/app/page.tsx` (~724), plus large marketing calculators under `app/components/marketing/`. **Impact:** Higher merge conflict and regression risk; harder onboarding for contributors.
- **Duplicated `parseCurrencyNum`** — Same helper exists in `app/app/(app)/properties/add-property-wizard.tsx` (~line 63) and `app/app/(app)/properties/property-form.tsx` (~line 162). Conflicts with single-source-of-truth guidance in architecture doc §2.2 / §4.1.
- **Duplicated `WizardData` type** — `export type WizardData` in both `app/app/(app)/properties/add-property-wizard.tsx` (~line 32) and `app/app/(app)/draft-context.tsx` (~line 46); shapes can drift silently.
- **Duplicate mortgage aggregation on properties list** — `app/app/(app)/properties/page.tsx` computes `totalMortgageBalance` / `totalMonthlyPayment` via `.reduce` in two separate mappings (~lines 163–167 and ~198–202). **Impact:** Wasted CPU on larger portfolios; noise when changing mortgage rollups.

### Low

- **Hardcoded production home link on unsubscribe HTML** — `app/app/api/unsubscribe/route.ts` (`htmlResponse`, ~line 67) uses `https://veldportfolio.com` for “Return to Veld Portfolio”. Staging/preview users land on production. Align with `getAppOrigin()` / `NEXT_PUBLIC_APP_URL` (same theme as prior audits).
- **Marketing / shell shadows above minimal “Raised”** — `shadow-lg` / `shadow-xl` / `shadow-2xl` appear on `app/app/page.tsx`, `app/app/pricing/page.tsx`, `app/app/(app)/onboarding-panel.tsx`, `app/components/consent/cookie-consent-banner.tsx`. Canonical elevation in `docs/design/design-spec-2026.md` §6 favors `shadow-sm` for most cards and reserves heavier shadows for modals / hero mockups; worth a visual pass for consistency (not automatically wrong — hero gradient is explicitly allowed in the 2026 spec).
- **`eslint-disable` for React hooks** — `react-hooks/exhaustive-deps` suppressed in `app/app/(app)/properties/property-form.tsx`, `app/app/(app)/refinance/refinance-workspace.tsx`; `react-hooks/set-state-in-effect` in `app/app/(app)/settings/theme-toggle.tsx`. Document intent or narrow deps to avoid stale closures.
- **`force-dynamic` usage** — Present on `app/app/(app)/layout.tsx`, `app/app/(app)/admin/layout.tsx`, `app/app/(app)/admin/page.tsx`, `app/app/(app)/analyze/page.tsx`. Consistent with authenticated shells; **not** on root `app/app/layout.tsx`, matching architecture guidance to avoid root-level force-dynamic unless required.
- **No `export const revalidate` in app routes** — Grep found none. Acceptable per `docs/architecture-and-build-practices.md` §2.5 for session-dependent marketing pages; static legal content could still be revisited if IA moves auth checks client-side.

---

## Evidence reviewed

| Area | What was checked |
|------|------------------|
| **Config / perf** | `app/next.config.ts` (`optimizePackageImports`, Sentry wrapper, CSP headers) |
| **Rendering** | `force-dynamic` grep under `app/`; root `app/app/layout.tsx` (fonts, preconnect/dns-prefetch for Clerk, Stripe, PostHog) |
| **Heavy UI** | `recharts` imports vs `next/dynamic` in workspace, chart shells, refinance loader |
| **Design tokens** | Grep for raw `zinc/slate/gray` Tailwind scales in TSX (no matches); semantic token usage appears dominant |
| **Type safety** | Grep for `: any` / `as any` in TS/TSX (no matches) |
| **API surface** | All `app/app/api/**/route.ts` handlers (44 files); auth helper usage; sample reads of `portfolio/summary`, `me`, `csp-report`, cron + unsubscribe |
| **Rate limits** | Full `app/lib/rate-limit.ts` `RATE_LIMITS` table vs Places routes |
| **Public routes** | `app/proxy.ts` `isPublicRoute` list |
| **File size** | Node line-count sweep for `*.ts` / `*.tsx` under `app/` excluding `node_modules` |

**Limits:** No full manual read of every line of multi-thousand-line components; no runtime profiling; no dependency vulnerability scan (out of scope for this lane unless paired with Snyk/security audit).

---

## Risk & impact assessment

- **Places API (High):** Likelihood of abuse is moderate (requires a valid account) but impact is direct financial and operational (API bills, service degradation). Internal testing or a compromised session could spike usage quickly.
- **Large files + duplication (Medium):** Daily product risk is slower delivery and more bugs per change; scales with team size and feature velocity.
- **Unsubscribe link / shadows / eslint (Low):** Mostly UX, environment correctness, and long-term maintainability; no immediate data breach indicated from this pass.

---

## Recommendations (prioritized)

1. **Add per-user rate limits** for `places:autocomplete` and `places:details` in `app/lib/rate-limit.ts`, call `checkRateLimit` / `recordRateLimit` from both Places route handlers, and document limits in `docs/security/security-notes.md`.
2. **Extract shared helpers:** move `parseCurrencyNum` to a small `lib/` module; consolidate `WizardData` in `draft-context.tsx` (or `lib/types`) and import from the wizard.
3. **Refactor `properties/page.tsx`** to compute mortgage rollups once per property (single pass or small helper) before building `portfolioInput` and `propertyCards`.
4. **Replace hardcoded unsubscribe return URL** with `getAppOrigin()` (or env) in `unsubscribe/route.ts`.
5. **Backlog decomposition:** plan phased splits for `add-property-wizard.tsx` and `deal-analyzer-form.tsx` (step components + hooks) without changing product behavior per slice.

---

## Task candidates (optional)

- [ ] Add `places:autocomplete` / `places:details` to `RATE_LIMITS` and wire `checkRateLimit` + `recordRateLimit` in `app/app/api/places/autocomplete/route.ts` and `app/app/api/places/details/route.ts`; update `docs/security/security-notes.md`.
- [ ] Deduplicate `parseCurrencyNum` → `lib/` and update wizard + property form imports.
- [ ] Single-source `WizardData` from `draft-context.tsx` (re-export); remove duplicate from `add-property-wizard.tsx`.
- [ ] Single-pass mortgage totals in `app/app/(app)/properties/page.tsx`.
- [ ] Use `getAppOrigin()` for the unsubscribe HTML footer link in `app/app/api/unsubscribe/route.ts`.

---

## Re-test checklist

- [ ] After Places limits: load addresses rapidly in add-property flow; confirm 429 after threshold; confirm normal UX under limit.
- [ ] After refactors: `npm run check`; exercise property create/edit and draft restore paths.
- [ ] After unsubscribe URL change: hit `/api/unsubscribe` on a preview deployment and confirm link targets preview origin.
- [ ] Regression smoke: portfolio summary, import CSV, deals list, refinance workspace charts.
- [ ] `npm run check` (and `npm run test` if metrics/validation touched per architecture doc).

---

## Next trigger and cadence

- **Trigger:** Monthly or after major feature work touching API routes, auth, billing, or large property/deal UI.
- **Suggested next window:** 2026-05-07 or next release milestone.
