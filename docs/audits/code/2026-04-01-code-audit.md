# Code Audit — 2026-04-01

## Executive summary

- **Overall health:** The codebase aligns well with `docs/architecture-and-build-practices.md` and `docs/security/security-notes.md`: protected APIs use `getActiveAppUser()` (with `getAppUser()` only on `POST /api/account/restore` as documented), Prisma access is `userId`-scoped for portfolio entities, write paths use Zod in sampled routes, metrics live in `lib/metrics/`, and Recharts-heavy surfaces use `next/dynamic` with `ssr: false` and loading placeholders where reviewed (dashboard charts; modeling/mortgage workspaces defer `projections-tab-content` / `mortgage-tab-content`).
- **Top risks:** Several UI modules far exceed the ~300-line maintainability guideline, concentrating wizard, analyzer, and form logic in single files. A few surfaces diverge from `docs/policies/design-spec.md` §9 (heavy shadows, decorative blur orbs, `primary` token usage). `GET /api/deals/[id]` loads a full portfolio summary via `buildPortfolioSummaryPayload` on every request, which can duplicate work as portfolios grow.
- **Security posture:** No Critical issues identified in this pass; IDOR controls use `findFirst` / `where: { id, userId }` patterns on reviewed property and deal routes; Stripe webhook verifies signatures; public routes match `proxy.ts` expectations.
- **Recommendation:** When touching oversized files, extract subcomponents or hooks incrementally; tighten design-token usage on marketing/legal links and the onboarding modal; consider slimming deal-detail API work (lighter portfolio slice or caching) if profiling shows cost.

---

## Severity-ranked findings

### Critical

- None identified in this pass.

### High

- **Architecture / maintainability — very large UI and form modules** — `docs/architecture-and-build-practices.md` §4.1 suggests keeping files focused and considering splits past ~300 lines. Multiple production files exceed that by a large margin, increasing regression risk, review cost, and merge conflict frequency.  
  **Evidence (line counts from workspace enumeration, approximate):**  
  - `app/app/(app)/properties/add-property-wizard.tsx` (~1528 lines)  
  - `app/app/(app)/analyze/deal-analyzer-form.tsx` (~1389 lines)  
  - `app/app/(app)/properties/property-form.tsx` (~988 lines)  
  - `app/app/(app)/properties/page.tsx` (~600 lines)  
  - `app/components/marketing/str-ltr-calculator.tsx` (~714 lines), `brrr-calculator.tsx` (~624), `public-calculator.tsx` (~522), `fix-and-flip-calculator.tsx` (~501)  
  - `app/components/pricing-cards.tsx` (~511 lines)

### Medium

- **Design compliance — onboarding welcome modal** — `docs/policies/design-spec.md` §9 discourages heavy shadows and decorative visual noise; §1 emphasizes clarity over decoration. The welcome modal uses strong elevation and decorative blurred orbs.  
  **Evidence:** `app/app/(app)/onboarding-panel.tsx` — e.g. `shadow-2xl` on the dialog container, `blur-3xl` accent orbs, `shadow-lg shadow-accent/25` and `hover:-translate-y-px` on the primary CTA (lines ~96–135).

- **Design compliance — semantic tokens vs `primary`** — The design spec centers on `accent`, `muted`, `border`, etc. A few usages rely on `text-primary` / `bg-primary/15`, which can drift from the documented semantic palette if `primary` is not explicitly part of the same `@theme` contract.  
  **Evidence:** `app/app/privacy/page.tsx` (`text-primary` on links, ~93–102); `app/app/(app)/onboarding-panel.tsx` (`bg-primary/15`, ~98).

- **Design compliance — marketing imagery chrome** — Homepage and pricing pages use `shadow-lg` on large images/screenshots. Acceptable for marketing polish but noted against §9 “heavy shadows” preference.  
  **Evidence:** `app/app/page.tsx`, `app/app/pricing/page.tsx` (e.g. `shadow-lg` on image containers, ~203 and ~117–135 regions).

