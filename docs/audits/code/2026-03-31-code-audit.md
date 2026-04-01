# Code Audit — 2026-03-31

## Executive summary

- **Overall health:** The app follows the documented stack and patterns well: Clerk + `getActiveAppUser()` on protected APIs, Zod on write paths, Prisma queries scoped by `userId`, metrics centralized in `lib/metrics/`, and charts loaded via `next/dynamic` with `ssr: false` and placeholders.
- **Top risks:** Very large UI modules (wizard, property detail tabs, deal analyzer) exceed the architecture guideline (~300 lines) by an order of magnitude, increasing regression and review cost. A few UI spots diverge from the design spec’s “minimal / no decorative noise” and semantic-token story (`primary` usage, heavy modal chrome).
- **Security posture:** No Critical issues found in this pass; auth boundaries and public-route exclusions in `proxy.ts` match `docs/security/security-notes.md`.
- **Recommendation:** Prioritize incremental extraction when touching those large files; align remaining `primary`/decorative patterns with `globals.css` `@theme` tokens; add Sentry on selected API failure paths that today only `console.error`.

---

## Severity-ranked findings

### Critical

- None identified in this pass.

### High

- **Oversized core UI modules (maintainability & regression risk)** — Multiple files far exceed `docs/architecture-and-build-practices.md` §4.1 guidance (~300 lines). Concentration of form logic, state, and layout in single files makes changes error-prone and reviews heavy.  
  **Evidence (line counts include trailing newline):**
  - `app/app/(app)/properties/add-property-wizard.tsx` (~1592 lines)
  - `app/app/(app)/properties/[id]/projections-tab-content.tsx` (~1362 lines)
  - `app/app/(app)/analyze/deal-analyzer-form.tsx` (~1423 lines)
  - `app/app/(app)/properties/[id]/mortgage-tab-content.tsx` (~1036 lines)
  - `app/app/(app)/properties/property-form.tsx` (~1028 lines)
  - `app/app/(app)/properties/page.tsx` (~614 lines)
  - `app/components/marketing/str-ltr-calculator.tsx` (~742 lines); other marketing calculators also large (`public-calculator.tsx`, `brrr-calculator.tsx`, `fix-and-flip-calculator.tsx`)

### Medium

- **Design spec tension — welcome onboarding modal** — Decorative blurs, large shadow, and motion-style affordances conflict with `docs/policies/design-spec.md` §1 (“Clarity over decoration,” avoid unnecessary shadows/visual noise).  
  **Evidence:** `app/app/(app)/onboarding-panel.tsx` — e.g. `shadow-2xl`, `blur-3xl` orbs, `shadow-lg shadow-accent/25`, `hover:-translate-y-px` on primary CTA.

- **Semantic color tokens — `primary` vs documented palette** — `docs/policies/design-spec.md` §3 documents semantic tokens (`accent`, `muted`, `border`, etc.) mapped in `app/app/globals.css` `@theme inline`. That theme block does **not** define `--color-primary`, while some UI uses `text-primary` / `bg-primary`. This risks reliance on Tailwind defaults or inconsistent theming versus the documented token set.  
  **Evidence:** `app/app/globals.css` (`@theme inline`, lines ~89–110); `app/app/privacy/page.tsx` (`text-primary` on links); `app/app/(app)/onboarding-panel.tsx` (`bg-primary/15`).

- **Observability gap on some API failures** — `docs/architecture-and-build-practices.md` §2.6 recommends `Sentry.captureException` for unexpected failures in API routes. Some handlers log to console only on 500 paths.  
  **Evidence:** `app/app/api/billing/portal/route.ts` — `catch` uses `console.error` and returns 500 without Sentry (contrast `app/app/api/billing/sync/route.ts`, which captures exceptions).

- **Defense-in-depth on property update** — After `getPropertyForUser(id, user.id)`, `PATCH` calls `prisma.property.update({ where: { id }, ... })`. Ownership is already enforced by the prior query; adding `userId` to `where` would harden against future edits that might skip the check.  
  **Evidence:** `app/app/api/properties/[id]/route.ts` (GET/PATCH flow; `update` at ~125–128).

### Low

- **CSV import: per-row creates inside a transaction** — Correct and safe; for very large imports the loop of `create` calls may be slower than batch APIs but is bounded by plan limits.  
  **Evidence:** `app/app/api/import/portfolio/route.ts` (`$transaction` loop ~133–191).

- **`(app)` layout `force-dynamic`** — Intentional and documented for user-specific shell data; not the root layout. Aligns with architecture note to avoid force-dynamic at root unless required.  
  **Evidence:** `app/app/(app)/layout.tsx` (`export const dynamic = "force-dynamic"`, comment lines 9–10).

- **No `export const revalidate` on `page.tsx` files** — Consistent with `docs/architecture-and-build-practices.md` §2.5: public pages using `auth()` / session-dependent nav are not ISR-stable without moving session to a client boundary.

---

## Evidence reviewed

**Process & policy (read in full or in substantive part):**

