# Feature / UX / IA Audit — 2026-03-30 (Run 5)

## Executive summary

- **Overall:** Logged-in shell (`app-layout-client.tsx`, `app-nav.tsx`), primary routes under `app/app/(app)/`, and cross-links (dashboard ↔ properties ↔ workspaces via `propertyId`, analyze ↔ deals) remain coherent. Information hierarchy generally matches `docs/policies/design-spec.md` (page titles, metric emphasis, progressive disclosure on dashboard via `MobileCollapsible`).
- **Top risks:** (1) **Onboarding welcome overlay** lacks standard dialog semantics and focus management, which hurts keyboard and assistive-technology users. (2) **IA/copy fragmentation** persists between marketing **Pricing** (`/pricing`) and in-app **Plans & billing** (`/plans`), and between nav **Deals** and the page title **Saved deals**.
- **Mobile:** `MobileToolShell` on analyze (`deal-analyzer-form.tsx`) and property tabs (`projections-tab-content`, `mortgage-tab-content`) matches the design-spec mobile workspace pattern; app chrome uses safe-area padding, `md` breakpoint split, and a drawer with Escape/backdrop/slide affordances.
- **Recommendation:** Prioritize onboarding modal accessibility (dialog role, focus trap, Escape); align nav label or page title for deals; add a logged-in path from `/pricing` to `/plans` (or shared terminology). Normalize remaining empty-state card recipes where polish matters.

## Severity-ranked findings

### Critical

- None identified in this static review.

### High

- None identified for functional correctness or auth/navigation breakage. Core flows (dashboard, properties list/detail, modeling/mortgage workspaces, analyze, deals, settings) are reachable and consistently gated where expected (`getAppUser` / `redirect` patterns vary by route but remain understandable).

### Medium

- **Welcome onboarding overlay lacks dialog accessibility patterns** — The first-run modal in `onboarding-panel.tsx` uses a full-screen `fixed` backdrop and inner card but does not expose `role="dialog"`, `aria-modal="true"`, `aria-labelledby` / `aria-describedby`, or initial focus / focus trap. Keyboard users can likely tab into underlying page content; there is no Escape handler to dismiss. — Risk: WCAG 2.x focus order and modal behavior gaps; support burden for “stuck” or confused users.

- **Dual entry points for pricing vs in-app plans** — Marketing `LandingNav` links to `/pricing` with label **“Pricing”** (`landing-nav.tsx`). Authenticated upgrade paths emphasize **`/plans`** (“Plans” in `app-nav.tsx`, “Plans & billing” on `plans/page.tsx`). Logged-in users on marketing pages may not see a direct equivalent to **Plans**. — Same structural issue as prior runs; impacts discoverability of upgrades and consistency with FAQ copy that references “account settings.”

- **Nav label vs page title: “Deals” / “Saved deals”** — Sidebar and drawer list the route as **Deals** (`app-nav.tsx`), while the page `<h1>` is **Saved deals** (`deals/page.tsx`). Minor but recurring mental-model friction when scanning nav vs landing on the page.

- **Empty-state card styling still mixed** — **Dashboard** (no properties) and **Properties** (empty list) use `rounded-lg border border-border bg-card` (`dashboard/page.tsx`, `properties/page.tsx`). **Modeling**, **Mortgage**, and **Deals** empty blocks use `rounded-xl border border-border/70 bg-card/95 … shadow-sm` (`modeling-workspace.tsx`, `mortgage-workspace.tsx`, `deals/page.tsx`). Workspace/deals surfaces are now aligned with each other; onboarding/dashboard/properties empty blocks remain visually “lighter.”

- **Analyze flow density and duplicate titling on mobile** — `analyze/page.tsx` renders an `h1` “Analyze deal” in a card; `DealAnalyzerForm` on mobile wraps content in `MobileToolShell` with title **“Deal Analyzer”** and eyebrow **“Analyzer”** (`deal-analyzer-form.tsx`). Users see overlapping conceptual labels (“Analyze deal” vs “Deal Analyzer”). Long form remains appropriate for power users but heavy for first visit.

### Low

- **`MobileCollapsible` disclosure state not exposed to AT** — The toggle in `mobile-collapsible.tsx` has no `aria-expanded` (nor `aria-controls` for the panel id). Screen reader users do not hear expanded/collapsed state for “More metrics” on the dashboard.

- **Mobile analyze footer copy** — Footer text in `deal-analyzer-form.tsx` says saved analyses are available in the “full desktop workflow,” which can read as mobile being second-class on a phone-first layout.

- **Settings information architecture** — `settings/page.tsx` shows an **Account snapshot** card only below `md` (`md:hidden` section). Desktop users rely on **Profile** and **Plan & billing** sections without the same condensed snapshot; intentional but slightly asymmetric.

- **Error boundary** — `app/(app)/error.tsx` provides reset and dashboard link with clear copy; no `role="alert"` on the message (optional enhancement for screen readers).

- **Positive (shell)** — Mobile nav drawer: `aria-modal`, `aria-label`, first focusable focus on open, body scroll lock, Escape (`app-layout-client.tsx`). Property detail tabs: `aria-label="Property sections"` on `<nav>` (`property-detail-tabs.tsx`).

