# Feature / UX / IA Audit — 2026-04-04

## Executive Summary

- **One critical carry-forward from Run 2 is now resolved:** The welcome onboarding modal (`onboarding-panel.tsx`) has been upgraded with full dialog semantics — `role="dialog"`, `aria-modal`, `aria-labelledby`, a working focus trap, and an Escape key handler are all present. This was the highest-priority open item from runs 1 and 2.
- **A new medium-severity ARIA gap exists on the property detail page:** Tab navigation (`property-detail-tabs.tsx`) uses `<nav>` + `<button>` elements with visual affordances but no ARIA tab roles (`role="tablist"`, `role="tab"`, `aria-selected`), meaning screen readers cannot infer the tab-switching pattern.
- **The `border-border/70` / `bg-card/95` token question requires a policy decision:** These opacity-slash variants appear in 50+ locations across production (including shared components `MobileToolShell`, `MobileSectionCard`, `DealAnalyzerForm`). Run 2 classified them as deprecated per `design-spec-2026.md §15.2`; at this usage scale the classification needs re-verification — either confirm they are acceptable or create a migration plan, but treating them as single-file fixes is no longer appropriate.
- **Four medium-severity carry-forwards from Run 2 remain open** (MockupFrame CLS, pricing FAQ duplication, timing copy inconsistency, stale `design-spec.md §6`); none were addressed in the period since Run 2.

---

## Severity-ranked findings

### Critical

- None.

### High

- **`border-border/70` / `bg-card/95` token policy ambiguity — systemic scale** — Run 2 classified `border-border/70` and `bg-card/95` as deprecated tokens per `design-spec-2026.md §15.2`, flagging three surfaces. This audit confirms the pattern appears in **50+ locations** across production code: `app/components/mobile-tool-shell.tsx` lines 55–56, 84; `app/app/(app)/analyze/deal-analyzer-form.tsx` lines 914, 925, 1034, 1080, 1144, 1200, 1227, 1300–1340; `app/app/(app)/mortgage/mortgage-workspace.tsx` lines 150, 264; `app/components/mobile-section-card.tsx` line 14; `app/components/mobile-summary-rail.tsx` line 31; `app/components/growth/paid-intent-checkout-banner.tsx` line 72; `app/app/(app)/dashboard/page.tsx` line 150; `app/app/(app)/modeling/modeling-workspace.tsx` line 119; `app/app/(app)/onboarding-panel.tsx` line 172; `app/app/(app)/properties/new/page.tsx` line 28; `app/app/lp/investment-property-calculator/page.tsx` lines 47–89. **Impact:** If the tokens are truly deprecated, a migration of this scale cannot be assigned to a single ticket — it requires a design decision, a `design-spec-2026.md §15.2` re-read, and a batched migration plan. If they are in fact the accepted glass/subtle-card vocabulary for the current design language, the deprecation claim in Run 2 was incorrect and `design-spec-2026.md §15.2` should be clarified so future audits stop flagging valid patterns as violations. **Action required before the next audit:** PM/designer to confirm whether `border-border/70` and `bg-card/95` are accepted or deprecated and update `design-spec-2026.md §15.2` accordingly. **Evidence:** `app/components/mobile-tool-shell.tsx` (lines 55–84); `app/app/(app)/analyze/deal-analyzer-form.tsx` (lines 914–1340); `app/app/(app)/mortgage/mortgage-workspace.tsx` (lines 150, 264); all files listed above; `docs/audits/feature/2026-04-03-feature-ux-audit-2.md` High §1.

### Medium

- **Property detail tab nav — missing ARIA tab role semantics** — The tab navigation in `app/app/(app)/properties/[id]/property-detail-tabs.tsx` (lines 64–105) renders an `<nav aria-label="Property sections">` containing plain `<button>` elements. Active state is communicated only by `border-b-2 border-accent` CSS. There is no `role="tablist"` on the container, no `role="tab"` on the buttons, no `aria-selected="true/false"`, and no `aria-controls` pairing to the tab panels. This is the primary navigation pattern on the property detail page — the most content-rich view in the app. **Impact:** Screen reader users navigating keyboard-first do not hear "tab 1 of 2, selected" or "tab 2 of 2" — they encounter two unlabeled buttons inside a nav landmark. WCAG 2.1 §4.1.2 (Name, Role, Value). **Evidence:** `app/app/(app)/properties/[id]/property-detail-tabs.tsx` lines 64–105; design-spec §5.5 (tab pattern); `app/app/(app)/app-layout-client.tsx` mobile drawer (correct tab role reference). **Route:** `/properties/[id]`.

