# Feature / UX / IA Audit — 2026-03-30 (Run 4)

## Executive summary

- **Overall:** The authenticated shell (`AppLayoutClient`, `AppNav`, `DraftProvider`), public route allowlist in `app/proxy.ts`, and primary journeys (dashboard → properties → detail; analyze → saved deals; modeling/mortgage with `propertyId`) remain coherent. Welcome onboarding (`onboarding-panel.tsx`) and plan-limit affordances on properties/deals surfaces are still in good shape.
- **Continuity vs [Run 3](2026-03-30-feature-ux-audit-3.md):** The main IA tension (**marketing “Pricing”** at `/pricing` vs **in-app “Plans”** at `/plans`) and **workspace empty-state styling drift** (Modeling vs Mortgage vs Deals) are **still present** in code; polish items (footer year, billing success heading token) are **unchanged**.
- **Top risks:** Label/path fragmentation for billing discovery (Pricing vs Plans; marketing FAQ copy vs in-app surfaces) and inconsistent empty-state card chrome—both affect clarity and perceived quality more than functional correctness.
- **Recommendation:** Ship small copy/IA links (Pricing ↔ Plans, FAQ wording) and normalize empty-state patterns; treat extended onboarding as optional until activation data demands it.

## Severity-ranked findings

### Critical

- None identified in this review.

### High

- None identified in this review. Auth gating, nav map, and core CRUD/analysis flows remain aligned with expectations.

### Medium

- **Dual pricing entry points with different labels and chrome** — Public `/pricing` uses `LandingNav` with link text **“Pricing”** and page title **“Pricing”** (`app/app/pricing/page.tsx`). Authenticated users reach **“Plans & billing”** at `/plans` via sidebar (`app/app/(app)/app-nav.tsx`, `app/app/(app)/plans/page.tsx`). Logged-in visitors to `/pricing` see **Dashboard** in `LandingNav` but **no direct link to `/plans`**, so upgrades still rely on discovering **Plans** in the app nav or Settings. — Evidence: `app/components/landing-nav.tsx`, `app/app/pricing/page.tsx`, `app/app/(app)/plans/page.tsx`, `app/app/(app)/app-nav.tsx`.

- **Empty-state card patterns still diverge across workspaces** — **Modeling** (no properties) uses `rounded-lg border border-border bg-card` (`app/app/(app)/modeling/modeling-workspace.tsx`). **Mortgage** (no properties) uses `rounded-xl border border-border/70 bg-card/95 … shadow-sm` (`app/app/(app)/mortgage/mortgage-workspace.tsx`). **Deals** (no deals) uses `rounded-lg border border-border bg-card` (`app/app/(app)/deals/page.tsx`)—closer to Modeling than to Mortgage. This matches Run 3’s consistency gap; Mortgage remains the most visually “elevated” empty block.

- **Onboarding persistence is still minimal** — `buildOnboardingProgress` / API only track welcome seen and dismissed (`app/lib/onboarding.ts`, `app/app/(app)/onboarding-panel.tsx`). No in-app checklist for downstream steps (first deal, CSV import, etc.). First-value path still depends on dashboard empty state, query-driven dashboard banner (`dashboard/page.tsx` `searchParams.onboarding`), and navigation—same structural risk as Run 3 for users who dismiss the welcome modal early.

- **Marketing FAQ copy vs in-app upgrade path** — On `/pricing`, the FAQ answer “Can I cancel or upgrade later?” says users can update the plan **“anytime from account settings.”** In-app upgrade selection lives primarily under **`/plans`** (“Plans & billing”), while Settings holds account/billing management (`app/app/(app)/settings/page.tsx`). Wording is directionally correct but under-specifies the **Plans** surface. — Evidence: `app/app/pricing/page.tsx` (FAQ `<details>` block), `app/app/(app)/plans/page.tsx`.

### Low

- **Footer copyright year** — `Footer` still shows `© 2025` while audit date is 2026-03-30. — Evidence: `app/components/footer.tsx`.

- **Billing success page title vs design spec** — Main heading uses `text-3xl font-semibold`; `docs/policies/design-spec.md` §2 defines page titles as `text-2xl font-semibold`. — Evidence: `app/app/(app)/billing/success/page.tsx`, `docs/policies/design-spec.md`.

- **Footer content width vs main column** — Main content uses `max-w-4xl xl:max-w-6xl 2xl:max-w-7xl` (`app/app/(app)/app-layout-client.tsx`); footer uses `max-w-4xl` (`footer.tsx`). On very wide viewports the footer can feel narrower than the content column above.

