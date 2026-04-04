# Landing Page — Mobile & CTA Improvement Plan

**Created:** 2026-04-03
**Status:** Ready to execute
**Scope:** `app/app/page.tsx` (home_v4) — mobile layout, CTA audit, screenshot strategy
**Skills:** `veld-landing-cta`, `veld-ui`, `veld-mobile`

---

## Priority Order

Items are ordered by expected conversion impact, highest first.

| # | Item | Type | Impact |
|---|---|---|---|
| 1 | Hide HERO_STEPS on mobile | Mobile | High |
| 2 | Add mobile product screenshot | Mobile | High |
| 3 | Sign-up path in calculator section | CTA | High |
| 4 | Replace hero screenshot content | Screenshot | Medium-high |
| 5 | Restore canonical section order | CTA | Medium |
| 6 | Fix mobile CTA stack layout | Mobile | Medium |
| 7 | Track bottom CTA secondary link | CTA | Low-medium |
| 8 | Differentiate bottom CTA label | CTA | Low-medium |
| 9 | Add pricing preview sign-up link | CTA | Low |
| 10 | No ChevronRight on primary button | Decision | N/A (non-change) |

---

## Item 1 — Hide HERO_STEPS Mini-Cards on Mobile

**Change:** The three `HERO_STEPS` cards currently stack vertically on phones, adding ~250px of content after the primary CTA and trust line. Hide them on mobile; show from `sm` (640px) up.

**Code:** Change the grid container class from `grid gap-2 sm:grid-cols-3` to `hidden gap-2 sm:grid sm:grid-cols-3`.

### Acceptance Criteria

- [ ] At viewport widths below 640px, no HERO_STEPS cards are visible
- [ ] At 640px and above, three cards render in a 3-column grid — identical to current behavior
- [ ] The `hero-animate` class and `transitionDelay` style remain on the container
- [ ] The social proof strip is the next visible element after the trust line on mobile
- [ ] No layout shift or flash of the cards on mobile during hydration

---

## Item 2 — Add Mobile Product Screenshot

**Change:** Mobile visitors currently see zero product visuals. Add a mobile-only screenshot block inside the hero. Also fix the desktop screenshot breakpoint from `lg:` to `md:` (skill violation).

**Code:**
- Desktop screenshot container: change `hidden lg:block` to `hidden md:block`
- Add a new `md:hidden` block within the hero copy column, after the trust line, showing the dashboard screenshot in a rounded frame

### Acceptance Criteria

- [ ] At viewport widths below 768px, a product screenshot is visible inside the hero section
- [ ] The mobile screenshot uses `md:hidden` — not visible at 768px and above
- [ ] The mobile screenshot has `overflow-hidden rounded-xl border border-border shadow-lg`
- [ ] The mobile screenshot uses a `next/image` `<Image>` tag with descriptive `alt` text
- [ ] The mobile screenshot has appropriate `sizes` attribute (e.g., `(max-width: 767px) 100vw, 0px`)
- [ ] At 768px–1023px (tablet), the desktop screenshot in the right grid column is now visible (was previously hidden until 1024px)
- [ ] At 1024px and above, behavior is identical to current
- [ ] The mobile screenshot appears after the trust line and before the (now hidden) HERO_STEPS grid
- [ ] The faux browser chrome (three dots bar) is NOT included on the mobile version — only the image
- [ ] No `lg:` class is used as the primary mobile/desktop visibility split for the screenshot

---

## Item 3 — Sign-Up Path in Calculator Section

**Change:** The calculator section has no sign-up CTA for signed-out visitors. This violates the skill rule: "A clear path to sign up from within/near the calculator."

**Code:** Add an inline text CTA (not a button) below the calculator links row, visible only when `!userId`.

### Acceptance Criteria

- [ ] When signed out, a sign-up link is visible in the calculator section
- [ ] The link uses `FunnelCtaLink` with `placement="landing_calculator"` and `planIntent="free"`
- [ ] The link points to `/sign-up?intent=free`
- [ ] The link is styled as inline text (`text-accent`, not `bg-accent`) — no second loud button in the section
- [ ] The link has `transition-colors duration-150` and a hover state
- [ ] When signed in, the sign-up link is not rendered
- [ ] The "Open full calculator" accent link remains the primary visual CTA in the section
- [ ] Touch target on the link meets 44px minimum height