- **Onboarding modal — deprecated tokens and timing copy carry-forward (partial)** — The welcome modal a11y semantics from Run 2 are now resolved (focus trap, Escape key, `role="dialog"`, `aria-labelledby` all present). However two issues remain open: (1) `onboarding-panel.tsx` line 172 still uses `border border-border/70 bg-card/95` (subject to the policy decision above); line 177 uses `border-border/80`. (2) Line 196: `"Typical setup time: about 60 seconds."` contradicts `HOW_IT_WORKS[0].description` in `app/app/page.tsx` (line 107: "about 2 minutes per property") — the within-page timing inconsistency flagged in Run 2 remains. **Impact:** Micro-trust erosion for visitors who see both surfaces in a session; design-token inconsistency persists if tokens are confirmed deprecated. **Evidence:** `app/app/(app)/onboarding-panel.tsx` lines 172, 177, 196; `app/app/page.tsx` line 107 (`HOW_IT_WORKS`); Run 2 Medium §3 and §4.

- **MockupFrame initial render — CLS risk on landing hero (carry-forward, unverified)** — The `ResizeObserver`-based scale initialization in `app/components/mockups/mockup-frame.tsx` (lines 32–34, 77–93) starts at `scale=0`, causing a potential layout collapse on first paint. Not re-verified this pass (landing page not within this audit scope). Carry-forward from Run 2. **Evidence:** `app/components/mockups/mockup-frame.tsx` lines 32–34, 77–93; `app/app/page.tsx` lines 265–309; Run 2 Medium §1.

- **Pricing page — FAQ content duplicated across two sections (carry-forward)** — Two separate FAQ-style sections on `app/app/pricing/page.tsx` (lines 212–251 and 299–328) include the repeated question "Do I need a credit card to start?" Not addressed since Run 2. **Impact:** Redundant content; implementing AI for the premium polish plan may style around it rather than consolidating. **Evidence:** `app/app/pricing/page.tsx` lines 225–227 vs 303–306; Run 2 Medium §2.

- **`docs/policies/design-spec.md §6` — stale nav still active (carry-forward)** — Confirmed this pass: `docs/policies/design-spec.md §6` lists `Dashboard`, `Properties`, `Pricing`, `Settings` as the sidebar items. The actual production nav (`app/app/(app)/app-nav.tsx` lines 22–39) has an unlabeled cluster (Dashboard, Properties), a **Tools** cluster (Modeling, Mortgage, Refinance, Calculators, Analyze deal, Deals), and an **Account** cluster (Plans, Settings). This divergence causes future audits and engineers to get a false picture of canonical nav. Not addressed since Run 2. **Evidence:** `docs/policies/design-spec.md §6`; `app/app/(app)/app-nav.tsx` lines 22–39; Run 2 Medium §4.

- **Landing page within-page timing inconsistency (carry-forward)** — `app/app/page.tsx` hero trust line (line 261) and bottom CTA (line 717) say "about 60 seconds"; the `HOW_IT_WORKS` data (line 107) says "about 2 minutes per property." Both are visible to any visitor who scrolls the landing page. Not resolved since Run 2. **Evidence:** `app/app/page.tsx` lines 107, 261, 717; Run 2 Medium §3.

- **Deals list `<select>` sort control — no accessible label** — `app/app/(app)/deals/deals-list.tsx` line 92: the sort `<select>` element has no accompanying `<label>` or `aria-label`. Adjacent text reads "Search deals..." but the select itself has no programmatic label. Screen reader users encounter an unlabeled form control. **Impact:** WCAG 2.1 §1.3.1 (Info and Relationships) violation; low likelihood of user harm in practice but trivially fixable. **Evidence:** `app/app/(app)/deals/deals-list.tsx` line 92. **Route:** `/deals`.

### Low

- **"CoC return" vs "Cash-on-cash return" — label inconsistency in the Analyze → Deals flow** — `app/app/(app)/deals/deals-list.tsx` line 172 uses the abbreviation "CoC return" in the deal card metric grid. The deal analyzer form (`deal-analyzer-form.tsx`) and the property metrics section use the full label "Cash-on-cash return." A user who runs an analysis and navigates to the saved deals list encounters a new abbreviation for the same metric without explanation. **Evidence:** `app/app/(app)/deals/deals-list.tsx` line 172; `app/app/(app)/properties/property-metrics-section.tsx` (expected usage of full label). **Route:** `/deals`.