- `docs/process/code-audit-process.md`
- `docs/process/audit-report-template.md`
- `docs/policies/design-spec.md` (through §4+ mobile patterns)
- `docs/architecture-and-build-practices.md`
- `docs/security/security-notes.md`

**App shell & config:**

- `app/app/layout.tsx` (fonts, metadata, preconnect/dns-prefetch, providers)
- `app/app/(app)/layout.tsx` (dynamic rendering, `unstable_cache`, `getAppUser`, onboarding banner data)
- `app/proxy.ts` (public vs protected routes)
- `app/next.config.ts` (security headers, `optimizePackageImports`)

**API routes (sampled — auth, validation, scope):**

- `app/app/api/properties/route.ts`, `app/app/api/properties/[id]/route.ts`
- `app/app/api/deals/route.ts`, `app/app/api/deals/[id]/route.ts`
- `app/app/api/import/portfolio/route.ts`, `app/app/api/export/portfolio/route.ts`
- `app/app/api/billing/portal/route.ts`, `app/app/api/billing/sync/route.ts`, `app/app/api/billing/webhook/route.ts`
- `app/app/api/account/restore/route.ts` (`getAppUser` — expected exception)
- `app/app/api/health/route.ts`, `app/app/api/csp-report/route.ts` (public by design)
- `app/app/api/properties/[id]/metrics/route.ts`, `app/app/api/admin/export/users/route.ts`

**Lib & auth:**

- `app/lib/auth.ts` (`getAppUser`, `getActiveAppUser`, `isAdmin`)

**Components & pages (sampled):**

- `app/app/(app)/dashboard/page.tsx`, `app/app/(app)/dashboard/dashboard-charts.tsx`
- `app/app/(app)/onboarding-panel.tsx`
- `app/app/privacy/page.tsx`
- `app/app/globals.css`

**Grep-style sweeps:**

- `getAppUser` / `getActiveAppUser` across `app/app/api`
- Raw Tailwind zinc/slate utility classes in TS/TSX (no substantive drift found)
- `: any` / `as any` in TS/TSX (no matches)
- `<img` in TS/TSX (no matches)
- `next/dynamic` + chart entry points
- `Sentry.` usage in app

**Limits of this pass:** Not every component or API file was read line-by-line; findings are based on representative sampling and repo-wide searches. Runtime behavior, load tests, and dependency vulnerability scans were not executed.

---

## Risk & impact assessment

- **Large files:** Impact is primarily engineering velocity, review quality, and defect risk on change—not an immediate security or availability failure.
- **Design drift (onboarding, `primary`):** User-facing inconsistency with the stated Robinhood-like minimal brand; `primary` outside `@theme` may cause subtle light/dark or future-theme bugs.
- **Missing Sentry on some API errors:** Harder production diagnosis for billing/support scenarios; low likelihood if Stripe rarely errors, but high friction when it does.
- **Property `update` where:** IDOR is mitigated by the preceding user-scoped `findFirst`; remaining risk is low if the route stays as-is.

---

## Recommendations (prioritized)

1. When editing property add/edit/detail or deal analyzer flows, **split the largest TSX files** into section components, hooks, or `lib/` helpers—without drive-by refactors elsewhere.
2. **Align onboarding and privacy link styling** with design-spec tokens: remove or soften decorative blurs/shadows on onboarding; replace `text-primary` / `bg-primary` with documented tokens (e.g. `accent` / link pattern) or add an explicit `--color-primary` to `@theme` that matches the spec.
3. **Add `Sentry.captureException`** (or structured ops logging per §2.6) to billing and other user-visible API failure paths that currently only `console.error`.
4. Optionally tighten **`prisma.property.update`** to `where: { id, userId: user.id }` for defense-in-depth.

---

## Task candidates

- [ ] Refactor plan for `add-property-wizard.tsx` / `projections-tab-content.tsx` / `deal-analyzer-form.tsx` (extract steps/tabs into focused modules).
- [ ] Onboarding modal visual pass: reduce decorative chrome per `design-spec.md` §1.
- [ ] Add `primary` to `@theme` mapped to accent **or** replace `text-primary` / `bg-primary` usages with existing semantic classes; verify in light/dark.
- [ ] Instrument `app/app/api/billing/portal/route.ts` (and similar catch-only routes) with Sentry on unexpected errors.
- [ ] Harden `PATCH` in `app/app/api/properties/[id]/route.ts` with `userId` in `update` `where` clause.

---

## Re-test checklist

- [ ] After any refactor of property wizard or detail tabs: spot-check add property, edit property, mortgage and projections tabs.
- [ ] After styling/token changes: verify onboarding + privacy links in light and dark theme.
- [ ] After Sentry additions: trigger a test failure in dev/staging and confirm event shape (no PII/secrets).
- [ ] `npm run check` (from `app/`) when code changes are made.

---

## Next trigger and cadence

- **Trigger:** Monthly, pre-release, or after any large change to `app/api`, property flows, or design tokens.
- **Recommended next window:** 2026-04-30 or sooner if a major property/deal UI refactor lands.