- **Analyze workspace density and hero pattern** — `DealAnalyzerForm` remains a long, stateful surface (power-user friendly, heavy for first visit). The page also wraps the title block in a `rounded-xl border … bg-card/95` card (`app/app/(app)/analyze/page.tsx`), whereas several other app pages lead with a bare `h1`—minor pattern variance.

- **App shell (positive)** — Mobile drawer closes on route change, Escape, backdrop tap, and left-swipe (`app-layout-client.tsx`); draft-aware navigation on `/properties/new` (`draft-context`, `LogoLink`, `AppNav`) preserves a clear mental model. Not a finding to “fix,” but evidence that shell UX is intentional.

## Evidence reviewed

### Routes & surfaces (read in code)

- Process & template: `docs/process/feature-ux-audit-process.md`, `docs/process/audit-report-template.md`
- Prior report: `docs/audits/feature/2026-03-30-feature-ux-audit-3.md`
- Policy: `docs/policies/design-spec.md` (§1–2)
- App shell: `app/app/(app)/app-layout-client.tsx`, `app/app/(app)/app-nav.tsx`, `app/app/(app)/layout.tsx`, `app/app/(app)/onboarding-panel.tsx`, `app/app/(app)/draft-context.tsx`
- Auth: `app/proxy.ts`
- Dashboard: `app/app/(app)/dashboard/page.tsx`
- Properties: `app/app/(app)/properties/page.tsx` (sample)
- Analyze & deals: `app/app/(app)/analyze/page.tsx`, `app/app/(app)/deals/page.tsx`
- Workspaces: `app/app/(app)/modeling/modeling-workspace.tsx`, `app/app/(app)/mortgage/mortgage-workspace.tsx`
- Plans & marketing pricing: `app/app/(app)/plans/page.tsx`, `app/app/pricing/page.tsx`
- Billing: `app/app/(app)/billing/success/page.tsx`
- Marketing nav & footer: `app/components/landing-nav.tsx`, `app/components/footer.tsx`
- Mobile pattern reference: `app/components/mobile-tool-shell.tsx` (shared mobile chrome for tools)

### Assumptions / limits

- This pass is **static code review** of routes, components, and copy—not a live device test, screen reader audit, or analytics verification.
- Workspace root was not treated as a git worktree for commit archaeology; findings are from current files only.

## Risk & impact assessment

- **Medium** findings affect **discoverability of billing/upgrade**, **visual consistency**, and **trust in marketing copy**; they increase hesitation and support-style questions rather than breaking flows.
- **Low** findings are polish and spec alignment; cheap to fix when prioritized.

## Recommendations (prioritized)

1. **Tighten Pricing ↔ Plans IA** — On `/pricing` for authenticated users, add an explicit path to **`/plans`** (and optionally mirror terminology: “Plans” vs “Pricing” in secondary copy). Consider adjusting the FAQ line to mention **Plans** or **Plans & billing** alongside Settings.
2. **Normalize empty-state cards** — Choose one card recipe from `design-spec.md` / dashboard patterns and apply to Modeling, Mortgage, and Deals empty blocks so no workspace looks “premium” or “plain” by accident.
3. **Optional onboarding expansion** — If activation data shows drop-off after dismiss, add a lightweight checklist or dashboard module; keep scope tied to measured gaps.

## Task candidates (optional)

- [ ] Add logged-in CTA or copy on `/pricing` pointing to `/plans`; align FAQ “account settings” wording with actual surfaces (`/plans`, Settings).
- [ ] Unify empty-state classes across `modeling-workspace.tsx`, `mortgage-workspace.tsx`, and `deals/page.tsx`.
- [ ] Update `footer.tsx` copyright year (or dynamic year) and align `billing/success/page.tsx` heading with `design-spec.md` page title token.

## Re-test checklist

- [ ] Smoke: sign-in → dashboard → welcome modal / empty state → add property → onboarding banner query param path
- [ ] Properties → modeling/mortgage with `propertyId`; draft on `/properties/new` → nav uses draft `navigateTo`
- [ ] Compare `/pricing` (logged in) vs `/plans` for upgrade clarity
- [ ] Deals at limit; Analyze save flow; Plans link from Deals copy
- [ ] `npm run check` (when code changes are made)

## Next trigger and cadence

- **Trigger:** IA/navigation/onboarding changes, major dashboard or workspace UI changes, or quarterly `design-spec.md` review.
- **Recommended next run:** After any planned Pricing/Plans or empty-state work ships, or next monthly audit window.
