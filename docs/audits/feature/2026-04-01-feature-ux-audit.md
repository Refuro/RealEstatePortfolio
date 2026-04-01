# Feature / UX / IA Audit — 2026-04-01

## Executive summary

- **Overall health is good.** Core flows (add property → dashboard → workspaces → deal analyzer → plans) are coherent, consistently styled, and follow the design-spec token system in most places. Empty states and error banners are properly instrumented.
- **Two accessibility gaps require immediate attention:** both the Modeling and Mortgage workspace pages suppress their `<h1>` on mobile (inside `hidden md:block`), leaving those pages with no landmark heading for screen readers on the most common viewport.
- **IA at the workspace level is the main structural concern:** the split between `/calculators` (in-app) and `/tools` (public), the co-existence of `Analyze deal` + `Deals` as sibling nav items, and workspace context-selectors labeled "Modeling context" / "Mortgage context" all add cognitive load that a first-time user will encounter early.
- **Several spec divergences are present but cosmetic:** raw amber color tokens in the over-limit banner, decorative gradient blobs in the onboarding modal, mixed `rounded-xl`/`rounded-2xl`/`rounded-lg` rounding, and a sub-spec font size in the settings mobile snapshot. None block core usage but accumulate visual debt.

---

## Severity-ranked findings

### Critical

*(None — no findings that block core functionality or completely break a flow.)*

### High

- **H1: Workspace `<h1>` missing on mobile for Modeling and Mortgage** — Both `ModelingWorkspace` and `MortgageWorkspace` render the page title (`<h1 className="text-2xl font-semibold">`) inside a `hidden md:block` wrapper; the mobileHeader prop injects only a property-name label, not a heading. On viewports <768px (the dominant mobile breakpoint), these pages have no `<h1>` in the DOM. Screen readers navigating by heading will find no page title; accessibility audits and screen-reader testing will flag this immediately. — `app/app/(app)/modeling/modeling-workspace.tsx` lines 112–113, 137; `app/app/(app)/mortgage/mortgage-workspace.tsx` lines 131–132, 154.

### Medium

- **M1: In-app calculators hub leaks SEO implementation detail to users** — The `/calculators` page copy reads "For shareable, indexable pages (SEO), use the public calculators hub." This is developer rationale surfaced in user-facing copy. Users should not need to reason about indexability. The conceptual duplication of two calculator hubs (in-app at `/calculators`, public at `/tools`) is itself an IA problem that the copy awkwardly tries to paper over. — `app/app/(app)/calculators/page.tsx` lines 18–23.

- **M2: Properties page header has 3 CTAs competing for equal visual weight** — The Properties header row contains: "Add property" (primary/`bg-accent`), "Open Modeling workspace" (secondary/border), and "Open Mortgage workspace" (secondary/border) — all rendered in the same container above filters. On small desktops or stacked mobile layouts this creates three actions with ambiguous hierarchy before the user reaches their property list. Workspace links are discovery shortcuts, not primary actions, and could be relocated. — `app/app/(app)/properties/page.tsx` lines 262–284.

- **M3: Post-first-property onboarding nudge has 4 equal-weight CTAs with no recommendation** — The `?onboarding=first-property` confirmation card renders four identically-styled secondary buttons (Analyze a deal / Run projections / Simulate mortgage payoff / Add another property). None are promoted as the recommended next step. Progressive disclosure or a single recommended primary action would serve better. — `app/app/(app)/dashboard/page.tsx` lines 157–192.

- **M4: Past-due banner: silent failure on portal open error** — `PastDueBanner.handleUpdatePayment` catches the error and calls `setLoading(false)` but shows no user-visible error message if the billing portal API call fails. The user clicks "Update payment," nothing happens, and there is no indication of what went wrong. — `app/app/(app)/components/past-due-banner.tsx` lines 28–37.

- **M5: Over-limit banner uses raw `amber-500` Tailwind values instead of semantic token** — The banner uses `border-amber-500/30 bg-amber-500/10` directly. The design spec (`docs/policies/design-spec.md` §9) explicitly prohibits raw zinc/slate/amber/emerald values in components; a `--warning` semantic CSS token should be used instead. This is both a visual consistency and theming/maintainability concern. — `app/app/(app)/components/over-limit-banner.tsx` line 57.

- **M6: Workspace context selectors labeled "Modeling context" / "Mortgage context" — not intuitive for new users** — First-time users landing on `/modeling` or `/mortgage` will encounter a `<select>` labeled "Modeling context" or "Mortgage context" whose purpose is to pick which property to analyze. The labels describe the workspace, not the selector's function. Labels like "Select property" or "Property" are more immediately parseable. — `app/app/(app)/modeling/modeling-workspace.tsx` lines 153–154; `app/app/(app)/mortgage/mortgage-workspace.tsx` lines 177.

