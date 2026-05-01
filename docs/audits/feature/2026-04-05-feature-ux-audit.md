# Feature / UX / IA Audit — 2026-04-05

## Executive summary

- **Activation funnel is broken at the "Maybe later" dismiss.** The onboarding modal's dismiss action permanently sets `onboardingDismissedAt` with no re-engagement mechanism; with 6 sign-ups and 0 properties added this is the highest-urgency issue in the product.
- **Several Run 4 carry-forwards are resolved** (onboarding panel token cleanup, button touch targets, "60 seconds" copy, pricing FAQ duplication). One new critical issue and two new high-severity issues have entered scope this pass.
- **Post-quick-add completeness guidance is structurally weak:** a dead `quick-actions.tsx` component is imported nowhere; the completion banner heuristic is too narrow; and key fields (bedrooms, bathrooms, sq ft) disappear silently when empty — no placeholder, no nudge.
- **Existing medium and low carry-forwards remain open** (property detail tab ARIA semantics, deals sort label, CoC return label, print summary label inconsistency, stale design-spec §6); none were addressed since Run 4.

---

## Severity-ranked findings

### Critical

- **Onboarding "Maybe later" = permanent silent dismissal — no re-engagement path** — `app/app/(app)/onboarding-panel.tsx` lines 67–84: clicking "Maybe later" calls `patchOnboarding("dismiss_modal")`, which sets `onboardingDismissedAt` in the database. The modal's visibility guard (`!progress.welcomeSeenAt && !progress.dismissedAt`) prevents it from ever appearing again. There is no server-side or client-side re-engagement hook: no time-based re-display, no sticky nudge, no email follow-up. The empty dashboard shows a static CTA that is identical on day 1 and day 30 for a dismissed user. Context: the onboarding friction analysis (`docs/audits/growth-funnel/2026-04-05-onboarding-friction-analysis.md`) records 6 sign-ups and 0 properties added — this dismiss path is the most likely exit. **Impact:** A user who isn't ready with paperwork on day 1 (the majority) dismisses, sees a dead empty dashboard, and churns before ever experiencing the product value. This is a conversion-killing issue for a zero-MAU-to-activation funnel. **Evidence:** `app/app/(app)/onboarding-panel.tsx` lines 42–84 (`showWelcomeModal`, `patchOnboarding("dismiss_modal")`); `app/app/(app)/dashboard/page.tsx` lines 44–55 (static empty state copy with no time-based variation beyond day 6); `docs/audits/growth-funnel/2026-04-05-onboarding-friction-analysis.md` §2 Critical.

---

### High

- **`quick-actions.tsx` fully implemented but not imported anywhere** — `app/app/(app)/properties/[id]/quick-actions.tsx` exists and defines a `QuickActions` component with Edit property, Add mortgage, and Refresh benchmark actions. The quick-add completion gap audit (`docs/audits/feature/2026-04-05-quick-add-completion-gap-audit.md` §1) confirms it "is defined but not imported anywhere." Neither `overview-tab-content.tsx` nor `property-detail-tabs.tsx` nor `page.tsx` for the property detail route reference it. The intended user flow after quick-add — "get in fast, come back to complete" — has no surfaced quick-completion CTA on the property detail page. **Impact:** The completion nudge that would drive users from a quick-add stub to a fully-populated property is absent from the most-visited post-add page. New users after quick-add land on a page with metrics showing "—" for key figures and no prominent action path to fix them. **Evidence:** `app/app/(app)/properties/[id]/quick-actions.tsx` (component exists, all three actions wired); `app/app/(app)/properties/[id]/overview-tab-content.tsx` (no import of QuickActions); `docs/audits/feature/2026-04-05-quick-add-completion-gap-audit.md` §1.

- **Post-quick-add completion banner: heuristic too narrow + key fields invisible when missing** — The completion banner in `app/app/(app)/properties/[id]/overview-tab-content.tsx` (lines 49–64) relies on `getPropertyCompleteness`, which flags a property as incomplete only when `cashInvested == null AND mortgageData.length === 0 AND purchasePrice === currentEstimatedValue` simultaneously. This means: (a) if the user edits their estimated value after quick-add, the banner silently disappears even though bedrooms, bathrooms, square footage, mortgage, and purchase date are all missing; (b) the entire bedrooms/bathrooms/sq ft row is completely hidden when all three are null — no dash, no placeholder, no prompt — so the user has no indication these fields exist unless they open the Edit form (`docs/audits/feature/2026-04-05-quick-add-completion-gap-audit.md` §1, field-by-field table). The net effect: quick-add users routinely end up with sub-half-populated property profiles and no persistent nudge to improve them. **Impact:** Metrics for cap rate, DSCR, and cash-on-cash return are "—" when data is missing; without a clear nudge, these fields stay missing, reducing the product's analytical value and the user's perception of it. **Evidence:** `app/app/(app)/properties/[id]/overview-tab-content.tsx` lines 28–64 (`getPropertyCompleteness` call and banner render logic); `app/app/(app)/properties/[id]/property-detail-tabs.tsx` lines 107–125 (tab content rendering, no QuickActions slot); `docs/audits/feature/2026-04-05-quick-add-completion-gap-audit.md` §1, §2.