---

## Item 4 — Replace Hero Screenshot Content

**Change:** `/ScreenDashboard.png` currently shows a bar chart view. A dashboard overview showing MetricCards (equity, cash flow, cap rate, LTV) would better answer "what is this product?" for first-time visitors.

**Prerequisite:** A new screenshot must be captured from the running application.

### Acceptance Criteria

- [ ] The hero screenshot shows the dashboard overview with MetricCard values (equity, cash flow, cap rate, LTV) prominently visible
- [ ] The screenshot does NOT primarily feature a bar chart
- [ ] The screenshot is captured at a resolution that looks sharp at both desktop (up to ~600px rendered width) and mobile (up to ~390px rendered width)
- [ ] The screenshot file is placed in `public/` and is a reasonable file size (< 500KB, compressed)
- [ ] The `alt` text on the `<Image>` tag accurately describes the visible content
- [ ] If the file name changes from `ScreenDashboard.png`, all references in `page.tsx` and `pricing/page.tsx` are updated
- [ ] Dark mode and light mode considerations: the screenshot should work against both background themes, or separate screenshots should be provided

---

## Item 5 — Restore Canonical Section Order

**Change:** Value props and Calculator sections are currently swapped relative to the canonical skill order. The calculator is an interactive engagement hook and should appear before the passive value props.

**Code:** Move the Calculator `<section>` block above the Value props `<section>` block.

### Acceptance Criteria

- [ ] Section order in the rendered page matches: Hero → Social proof → Calculator → Value props → How it works → Honest scope → Pricing → Bottom CTA → Footer
- [ ] The Calculator section retains its `border-y border-border bg-subtle` background treatment
- [ ] The Value props section retains its transparent background treatment
- [ ] All `aria-labelledby` IDs remain correctly linked to their headings
- [ ] `AnimatedSection` scroll reveals still trigger correctly at the new DOM positions
- [ ] The "Honest scope" section remains in its current position (between How it works and Pricing) — this is a justified deviation from canonical order

---

## Item 6 — Fix Mobile CTA Stack Layout

**Change:** The secondary CTA ("See pricing ›") appears left-aligned below the full-width accent button on mobile, looking accidental. Make the stack intentional.

**Code:**
- Primary `FunnelCtaLink` (both signed-in and signed-out variants): add `w-full sm:w-auto`
- Secondary `FunnelCtaLink`: add `justify-center sm:justify-start`

### Acceptance Criteria

- [ ] On mobile (below 640px), the primary accent button renders full-width
- [ ] On mobile, the secondary text link is horizontally centered
- [ ] On 640px and above, the primary button is auto-width (inline) — identical to current
- [ ] On 640px and above, the secondary link is left-aligned inline — identical to current
- [ ] Both signed-in and signed-out CTA variants receive the same layout fix
- [ ] Touch targets remain ≥ 44px height on both CTAs
- [ ] The `min-h-[44px]` class is preserved on both CTAs

---

## Item 7 — Track Bottom CTA Secondary Link

**Change:** "Compare Veld vs spreadsheets" at line 678 uses a plain `<Link>` instead of `FunnelCtaLink`. These clicks are invisible in analytics.

**Code:** Replace the `<Link>` with a `FunnelCtaLink` using `placement="landing_bottom_cta"` and `ctaId="compare_vs_spreadsheets"`.

### Acceptance Criteria

- [ ] The "Compare Veld vs spreadsheets" link uses `FunnelCtaLink` (not `<Link>`)
- [ ] `placement` is `"landing_bottom_cta"`
- [ ] `ctaId` is `"compare_vs_spreadsheets"`
- [ ] `landingVariant={LANDING_VARIANT}` is passed
- [ ] The visual appearance (classes) is unchanged
- [ ] The link still points to `/vs/spreadsheets`
- [ ] The `ChevronRight` icon is preserved

---

## Item 8 — Differentiate Bottom CTA Label

**Change:** Use "Create your free account" on the bottom CTA to differentiate it from the hero "Get started free." More concrete for visitors who've read the full page.

**Code:** Change the bottom CTA `FunnelCtaLink` children text from "Get started free" to "Create your free account".