### Low

- **L1: LandingNav includes Privacy and Terms as top-level nav items** — `Privacy` and `Terms` appear as peer nav items alongside `Calculators`, `Pricing`, and `Changelog`. These are utility/legal links that belong in the footer; their presence in the primary nav adds visual clutter and dilutes conversion-critical paths (Sign up / Pricing / Calculators). — `app/components/landing-nav.tsx` lines 73–93.

- **L2: Mobile hamburger on landing nav uses `size-10` (40px), app nav uses `size-11` (44px)** — The design spec (`§4.1`) mandates minimum 44×44px touch targets. The landing nav mobile trigger is `size-10` (40×40px). The app-layout mobile header correctly uses `size-11`. — `app/components/landing-nav.tsx` line 141; `app/app/(app)/app-layout-client.tsx` line 176.

- **L3: Onboarding modal uses decorative gradient blobs** — The welcome modal contains two `blur-3xl` gradient circles (`bg-accent/20`, `bg-primary/15`). The design spec (`§9`) states "No decorative gradients — no gradient backgrounds unless explicitly in spec." — `app/app/(app)/onboarding-panel.tsx` lines 97–98.

- **L4: Sidebar bottom "Getting started" / "Add property" item uses Lightbulb icon** — After onboarding the label changes to "Add property" but the icon remains `Lightbulb`, which semantically suggests ideas or help rather than adding. A `Plus` or `PlusCircle` icon better matches the "Add property" action intent. — `app/app/(app)/app-nav.tsx` lines 11, 96–108.

- **L5: Deals page subtitle exposes display-mode implementation detail to users** — "Metrics use the same proportional math as elsewhere (they do not follow portfolio 'full liability' display mode)" is technically accurate but implementation-level copy. Most users will not understand what "full liability display mode" means without help text. A tooltip or help link would communicate this more gracefully. — `app/app/(app)/deals/page.tsx` lines 68–70.

- **L6: Mixed card rounding values across app surfaces** — Cards and panels use `rounded-lg`, `rounded-xl`, and `rounded-2xl` inconsistently across surfaces (e.g., settings mobile snapshot uses `rounded-2xl border`; workspace panels use `rounded-xl`; design-spec canonical is `rounded-lg`). This is not a blocking issue but accumulates visual inconsistency. — `app/app/(app)/settings/page.tsx` lines 41, 45; `app/app/(app)/dashboard/page.tsx` lines 193, 427; design-spec §5.3.

- **L7: Settings mobile snapshot uses `text-[11px]` custom size below spec scale** — The mobile snapshot uses `text-[11px]` for section header labels. The design spec type scale bottoms out at `text-xs` (`12px`, caption tier). Using a raw pixel value bypasses the type scale and produces text that may be too small for comfortable reading. — `app/app/(app)/settings/page.tsx` lines 43, 49.

- **L8: Onboarding modal lacks `role="dialog"` and `aria-labelledby`** — The welcome modal is rendered as a `div` with no ARIA dialog role or labelledby reference. Screen readers will not announce it as a modal dialog. The app-nav mobile drawer correctly uses `role="dialog" aria-modal="true" aria-label="…"` — the onboarding modal should follow the same pattern. — `app/app/(app)/onboarding-panel.tsx` lines 95–96.

- **L9: Mortgage workspace context-select disabled state with one property occupies layout space without value** — When there is only one property, the workspace `<select>` is rendered in full but disabled (`disabled:opacity-70`). It provides no user value and occupies prominent layout real estate in the workspace header. A static property name label could replace the disabled select in single-property scenarios. — `app/app/(app)/mortgage/mortgage-workspace.tsx` line 195.

- **L10: Billing success page is functionally correct but tonally flat for a conversion event** — The page copy ("Subscription active / Thank you for subscribing.") is minimal. For the most important conversion moment in the funnel, a brief reinforcement of what they've unlocked (e.g., property and deal limit at their new tier) would improve perceived value and reduce post-purchase uncertainty. — `app/app/(app)/billing/success/page.tsx`.

---

## Evidence reviewed

### Paths and files reviewed