- **`border-border/70` / `bg-card/95` token policy ambiguity — systemic (carry-forward)** — The Run 4 policy decision was required before this audit pass but has not been made. Two new occurrences confirmed this pass: (1) `app/app/(app)/dashboard/page.tsx` line 165, in the post-first-property activation banner (`border border-border/70 bg-card/95`) — the most prominent surface a user sees after completing the primary CTA; (2) `app/app/(app)/properties/new/page.tsx` line 63, in the deal-to-portfolio conversion banner (`border-border/70 bg-card/90`). Note: the onboarding panel itself has been cleaned to `border border-border bg-card` (Run 4 instance RESOLVED). **Impact:** If the tokens are deprecated, the activation-critical dashboard surface and the deal-conversion surface both carry design debt. Without a policy decision, future audits and PRs will continue to add or preserve these tokens inconsistently. **Evidence:** `app/app/(app)/dashboard/page.tsx` line 165; `app/app/(app)/properties/new/page.tsx` line 63; Run 4 High §1; `docs/design/design-spec-2026.md §15.2` (to be re-read for the policy decision).

---

### Medium

- **Add-property entry point split (full vs. quick) has no context on the Properties page** — `app/app/(app)/properties/page.tsx` lines 281–293 renders two side-by-side CTAs: `Add property` (indigo accent button, links to `/properties/new`) and `Quick add` (plain text link `text-muted`, links to `/properties/new?mode=quick`). There is no explanation of the difference at the point of decision. A first-time user has no way to know: Is "Quick add" faster but less complete? Does it skip important fields? The onboarding modal pushes to `?mode=quick`, but a returning user who lands directly on `/properties` is presented with the same unexplained choice. The plain-text styling of "Quick add" also violates Pillar 5 (one loud action per screen) only partially — there *is* one accent button — but the "Quick add" micro-link competes without framing. **Impact:** Users who would benefit from quick-add don't know to use it; users who click it and encounter a sparse form (5 fields) may feel they chose the "wrong" path and abandon rather than switching to the full form. **Evidence:** `app/app/(app)/properties/page.tsx` lines 281–293; `app/app/(app)/properties/new/page.tsx` lines 25–61 (contextual explainer for each mode appears *after* the user has already committed to one); `docs/design/design-spec-2026.md §1 Pillar 5`.

- **Property detail tab nav — missing ARIA tab role semantics (carry-forward from Run 4)** — `app/app/(app)/properties/[id]/property-detail-tabs.tsx` lines 64–102: the desktop and mobile tab containers are plain `<div>` elements (or `<div className="hidden ... md:flex">`) containing `<button>` elements inside a `<nav aria-label="Property sections">`. There is no `role="tablist"` on the container, no `role="tab"` on the buttons, no `aria-selected`, and no `aria-controls` pairing to the content panels. Active state is only communicated via `border-b-2 border-accent`. **Impact:** Screen reader users cannot navigate to the property detail page and infer a two-tab interface; they encounter two anonymous buttons inside a nav landmark. WCAG 2.1 §4.1.2 (Name, Role, Value). Not fixed since Run 4. **Evidence:** `app/app/(app)/properties/[id]/property-detail-tabs.tsx` lines 64–102. **Route:** `/properties/[id]`.

- **Deals sort `<select>` — no accessible label (carry-forward from Run 4)** — `app/app/(app)/deals/deals-list.tsx` lines 92–102: the sort `<select>` element has no `<label>` and no `aria-label`. The immediately adjacent element is a search `<input>` with a placeholder, not a label for the select. Screen reader users encounter an unlabeled form control. **Impact:** WCAG 2.1 §1.3.1 violation; trivially fixable. Not fixed since Run 4. **Evidence:** `app/app/(app)/deals/deals-list.tsx` lines 92–102. **Route:** `/deals`.