### Acceptance Criteria

- [ ] Hero CTA reads "Get started free" (unchanged)
- [ ] Bottom CTA reads "Create your free account"
- [ ] The bottom CTA `ctaId` is updated to `"create_free_account"` (distinct from hero's `"get_started_free"`)
- [ ] Both labels are approved per `veld-landing-cta` skill: "Get started free" or "Create free account"
- [ ] No other CTA text on the page is changed

---

## Item 9 — Add Pricing Preview Sign-Up Link

**Change:** The pricing preview section has "See full pricing" but no direct sign-up path. Add a subtle inline sign-up link for signed-out visitors.

**Code:** Add a `FunnelCtaLink` next to or below the "See full pricing" button, visible only when `!userId`.

### Acceptance Criteria

- [ ] When signed out, a sign-up link is visible in the pricing preview section
- [ ] The link uses `FunnelCtaLink` with `placement="landing_pricing_preview"` and `planIntent="free"`
- [ ] The link points to `/sign-up?intent=free`
- [ ] The link is styled as secondary (`text-muted` or similar) — not `bg-accent` (one loud action rule)
- [ ] When signed in, the link is not rendered
- [ ] The "See full pricing" ghost button remains the primary visual CTA in the section
- [ ] Touch target meets 44px minimum height

---

## Item 10 — No ChevronRight on Primary Button (Decision Record)

**Decision:** Do NOT add a `ChevronRight` icon inside the primary accent button.

**Reasoning:** The chevron is the established visual convention on this page for secondary navigation links ("See pricing ›", "Open full calculator ›", etc.). Adding it to the primary button would blur the distinction between "commit to this action" (accent background, no icon) and "go see something" (text link, chevron). The `bg-accent` color contrast is sufficient as the primary affordance on mobile.

### Acceptance Criteria

- [ ] The hero primary CTA (`bg-accent`) does NOT contain a `ChevronRight` icon
- [ ] The bottom primary CTA (`bg-accent`) does NOT contain a `ChevronRight` icon
- [ ] All secondary text links continue to use `ChevronRight` as they do currently

---

## Preservation Constraints

These elements must NOT regress during implementation. Verify after all changes are applied.

- [ ] Asymmetric hero grid uses `lg:grid-cols-[3fr_2fr]` (or updated to `md:grid-cols-[3fr_2fr]` if the screenshot breakpoint shifts — either is acceptable as long as the grid functions)
- [ ] `AnimatedSection` scroll reveals fire on all sections that currently have them
- [ ] "Honest scope" section (What Veld does / What it doesn't do) is present and unchanged
- [ ] Annual pricing hints ("$X/year (2 months free)") appear on Investor and Pro cards
- [ ] All `aria-labelledby` attributes point to valid heading `id` values
- [ ] Trust line ("Free plan — no card required. Your first property in about 60 seconds.") renders for signed-out visitors in the hero
- [ ] Trust line does NOT render for signed-in visitors
- [ ] `FunnelCtaLink` is used on all primary marketing CTAs (no regression to plain `<Link>`)
- [ ] `PlanIntentUrlSync` renders in a `Suspense` boundary at the top
- [ ] `LandingNav` receives `landingVariant={LANDING_VARIANT}`
- [ ] `PublicCalculator` is dynamically imported with a loading placeholder
- [ ] No `bg-accent` appears on more than one CTA per visible screen section
- [ ] All `hover:` classes have matching `transition-` classes
- [ ] No `border-border/70` or `bg-card/95` opacity dilutions
- [ ] No literal `→` characters — all forward arrows use `ChevronRight`
- [ ] Pricing figures use `tabular-nums`
- [ ] All interactive elements on mobile have ≥ 44px touch targets

---

## Design System Compliance

No deviations from the design system are required. All changes use existing tokens:

- Responsive visibility: `hidden`, `sm:grid`, `md:hidden`, `md:block`
- Responsive sizing: `w-full sm:w-auto`
- Inline CTA text: `text-accent` with `transition-colors duration-150`
- Surface treatment: `rounded-xl border border-border shadow-lg` (mobile screenshot frame)
- Typography: existing L5 body text for inline sign-up prompts

If any change requires a deviation during implementation, it must be called out explicitly with a conversion justification before proceeding.
