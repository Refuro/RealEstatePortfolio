# Feature / UX / IA Audit — 2026-03-30 (Run 3)

## Executive summary

- **Overall:** The authenticated app shell (`AppLayoutClient` + `AppNav`), route map, and primary journeys (dashboard → properties → detail; analyze → saved deals; modeling/mortgage workspaces) are coherent and aligned with `docs/policies/design-spec.md` on hierarchy (page titles, cards, accent CTAs). Clerk protection via `app/proxy.ts` keeps non-public routes behind sign-in; onboarding and empty states generally provide clear next steps.
- **Strengths:** Welcome modal onboarding (`onboarding-panel.tsx`) + post–first-property dashboard banner (`dashboard/page.tsx` with `?onboarding=first-property`) close the loop on first value; draft-aware nav on `/properties/new` (`draft-context`, `LogoLink`, `AppNav`) reduces accidental data loss; properties list filters/sort and plan-limit copy (`properties/page.tsx`, `deals/page.tsx`) are discoverable.
- **Top risks:** Naming and entry-point split between **marketing** (`/pricing`, landing `LandingNav` “Pricing”) and **in-app** (`/plans`, nav “Plans”) may confuse users who bookmark or return from ads; empty-state and hero-card patterns are **not fully uniform** across workspaces (Modeling vs Mortgage vs Deals) — polish debt, not a broken flow.
- **Recommendation:** Treat IA/copy alignment (Pricing vs Plans) and empty-state visual consistency as the next backlog-worthy UX items; keep monitoring density and mobile scanability as portfolio metrics grow.

## Severity-ranked findings

### Critical

- None identified in this review.

### High

- None identified in this review. Core flows (auth gate, property CRUD surfaces, analyze/save deal, billing success) are reachable and consistent with expectations.

### Medium

- **Dual “pricing” surfaces with different labels and chrome** — Users can hit **public** `/pricing` (title “Pricing”, `LandingNav`) or **in-app** `/plans` (“Plans & billing”, sidebar). Same `PricingCards` component is reused, but the mental model (“Pricing” vs “Plans”) and navigation paths differ. Risk: hesitation when returning from email, ads, or bookmarks. — Evidence: `app/app/pricing/page.tsx`, `app/app/(app)/plans/page.tsx`, `app/components/landing-nav.tsx`, `app/app/(app)/app-nav.tsx`.

- **Empty-state and hero card styling differs between workspaces** — Modeling empty uses `rounded-lg border border-border bg-card` (`modeling-workspace.tsx`); Mortgage empty uses `rounded-xl border border-border/70 bg-card/95 … shadow-sm` (`mortgage-workspace.tsx`); Deals empty matches a simpler card pattern (`deals/page.tsx`). Diverges from design-spec guidance on uniform cards and “clarity over decoration.” — Evidence: paths above.

- **Onboarding state is minimal after the welcome modal** — `lib/onboarding.ts` only tracks welcome seen / dismissed; there is no persistent checklist in-shell for “import CSV,” “first deal,” etc. First-value path relies on dashboard empty state, `?onboarding=first-property` banner, and nav. Risk: users who dismiss modal early may under-discover analyze/deals. — Evidence: `app/lib/onboarding.ts`, `app/app/(app)/onboarding-panel.tsx`, `app/app/(app)/dashboard/page.tsx`.

### Low

- **Footer copyright year** — `Footer` shows `© 2025` while audit date is 2026-03-30. Minor trust/polish issue. — Evidence: `app/components/footer.tsx`.

- **Billing success page title size vs design spec** — Page uses `text-3xl` for the main heading; `design-spec.md` §2 specifies page titles as `text-2xl font-semibold`. — Evidence: `app/app/(app)/billing/success/page.tsx`, `docs/policies/design-spec.md`.

- **App footer width vs main content** — Main column uses `max-w-4xl xl:max-w-6xl 2xl:max-w-7xl` (`app-layout-client.tsx`); footer content uses `max-w-4xl` (`footer.tsx`). On very wide viewports the footer can feel visually narrower than the content above.

- **Information density on Analyze** — `DealAnalyzerForm` is long and stateful; acceptable for power users but aligns with prior “density” notes for first-time users. — Evidence: `app/app/(app)/analyze/deal-analyzer-form.tsx`.