- **"CoC return" abbreviation — label inconsistency vs rest of app (carry-forward from Run 4)** — `app/app/(app)/deals/deals-list.tsx` line 170 uses `"CoC return"` as the `<dt>` label. The property overview (`overview-tab-content.tsx` line 171) and deal analyzer use "Cash-on-cash return". A user who runs an analysis and navigates to the saved deals list encounters an unexplained abbreviation for the same metric. **Impact:** Micro-confusion for new investors who haven't seen the abbreviation before; cross-flow terminology inconsistency. Not fixed since Run 4. **Evidence:** `app/app/(app)/deals/deals-list.tsx` line 170; `app/app/(app)/properties/[id]/overview-tab-content.tsx` line 171. **Routes:** `/deals`, `/properties/[id]`.

- **Dashboard empty state: time-based copy variation stops at day 6** — `app/app/(app)/dashboard/page.tsx` lines 38–55: the empty-state heading and body copy vary for `daysSinceSignup <= 1` and `daysSinceSignup <= 6`, then falls back to a generic "Your portfolio metrics are ready when you are" for all users after day 6. There is no variation beyond 6 days — a user who dismisses the modal and returns on day 30 sees the same static CTA. The copy also never mentions the quick-add path, the CSV import option, or addresses the likely reason for non-activation (not having paperwork ready). **Impact:** Medium-term retained-but-inactive users receive no differentiated messaging to re-engage; the primary recovery path for churned-but-not-deleted users is broken. **Evidence:** `app/app/(app)/dashboard/page.tsx` lines 38–55, 115–157; `docs/audits/growth-funnel/2026-04-05-onboarding-friction-analysis.md` §2 Critical (re-engagement).

---

### Low

- **"Print summary" vs "Print portfolio summary" — two labels for the same action (carry-forward from Run 4)** — Desktop action bar: `app/app/(app)/dashboard/page.tsx` line 246 → "Print summary". Mobile component: `app/app/(app)/dashboard/workspace-nav-mobile.tsx` line 42 → "Print portfolio summary". Same destination (`/export/portfolio-summary`), two different labels on the same page depending on viewport. Not fixed since Run 4. **Evidence:** `app/app/(app)/dashboard/page.tsx` line 246 vs `app/app/(app)/dashboard/workspace-nav-mobile.tsx` line 42. **Route:** `/dashboard`.

- **Deal cards: "Add to portfolio" button missing `min-h-[44px]` touch target** — `app/app/(app)/deals/deals-list.tsx` line 190: the "Add to portfolio" `<Link>` uses `px-3 py-1.5 text-sm` (approximately 36px tall) with no `min-h-[44px]`. The adjacent "Delete" button has the same height issue (line 215). Both are action buttons on deal cards that a mobile user may interact with frequently. **Impact:** Touch target below the 44px minimum per design-spec §9 and WCAG 2.1 §2.5.5 (Target Size). **Evidence:** `app/app/(app)/deals/deals-list.tsx` lines 190, 215. **Route:** `/deals`.

- **`docs/policies/design-spec.md §6` stale nav — carry-forward from Run 4** — Not re-read this pass; carry-forward confirmed from Run 4. The section still lists a flat 4-item nav (`Dashboard`, `Properties`, `Pricing`, `Settings`) whereas the actual production nav has three groups: unlabeled portfolio cluster, Tools cluster (6 items), and Account cluster. Future onboarding and audit docs using this file as reference will get a false picture. **Evidence:** `docs/policies/design-spec.md §6`; `app/app/(app)/app-nav.tsx` lines 22–39.

- **MockupFrame CLS — unverified carry-forward from Run 4** — `app/components/mockups/mockup-frame.tsx` `scale=0` initial state; SSR render has no defined container height. Not re-verified this pass (no live browser pass). **Evidence:** Run 4 Medium §3; `app/components/mockups/mockup-frame.tsx` (carry-forward reference).

- **Calculators hub: no 0-property state or portfolio-integration guidance** — `app/app/(app)/calculators/page.tsx` renders identically for 0-property users and multi-property users. No messaging like "Add a property first to use portfolio-aware calculators" or a pointer to specific tools that work without portfolio data. A new user who lands here sees the full hub without context. **Impact:** Low; calculators are standalone tools that work without portfolio data. But new users may not understand the distinction between standalone calculators and portfolio-integrated tools (Modeling, Mortgage). **Evidence:** `app/app/(app)/calculators/page.tsx` (full; no conditional for propertyCount === 0). **Route:** `/calculators`.