- **Efficiency — deal detail GET loads full portfolio summary** — `GET` handlers call `buildPortfolioSummaryPayload(user)`, which runs `loadPortfolioSummaryCore` (property `count`, `findMany` with mortgages up to tier limit, portfolio metrics). That repeats work already done elsewhere and scales with portfolio size whenever a saved deal is opened.  
  **Evidence:** `app/app/api/deals/[id]/route.ts` (calls `buildPortfolioSummaryPayload` after loading the deal, ~110–111); `app/lib/server/portfolio-summary-payload.ts` (`buildPortfolioSummaryPayload`, `loadPortfolioSummaryCore`).

- **Security / defense in depth — property PATCH update `where` clause** — After `getPropertyForUser` proves ownership, `PATCH` uses `prisma.property.update({ where: { id } })`. Adding `userId` to `where` would harden against future edits that might bypass the pre-check.  
  **Evidence:** `app/app/api/properties/[id]/route.ts` (flow after line ~58; update section).

- **Observability — permanent account delete partial failures** — Stripe subscription cancel and Clerk user delete failures are logged with `console.error` but not reported to Sentry, unlike many other API error paths that call `Sentry.captureException`.  
  **Evidence:** `app/app/api/account/delete-permanent/route.ts` (~72–74, ~83–85).

### Low

- **Performance — `force-dynamic` scoped appropriately** — `export const dynamic = "force-dynamic"` appears on `(app)` layout and specific app pages (e.g. analyze, admin), not the root layout, matching `docs/architecture-and-build-practices.md` §2.5.  
  **Evidence:** `app/app/(app)/layout.tsx`, `app/app/(app)/analyze/page.tsx`, `app/app/(app)/admin/layout.tsx`, `app/app/(app)/admin/page.tsx`.

- **Performance — config** — `next.config.ts` sets `experimental.optimizePackageImports` for `lucide-react` and `recharts`. Root layout includes preconnect/dns-prefetch for RentCast, Clerk, Stripe, PostHog as applicable.  
  **Evidence:** `app/next.config.ts` (~51–53); `app/app/layout.tsx` (~118–137).

- **Performance — no ISR on session-aware public pages** — Public pages using `auth()` for nav are dynamically rendered; absence of `revalidate` matches the documented tradeoff in `docs/architecture-and-build-practices.md` §2.5.  
  **Evidence:** `app/app/privacy/page.tsx` (`auth()` usage, no `revalidate` export).

- **Architecture — billing portal body parsing** — `POST /api/billing/portal` uses `JSON.parse` with manual narrowing for optional fields; critical fields use `isValidPaidTier` / `isValidBillingCycle` and `resolveBillingPortalReturnPath`. Acceptable alternative to Zod for minimal optional JSON; Stripe calls remain server-side.  
  **Evidence:** `app/app/api/billing/portal/route.ts` (~37–51).

- **Technical debt — `eslint-disable` usage** — Single targeted disable for `set-state-in-effect` in theme toggle; justified by comment.  
  **Evidence:** `app/app/(app)/settings/theme-toggle.tsx` (~19).

- **Product mantra** — Core flows (property CRUD, deals, estimates, billing) generally follow thoughtful validation and clear error JSON; friction increases when navigating very large single-file wizards (cognitive load for contributors more than end users).

---

## Evidence reviewed

**Process and policy (read in full):**

- `docs/process/code-audit-process.md`
- `docs/process/audit-report-template.md`
- `docs/policies/design-spec.md`
- `docs/architecture-and-build-practices.md`
- `docs/security/security-notes.md`

**App configuration and shell:**

- `app/proxy.ts` (public route matcher vs Clerk `auth.protect`)
- `app/next.config.ts` (headers, `optimizePackageImports`, Sentry wrapper)
- `app/app/layout.tsx` (metadata, preconnect, providers)
- `app/app/(app)/layout.tsx` (`force-dynamic` scope)
- `app/app/globals.css` (CSS variables and semantic mapping)

**API routes (systematic sample — auth, scope, validation):**

- `app/app/api/properties/route.ts`, `app/app/api/properties/[id]/route.ts`
- `app/app/api/properties/[id]/metrics/route.ts`, `app/app/api/properties/[id]/amortization/route.ts`
- `app/app/api/deals/route.ts`, `app/app/api/deals/[id]/route.ts`
- `app/app/api/import/portfolio/route.ts`, `app/app/api/export/portfolio/route.ts`
- `app/app/api/billing/portal/route.ts`, `app/app/api/billing/sync/route.ts`, `app/app/api/billing/subscription-details/route.ts`, `app/app/api/billing/webhook/route.ts`
- `app/app/api/account/restore/route.ts` (`getAppUser` — expected)
- `app/app/api/admin/users/[id]/tier/route.ts`
- `app/app/api/account/delete-permanent/route.ts`
- `app/app/api/health/route.ts`, `app/app/api/csp-report/route.ts` (public by design per security notes)

