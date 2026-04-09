# Code Audit — 2026-04-09

## Executive summary

- **Overall health:** Layered auth and data access remain strong: protected API handlers sampled use `getActiveAppUser()` with `userId`-scoped Prisma access; `POST /api/billing/portal` validates with `billingPortalBodySchema` (`app/lib/validations/checkout`); `next.config.ts` sets `experimental.optimizePackageImports` for `lucide-react` and `recharts`, and security headers/CSP wiring match `docs/security/security-notes.md` expectations.
- **Regression closed:** `app/proxy.ts` now whitelists **all** `vercel.json` cron paths (`milestone-emails`, `monthly-refresh`, `monthly-digest`, `winback-emails` alongside the older three), so Vercel Cron can reach Bearer+`CRON_SECRET` handlers without Clerk session — this addresses the critical misalignment reported in an earlier 2026-04-09 draft.
- **Residual focus:** Very large client modules (`add-property-wizard.tsx`, `deal-analyzer-form.tsx`) still far exceed the ~300-line maintainability guideline; authenticated `/calculators/rent-vs-buy` still **statically** imports `RentVsBuyCalculator`, pulling Recharts into that route’s graph unlike the public `/tools/rent-vs-buy` pattern (`RentVsBuySlot` / `next/dynamic`).
- **Recommendation:** Keep incremental extraction from mega-components; align in-app calculator routes with the dynamic slot pattern where charts load; fix unsubscribe confirmation link to use app origin for non-production environments.

## Severity-ranked findings

### Critical

- *(None re-verified on this pass.)* Prior concern that Clerk `auth.protect()` blocked cron routes is **not** present in the current tree: `app/proxy.ts` lines 25–31 match `vercel.json` cron `path` values.

### High

- *(None mandatory.)* Marketing **location** calculator pages route through `CalculatorLocationSlot` → `calculator-page-slots.tsx` (`next/dynamic` per calculator), which addresses the earlier “static import all calculators on location pages” bundle risk. **Evidence:** `app/components/marketing/calculator-location-page.tsx` (imports `CalculatorLocationSlot`), `app/components/marketing/calculator-location-slot.tsx`, `app/components/marketing/calculator-page-slots.tsx`.

### Medium

- **Monolithic UI modules vs architecture file-size guidance** — `docs/architecture-and-build-practices.md` §4.2 recommends splitting past ~300 lines. Current sizes are an order of magnitude larger on core flows: `app/app/(app)/properties/add-property-wizard.tsx` extends past line ~2875; `app/app/(app)/analyze/deal-analyzer-form.tsx` extends past line ~1645. **Risk/impact:** Merge conflicts, slower review, higher regression cost on property and deal flows.
- **In-app Rent vs Buy page loads Recharts via static import** — `app/app/(app)/calculators/rent-vs-buy/page.tsx` imports `RentVsBuyCalculator` from `rent-vs-buy-calculator.tsx`, which imports `recharts` at module top. Public `app/app/tools/rent-vs-buy/page.tsx` uses `RentVsBuySlot` (dynamic). **Risk/impact:** Heavier initial JS for signed-in calculator page vs documented `next/dynamic` + `ssr: false` pattern for chart libraries (`docs/architecture-and-build-practices.md` §2.5).

### Low

- **Design spec: stronger shadows on marketing/onboarding** — `docs/policies/design-spec.md` / `design-spec-2026.md` emphasize clarity over decoration; grep shows `shadow-lg` / `shadow-xl` / `shadow-2xl` on e.g. `app/app/page.tsx` (~267, ~301), `app/app/pricing/page.tsx` (~269+), `app/components/consent/cookie-consent-banner.tsx` (~23), `app/app/(app)/onboarding-panel.tsx` (~247, ~295). **Impact:** Visual drift from “minimal chrome” intent; not a functional defect.
- **Unsubscribe HTML hardcodes production origin** — `app/app/api/unsubscribe/route.ts` line ~108: link `https://veldportfolio.com`. **Impact:** Wrong “home” from preview/staging confirmation pages.
- **Redundant `force-dynamic` on nested routes** — `app/app/(app)/layout.tsx` exports `dynamic = "force-dynamic"`; child files `app/app/(app)/analyze/page.tsx`, `app/app/(app)/admin/layout.tsx`, `app/app/(app)/admin/page.tsx` repeat it. **Impact:** Noise when auditing rendering; negligible runtime difference.
- **`eslint-disable-next-line` on React hooks** — Present in `app/app/(app)/refinance/refinance-workspace.tsx`, `app/app/(app)/properties/property-form.tsx`, `app/app/(app)/settings/theme-toggle.tsx`. **Impact:** Risk of stale dependencies if surrounding code changes without revisiting suppressions.
- **Pricing table uses `dangerouslySetInnerHTML` for static feature rows** — `app/app/pricing/page.tsx` (~137–156 region in prior review). **Impact:** Low today (hardcoded strings); pattern is brittle if content becomes dynamic without sanitization.