| Surface | File(s) |
|---------|---------|
| Marketing / landing page | `app/app/page.tsx` |
| Public tools hub | `app/app/tools/page.tsx` |
| In-app calculators hub | `app/app/(app)/calculators/page.tsx` |
| App layout + nav (desktop sidebar, mobile drawer) | `app/app/(app)/app-layout-client.tsx`, `app/app/(app)/app-nav.tsx` |
| Landing nav (public, mobile) | `app/components/landing-nav.tsx` |
| Dashboard (empty + populated) | `app/app/(app)/dashboard/page.tsx` |
| Properties list (filters, empty, single, multi) | `app/app/(app)/properties/page.tsx` |
| Property detail tabs | `app/app/(app)/properties/[id]/property-detail-tabs.tsx`, `page.tsx` |
| Onboarding modal | `app/app/(app)/onboarding-panel.tsx` |
| Add property wizard | `app/app/(app)/properties/add-property-wizard.tsx` (partial — first 80 lines) |
| Modeling workspace | `app/app/(app)/modeling/modeling-workspace.tsx` |
| Mortgage workspace | `app/app/(app)/mortgage/mortgage-workspace.tsx` |
| Deal Analyzer | `app/app/(app)/analyze/page.tsx`, `deal-analyzer-form.tsx` (partial) |
| Deals list | `app/app/(app)/deals/page.tsx` |
| Plans / billing | `app/app/(app)/plans/page.tsx` |
| Settings | `app/app/(app)/settings/page.tsx` |
| Billing success | `app/app/(app)/billing/success/page.tsx` |
| Error banners | `components/over-limit-banner.tsx`, `components/past-due-banner.tsx` |
| Design spec | `docs/policies/design-spec.md` |
| Architecture & build practices | `docs/architecture-and-build-practices.md` |

### Assumptions and limits

- Audit is static code review only; no live browser testing or screen reader verification performed.
- The add-property wizard (`add-property-wizard.tsx`, ~1500+ lines) and deal-analyzer-form (`deal-analyzer-form.tsx`, ~1400+ lines) were reviewed for the first 80 lines only. In-form validation error states, step-by-step IA, and mortgage sub-form UX were not fully audited in this pass.
- Public calculator pages at `/investment-property-calculator`, `/tools/fix-and-flip`, `/tools/str-vs-ltr`, `/tools/brrr` were not read in full.
- Chart components (`dashboard-charts.tsx`, `projections-tab-content.tsx`) and the property health strip were not audited in detail.

---

## Risk & impact assessment

| Finding | User impact | Business impact | Likelihood/Exposure |
|---------|------------|-----------------|---------------------|
| H1 — Missing `<h1>` on mobile workspaces | Screen reader users receive no page title on Modeling and Mortgage; disorienting for assistive tech | Accessibility compliance gap; potential WCAG 2.1 SC 1.3.1 violation | High: affects all mobile users using screen readers on these two routes |
| M1 — SEO copy leaking to users | Confuses users; undermines trust in the product's clarity | Minor; unlikely to block conversion but degrades perceived quality | Low frequency (only users who visit in-app calculators) |
| M2 — 3 CTAs in properties header | Decision paralysis on a high-traffic page; workspace links distract from main action | May reduce "Add property" clicks; may help discoverability of workspaces | Medium: every user with properties sees this |
| M3 — Equal-weight post-onboarding CTAs | No guidance on next step; users may stall after first property | Reduced activation depth; users may not discover deal analysis or modeling | Medium: affects every user immediately after first property add |
| M4 — Silent billing portal failure | User can't recover from payment issue without external support | Churn risk: users stuck in past-due state with no feedback | Low frequency, high impact when it occurs |
| M5 — Raw amber token | Theming debt; will break in custom theme scenarios | Low user impact; maintainability concern | Low: design debt |
| L1–L10 | Low individual impact | Accumulated visual/brand inconsistency over time | Low-medium |

---

## Recommendations (prioritized)

1. **Fix mobile `<h1>` in Modeling and Mortgage workspaces (H1).** Render a visually hidden `<h1>` or ensure the heading is present in the DOM on mobile even if the desktop header card is hidden. The `mobileHeader` prop block is the right location for an accessible `<h1>` that is styled appropriately for the mobile context.

2. **Resolve the in-app vs. public calculator IA (M1).** Either: (a) remove the `/calculators` in-app hub and direct in-app users to the public `/tools` hub via a contextual link, or (b) keep both but rewrite the copy to be user-focused ("Open a standalone calculator to share" rather than "For indexable pages (SEO)…"). Option (a) simplifies IA; option (b) is lower-effort.

3. **Simplify properties page header actions (M2).** Move the "Open Modeling workspace" and "Open Mortgage workspace" links out of the primary header row. Consider placing them as contextual actions within the portfolio summary area or in a compact secondary row below the `h1 + Add property` pair.