**Lib and shared server logic:**

- `app/lib/server/portfolio-summary-payload.ts`
- `app/lib/auth.ts` (referenced via imports; patterns consistent with security notes)

**Components and pages (sampled across design and performance dimensions):**

- `app/app/(app)/dashboard/dashboard-charts.tsx` (dynamic chart imports)
- `app/app/(app)/modeling/modeling-workspace.tsx`, `app/app/(app)/mortgage/mortgage-workspace.tsx` (dynamic tab content)
- `app/app/(app)/onboarding-panel.tsx`
- `app/app/(app)/properties/[id]/property-detail-tabs.tsx`
- `app/components/pricing-cards.tsx`, `app/app/page.tsx`, `app/app/pricing/page.tsx`
- Grep passes: `getActiveAppUser` / `getAppUser` across `app/app/api`, `recharts` imports, `zinc-`/`slate-` raw palette classes, `any` usage, `force-dynamic`, `next/dynamic`

**Limits of this pass:** Not every file under `app/` was read line-by-line; findings combine policy checks, representative deep reads, and targeted searches. Runtime performance was not profiled; the deal GET cost is a static code-structure observation.

---

## Risk & impact assessment

- **Unresolved High (large files):** Slower feature delivery and higher defect rate on the heaviest modules; impact is team velocity and quality rather than immediate user-facing outage.
- **Medium (design drift, deal GET weight, property update hardening):** UX brand consistency and spec alignment; deal API may add latency and DB load for users with large portfolios; missing `userId` on `update` is a low-likelihood footgun if the route is refactored incorrectly later.
- **Medium/Low (Sentry gaps on delete path):** Failed Stripe cancel or Clerk delete during permanent delete could leave inconsistent external state with limited production visibility.

---

## Recommendations (prioritized)

1. When editing the largest wizards/forms (`add-property-wizard`, `deal-analyzer-form`, `property-form`), extract sections, hooks, or child components to shrink files and isolate testable units.
2. Reconcile onboarding and legal link styling with `docs/policies/design-spec.md`: reduce decorative blur/shadow on the welcome modal where product agrees; map `text-primary` links to documented tokens (`accent` / underline patterns).
3. Profile `GET /api/deals/[id]` under realistic portfolio sizes; if costly, return a narrower `portfolioContext` or reuse cached summary data instead of full `buildPortfolioSummaryPayload` on every load.
4. Add `userId` to `prisma.property.update` `where` in `app/app/api/properties/[id]/route.ts` for defense in depth.
5. Consider `Sentry.captureException` (with careful PII avoidance) for non-fatal failures in `app/app/api/account/delete-permanent/route.ts` when Stripe or Clerk calls fail.

---

## Task candidates (optional)

- [ ] Extract first slice from `add-property-wizard.tsx` or `deal-analyzer-form.tsx` into focused modules (goal: reduce file length and clarify boundaries).
- [ ] Align `onboarding-panel.tsx` and `privacy/page.tsx` link styles with semantic tokens per design spec.
- [ ] Optimize `GET /api/deals/[id]` portfolio context payload after confirming cost in staging or production metrics.
- [ ] Harden `PATCH /api/properties/[id]` update `where` with `userId`.
- [ ] Add Sentry reporting for Stripe/Clerk failures on permanent account delete.

---

## Re-test checklist

- [ ] Verify any fix for High maintainability extractions (smoke: add property, deal analyzer, property edit).
- [ ] Verify deal detail and settings after deal API or portfolio payload changes.
- [ ] Verify property PATCH still rejects cross-user access (regression test or manual).
- [ ] `npm run check` (when code changes are made)

---

## Next trigger and cadence

- **Trigger:** Monthly or after major feature work touching `app/` UI, API, or billing.
- **Recommended next run:** 2026-05-01 or next release milestone, whichever comes first.