## Evidence reviewed

- **Process / template:** `docs/process/code-audit-process.md`, `docs/process/audit-report-template.md`
- **Policies / architecture / security:** `docs/policies/design-spec.md` (intro, tokens, mobile/table), `docs/architecture-and-build-practices.md` (§2 layered flow, §2.5 performance, §4 spaghetti/file size), `docs/security/security-notes.md`
- **Auth boundary (fresh):** `app/proxy.ts` (full), `vercel.json` (crons) — line-by-line path alignment
- **API sampling:** Grep `getAppUser` / `getActiveAppUser` under `app/app/api` (restore uses `getAppUser` only); spot-read `app/app/api/billing/portal/route.ts`, `app/app/api/unsubscribe/route.ts`, `app/app/api/cron/monthly-digest/route.ts` (Bearer + Zod patterns)
- **Config / perf:** `app/next.config.ts` (`optimizePackageImports`, headers)
- **Layouts / head:** `app/app/layout.tsx` (Clerk/Stripe/PostHog hints; no `force-dynamic` on root)
- **Charts / dynamic boundaries:** Grep `from "recharts"`; read `app/app/(app)/dashboard/dashboard-charts.tsx`, `app/app/(app)/refinance/refinance-workspace-loader.tsx`, `app/components/marketing/calculator-page-slots.tsx`, `app/components/marketing/calculator-location-slot.tsx`
- **Design drift grep:** `text-zinc`, `bg-zinc`, `slate-` in `app/**/*.tsx` — **no matches** (semantic tokens in use on sampled sweep)
- **Type safety grep:** `: any` / `as any` in `app/**/*.ts(x)` — **no matches**
- **Raw `<img>` grep in `app/**/*.tsx` — **no matches**

**Limits:** No Vercel cron execution logs, no Lighthouse/bundle analyzer run, no full read of multi-thousand-line components, no dependency CVE scan in this lane.

## Risk & impact assessment

- **Large components (Medium):** High **likelihood** of continued churn on property/deal UX; impact is engineering velocity and defect escape rate, not immediate security exposure.
- **Static Recharts on in-app calculator (Medium):** Affects signed-in users on that route only; aligns poorly with stated perf checklist but is not an auth or data-integrity issue.
- **Low-severity items:** Mostly UX, consistency, and future-proofing; cumulative effect is brand/design consistency and staging correctness.

## Recommendations (prioritized)

1. **Refactor authenticated calculator entry points** to reuse `RentVsBuySlot` (or equivalent `next/dynamic` wrapper) so Recharts loads like other chart surfaces — start with `app/app/(app)/calculators/rent-vs-buy/page.tsx`.
2. **Continue phased extraction** from `add-property-wizard.tsx` and `deal-analyzer-form.tsx` (hooks, step components, shared validation helpers) to approach the ~300-line guidance without a risky big-bang rewrite.
3. **Use `getAppOrigin()` or `NEXT_PUBLIC_APP_URL`** for the unsubscribe confirmation link in `app/app/api/unsubscribe/route.ts` instead of a hardcoded production hostname.
4. **Audit shadow usage** on marketing and onboarding against `docs/design/design-spec-2026.md` — soften or tokenize where product agrees.
5. **Revisit `eslint-disable` hooks** after refactors; prefer dependency-correct `useCallback`/`useMemo` or split effects.

## Task candidates (optional)

- [ ] Switch `app/app/(app)/calculators/rent-vs-buy/page.tsx` to dynamic chart loading (`RentVsBuySlot` or parallel pattern).
- [ ] Milestone extraction PR for `deal-analyzer-form.tsx` (e.g. portfolio compare block + stress UI as child components).
- [ ] Milestone extraction PR for `add-property-wizard.tsx` (further step component splits if not already fully decomposed).
- [ ] Env-based home URL in `app/app/api/unsubscribe/route.ts` `htmlResponse`.
- [ ] Remove redundant `export const dynamic = "force-dynamic"` from child routes that inherit `(app)/layout.tsx` dynamism (optional clarity cleanup).

## Re-test checklist

- [ ] After any proxy/cron change: confirm Vercel Cron 200 responses and handler logs (Bearer + secret).
- [ ] After calculator dynamic import change: smoke-test `/calculators/rent-vs-buy` signed-in and `/tools/rent-vs-buy` guest.
- [ ] After unsubscribe link change: open unsubscribe success HTML on preview URL and verify link target.
- [ ] `npm run check` (when code changes are made)

## Next trigger and cadence

- **Trigger:** After changes to `app/proxy.ts`, new cron routes, large marketing/calculator refactors, or auth middleware; otherwise **monthly** or **next release** with architecture review.
- **Recommended next run window:** **2026-05-09** or the next deploy touching auth boundary, cron, or chart loading.
