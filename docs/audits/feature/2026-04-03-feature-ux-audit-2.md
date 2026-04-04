# Feature / UX / IA Audit — 2026-04-03 (Run 2)

## Executive Summary

- Three plans written today (pricing polish, embedded mockups, landing CTA/mobile) are largely **already executed** in the codebase — all 10 items in the landing CTA/mobile plan and the embedded mockups plan appear fully implemented; the pricing polish plan is queued for future implementation.
- **One Schedule-quality carry-forward from the morning run remains unresolved:** the welcome onboarding modal lacks dialog semantics (`role="dialog"`, `aria-modal`, focus trap, Escape key) and its inner card uses two deprecated design tokens (`border-border/70`, `bg-card/95`).
- **The canonical navigation drift** flagged this morning is effectively resolved in `design-spec-2026.md` §13.2 (which correctly documents the production AppNav structure), but the old `docs/policies/design-spec.md` likely still exists with stale §6 content.
- **New surfaces being targeted by the pricing polish plan** have pre-existing issues — notably FAQ duplication and a CLS risk in `MockupFrame` — that the implementing AI should address before or alongside motion work.

---

## Severity-ranked findings

### Critical

- None.

### High

- **Welcome modal — no dialog semantics, deprecated tokens (OPEN SCHEDULE ITEM)** — The welcome overlay (`app/app/(app)/onboarding-panel.tsx` lines 107–156) renders as a plain `div` without `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, a focus trap, or an Escape key handler. The inner card at line 108 uses `border-border/70` and `bg-card/95` (both deprecated per design-spec §5 and §15.2). The "Welcome" pill at line 112 uses `border-border/80`. This compound finding was first logged in the morning audit and remains unaddressed. **Impact:** WCAG friction for keyboard and screen-reader users on their very first interaction with the signed-in app; design system violations on the most prominent first-run surface; inconsistent with `app-layout-client.tsx`'s own mobile drawer which already uses `role="dialog"` and Escape handling. **Evidence:** `app/app/(app)/onboarding-panel.tsx` lines 107–112; `app/components/landing-nav.tsx` (mobile drawer reference); design-spec §9.4, §15.2.

### Medium

- **`MockupFrame` initial render — CLS risk on landing hero** — The component initialises `scale` at `0` and hides content with `opacity: scale > 0 ? 1 : 0` (mockup-frame.tsx lines 32–34, 92). On SSR and first paint, the wrapper has no defined height (`style.height` is `undefined` when `scale === 0`, line 78–83), so the container collapses to zero. The `ResizeObserver` callback runs after hydration and sets the scale, causing a visible layout shift in the hero section — the primary above-the-fold LCP element on the landing page. The embedded-mockups plan's acceptance criterion "No hydration errors" covers logical correctness but not layout stability. **Impact:** Measurable Cumulative Layout Shift on the most-viewed page; degrades CWV scores and user perception on slow connections. **Evidence:** `app/components/mockups/mockup-frame.tsx` lines 32–34, 77–93; landing hero `md:hidden` mockup block (page.tsx lines 265–275); desktop hero mockup block (page.tsx lines 301–309).

- **Pricing page — FAQ content duplicated across two sections** — The page contains a dedicated FAQ section with 4 questions (pricing/page.tsx lines 212–251) and, inside the bottom CTA card, a separate set of 3 accordion questions (lines 299–328). The question "Do I need a credit card to start?" appears verbatim in both locations. The `pricing-page-premium-plan.md` does not mention this duplication, creating a risk that the implementing AI polishes around it rather than resolving it. **Impact:** Redundant content dilutes the FAQ section's authority; the second occurrence may read as a copy error on a page intended to feel "premium." **Evidence:** `app/app/pricing/page.tsx` lines 225–227 (FAQ) vs 303–306 (CTA card); `docs/plans/2026-04-03-pricing-page-premium-plan.md` (no mention of FAQ duplication).

- **Landing page — timing inconsistency on the same page** — The hero trust line (page.tsx line 261) and bottom CTA (line 717) both state "Your first property in about 60 seconds." The How it works section on the same page (line 107 in `HOW_IT_WORKS` data) states "Takes about 2 minutes per property." The onboarding modal (onboarding-panel.tsx line 128) also uses "about 2 minutes." Two contradictory estimates appear on the same marketing surface for any visitor who scrolls from the hero to the How it works section. The morning audit flagged the cross-page version of this inconsistency; the within-page version is a new finding from reading the combined source. **Impact:** Micro-trust erosion for engaged visitors who read the page in full. **Evidence:** `app/app/page.tsx` lines 107 (`HOW_IT_WORKS` array), 261, 717; `app/app/(app)/onboarding-panel.tsx` line 128.

- **`docs/policies/design-spec.md` — stale §6 likely still active** — `design-spec-2026.md` (version 3.0, 2026-04-03) correctly documents the production AppNav in §13.2 — with the Tools cluster (Modeling, Mortgage, Calculators, Analyze deal, Deals) and Account cluster (Plans, Settings). However, the Appendix A "Superseded documents" list does not include `docs/policies/design-spec.md`. If that file still contains the old §6 (Dashboard / Properties / Pricing / Settings flat list), any engineer or audit agent that reads it will get a false picture of canonical nav. The morning audit's Schedule task was "Update `docs/policies/design-spec.md` §6 to match `app-nav.tsx`"; the better resolution is a deprecation header redirecting to `design-spec-2026.md`. **Evidence:** `docs/design/design-spec-2026.md` §13.2 and Appendix A; morning audit `docs/audits/feature/2026-04-03-feature-ux-audit.md` task candidates §2.

- **Hero mockup and HERO_STEPS both visible at 640–767px** — The mobile mockup block uses `md:hidden` (hidden from 768px, visible below), while the HERO_STEPS mini-cards use `hidden sm:grid` (visible from 640px). At the 640–767px range, both render simultaneously: the mobile mockup (full-width) followed immediately by the three HERO_STEPS cards — redundant "what does this product do" proof. The desktop grid mockup (`hidden md:block`) starts at 768px, so this breakpoint range has no desktop context frame. The `landing-mobile-cta-plan.md` acceptance criteria only address the `< 640px` and `≥ 768px` states; the 640–767px range is unspecified. **Impact:** Awkward layout at a commonly used viewport range (small tablets, portrait large phones). **Evidence:** `app/app/page.tsx` lines 265–298 (`md:hidden` mockup block + `hidden sm:grid` HERO_STEPS); `docs/plans/2026-04-03-landing-mobile-cta-plan.md` Item 2 acceptance criteria (no mention of 640–767px).

- **`pricing-page-premium-plan.md` — billing toggle position undefined** — Design-spec §14.2 documents a "Billing toggle (Monthly / Annual with 'Save' badge)" as a distinct step between trust pills and `PricingCards`. The current `pricing/page.tsx` has no billing toggle at the page level; if the toggle lives inside `PricingCards`, it is encapsulated and the implementing AI will not encounter it as a standalone element to style. The plan's "signed-in vs signed-out" guidance and the "Motion & animation" section do not address the toggle at all. **Impact:** The implementing AI may omit the toggle from its motion/polish pass, or inadvertently remove it when restructuring the page hierarchy. **Evidence:** `docs/plans/2026-04-03-pricing-page-premium-plan.md` §B "Premium feel"; `docs/design/design-spec-2026.md` §14.2; `app/app/pricing/page.tsx` (no billing toggle outside `<PricingCards>`).

### Low

- **Onboarding panel — accent button missing `duration-150` transition token** — The "Add first property" button (onboarding-panel.tsx line 149) applies `transition-all hover:-translate-y-px hover:bg-accent-hover` without an explicit `duration-150` class. Design-spec §10.2 requires every `hover:bg-*` to be accompanied by the appropriate duration token; §10.1 specifies 150ms for button hover/active states. **Evidence:** `app/app/(app)/onboarding-panel.tsx` line 149; design-spec §10.1–10.2.

- **Pricing comparison table — `dangerouslySetInnerHTML` for static content** — `pricing/page.tsx` line 151 uses `dangerouslySetInnerHTML={{ __html: feature }}` to render the HTML entity in the hardcoded string `"Rent &amp; value estimates"` (line 137). No XSS exposure exists (data is compile-time static), but the pattern bypasses React's safety model unnecessarily; a simple JSX string `"Rent & value estimates"` would render identically without the unsafe API. The implementing AI for the premium polish plan may encounter this and introduce a `useRef`-based workaround unnecessarily. **Evidence:** `app/app/pricing/page.tsx` lines 137, 151.

- **Mobile feature comparison — "Estimate pool" row omitted** — The mobile `<details>` accordion on the pricing page omits the "Estimate pool (per hour)" row that is present in the desktop table (desktop: 8 rows, mobile accordion: 7 rows, line 180–208 vs 133–167). Design-spec §14.2 notes this as intentional, but the pool limit is a meaningful differentiator between tiers that directly impacts whether users can use rent/value estimates after sign-up. Mobile-first users comparing plans cannot see this distinction without switching to a wider viewport. **Evidence:** `app/app/pricing/page.tsx` lines 180–208 (mobile) vs lines 133–167 (desktop).

- **Social proof strip — duplicates hero trust line copy** — "Free plan — no card required" appears in both the hero trust line (page.tsx line 257, visible above the fold) and the social proof strip immediately below the hero (line 346). On viewports taller than ~700px, both are simultaneously visible. The duplication reinforces a single point rather than expanding the factual set across three social proof slots. **Evidence:** `app/app/page.tsx` lines 257–262 vs 343–350.

- **Pricing page `reveal-up` animation classes — provenance unverified** — The pricing page heading and subtext use `reveal-up`, `reveal-up-d1`, `reveal-up-d2`, `reveal-up-d3` CSS classes (pricing/page.tsx lines 45, 48, 54, 66, 81). These classes do not appear in the standard design-spec motion token set (`hero-animate`, `AnimatedSection`) used on the landing page. Their CSS definition, `prefers-reduced-motion` compliance, and interaction with any new animations from the premium polish plan are unverified in this pass. The implementing AI should audit these classes before layering additional motion. **Evidence:** `app/app/pricing/page.tsx` lines 45, 48, 54, 66, 81; design-spec §10 (no mention of `reveal-up` pattern); `app/app/page.tsx` (uses `hero-animate` + `AnimatedSection` instead).

---

## Evidence reviewed

| Area | Paths / Artifacts |
|------|-------------------|
| Process & policy | `docs/process/feature-ux-audit-process.md`, `docs/process/audit-report-template.md` |
| Design standards | `docs/design/design-spec-2026.md` (§§4–5, 9, 10, 13.2, 13.5, 13.6, 14.1, 14.2, 15) |
| Morning carry-forwards | `docs/audits/feature/2026-04-03-feature-ux-audit.md` |
| New plans | `docs/plans/2026-04-03-pricing-page-premium-plan.md` (full); `docs/plans/2026-04-03-embedded-mockups-plan.md` (full); `docs/plans/2026-04-03-landing-mobile-cta-plan.md` (full) |
| Landing page | `app/app/page.tsx` (full read) |
| Pricing page | `app/app/pricing/page.tsx` (full read) |
| Onboarding modal | `app/app/(app)/onboarding-panel.tsx` (full read) |
| App nav | `app/app/(app)/app-nav.tsx` (full read) |
| Mockup frame | `app/components/mockups/mockup-frame.tsx` (full read) |

**Plan implementation status observed:**
- `landing-mobile-cta-plan.md` — all 10 items appear implemented in `app/app/page.tsx` (mobile mockup, HERO_STEPS hidden, section order, CTA fixes, analytics tracking, label differentiation, sign-up paths).
- `embedded-mockups-plan.md` — `MockupFrame`, `DashboardMockup`, `MortgageMockup`, `DealAnalyzerMockup` components all exist and are integrated in both `page.tsx` and `pricing/page.tsx`; PNG screenshots replaced.
- `pricing-page-premium-plan.md` — not yet implemented; current pricing page represents the pre-implementation baseline.

**Assumptions / limits:** Static review only — no live browser or device pass. `PricingCards` component internals not read; billing toggle location (inside or outside `PricingCards`) not verified. Individual mockup components (`dashboard-mockup.tsx`, `mortgage-mockup.tsx`, `deal-analyzer-mockup.tsx`) not read — design-token fidelity of their content is unverified. `docs/policies/design-spec.md` not read — its staleness is inferred from morning audit evidence and the supersession claim in `design-spec-2026.md` Appendix A.

---

## Risk & impact assessment

| Theme | Impact if unaddressed |
|-------|----------------------|
| Onboarding modal a11y + deprecated tokens | First-run friction for keyboard and AT users on every new account; design-debt accumulates with each polish pass that skips the modal |
| MockupFrame CLS | Measurable Core Web Vitals degradation on the landing page hero; worsens as traffic grows |
| Pricing FAQ duplication | Implementing AI for the premium polish pass polishes around the duplication, leaving it in the shipped output |
| Timing inconsistency ("60 sec" vs "2 min") | Trust erosion for visitors who read the full landing page; persists across any future copywriting pass that doesn't audit both occurrences simultaneously |
| 640–767px breakpoint overlap | Redundant hero layout at a widely-used range; may feel accidental rather than designed |
| Old design-spec.md staleness | False-positive nav findings in future audits; engineer confusion when the old file surfaces in IDE search results |
| Pricing `reveal-up` classes unverified | New motion from the premium plan could stack on existing animations, creating overanimated or conflicting scroll effects |

---

## Recommendations (prioritized)

1. **Close the onboarding modal a11y task before shipping any pricing polish:** Add `role="dialog"` to the overlay div, `aria-modal="true"`, an `id` on the `h2` and a matching `aria-labelledby` on the dialog div, a focus trap on mount (return focus to the trigger or first focusable element on close), and a `keydown` Escape handler. Replace `border-border/70` → `border-border`, `bg-card/95` → `bg-card`, and `border-border/80` → `border-border`. Add `duration-150` to the accent button's `transition-all` class. Reference `app-layout-client.tsx` mobile drawer as the local implementation pattern.

2. **Pre-brief the pricing polish implementing AI on the FAQ duplication:** Update the implementation prompt in `pricing-page-premium-plan.md` or add a note to the plan to consolidate the FAQ section (lines 212–251) and the CTA card accordions (lines 299–328). The implementing AI should merge or differentiate them, not style around them.

3. **Add an SSR-stable height to `MockupFrame`:** Introduce an optional `aspectRatio` prop (e.g., `aspectRatio={9/16}` for portrait mobile, `aspectRatio={2/3}` for dashboard) that sets a CSS `aspect-ratio` or explicit `min-height` on the outer div, giving the server and first paint a stable container height. The `ResizeObserver` scale logic can then refine from a non-zero starting point, eliminating the full collapse-and-expand CLS.

4. **Resolve the landing page timing copy:** Decide whether setup takes ~60 seconds or ~2 minutes. Update `HOW_IT_WORKS[0].description` (page.tsx line 107) to match the hero trust line and bottom CTA (or vice versa), and reconcile with the onboarding modal copy (`onboarding-panel.tsx` line 128). All four occurrences should say the same thing.

5. **Mark `docs/policies/design-spec.md` as superseded:** Add a top-of-file deprecation notice (`> **Superseded:** See docs/design/design-spec-2026.md (v3.0, 2026-04-03) for the canonical reference.`) to prevent future audit agents and engineers from reading the stale §6. Add this file to `design-spec-2026.md` Appendix A's superseded list.

6. **Specify the 640–767px breakpoint intent for the hero mockup:** Either change `md:hidden` on the mobile mockup block to `hidden sm:block sm:hidden md:hidden` (only show below 640px), or accept the overlap as intentional and document it in the landing page comment. Either answer eliminates ambiguity for future engineers and auditors.

---

## Task candidates

- [ ] **Onboarding modal a11y + token cleanup:** `role="dialog"`, `aria-modal`, `aria-labelledby` (add `id` to `h2`), focus trap, Escape handler; replace `border-border/70` → `border-border`, `bg-card/95` → `bg-card`, `border-border/80` → `border-border`; add `duration-150` to accent button — `app/app/(app)/onboarding-panel.tsx`.
- [ ] **MockupFrame CLS fix:** Add `aspectRatio` or `minHeight` prop for server-stable container height — `app/components/mockups/mockup-frame.tsx`.
- [ ] **Pricing page FAQ consolidation:** Merge or clearly differentiate the dedicated FAQ section and the CTA card's accordion questions before or as part of the premium polish pass — `app/app/pricing/page.tsx`.
- [ ] **Landing copy — timing reconciliation:** Align "about 60 seconds" (hero, bottom CTA) with "about 2 minutes" (How it works, onboarding modal) — `app/app/page.tsx` and `app/app/(app)/onboarding-panel.tsx`.
- [ ] **Design-spec.md retirement:** Add deprecation header to `docs/policies/design-spec.md`; add that file to `design-spec-2026.md` Appendix A superseded list.
- [ ] **640–767px hero breakpoint:** Document or fix the mobile mockup + HERO_STEPS co-visibility at the `sm` breakpoint — `app/app/page.tsx` lines 265–298.
- [ ] **Premium plan brief — billing toggle note:** Add a note to `pricing-page-premium-plan.md` calling out that the billing toggle's location (inside or outside `PricingCards`) should be verified before any layout restructuring.

---

## Re-test checklist

- [ ] New user flow: welcome modal — keyboard tab order stays inside modal, screen reader announces dialog role and label, Escape closes the modal, focus returns on close.
- [ ] Landing page at 320px, 640px, 768px, 1024px, 1280px widths — confirm mockup and HERO_STEPS visibility is intentional at each breakpoint.
- [ ] Landing page: scroll from hero through How it works — confirm timing copy is consistent within the single page view.
- [ ] Pricing page: confirm billing toggle presence and interaction (inside `PricingCards` or at page level) before the motion polish pass begins.
- [ ] Pricing page: read both FAQ locations side-by-side and confirm distinct user value with no repeated questions.
- [ ] `MockupFrame` hero: measure CLS with Chrome DevTools Lighthouse on a throttled (Fast 3G) connection.
- [ ] After any code changes: `npm run check`.

---

## Next trigger and cadence

- **Trigger:** Pricing polish plan implementation (pre-ship review); onboarding modal a11y fix; any change to `MockupFrame` or the landing hero section.
- **Recommended next run date/window:** Immediately before the `pricing-page-premium-plan` merges to production, or within **2 weeks** — whichever comes first.
