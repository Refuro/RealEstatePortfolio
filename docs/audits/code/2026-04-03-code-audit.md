# Code Audit — 2026-04-03

## Executive summary

- **Overall:** The `app/` codebase aligns with `docs/architecture-and-build-practices.md`: layered flow (UI → API → `lib/` → Prisma), `getActiveAppUser()` on protected APIs, Zod on mutating request bodies, metrics and plans centralized in `lib/`. Grep passes found **no** `any` / `as any` in `*.ts`/`*.tsx`, **no** raw Tailwind `zinc-*` / `slate-*` color utilities, and **no** raw `<img>` tags.
- **Performance:** `next.config.ts` sets `experimental.optimizePackageImports` for `lucide-react` and `recharts`. Dashboard and workspace surfaces load chart-heavy modules via `next/dynamic` with `ssr: false` and loading placeholders (`app/(app)/dashboard/dashboard-charts.tsx`, `mortgage-workspace.tsx`, `modeling-workspace.tsx`). Root `app/layout.tsx` does **not** set `force-dynamic`; RentCast / Clerk / Stripe hints are present in `<head>`.
- **Residual gaps:** Some UI uses **strong box shadows** that conflict with `docs/policies/design-spec.md` §9 (“heavy shadows”). Several **very large client modules** (>1k lines) increase review and regression risk. **`force-dynamic`** is declared in multiple nested segments (partly redundant). **`POST /api/billing/portal`** validates optional JSON with manual guards instead of a shared Zod schema.
- **Recommendation:** Treat findings as hygiene and consistency work—no critical security or auth gaps identified in this pass.

## Severity-ranked findings

### Critical

- None identified.

### High

- None identified.

### Medium

- **Design spec — prominent shadows on key surfaces** — Conflicts with design-spec guidance to avoid heavy shadows; increases visual noise vs “Robinhood-inspired minimal.” Evidence: `app/(app)/onboarding-panel.tsx` (`shadow-2xl`, `shadow-lg` on primary CTA), `app/app/page.tsx` (`shadow-xl` on hero/visual), `app/pricing/page.tsx` (`shadow-lg` on images), `components/consent/cookie-consent-banner.tsx` (`shadow-lg` on fixed banner).
- **Maintainability — very large client/feature modules** — Files far above the ~300-line “consider splitting” guidance in architecture doc make reviews and safe refactors harder. Evidence (line counts from workspace scan): `app/(app)/properties/add-property-wizard.tsx` (~1592), `app/(app)/analyze/deal-analyzer-form.tsx` (~1436), `app/(app)/properties/[id]/projections-tab-content.tsx` (~1362), `app/(app)/properties/[id]/mortgage-tab-content.tsx` (~1036), `app/(app)/properties/property-form.tsx` (~1028).

### Low

- **API consistency — billing portal body parsing** — `POST` `app/api/billing/portal/route.ts` uses `JSON.parse` plus narrow type guards for `returnPath`, `targetPlan`, and `targetBillingCycle`. Other routes typically use Zod `safeParse`; aligning would reduce drift and centralize error shapes.
- **Rendering config — redundant `force-dynamic`** — `export const dynamic = "force-dynamic"` appears on `app/(app)/layout.tsx` (documented for banner/onboarding data), and again on `app/(app)/admin/layout.tsx`, `app/(app)/admin/page.tsx`, and `app/(app)/analyze/page.tsx`. Child segments inherit dynamic behavior from the parent `(app)` layout; nested duplicates are harmless but add noise when auditing rendering strategy.
- **Theme single source of truth — Clerk appearance colors** — `app/layout.tsx` sets Clerk `appearance.variables.colorPrimary` / `colorPrimaryForeground` to fixed hex values (`#6366f1`, `#ffffff`) alongside CSS semantic tokens elsewhere. If accent tokens change in `globals.css`, Clerk chrome may drift until manually updated.

## Evidence reviewed