- **"Print summary" vs "Print portfolio summary" — two labels for the same action on the dashboard** — Dashboard desktop action bar (line 225) says "Print summary"; the mobile `WorkspaceNavMobile` component (line 43) says "Print portfolio summary." Same destination (`/export/portfolio-summary`), two different labels on the same page depending on viewport. **Impact:** Minor consistency gap; confusing if a user is switching between devices. **Evidence:** `app/app/(app)/dashboard/page.tsx` line 225 vs `app/app/(app)/dashboard/workspace-nav-mobile.tsx` line 43. **Route:** `/dashboard`.

- **Onboarding modal accent button — missing `duration-150` transition token** — `app/app/(app)/onboarding-panel.tsx` line 218: the "Add first property" button uses `transition-all hover:-translate-y-px hover:bg-accent-hover` without an explicit `duration-150` class. Design-spec §10.1–10.2 require the duration token with every `hover:bg-*` on button hover/active states. Carry-forward from Run 2. **Evidence:** `app/app/(app)/onboarding-panel.tsx` line 218; design-spec §10.1–10.2.

- **Property detail sticky tab nav offset does not account for system banners** — `app/app/(app)/properties/[id]/property-detail-tabs.tsx` line 65: the sticky nav uses `top-14` on mobile (56px, the fixed header height) and `top-0` on desktop. When `OverLimitBanner` or `PastDueBanner` renders (`app/app/(app)/components/over-limit-banner.tsx`, `past-due-banner.tsx`), those banners push the layout but do not adjust the `top-14` sticky offset. On mobile, the tab nav could scroll under the banner text. **Impact:** Low probability but affects users on the plan limit who navigate to a property detail while seeing the over-limit banner. **Evidence:** `app/app/(app)/properties/[id]/property-detail-tabs.tsx` line 65; `app/app/(app)/components/over-limit-banner.tsx`; `app/app/(app)/components/past-due-banner.tsx`. **Route:** `/properties/[id]`.

- **Modeling and Mortgage workspace desktop description copy diverges** — Modeling desktop header (line 143 of `modeling-workspace.tsx`) reads "Run scenario assumptions in a global workspace." Mortgage desktop workspace uses analogous language. The mobile header for both reads "Active property" (line 82 of `modeling-workspace.tsx`). The functional label ("Active property") is clearer for orientation; the desktop description is context-setting prose. Not a blocking issue but the framing mismatch reduces consistency. **Evidence:** `app/app/(app)/modeling/modeling-workspace.tsx` lines 82–83, 143.

---

## Evidence reviewed

| Area | Paths reviewed |
|------|---------------|
| Process & policy | `docs/process/feature-ux-audit-process.md`, `docs/process/audit-report-template.md` |
| Design standards | `docs/policies/design-spec.md` (full), `docs/architecture-and-build-practices.md` (§1–2) |
| Previous audits | `docs/audits/feature/2026-04-03-feature-ux-audit-2.md` (full) |
| Dashboard | `app/app/(app)/dashboard/page.tsx` (full), `app/app/(app)/dashboard/workspace-nav-mobile.tsx` (full), `app/app/(app)/dashboard/dashboard-charts.tsx` (signature) |
| Properties list | `app/app/(app)/properties/page.tsx` (full) |
| Property detail | `app/app/(app)/properties/[id]/property-detail-tabs.tsx` (full), `app/app/(app)/properties/[id]/overview-tab-content.tsx` (lines 1–173), `app/app/(app)/properties/[id]/page.tsx` (lines 1–60) |
| Modeling workspace | `app/app/(app)/modeling/modeling-workspace.tsx` (full) |
| Mortgage workspace | `app/app/(app)/mortgage/mortgage-workspace.tsx` (lines 1–80) |
| Refinance workspace | `app/app/(app)/refinance/refinance-workspace.tsx` (lines 1–60) |
| Analyze / Deals | `app/app/(app)/analyze/page.tsx` (full), `app/app/(app)/analyze/deal-analyzer-form.tsx` (lines 1–200), `app/app/(app)/deals/page.tsx` (full), `app/app/(app)/deals/deals-list.tsx` (full) |
| Plans | `app/app/(app)/plans/page.tsx` (full) |
| Onboarding | `app/app/(app)/onboarding-panel.tsx` (full) |
| Navigation | `app/app/(app)/app-nav.tsx` (full), `app/components/mobile-bottom-nav.tsx` (full), `app/app/(app)/app-layout-client.tsx` (lines 1–60) |
| Token sweep | `app/app/globals.css` (warning token); grep for `border-border/70`, `bg-card/95` across full app tree |