## Evidence reviewed

### Process & policy

- `docs/process/feature-ux-audit-process.md`
- `docs/process/audit-report-template.md`
- `docs/policies/design-spec.md` (§1–4, typography, mobile guidelines)

### App shell & global

- `app/app/(app)/layout.tsx`
- `app/app/(app)/app-layout-client.tsx`
- `app/app/(app)/app-nav.tsx`
- `app/app/(app)/onboarding-panel.tsx`
- `app/app/(app)/draft-context.tsx` (referenced via `LogoLink` / nav)
- `app/app/(app)/error.tsx`
- `app/components/footer.tsx`

### Core journeys

- `app/app/(app)/dashboard/page.tsx`, `dashboard/workspace-nav-mobile.tsx`, `dashboard/dashboard-charts.tsx` (referenced for charts/benchmark)
- `app/app/(app)/properties/page.tsx`, `properties/properties-filters-mobile.tsx`
- `app/app/(app)/properties/[id]/page.tsx`, `property-detail-tabs.tsx` (tabs, redirect behavior for `tab=mortgage` / `tab=projections`)
- `app/app/(app)/modeling/page.tsx`, `modeling/modeling-workspace.tsx`
- `app/app/(app)/mortgage/page.tsx`, `mortgage/mortgage-workspace.tsx`
- `app/app/(app)/analyze/page.tsx`, `analyze/deal-analyzer-form.tsx`
- `app/app/(app)/deals/page.tsx`, `deals/deals-list.tsx`
- `app/app/(app)/settings/page.tsx`

### Shared mobile & components

- `app/components/mobile-tool-shell.tsx`
- `app/components/mobile-collapsible.tsx`
- `app/components/mobile-mode-switcher.tsx`

### Marketing / IA cross-check

- `app/components/landing-nav.tsx`
- `app/app/(app)/plans/page.tsx` (sample)

### Assumptions / limits

- **Static code review** only: no device testing, automated axe run, or analytics validation.
- Severity reflects **UX, IA, and accessibility** impact from code structure and copy; not production error rates.

## Risk & impact assessment

- **Medium** findings affect **accessibility compliance**, **upgrade discoverability**, and **perceived polish** (label mismatch, empty-state variance, analyze titling). Likelihood is high for any keyboard/AT user hitting the welcome modal; business impact is trust, support tickets, and conversion hesitation rather than broken CRUD.
- **Low** findings are incremental a11y and copy tweaks.

## Recommendations (prioritized)

1. **Treat the welcome modal as a real dialog** — Add `role="dialog"`, `aria-modal="true"`, label/description wiring, move focus into the modal on open, restore focus on close, optional Escape to dismiss (if product-acceptable), and ensure focus cannot tab behind the overlay (`onboarding-panel.tsx`).
2. **Clarify Deals IA** — Either rename nav to **Saved deals**, add a subtitle under **Saved deals** (“Your deal list”), or change `<h1>` to **Deals** with supporting text “Saved analyses” so nav and page agree (`app-nav.tsx`, `deals/page.tsx`).
3. **Tighten Pricing ↔ Plans** — For authenticated sessions on `/pricing`, add a clear link to **`/plans`** and align FAQ wording with **Plans & billing** (`landing-nav.tsx` / `pricing` page as applicable).
4. **Reduce duplicate titles on Analyze (mobile)** — Single primary heading strategy: e.g. keep page `h1` visually secondary on mobile or remove redundant shell title (`analyze/page.tsx`, `deal-analyzer-form.tsx`).
5. **Optional empty-state pass** — Align dashboard/properties empty cards with workspace `rounded-xl` recipe if product wants one “marketing card” language everywhere.

## Task candidates (optional)

- [ ] Onboarding modal: dialog semantics, focus trap, Escape, and `aria-*` (`onboarding-panel.tsx`).
- [ ] Align **Deals** nav label with `deals/page.tsx` heading or add clarifying subcopy.
- [ ] Add `aria-expanded` / `aria-controls` to `MobileCollapsible` (`mobile-collapsible.tsx`).
- [ ] Logged-in `/pricing` CTA to `/plans` + FAQ copy update (`pricing` page, `landing-nav` as needed).
- [ ] Mobile analyze: reconcile “Analyze deal” vs “Deal Analyzer” titling (`analyze/page.tsx`, `deal-analyzer-form.tsx`).

## Re-test checklist

- [ ] Verify welcome modal with keyboard-only navigation and VoiceOver/NVDA (focus never escapes; dismiss behavior clear).
- [ ] Verify deals nav → page title coherence after copy change.
- [ ] Verify `/pricing` → `/plans` path for signed-in user (if implemented).
- [ ] Spot-check dashboard “More metrics” collapsible announces state with AT (if `aria-expanded` added).
- [ ] `npm run check` (when code changes are made)

## Next trigger and cadence

- **Trigger:** Pre-release UX pass, monthly IA review, or after major nav/settings changes.
- **Recommended next run:** Within **4–8 weeks** or before the next marketing/site IA change.