4. **Promote one recommended next step in post-onboarding CTA cluster (M3).** Designate one of the four post-first-property CTAs as the recommended next action (e.g., "Run projections" or "Analyze a deal") with a primary/accent style, and demote the others to ghost/secondary buttons or a collapsible "More options" section.

5. **Add error feedback to the past-due billing portal button (M4).** Show an inline error message when the portal API call fails so users understand what happened and can retry or contact support.

6. **Replace raw `amber-500` in over-limit banner with a `--warning` semantic token (M5).** Aligns with design-spec §9 and enables proper dark-mode theming.

7. **Rename workspace context-selectors and sidebar bottom CTA icon (M6, L4).** Rename the workspace `<select>` labels from "Modeling context"/"Mortgage context" to "Property" or "Select property." Replace the `Lightbulb` icon in the sidebar bottom item with `Plus` or `PlusCircle` once the property count is >0.

8. **Remove Privacy/Terms from the primary LandingNav (L1).** Move these to the footer only. Free up space in the nav for better conversion-path clarity.

9. **Add `role="dialog"` and `aria-labelledby` to onboarding modal (L8).** Follow the existing `app-layout-client.tsx` drawer pattern.

10. **Address cosmetic spec divergences as a batch task (L3, L6, L7).** Remove decorative gradient blobs from onboarding modal; standardize card rounding to `rounded-lg` per design spec; replace `text-[11px]` with `text-xs`.

---

## Task candidates

- [ ] **Fix: Add accessible `<h1>` on mobile for Modeling workspace** — ensure heading present in DOM at mobile breakpoint; update `modeling-workspace.tsx` mobileHeader or introduce a conditionally-rendered landmark.
- [ ] **Fix: Add accessible `<h1>` on mobile for Mortgage workspace** — same pattern as above; `mortgage-workspace.tsx`.
- [ ] **Fix: Add `role="dialog"` + `aria-labelledby` to OnboardingPanel welcome modal** — follow `app-layout-client.tsx` drawer pattern.
- [ ] **Fix: Show error feedback in PastDueBanner when billing portal open fails** — add `error` state and inline error message.
- [ ] **Chore: Replace `amber-500` raw values in OverLimitBanner with `--warning` semantic token** — requires adding `--warning` to `globals.css` and `tailwind.config`.
- [ ] **UX: Rename workspace context selectors from "Modeling context" / "Mortgage context" to "Property"** — two-line change; low risk.
- [ ] **UX: Replace Lightbulb icon with Plus/PlusCircle in app-nav bottom CTA when propertyCount > 0** — single-file change in `app-nav.tsx`.
- [ ] **UX: Rewrite in-app calculators hub description** — remove SEO rationale from user-facing copy; user-focused alternative wording.
- [ ] **UX: Promote one primary next-step CTA in post-first-property onboarding card** — style one CTA as primary (`bg-accent`), demote others to secondary/ghost.
- [ ] **UX: Move "Open Modeling workspace" / "Open Mortgage workspace" out of properties header row** — relocate to portfolio summary section or below the h1+primary-CTA pair.
- [ ] **Accessibility: Remove landing nav hamburger `size-10` and replace with `size-11`** — single-line change; `landing-nav.tsx` line 141.
- [ ] **Design debt: Remove decorative gradient blobs from OnboardingPanel welcome modal** — design-spec compliance.
- [ ] **Design debt: Standardize card border-radius to `rounded-lg`** — batch search-replace across settings, dashboard, and workspace panels.

---

## Re-test checklist

- [ ] Verify Modeling workspace `<h1>` is present in DOM on 375px viewport
- [ ] Verify Mortgage workspace `<h1>` is present in DOM on 375px viewport
- [ ] Verify OnboardingPanel `role="dialog"` and `aria-labelledby` with screen reader (or axe DevTools)
- [ ] Verify PastDueBanner shows visible error when portal fetch fails (mock 500 response)
- [ ] Verify OverLimitBanner renders correctly in dark mode after semantic token change
- [ ] Confirm landing nav hamburger touch target meets 44px minimum on iOS Safari
- [ ] Run `npm run check` when any code changes are made

---

## Next trigger and cadence

- **Trigger:** Pre-launch milestone or after wizard/deal-analyzer form overhaul (large UI change)
- **Recommended next run:** 2026-07-01 (quarterly) or sooner if add-property wizard / deal-analyzer form receive a UX pass (those flows warrant a dedicated sub-audit of their step IA and in-form validation error paths)