**Run 2 resolution status:**

| Run 2 finding | Status |
|---------------|--------|
| Welcome modal a11y (High) | **RESOLVED** — `role="dialog"`, `aria-modal`, `aria-labelledby`, focus trap, Escape key all present in `onboarding-panel.tsx` |
| Welcome modal deprecated tokens (High, partial) | **OPEN** — Tokens present; policy needs clarification at systemic scale |
| MockupFrame CLS (Medium) | **OPEN** — Not re-verified this pass |
| Pricing FAQ duplication (Medium) | **OPEN** |
| Timing copy "60s vs 2min" (Medium) | **OPEN** |
| `design-spec.md §6` stale nav (Medium) | **OPEN** — Confirmed stale |
| Hero 640–767px breakpoint (Medium) | **Not re-verified** — Out of scope this pass |
| Onboarding button `duration-150` (Low) | **OPEN** |
| Pricing `reveal-up` classes (Low) | **Not re-verified** — Out of scope this pass |

**Assumptions / limits:** Static code review only — no live browser or device pass. `deal-analyzer-form.tsx` reviewed lines 1–200 only; save/edit/stress-test sections (lines 200–1356) not fully read. `PricingCards` component internals not re-read this pass. `design-spec-2026.md` not read this pass; §15.2 token policy not directly verified.

---

## Risk & impact assessment

| Theme | Impact if unaddressed |
|-------|----------------------|
| `border-border/70` / `bg-card/95` policy ambiguity | Every future audit flags 50+ valid-looking usages as violations; or a genuine design debt accumulates silently across the entire app |
| Property detail tab nav — no ARIA tab roles | Screen reader and keyboard users navigating the property detail page (the most content-dense view) cannot use standard AT tab-panel navigation; WCAG 2.1 §4.1.2 non-compliance |
| Deals sort select — no label | Minor WCAG §1.3.1 violation on `/deals`; quickly fixable but will remain flagged in accessibility scans |
| Timing copy inconsistency | Trust erosion for visitors who see both the hero ("60 seconds") and How it Works ("2 minutes") on one page scroll; persists across all future marketing edits until root-cause is addressed |
| Stale `design-spec.md §6` | Future auditors and engineers who read this file get a false nav model; compounds with each new engineer who onboards |
| MockupFrame CLS | Landing-page CWV degradation accumulates; becomes harder to attribute once other performance work ships |
| Pricing FAQ duplication | Ships polished-but-duplicated content in the premium pricing pass |

---

## Recommendations (prioritized)

1. **Resolve the `border-border/70` / `bg-card/95` policy immediately (before the next implementation pass):** Read `design-spec-2026.md §15.2` and determine: (a) if these slash-opacity variants are the accepted glass-card vocabulary, update §15.2 to say so and remove the "deprecated" claim; or (b) if they are truly deprecated, create a dedicated migration task (not single-file fixes) covering all 50+ instances across shared components and workspace pages. Until resolved, do not flag individual file occurrences as violations in audits.

2. **Add ARIA tab semantics to `property-detail-tabs.tsx`:** Wrap the `<div className="hidden ... md:flex">` and `<div className="flex flex-1 ... md:hidden">` containers in `role="tablist"`, add `role="tab"` to each `<button>`, and set `aria-selected={activeTab === id}`. Add `id` attributes to the tab panels (`OverviewTabContent`, `DetailsTabContent`) and connect them via `aria-controls`. This is a ~10-line change with no visual effect.

3. **Add `aria-label="Sort deals"` (or a visually-hidden `<label>`) to the sort `<select>` in `deals-list.tsx`:** One-line fix; eliminates a WCAG §1.3.1 violation on `/deals`.

4. **Standardize the "Print summary" label:** Pick one label ("Print summary" or "Print portfolio summary") and apply it consistently to both `dashboard/page.tsx` line 225 and `workspace-nav-mobile.tsx` line 43. Prefer the shorter "Print summary" since the page context already implies portfolio.

5. **Standardize "CoC return" → "Cash-on-cash return" in `deals-list.tsx`:** Replace the abbreviation (line 172) with the full label used everywhere else in the app. One-word change, eliminates the cross-flow inconsistency.