---

## Evidence reviewed

| Area | Paths reviewed |
|------|----------------|
| Process & policy | `docs/process/feature-ux-audit-process.md`, `docs/process/audit-report-template.md` |
| Previous audits | `docs/audits/feature/2026-04-04-feature-ux-audit.md` (full) |
| Related analysis | `docs/audits/growth-funnel/2026-04-05-onboarding-friction-analysis.md` (§1–2); `docs/audits/feature/2026-04-05-quick-add-completion-gap-audit.md` (§1–2); `docs/plans/2026-04-05-onboarding-activation-rollout.md` (title/scope only) |
| Design standards | `docs/design/design-spec-2026.md` (§1–5, §9, §15 — token/accessibility/pillar sections) |
| Onboarding | `app/app/(app)/onboarding-panel.tsx` (full) |
| Dashboard | `app/app/(app)/dashboard/page.tsx` (lines 1–260); `app/app/(app)/dashboard/workspace-nav-mobile.tsx` (full) |
| Properties list | `app/app/(app)/properties/page.tsx` (full) |
| Add property | `app/app/(app)/properties/new/page.tsx` (full); `app/app/(app)/properties/add-property-wizard.tsx` (lines 1–305) |
| Property detail | `app/app/(app)/properties/[id]/property-detail-tabs.tsx` (full); `app/app/(app)/properties/[id]/overview-tab-content.tsx` (lines 1–198); `app/app/(app)/properties/[id]/property-health-strip.tsx` (full); `app/app/(app)/properties/[id]/quick-actions.tsx` (existence confirmed via audit doc) |
| Analyze / Deals | `app/app/(app)/analyze/page.tsx` (full); `app/app/(app)/deals/deals-list.tsx` (full) |
| Navigation | `app/app/(app)/app-nav.tsx` (full) |
| Plans | `app/app/(app)/plans/page.tsx` (full) |
| Calculators | `app/app/(app)/calculators/page.tsx` (full) |
| Landing / Pricing | `app/app/page.tsx` (lines 1–140); `app/app/pricing/page.tsx` (lines 1–60, 200–350) |

**Run 4 resolution status:**

| Run 4 finding | Status this pass |
|---------------|-----------------|
| Onboarding panel `border-border/70`/`bg-card/95` tokens | **RESOLVED** — `onboarding-panel.tsx` line 172 now uses `border border-border bg-card` (clean tokens) |
| Onboarding button touch targets (`min-h-[44px]`) | **RESOLVED** — both "Maybe later" and "Add first property" buttons confirmed `min-h-[44px]` |
| Timing copy "about 60 seconds" | **RESOLVED** — now reads "Takes about 5 minutes with your property details. You can start with just the basics and fill in the rest later." (line 196); landing page `HOW_IT_WORKS` says "Takes a few minutes per property" — consistent |
| Onboarding button `hover:-translate-y-px` design-spec violation | **RESOLVED** — removed from `onboarding-panel.tsx` line 220; button now uses `transition-all hover:bg-accent-hover` only |
| Pricing FAQ duplicate "Do I need a credit card" | **RESOLVED** — the second FAQ section now contains different questions ("monthly vs annual billing", "can I cancel or upgrade") and the duplicate has been removed |
| Property detail tab nav — no ARIA tab roles (Medium) | **OPEN** — carry-forward |
| Deals sort select — no accessible label (Medium) | **OPEN** — carry-forward |
| "CoC return" abbreviation (Low) | **OPEN** — carry-forward |
| "Print summary" label inconsistency (Low) | **OPEN** — carry-forward |
| MockupFrame CLS (Medium) | **OPEN** — not re-verified |
| `design-spec.md §6` stale nav (Low) | **OPEN** — carry-forward |
| `border-border/70`/`bg-card/95` systemic policy (High) | **OPEN** — new instances found in dashboard + new property page |

**Assumptions / limits:** Static code review only — no live browser or device pass. `add-property-wizard.tsx` reviewed lines 1–305 only (4-step wizard; `StepReview` and full mobile `MobileToolShell` wrapper not read). `deal-analyzer-form.tsx` not re-read this pass. `quick-actions.tsx` not read directly (existence and content referenced via `docs/audits/feature/2026-04-05-quick-add-completion-gap-audit.md`). `getPropertyCompleteness` logic not read directly; referenced from the completion gap audit.

---

## Risk & impact assessment