## Evidence reviewed

### Routes & surfaces (read in code)

- App shell: `app/app/(app)/app-layout-client.tsx`, `app/app/(app)/app-nav.tsx`, `app/app/(app)/layout.tsx`, `app/app/(app)/onboarding-panel.tsx`, `app/app/(app)/draft-context.tsx`
- Auth: `app/proxy.ts` (public route list + `auth.protect()`)
- Dashboard: `app/app/(app)/dashboard/page.tsx`, `dashboard-charts.tsx`
- Properties: `app/app/(app)/properties/page.tsx`, `app/app/(app)/properties/[id]/page.tsx`, `property-detail-tabs.tsx`
- Analyze & deals: `app/app/(app)/analyze/page.tsx`, `deal-analyzer-form.tsx`, `app/app/(app)/deals/page.tsx`, `app/app/(app)/deals/[id]/page.tsx` (redirect)
- Workspaces: `app/app/(app)/modeling/page.tsx`, `modeling-workspace.tsx`, `app/app/(app)/mortgage/page.tsx`, `mortgage-workspace.tsx`
- Settings & plans: `app/app/(app)/settings/page.tsx`, `app/app/(app)/plans/page.tsx`, `app/app/pricing/page.tsx`
- Billing: `app/app/(app)/billing/success/page.tsx`
- Marketing / footer: `components/landing-nav.tsx`, `components/footer.tsx`
- Policy: `docs/policies/design-spec.md` (§1–2), `docs/process/feature-ux-audit-process.md`, `docs/process/audit-report-template.md`

### Recent change context (git)

- Recent commits touching app UI include analytics/cookies, Google Ads prep, property UX, and nav/layout work — **no code changes were made in this audit run**.

### Assumptions / limits

- This audit is **code review** of implemented UI and routes, not a live device/browser pass or accessibility audit with assistive tech.
- PostHog, cookie consent, and ad tagging were not exercised end-to-end.

## Risk & impact assessment

- **Medium findings** affect **discoverability, consistency, and perceived polish** more than core correctness. Unresolved, they can slightly increase support questions (“where do I upgrade?”) and design drift.
- **Low findings** are cosmetic or spec-nit level; exposure is low but fixing them is cheap.

## Recommendations (prioritized)

1. **Align “Pricing” vs “Plans”** — Add a short cross-link or shared label in the in-app plans page and/or marketing pricing page (e.g. “Same plans as in the app”) and ensure logged-in users on `/pricing` have an obvious path to `/dashboard` or `/plans` (evaluate duplicate entry points).
2. **Normalize empty-state card pattern** — Pick one card pattern from `design-spec.md` / existing dashboard cards and apply to Modeling, Mortgage, and Deals empty blocks for visual consistency.
3. **Optional onboarding expansion** — If activation metrics warrant it, extend onboarding beyond the welcome modal (e.g. dismissible checklist or dashboard module) using existing analytics events.

## Task candidates (optional)

- [ ] Unify empty-state card classes across `modeling-workspace.tsx`, `mortgage-workspace.tsx`, and `deals/page.tsx` (and optionally dashboard/properties empty blocks).
- [ ] Add copy + link between `/pricing` and `/plans` for logged-in users; clarify nav wording if product decides on a single canonical term.
- [ ] Update footer year in `footer.tsx` (or make it dynamic) and align `billing/success/page.tsx` heading with `design-spec.md` page title token.

## Re-test checklist

- [ ] Smoke: sign-in → dashboard → welcome modal / empty state → add property → `?onboarding=first-property` banner
- [ ] Properties: filters empty state, multi-property navigation to modeling/mortgage with `propertyId`
- [ ] Analyze: save deal at limit; open Deals list and `Analyze` from Deals empty state
- [ ] Plans: compare `/plans` and `/pricing` (logged in) for clarity
- [ ] `npm run check` (when code changes are made)

## Next trigger and cadence

- **Trigger:** IA/navigation/onboarding changes, major dashboard or workspace UI changes, or quarterly design-spec review.
- **Recommended next run:** Next monthly window or after any planned “Plans/Pricing” or onboarding work ships.