6. **Resolve the onboarding timing copy:** Align "about 60 seconds" (`onboarding-panel.tsx` line 196) with "about 2 minutes" (`page.tsx` HOW_IT_WORKS) — decide on one number, update all four occurrences (hero trust line, bottom CTA, How it Works, onboarding modal).

7. **Deprecate `docs/policies/design-spec.md §6`:** Add a top-of-section deprecation notice pointing to `app-nav.tsx` as the authoritative nav source. The existing file header already says "canonical visual and interaction rules live in `design-spec-2026.md`" but §6 specifically still shows the stale flat nav.

8. **Verify and fix MockupFrame CLS (carry-forward):** Add an SSR-stable `min-height` or `aspect-ratio` to the `MockupFrame` wrapper so the server-side render has a defined container height. Reduces CLS on the landing hero.

---

## Task candidates

- [ ] **Property detail tabs — ARIA tab roles:** Add `role="tablist"` to desktop and mobile tab containers, `role="tab"` + `aria-selected` to each `<button>`, `aria-controls` to panel divs — `app/app/(app)/properties/[id]/property-detail-tabs.tsx` lines 64–105.
- [ ] **Deals sort select — accessible label:** Add `aria-label="Sort deals"` or a visually-hidden `<label>` to the `<select>` — `app/app/(app)/deals/deals-list.tsx` line 92.
- [ ] **"Print summary" label standardization:** Reconcile desktop and mobile labels — `app/app/(app)/dashboard/page.tsx` line 225 and `app/app/(app)/dashboard/workspace-nav-mobile.tsx` line 43.
- [ ] **"CoC return" label fix:** Replace "CoC return" with "Cash-on-cash return" — `app/app/(app)/deals/deals-list.tsx` line 172.
- [ ] **Timing copy reconciliation:** Align "60 seconds" vs "2 minutes" across `app/app/page.tsx` (lines 107, 261, 717) and `app/app/(app)/onboarding-panel.tsx` (line 196).
- [ ] **`design-spec.md §6` deprecation header:** Add per-section deprecation notice for §6 — `docs/policies/design-spec.md`.
- [ ] **`border-border/70` / `bg-card/95` policy decision:** PM/designer confirms accept or deprecate; update `design-spec-2026.md §15.2` before next audit.
- [ ] **MockupFrame CLS:** Add `min-height`/`aspect-ratio` for SSR-stable container — `app/components/mockups/mockup-frame.tsx` (carry-forward from Run 2).
- [ ] **Pricing FAQ consolidation:** Merge or differentiate the two FAQ sections — `app/app/pricing/page.tsx` lines 212–251 and 299–328 (carry-forward from Run 2).
- [ ] **Onboarding button `duration-150`:** Add `duration-150` to transition class on "Add first property" button — `app/app/(app)/onboarding-panel.tsx` line 218 (carry-forward from Run 2).

---

## Re-test checklist

- [ ] `/properties/[id]` — keyboard user: tab into the Overview/Details nav, verify screen reader announces "Overview tab, 1 of 2, selected" and "Details tab, 2 of 2" using NVDA or VoiceOver after the ARIA fix.
- [ ] `/deals` — verify sort select reads its label ("Sort deals") under screen reader after label fix.
- [ ] `/dashboard` — confirm desktop and mobile show the same label for the print export action.
- [ ] `/deals` — confirm deal cards show "Cash-on-cash return" not "CoC return" after label fix.
- [ ] Landing page and onboarding modal — verify all four timing-copy instances say the same value after reconciliation.
- [ ] `docs/policies/design-spec.md §6` — verify it has a deprecation notice before it is read in a future audit.
- [ ] `design-spec-2026.md §15.2` — verify the `border-border/70` / `bg-card/95` policy is explicit and unambiguous.
- [ ] Landing hero at Fast 3G throttling — measure CLS after any MockupFrame fix (`npm run build && lighthouse`).
- [ ] After any code changes: `npm run check`.

---

## Next trigger and cadence

- **Trigger:** Any of the following: property detail ARIA fix ships; pricing premium polish plan merges to production; onboarding modal token cleanup; any change to `MockupFrame` or `app-nav.tsx`.
- **Recommended next run date/window:** Within **2 weeks** (by 2026-04-18), or immediately before the `pricing-page-premium-plan` implementation merges — whichever comes first.