| Theme | Impact if unaddressed |
|-------|----------------------|
| "Maybe later" permanent dismissal | Entire acquisition funnel stalls — every sign-up that dismisses the modal has no recovery path; with 0% activation rate this is already causing retention failure |
| `quick-actions.tsx` dead component | Completed work delivers zero user value; post-quick-add path lacks the completion nudge it was designed to provide |
| Completion heuristic + invisible fields | Quick-add users produce under-populated profiles; metrics like cap rate and DSCR remain "—" indefinitely; product value is degraded for its most time-pressured users |
| Token policy ambiguity (ongoing) | Activation-critical surfaces (dashboard first-property banner) carry potential design debt; audits continue to flag vs. ignore inconsistently |
| Property detail tab ARIA gap | WCAG 2.1 §4.1.2 non-compliance on the most content-rich page in the app; screen reader users cannot use standard AT tab-panel navigation |
| Add-property entry point split | Users choose blindly between full form and quick add; quick-add adoption may be lower than intended because the value proposition is never stated at the point of decision |

---

## Recommendations (prioritized)

1. **Break the "Maybe later" deadlock (Critical):** Replace the permanent `onboardingDismissedAt` path with a time-limited one. Option A: re-show the modal after N days if `propertyCount === 0` (e.g. day 3, day 7). Option B: replace the "Maybe later" path with a persistent empty-state strip on the dashboard that doesn't rely on the modal. Either approach removes the one-shot dismissal failure mode. The onboarding activation rollout plan (`docs/plans/2026-04-05-onboarding-activation-rollout.md`) likely has context for the preferred approach.

2. **Import and surface `quick-actions.tsx` on the property detail page (High):** Add the `QuickActions` component to `overview-tab-content.tsx` or directly to the property detail layout. This is completed work that requires only an import and render call. The component already handles Edit, Add mortgage, and Refresh benchmark — the three highest-value completion actions.

3. **Widen the completeness heuristic and surface field-level placeholders (High):** Update `getPropertyCompleteness` (or the overview-tab banner logic) to flag any property missing bedrooms *or* bathrooms *or* square footage *or* mortgage (if `hasMortgage` is not null-false). Add placeholder text (e.g. "Not set — add in Edit") to the bedrooms/bathrooms/sq ft display row when all three are null, rather than hiding the row entirely.

4. **Resolve the `border-border/70` / `bg-card/95` token policy before the next implementation pass (High carry-forward):** Read `design-spec-2026.md §15.2` explicitly. If the tokens are accepted, update §15.2 to reflect this and stop flagging them. If they are deprecated, create a dedicated migration task for the dashboard activation banner and `new/page.tsx` deal-conversion banner (at minimum) — these are high-visibility surfaces.

5. **Add copy context for the quick-add split on the Properties page (Medium):** On `properties/page.tsx`, either (a) add a tooltip or `title` attribute to "Quick add" explaining it takes ~1 minute and fills in the basics; or (b) restructure the CTA area so "Quick add" appears as a labeled secondary option under the primary "Add property" button, not as a peer text link without context.

6. **Add ARIA tab semantics to `property-detail-tabs.tsx` (Medium carry-forward):** Add `role="tablist"` to the tab container `<div>` elements (both desktop and mobile variants), `role="tab"` and `aria-selected={activeTab === id}` to each `<button>`. Add `id` attributes to the tab panels and connect via `aria-controls`. ~10-line change with no visual impact.

7. **Add `aria-label="Sort deals"` to the sort `<select>` in `deals-list.tsx` (Medium carry-forward):** One-line fix; removes a WCAG §1.3.1 violation.

8. **Standardize "CoC return" → "Cash-on-cash return" in `deals-list.tsx` (Medium carry-forward):** One-word change on line 170.

9. **Extend the dashboard empty-state copy timeline beyond day 6 (Medium):** Add a day-14+ variation that explicitly references quick-add and CSV import as low-friction entry paths, and considers naming the paperwork barrier ("Have your closing docs or just an address? Start with quick add — takes under a minute.").

10. **Fix "Add to portfolio" and "Delete" button touch targets on deal cards (Low):** Add `min-h-[44px]` to both buttons in `deals-list.tsx` lines 190 and 215.

---

## Task candidates

