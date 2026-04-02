# Feature / UX / IA Audit — 2026-04-03

## Executive summary

- **Overall:** Core journeys (dashboard → properties → detail; tools hub; analyze ↔ deals; modeling/mortgage workspaces; landing vs signed-in app) are **coherent and mostly aligned** with `docs/policies/design-spec.md` for hierarchy, CTAs, and progressive disclosure. **No critical** user-blocking IA defects surfaced in this document-only review.
- **Top risks:** (1) **Signed-in navigation labeling and IA** differ from the canonical sidebar list in design-spec §6 (extra “Tools” cluster; “Plans” vs “Pricing”). (2) **Welcome onboarding overlay** lacks standard dialog semantics and escape-to-dismiss—impacts accessibility and spec alignment for modals. (3) **Deal Analyzer** uses two mobile presentations (`useIsMobile` + `MobileToolShell` vs. a `md:hidden` fixed bar in the desktop tree)—creates **SSR/hydration flash** risk and maintenance confusion.
- **Design brief:** Per `docs/policies/design-spec.md` and project guidance, **`docs/design/design-brief-2026.md` is future work**—this audit does **not** treat current marketing or in-app visuals as incorrect for failing to match the brief.
- **Recommendation:** Prioritize onboarding modal accessibility, reconcile design-spec §6 with actual nav (or update the spec), and simplify or document the Deal Analyzer mobile/desktop split for engineers.

## Severity-ranked findings

### Critical

- None identified in this pass (static review; no runtime device verification).

### High

- **Welcome onboarding overlay — modal accessibility gap** — Users who rely on assistive tech or keyboard-only flows may not get a proper dialog experience: the overlay is a `fixed` `div` without `role="dialog"`, `aria-modal`, `aria-labelledby` / `aria-describedby`, focus trap, or `Escape` to dismiss. **Impact:** WCAG-oriented friction and inconsistent with the app’s own mobile drawer pattern (`app-layout-client.tsx` uses `role="dialog"` and Escape handling). **Evidence:** `app/app/(app)/onboarding-panel.tsx` (overlay and card wrappers ~lines 94–138).

### Medium

- **Design-spec §6 vs production sidebar IA** — Canonical spec lists **Dashboard, Properties, Pricing, Settings**. Production uses **Dashboard, Properties**, a **Tools** group (Modeling, Mortgage, Calculators, Analyze deal, Deals), and **Account** (Plans, Settings). **Impact:** Audits and PM reviews that cite §6 literally will falsely flag the product; new users reading the spec may expect a flatter nav. **Evidence:** `docs/policies/design-spec.md` §6; `app/app/(app)/app-nav.tsx` (`portfolioNav`, `toolsNav`, `accountNav`).

- **“Pricing” vs “Plans & billing” split across surfaces** — Marketing and footer emphasize **`/pricing`**; the authenticated shell uses **`/plans`** (“Plans” label, “Plans & billing” page title). Logged-in users on `/pricing` get a helpful pointer to `/plans`, which mitigates confusion. **Impact:** Residual naming inconsistency for support/docs. **Evidence:** `app/components/landing-nav.tsx` (link to `/pricing`); `app/app/(app)/app-nav.tsx` (`/plans`); `app/app/pricing/page.tsx` (signed-in copy linking to `/plans`); `app/app/(app)/plans/page.tsx` (h1 “Plans & billing”).

- **Deal Analyzer — dual mobile implementation + SSR snapshot** — `useIsMobile` uses `getServerSnapshot: () => false` (`app/lib/use-is-mobile.ts`), so the server initially renders the **desktop** grid path. After hydration, viewports ≤767px switch to `MobileToolShell`. A **`fixed bottom … md:hidden` “Mobile sticky results”** block exists in the desktop return tree (`deal-analyzer-form.tsx` ~1405–1432) but the mobile-first path returns early—so that bar is **redundant or only relevant during SSR/hydration edge cases**, conflicting with design-spec §4.1’s intent (“sticky results” for deal analyzer) unless explicitly superseded by `MobileToolShell`. **Impact:** Layout shift on load, possible duplicate/conflicting patterns for future changes. **Evidence:** `app/app/(app)/analyze/deal-analyzer-form.tsx` (early return ~894–909 vs. sticky block ~1405–1432); `app/lib/use-is-mobile.ts`.

- **Mobile bottom nav — limited primary destinations** — Only **Dashboard, Properties, Analyze**, plus **More** (opens full drawer). **Modeling, Mortgage, Deals, Calculators, Plans** require the drawer or in-page links. **Impact:** Acceptable per progressive disclosure, but **discoverability** of Deals/Modeling/Mortgage is lower than desktop—power users may take longer to find them. **Evidence:** `app/components/mobile-bottom-nav.tsx`; contrast `app/app/(app)/app-nav.tsx` tools group.

### Low

- **Mobile bottom nav iconography** — The **Analyze** tab uses the **Calculator** icon (`Calculator` from `lucide-react`), while a separate **Calculators** hub exists in the sidebar. **Impact:** Minor icon–concept mismatch for scan-first users. **Evidence:** `app/components/mobile-bottom-nav.tsx` (~lines 7–10).

- **Footer nav omits Pricing** — `Footer` exposes Calculators, Changelog, Alternatives, Compare, Resources—not `/pricing`. **Impact:** Low; signed-in users have Plans in-app; marketing pages use `LandingNav` for Pricing. **Evidence:** `app/components/footer.tsx`.

- **Saved deals page — dense explanatory copy** — Intro paragraph explains proportional math vs portfolio display mode. **Impact:** Accurate per policy but **heavy for a first scan**; aligns with `docs/policies/analytics-math-policy.md` “clarity over density” tension on secondary surfaces. **Evidence:** `app/app/(app)/deals/page.tsx` (~lines 68–71).