- **Process & policy:** `docs/process/code-audit-process.md`, `docs/process/audit-report-template.md`, `docs/architecture-and-build-practices.md` (§2 layered flow, §2.5 performance, API conventions), `docs/policies/design-spec.md` (tokens, §9 avoid list), `docs/security/security-notes.md` (auth expectations, public routes).
- **Layouts & rendering:** `app/layout.tsx`, `app/(app)/layout.tsx`, `app/(app)/admin/layout.tsx`, `app/(app)/admin/page.tsx`, `app/(app)/analyze/page.tsx`.
- **API sample (auth + Zod vs GET-only):** `app/api/me/route.ts`, `app/api/onboarding/route.ts`, `app/api/contact/route.ts`, `app/api/billing/portal/route.ts`, `app/api/billing/webhook/route.ts`, `app/api/health/route.ts`, `app/api/csp-report/route.ts`, `app/api/account/restore/route.ts` (`getAppUser` — documented exception), `app/api/properties/[id]/benchmark/refresh/route.ts`.
- **Performance:** `next.config.ts` (`optimizePackageImports`), `app/(app)/dashboard/dashboard-charts.tsx`, `app/(app)/mortgage/mortgage-workspace.tsx`, `app/(app)/modeling/modeling-workspace.tsx`, `app/(app)/properties/[id]/property-detail-tabs.tsx` (mortgage/projections deep-links to workspaces — avoids loading Recharts on property detail tabs).
- **Auth helper:** `lib/auth.ts` (`getAppUser` vs `getActiveAppUser`).
- **Grep sweeps:** `force-dynamic` (4 app files); `text-|bg-|border-(zinc|slate|stone|neutral)-`; `: any` / `as any` in `app/**/*.ts(x)`; `from "recharts"`; `next/dynamic`; raw `<img>`; arbitrary `[#hex]` in class names.

## Risk & impact assessment

- **Medium findings** affect **brand consistency** and **engineering velocity** (large files), not live security exposure. Shadow styling is user-visible but not a data-integrity issue.
- **Low findings** are **consistency and DRY** risks: slightly higher chance of validation or theme drift over time; redundant `force-dynamic` is operational noise only.
- **Likelihood:** Shadow and file-size issues are **already present** in production code paths; portal parsing and Clerk colors are **low-frequency** change surfaces.

## Recommendations (prioritized)

1. **Design alignment:** Replace or soften `shadow-lg` / `shadow-xl` / `shadow-2xl` on onboarding, marketing hero, pricing screenshots, and cookie banner with flatter borders/`bg-card` emphasis per design-spec §5–9, or document an explicit exception if marketing conversion requires stronger depth.
2. **Modularization (when touching features):** Split the largest wizards/forms (`add-property-wizard`, `deal-analyzer-form`, mortgage/projections tab content) along section or sub-feature boundaries to keep PRs reviewable—no need for a big-bang refactor.
3. **API consistency:** Introduce a small Zod schema for the optional billing portal POST body (reusing `resolveBillingPortalReturnPath` constraints) and return 400 on invalid shapes for easier client debugging.
4. **Rendering hygiene:** Remove redundant `export const dynamic = "force-dynamic"` from nested `(app)` routes where parent `(app)/layout.tsx` already forces dynamic—verify in a preview build that behavior is unchanged.
5. **Clerk + tokens:** Map Clerk `appearance` colors to CSS variables or a single exported constant shared with theme tokens to avoid duplicate hex definitions.

## Task candidates (optional)

- [ ] Audit and reduce heavy shadow classes on onboarding, landing hero, pricing images, and cookie banner (`onboarding-panel.tsx`, `app/page.tsx`, `pricing/page.tsx`, `cookie-consent-banner.tsx`).
- [ ] Add Zod schema for `POST /api/billing/portal` optional JSON body; keep existing `resolveBillingPortalReturnPath` behavior.
- [ ] When next editing large modules, extract subcomponents or hooks from `add-property-wizard.tsx` / `deal-analyzer-form.tsx` / `projections-tab-content.tsx` / `mortgage-tab-content.tsx` incrementally.

## Re-test checklist

- [ ] After shadow/CSS changes: visual pass on light/dark, onboarding, pricing, cookie banner, home hero.
- [ ] After portal schema change: billing portal flows (standard + `flow_data` path) and error handling.
- [ ] After removing nested `force-dynamic`: smoke-test `(app)` routes, admin, analyze.
- [ ] `npm run check` (when code changes are made).

## Next trigger and cadence

- **Trigger:** Monthly, after major feature merges touching API/auth/charts, or when implementing `docs/design/design-brief-2026.md` visual work.
- **Recommended next run window:** 2026-05-03 or following the next design-token / marketing refresh merge.