- [ ] **Break "Maybe later" permanent dismissal:** Replace `onboardingDismissedAt` permanent flag with a time-limited dismiss OR add persistent empty-state nudge on dashboard — `app/app/(app)/onboarding-panel.tsx` + `/api/onboarding` + `app/app/(app)/dashboard/page.tsx`.
- [ ] **Import `QuickActions` component on property detail overview:** Add `QuickActions` to `app/app/(app)/properties/[id]/overview-tab-content.tsx` — component already exists at `app/app/(app)/properties/[id]/quick-actions.tsx`.
- [ ] **Widen completeness heuristic + add field placeholders:** Update `getPropertyCompleteness` to flag missing bedrooms/bathrooms/sqft; render "Not set" placeholder on property detail when those fields are null — `app/app/(app)/properties/[id]/overview-tab-content.tsx`, `app/lib/property-completeness.ts`.
- [ ] **Property detail tabs — ARIA tab roles:** Add `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls` — `app/app/(app)/properties/[id]/property-detail-tabs.tsx` lines 64–102.
- [ ] **Deals sort select — accessible label:** Add `aria-label="Sort deals"` to the `<select>` — `app/app/(app)/deals/deals-list.tsx` line 92.
- [ ] **"CoC return" label fix:** Replace with "Cash-on-cash return" — `app/app/(app)/deals/deals-list.tsx` line 170.
- [ ] **Add-property entry point split — copy context:** Add a brief explainer near "Quick add" on Properties page header, or restructure the CTA hierarchy — `app/app/(app)/properties/page.tsx` lines 281–293.
- [ ] **Dashboard empty state: extend copy timeline beyond day 6** — Add day-14+ variation mentioning quick-add and CSV import — `app/app/(app)/dashboard/page.tsx` lines 38–55.
- [ ] **Deal cards touch targets:** Add `min-h-[44px]` to "Add to portfolio" and "Delete" buttons — `app/app/(app)/deals/deals-list.tsx` lines 190, 215.
- [ ] **"Print summary" label standardization:** Reconcile desktop and mobile labels — `app/app/(app)/dashboard/page.tsx` line 246 and `workspace-nav-mobile.tsx` line 42.
- [ ] **`design-spec.md §6` deprecation header:** Add per-section deprecation notice — `docs/policies/design-spec.md §6`.
- [ ] **`border-border/70` / `bg-card/95` policy decision:** PM/designer confirms accept or deprecate; update `design-spec-2026.md §15.2`; then migrate dashboard banner + `new/page.tsx` deal conversion banner if deprecated.
- [ ] **MockupFrame CLS fix (carry-forward):** Add `min-height`/`aspect-ratio` for SSR-stable container — `app/components/mockups/mockup-frame.tsx`.

---

## Re-test checklist

- [ ] **Onboarding modal — dismiss then return:** After clicking "Maybe later", sign in again or revisit `/dashboard` on day 1, day 3, and day 7 as a user with `propertyCount === 0`; verify a re-engagement nudge appears.
- [ ] **Property detail overview — quick-actions:** After quick-add, navigate to the property overview; verify Edit, Add mortgage, and Refresh benchmark quick actions are visible and functional.
- [ ] **Property detail overview — completeness banner:** After quick-add, edit only the estimated value (to differ from purchase price); verify the completion banner still appears and correctly lists missing fields.
- [ ] **Property detail overview — empty fields:** With bedrooms/bathrooms/sqft all null, verify the UI shows a "Not set" placeholder rather than hiding the row.
- [ ] **`/properties/[id]` — keyboard user:** Tab into the Overview/Details nav; verify screen reader announces "Overview, tab 1 of 2, selected" after ARIA fix.
- [ ] **`/deals` — screen reader:** Verify sort select reads its label ("Sort deals") after label fix.
- [ ] **`/deals` — deal card copy:** Verify "Cash-on-cash return" (not "CoC return") appears after label fix.
- [ ] **`/dashboard` — desktop + mobile:** Verify both show the same label for the portfolio summary export action.
- [ ] **`/properties` — entry point copy:** Verify a first-time user can understand the difference between "Add property" and "Quick add" from the Properties page without clicking into either form.
- [ ] **`design-spec-2026.md §15.2`:** Verify it explicitly states whether `border-border/70`/`bg-card/95` are accepted or deprecated.
- [ ] After any code changes: `npm run check`.

---

## Next trigger and cadence

- **Trigger:** Any of: onboarding "Maybe later" fix ships; `quick-actions.tsx` is imported; property completeness heuristic update; property detail ARIA fix; or any change to `OnboardingPanel`, `overview-tab-content.tsx`, or `deals-list.tsx`.
- **Recommended next run date/window:** Within **1 week** (by 2026-04-12) given Critical-severity activation funnel issue — or immediately after the onboarding re-engagement change ships, whichever comes first.