- **Marketing time estimates** — Landing hero subcopy says **“Your first property in about 60 seconds”** (`app/app/page.tsx`); onboarding modal says **“about 2 minutes”** (`app/app/(app)/onboarding-panel.tsx`). **Impact:** Minor copy inconsistency across funnel. **Evidence:** paths cited.

- **Competitor / alternatives pages** — `CompetitorAlternativePage` provides breadcrumbs, comparison table, hero/footer CTAs (`FunnelCtaLink` + `/pricing`), FAQ block—**IA is sound**. Hero primary CTA remains **“Create free account”** for all visitors; signed-in users typically land elsewhere—acceptable for SEO pages. **Evidence:** `app/components/marketing/competitor-alternative-page.tsx`.

## Evidence reviewed

| Area | Paths / artifacts |
|------|---------------------|
| Process & policy | `docs/process/feature-ux-audit-process.md`, `docs/process/audit-report-template.md`, `docs/policies/design-spec.md`, `docs/policies/analytics-math-policy.md` (§1, §4 skim) |
| Landing vs app | `app/app/page.tsx`, `app/components/landing-nav.tsx`, `app/app/(app)/app-layout-client.tsx` |
| Navigation | `app/app/(app)/app-nav.tsx`, `app/components/mobile-bottom-nav.tsx` |
| Dashboard | `app/app/(app)/dashboard/page.tsx`, `app/app/(app)/dashboard/workspace-nav-mobile.tsx` |
| Properties | `app/app/(app)/properties/page.tsx` (empty state, CTAs) |
| Analyze & deals | `app/app/(app)/analyze/page.tsx`, `app/app/(app)/analyze/deal-analyzer-form.tsx`, `app/app/(app)/deals/page.tsx`, `app/app/(app)/deals/deals-list.tsx` |
| Modeling & mortgage | `app/app/(app)/modeling/page.tsx`, `app/app/(app)/modeling/modeling-workspace.tsx`, `app/app/(app)/mortgage/page.tsx`, `app/app/(app)/mortgage/mortgage-workspace.tsx` |
| Property detail IA | `app/app/(app)/properties/[id]/property-detail-tabs.tsx` (tab redirects to `/modeling`, `/mortgage`) |
| Onboarding & modals | `app/app/(app)/onboarding-panel.tsx` |
| Calculators (app hub) | `app/app/(app)/calculators/page.tsx` |
| Plans / pricing | `app/app/(app)/plans/page.tsx`, `app/app/pricing/page.tsx` |
| Competitor marketing | `app/components/marketing/competitor-alternative-page.tsx`, `app/lib/marketing/competitor-data.ts` (skim) |
| Footer | `app/components/footer.tsx` |

**Assumptions / limits:** Static review only—no live browser or device pass. No measurement of actual Cumulative Layout Shift on Analyze. `design-brief-2026.md` explicitly out of scope for “wrong UI” judgments.

## Risk & impact assessment

| Theme | Impact if unaddressed |
|--------|-------------------------|
| Onboarding modal a11y | Strain for keyboard/screen-reader users at first-run; possible compliance gap in strict audits. |
| Spec vs nav drift | Internal miscommunication and repeated false-positive UX bugs in audits. |
| Analyze SSR/mobile duality | Occasional CLS or confusing bug reports when mobile layout logic changes. |
| Mobile bottom nav scope | Slower discovery of Deals/Modeling/Mortgage; mitigated by dashboard links and property-level entry points. |

Likelihood is **medium** for onboarding and spec drift (visible on every new account), **lower** for Analyze hydration issues (depends on network/device).

## Recommendations (prioritized)

1. **Treat welcome onboarding as a real dialog:** Add `role="dialog"`, name/description, focus management, and `Escape` (and decide whether backdrop click dismisses—product call). Align with patterns already used for mobile nav drawers.
2. **Update `docs/policies/design-spec.md` §6** to describe the **Tools** cluster and **Plans** naming—or add a short “Implementation (current)” subsection so audits reference production faithfully.
3. **Document or refactor Deal Analyzer mobile path:** Either remove the unreachable/SSR-only sticky bar or position it with explicit `bottom` offset above the bottom nav and a single mobile strategy—eliminate duplicate definitions of “mobile results.”

## Task candidates (optional)

- [ ] **Onboarding modal a11y:** `role="dialog"`, `aria-*`, focus trap, Escape handler in `onboarding-panel.tsx`.
- [ ] **Design-spec §6:** Amend navigation section to match `app-nav.tsx` (Tools + Plans) or add deviation note with date.
- [ ] **Deal Analyzer:** Audit `deal-analyzer-form.tsx` mobile/desktop split—remove dead `fixed` bar or align z-index/bottom offset with `MobileBottomNav`; consider matching `getServerSnapshot` to reduce CLS (product/engineering tradeoff).
- [ ] **Copy:** Reconcile “60 seconds” (landing) vs “2 minutes” (onboarding) per growth/editorial preference.
- [ ] **Optional:** Swap mobile bottom nav icon for Analyze to something distinct from Calculators (e.g. `ClipboardList` to match sidebar) if product agrees.

## Re-test checklist

- [ ] New user: welcome modal — keyboard, screen reader, Escape.
- [ ] `/analyze` on mobile width: no duplicate results UI; acceptable first paint.
- [ ] Signed-in: `/pricing` → Plans link; sidebar “Plans” vs marketing “Pricing” still understandable.
- [ ] After any code changes: `npm run check`.

## Next trigger and cadence

- **Trigger:** Navigation or onboarding changes; Deal Analyzer mobile refactor; quarterly IA review.
- **Recommended next run:** Within **1 month** or before any **design-brief-2026** implementation kickoff (re-audit IA against new patterns).
