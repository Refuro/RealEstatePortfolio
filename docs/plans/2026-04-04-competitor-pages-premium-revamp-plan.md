---
title: "feat: Competitor/alternatives pages premium revamp"
type: feat
status: active
date: 2026-04-04
---

# feat: Competitor/alternatives pages premium revamp

## Overview

The competitor and alternatives pages were built before the landing and pricing revamps. They carry design-system violations (L4 typography on marketing headings, missing transitions, no entrance animations) and feel static compared to every other marketing surface in the product. This plan brings them to the same quality bar by applying the same animation system, heading patterns, social proof layer, and canonical CTA strip already established on `/`, `/pricing`, and the calculator pages.

The hub page (`/alternatives`) is upgraded from a bare link list to a genuine marketing surface with a hero, `hero-animate` stagger, and a bottom CTA strip. The individual competitor pages get typography fixes, scroll-triggered `AnimatedSection` wraps, a new social proof strip, differentiator card lift, and the canonical full-width bottom CTA pattern.

## Problem Frame

Seven concrete violations exist in the current competitor page component:

1. All `<h2>` section headings use the L4 pattern (`text-sm font-semibold uppercase tracking-wide text-muted`) — explicitly forbidden on marketing headings by `veld-ui` §Typography.
2. The hero has no `hero-animate` stagger, no trust line, and the primary CTA lacks `cta-accent-glow` and `transition-all duration-150`.
3. No social proof strip between hero and comparison table — the landing page establishes this as a conversion anchor.
4. Below-fold sections have no `AnimatedSection` scroll reveals.
5. The differentiators grid has plain `bg-card` cards without the marketing value prop card lift.
6. The final CTA section uses a `rounded-lg bg-card` card instead of the canonical `border-y border-border bg-subtle py-16 sm:py-20` full-width strip.
7. `hover:bg-*` and `hover:shadow-*` on interactive elements lack matching `transition-*` classes.

The hub page (`/alternatives`) is a bare link list with an L4 eyebrow, an underpowered h1, and no CTA.

The measure of success: a skeptical landlord who lands on this page after Googling "[Competitor] alternative" feels confident enough to create a free account.

## Requirements Trace

- R1. All section `<h2>` headings use L2 marketing typography (`text-2xl font-semibold`) with accent-pill eyebrows — no `uppercase tracking-wide` on marketing headings.
- R2. Hero elements (eyebrow, h1, lede, CTA cluster, trust line) have `hero-animate` stagger with increasing `transitionDelay` values.
- R3. Every below-fold `<section>` content div is wrapped in `<AnimatedSection>` — not the `<section>` element itself.
- R4. The single primary `FunnelCtaLink` in hero and bottom strip carries `cta-accent-glow` — never on ghost/secondary buttons.
- R5. All `hover:bg-*` and `hover:shadow-*` on interactive elements have a matching `transition-*` class.
- R6. Differentiators cards have `hover:-translate-y-0.5 hover:shadow-md transition-all duration-150`.
- R7. Every animation is gated with `motion-safe:` prefix (via `AnimatedSection`) or wrapped in `@media (prefers-reduced-motion: no-preference)` (via `globals.css` for `hero-animate`/`cta-accent-glow`).
- R8. Hub page gets a hero section with accent-pill eyebrow, L1 headline, lede, and a bottom CTA strip.
- R9. Bottom CTA section uses the canonical `border-y border-border bg-subtle py-16 sm:py-20` full-width strip — outside the `max-w-6xl` content container.
- R10. A minimal social proof strip (3 factual statements) is added between the hero and comparison table on individual competitor pages, using the `border-y border-border bg-subtle` strip pattern.

## Scope Boundaries

- Do NOT change `app/lib/marketing/competitor-data.ts` feature parity data or calculator math.
- Do NOT add a second `bg-accent` CTA in any single section — one loud action per screen region.
- Do NOT add new npm dependencies.
- Do NOT apply `hero-animate` to below-fold sections — those use `AnimatedSection`.
- Do NOT apply `hover:-translate-y-0.5` outside the differentiators card grid.
- Do NOT rewrite `FunnelCtaLink` internals — consume it as-is.
- `app/app/globals.css` — only if new shared animation utilities are needed. Based on current audit, no new `@keyframes` are required; all needed classes (`hero-animate`, `cta-accent-glow`, `AnimatedSection`) already exist.

## Context & Research

### Relevant Code and Patterns

- `app/app/page.tsx` — canonical `hero-animate` stagger pattern with `transitionDelay` values (0ms, 80ms, 160ms, 220ms, 300ms), social proof strip (`border-y border-border bg-subtle px-4 py-6`), `AnimatedSection` wrapping every below-fold section content div, bottom CTA strip (`border-y border-border bg-subtle px-4 py-16 sm:py-20`) with `cta-accent-glow` on primary CTA.
- `app/components/marketing/animated-section.tsx` — IntersectionObserver-based scroll reveal; uses `motion-safe:` prefixes throughout; wrap content `<div>`, not `<section>`.
- `app/app/globals.css` lines 203–227 — `cta-accent-glow` and `hero-animate` definitions; both already wrapped in `@media (prefers-reduced-motion: no-preference)`.
- `app/app/pricing/page.tsx` — `reveal-up` / `reveal-up-d1..d5` pattern; not used on landing sections (those use `AnimatedSection`). Do not use `reveal-up` on competitor pages — `AnimatedSection` is the correct scroll-reveal pattern.
- `app/components/marketing/calculator-location-page.tsx` — another example of `AnimatedSection` and `hero-animate` applied to a marketing page with a hero.

### Relevant Token and Typography Reference

- L1 marketing headline: `text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight` — used on `<h1>` of full marketing pages.
- L2 marketing section heading: `text-2xl font-semibold` — what all `<h2>` section headings on competitor pages must use.
- L4 (violation): `text-xs font-semibold uppercase tracking-wide text-muted` — only for sidebar group headers and table column headers. **The existing competitor page uses this for all `<h2>` section headings — all must be fixed.**
- Accent-pill eyebrow: `inline-flex items-center rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs font-medium text-accent` inside a `mb-3 flex justify-center` div.
- Primary CTA class pattern (from `app/app/page.tsx`): `cta-accent-glow inline-flex min-h-[44px] items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-all duration-150 hover:bg-accent-hover`.
- Hero trust line: `<p className="text-sm text-muted">Free plan — <span className="font-medium text-foreground">no card required</span>. Your first property in about 60 seconds.</p>`.

### Table Column Headers Exception

The comparison table column headers (`Capability`, `Veld Portfolio`, `[Competitor]`) use `uppercase tracking-wide text-muted` — this is **correct** (table column headers are L4 by design). Do not change these.

### Existing Animation System (no new globals.css additions needed)

| Class | Trigger | Where used |
|---|---|---|
| `hero-animate` | `@starting-style` on initial render, no JS | Hero elements only |
| `AnimatedSection` | IntersectionObserver on scroll | Below-fold section content divs |
| `cta-accent-glow` | Always on, CSS `box-shadow` | Single primary accent CTA per page |
| `reveal-up` / `-d1..d5` | `@starting-style`, staggered | Pricing page and changelog only |

### External Research Decision

Skipped — all required patterns have 5+ direct local examples in recently-touched files. No adjacent-domain gap.

## Key Technical Decisions

- **`hero-animate` on social proof strip**: The social proof strip immediately follows the hero and is visible on initial load without scroll. Apply `hero-animate` with a high delay (e.g. `transitionDelay: "400ms"`) rather than `AnimatedSection` — matches the landing page pattern where the proof strip is also `hero-animate`.
- **Final CTA section moves outside `max-w-6xl` container**: The canonical bottom strip must span full viewport width. This requires restructuring the JSX to close the `max-w-6xl` div before the final CTA section and reopen it (or replace with a smaller `max-xl` div) for the footer links. This is the most significant structural change in the plan.
- **FAQ section moves before final CTA**: Answering objections before closing is a better conversion pattern. The canonical landing page order ends with the CTA strip immediately before the footer. Reordering FAQ → final CTA strip → footer links follows this pattern.
- **Hub page competitor card lift**: The hub page competitor link cards (`rounded-lg border bg-card`) should get `hover:shadow-md transition-shadow duration-150` (standard property/deal card hover) but NOT `hover:-translate-y-0.5` — the Y-translate lift is exclusively for the differentiators value prop grid per `veld-landing-cta` SKILL.md.
- **Differentiator card number badges**: The `01`/`02`/`03` badges inside differentiator cards currently use `text-xs font-semibold uppercase tracking-wide text-muted`. While these are inside a card (not a section heading), the hard anti-pattern list prohibits `uppercase tracking-wide` on anything except sidebar group labels and table headers. Change to `text-xs font-medium text-accent` — visually consistent with the accent-pill eyebrow language used across marketing sections.
- **Social proof strip content**: Use three fixed factual statements about Veld (not sourced from `competitor-data.ts`, which is out of scope). Examples: free tier scope, 60-second onboarding, deal + portfolio in one place. These are product facts already stated on the landing page — repetition here reinforces before the comparison table.
- **Inline post-table CTA**: The existing "Ready to see how Veld works?" block after the comparison table uses `bg-accent` without `cta-accent-glow`. Per R4, `cta-accent-glow` goes on the hero CTA and the bottom strip CTA only. The mid-page inline CTA keeps `bg-accent` but does NOT get `cta-accent-glow`. It does need `transition-all duration-150` added (R5).
- **Trust line — signed-out only**: The trust line in the hero (`Free plan — no card required...`) should be conditional on `!userId`, matching the landing page pattern. It should also carry `hero-animate` with the last stagger delay.

## Open Questions

### Resolved During Planning

- **Which sections need `hero-animate` vs `AnimatedSection`?** Hero (eyebrow, h1, lede, CTA cluster, trust line) and the social proof strip (as last hero stagger) use `hero-animate`. Everything below the social proof strip uses `AnimatedSection`. This matches `app/app/page.tsx` exactly.
- **Does the hub page need a signed-out guard on its CTA?** No — the hub page CTA strip ("Create free account") is already appropriate for all visitors since there's no authenticated-specific state to handle there (unlike the landing page which shows a "Go to dashboard" variant).
- **Should `Who this is for` and `Differentiators` get eyebrows?** Yes — both are named sections with section headings. The eyebrow label for "Who this is for" should read `"Fit"` or `"Who it's for"`. For differentiators: `"Why Veld"` — matches the landing page value props section label.
- **Should `fitFor` section be conditional?** It already is (`config.fitFor && config.fitFor.length > 0`). No change.
- **No new `globals.css` additions?** Confirmed — all required animation utilities already exist.

### Deferred to Implementation

- **Exact `transitionDelay` values for hero stagger**: The implementing agent should choose values that feel natural given the actual content lengths. The landing page uses 0ms, 80ms, 160ms, 220ms, 300ms, 400ms as a guide.
- **Whether to add `min-h-[44px]` to secondary CTAs**: The landing page uses `min-h-[44px]` only on primary CTAs for mobile touch targets. The implementing agent should apply mobile skill guidance consistently.
- **Exact copy for the social proof strip**: Three factual statements are needed. The implementing agent should draw from product facts already established in the landing page or `app/.agents/product-marketing-context.md` (if present) — no invented claims.

## High-Level Technical Design

> *This illustrates the intended approach and is directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce.*

### Individual competitor page section order (after revamp)

```
<main>
  <div mx-auto max-w-6xl>           ← content container
    breadcrumb
    
    [HERO]
      accent-pill eyebrow            ← hero-animate delay 0ms
      h1                             ← hero-animate delay 80ms
      lede                           ← hero-animate delay 160ms
      CTA cluster                    ← hero-animate delay 220ms
      trust line (signed-out)        ← hero-animate delay 280ms
  
  </div>
  
  [SOCIAL PROOF STRIP]               ← full-width, border-y bg-subtle
    hero-animate delay 400ms         ← still initial render, no scroll needed
  
  <div mx-auto max-w-6xl>           ← content container reopens
    [COMPARISON TABLE]
      AnimatedSection wrapper
    
    pricing note
    inline post-table CTA            ← AnimatedSection, bg-accent (no cta-accent-glow)
    
    [WHO THIS IS FOR]                ← AnimatedSection
      accent-pill "Who it's for"
      L2 h2
      bullet list
    
    [DIFFERENTIATORS]                ← AnimatedSection
      accent-pill "Why Veld"
      L2 h2
      3-col card grid (with card lift)
    
    pricing transparency aside       ← AnimatedSection
    
    [CALCULATOR]                     ← AnimatedSection
      accent-pill "Free tool"
      L2 h2
      PublicCalculator
    
    [FAQ]                            ← AnimatedSection
      CalculatorFaqSection
    
    footer links
  </div>
  
  [BOTTOM CTA STRIP]                 ← full-width, border-y bg-subtle py-16 sm:py-20
    AnimatedSection
      L2 h2
      subtext
      primary CTA + cta-accent-glow
      ghost secondary (View pricing)
  
</main>
```

**Key structural change:** The social proof strip and the bottom CTA strip are full-width elements that must live outside the `max-w-6xl` container. This requires splitting the main container div into sections. The `<Footer>` comes after `</main>`.

### Hub page structure (after revamp)

```
<main>
  <div mx-auto max-w-3xl>
    [HERO]
      breadcrumb
      accent-pill eyebrow "Compare"  ← hero-animate delay 0ms
      L1 h1                          ← hero-animate delay 80ms
      lede                           ← hero-animate delay 160ms
    
    [COMPETITOR CARDS LIST]          ← AnimatedSection
      Link cards (hover:shadow-md transition-shadow, no Y-translate)
    
    footer link row (All calculators · Pricing)
  </div>
  
  [BOTTOM CTA STRIP]                 ← full-width, border-y bg-subtle py-16 sm:py-20
    AnimatedSection
      L2 h2 "Ready to see for yourself?"
      subtext
      primary CTA + cta-accent-glow ("Create free account")
      ghost link ("View pricing")
</main>
```

## Implementation Units

---

- [ ] **Unit 1: Both hub pages revamp** (`app/app/alternatives/page.tsx` and `app/app/vs/page.tsx`)

**Goal:** Upgrade both the `/alternatives` hub and the `/vs` ("Compare") hub from bare link lists to genuine marketing surfaces. The two files have identical structure and identical violations — apply the same treatment to both in one unit.

**Requirements:** R1 (L4 eyebrow violation on both hubs), R2, R4, R5, R7, R8, R9

**Dependencies:** None — isolated files.

**Files:**
- Modify: `app/app/alternatives/page.tsx`
- Modify: `app/app/vs/page.tsx`

**Differences between the two files:**

| | `/alternatives` hub | `/vs` hub |
|---|---|---|
| Data source | `COMPETITOR_ALTERNATIVES` | `COMPETITOR_VS` |
| Current h1 | `"Alternatives"` | `"Veld vs spreadsheets"` |
| Current eyebrow | `"Compare"` | `"Compare"` |
| Link href prefix | `/alternatives/${c.slug}` | `/vs/${c.slug}` |
| Card label | `{c.competitorColumnLabel} alternative` | `{c.h1}` |
| Footer links | All calculators · Pricing | Tool alternatives · Calculators |
| Landing variant | `"alt_hub_v1"` | `"vs_hub_v1"` |

Apply the same structural changes to both. Only copy and link targets differ.

**Approach (applies to both files):**
- Replace `<p className="text-sm font-medium uppercase tracking-wide text-muted">Compare</p>` with the accent-pill eyebrow pattern.
  - `/alternatives` hub: eyebrow label `"Compare"`, h1 `"Alternatives"` → upgrade to L1 (`text-3xl sm:text-4xl font-semibold tracking-tight`).
  - `/vs` hub: eyebrow label `"Compare"`, h1 `"Veld vs spreadsheets"` — keep the existing copy but upgrade to L1 typography.
- Add `hero-animate` + `transitionDelay` stagger to: eyebrow wrapper (0ms), h1 (80ms), lede paragraph (160ms).
- The existing competitor link cards (`rounded-lg border border-default bg-card`) currently have `transition-colors hover:bg-subtle` which is already correct for R5. Add `hover:shadow-md` with a paired `transition-shadow duration-150` for the standard interactive card depth effect (no Y-translate — these are navigation cards, not value prop cards).
- Move the footer link row to after the competitor list, then close the `max-w-3xl` container.
- Add a bottom CTA strip section AFTER the `max-w-3xl` container div closes and BEFORE `<Footer>`: `border-y border-border bg-subtle px-4 py-16 sm:py-20`, wrapping a `max-w-xl text-center` div inside `<AnimatedSection>`. Include: L2 `<h2>`, one subtext paragraph, one primary `FunnelCtaLink` with `cta-accent-glow transition-all duration-150` ("Create free account"), and one ghost secondary `FunnelCtaLink` to `/pricing` with `transition-all duration-150`.
  - `/alternatives` hub h2: `"Ready to see for yourself?"`
  - `/vs` hub h2: `"Done with the spreadsheet?"` — more specific to the switcher intent of this page.
- Move `px-4 py-12` off `<main>` onto the inner `max-w-3xl` container div so the bottom CTA strip spans full viewport width. Leave `<main className="flex-1">` padding-free.
- The `<Footer>` lives outside `<main>` already and needs no change.

**Patterns to follow:**
- Bottom CTA strip: `app/app/page.tsx` lines ~678–720
- Accent-pill eyebrow: `app/app/page.tsx` lines ~362–365
- `hero-animate` stagger: `app/app/page.tsx` lines ~184–255
- `AnimatedSection`: `app/components/marketing/animated-section.tsx`

**Test scenarios:**
- Happy path: Both hub pages at 1280px render hero with eyebrow pill, large h1, lede; link cards below; bottom CTA strip before footer.
- Happy path: Both pages at 390px render single-column layout; CTA strip buttons stack vertically.
- Edge case: Empty data source (`COMPETITOR_ALTERNATIVES` or `COMPETITOR_VS`) — card list renders empty without layout break.
- A11y: `<h1>` is the single L1 heading on each page; `<h2>` in bottom CTA strip is correctly nested; no heading level skipped.
- Motion: On `prefers-reduced-motion: reduce`, hero elements appear immediately; no fade/slide.
- Transition: Hovering a link card shows shadow lift; `prefers-reduced-motion` users see instant hover state change.

**Verification:**
- Both `/alternatives` and `/vs` at 1280px and 390px feel as polished as `/pricing` when scrolled through.
- No `uppercase tracking-wide` on any marketing heading in either file.
- Bottom CTA strip spans full viewport width (not constrained to `max-w-3xl`).
- Primary CTA carries `cta-accent-glow` in the DOM.

---

- [ ] **Unit 2: Individual competitor page hero — typography, animations, trust line**

**Goal:** Polish the hero section of `CompetitorAlternativePage`: replace the text eyebrow with an accent-pill, add `hero-animate` stagger, add a signed-out trust line, and apply `cta-accent-glow` + `transition-all duration-150` to the primary CTA.

**Requirements:** R1 (hero eyebrow), R2, R4, R5

**Dependencies:** None — touches only the hero region of the component.

**Files:**
- Modify: `app/components/marketing/competitor-alternative-page.tsx`

**Approach:**
- Replace `<p className="text-sm font-medium text-muted">{switcherLabel}</p>` with the accent-pill pattern. Use `switcherLabel` as the pill text or derive a contextually appropriate label (for `kind === "alternatives"`: `"Alternative to {competitorColumnLabel}"`; for `kind === "vs"`: `"vs {competitorColumnLabel}"`).
- Apply `hero-animate` + increasing `transitionDelay` to: the eyebrow wrapper div (0ms), the `<h1>` (80ms), the lede `<p>` (160ms), the CTA cluster div (220ms).
- Add a trust line after the CTA cluster, conditional on `!userId`: `<p className="hero-animate text-sm text-muted" style={{ transitionDelay: "280ms" }}>Free plan — <span className="font-medium text-foreground">no card required</span>. Your first property in about 60 seconds.</p>` — matches the landing page trust line exactly.
- Add `cta-accent-glow` and `transition-all duration-150` to the primary hero `FunnelCtaLink`. The full class set: `cta-accent-glow inline-flex items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-all duration-150 hover:bg-accent-hover`.
- Add `transition-all duration-150` to the secondary "View pricing" `FunnelCtaLink` (currently `hover:bg-subtle` without a matching transition).
- The `<h1>` is already `text-3xl md:text-4xl font-semibold` — correct L1 for marketing. No change needed.
- The hero `<header>` already uses `text-center` — keep centering; the accent-pill eyebrow wrapper should use `justify-center` (not `sm:justify-start` since hero is centered).

**Patterns to follow:**
- Full hero stagger: `app/app/page.tsx` lines ~184–264
- Primary CTA full class: `app/app/page.tsx` line ~234

**Test scenarios:**
- Happy path: Hero renders with accent-pill eyebrow, staggered fade-in on load, trust line visible for signed-out visitors.
- Happy path: Trust line hidden for `userId !== null` (authenticated visitor).
- Motion: `prefers-reduced-motion: reduce` — all `hero-animate` elements render without transition.
- A11y: Accent-pill eyebrow is `<span>` inside a `<div>` — no heading semantics on the eyebrow; `<h1>` remains the only level-1 heading.
- Visual: Primary CTA shows subtle indigo ambient glow at rest; secondary CTA has no glow.
- Transition: Secondary "View pricing" hover state has smooth `duration-150` background change.

**Verification:**
- Hero eyebrow is the accent-pill pattern with no `uppercase tracking-wide`.
- `hero-animate` stagger fires on initial page load (visible in browser as sequential fade-in from top).
- Trust line appears for signed-out, disappears for signed-in.
- Primary CTA has `cta-accent-glow` class in DOM; secondary does not.

---

- [ ] **Unit 3: Social proof strip (new section)**

**Goal:** Insert a factual trust-signal strip between the hero and the comparison table on individual competitor pages.

**Requirements:** R10, R7

**Dependencies:** Unit 2 (hero stagger delays inform the strip's delay value — use `400ms` to continue the stagger past the trust line).

**Files:**
- Modify: `app/components/marketing/competitor-alternative-page.tsx`

**Approach:**
- Insert a new `<div>` with class `border-y border-border bg-subtle px-4 py-6` immediately after the `</header>` hero close and before the comparison table section. This div is NOT inside a `<section>` element — it's a strip, matching the landing page social proof strip structure.
- Inside: a single `<div className="hero-animate mx-auto max-w-5xl" style={{ transitionDelay: "400ms" }}>` containing a flex row of three factual statements separated by `hidden sm:block` vertical dividers, matching the landing page strip pattern.
- Three statements (fixed, not from `competitor-data.ts`):
  1. `"1–5 properties — no bank sync required"`
  2. `"Deal analysis, mortgage simulation, and rent estimates in one place"`
  3. `"Free plan · no card required · your first property in about 60 seconds"`
- Each statement: `<p className="text-sm text-muted"><span className="font-medium text-foreground">[key phrase]</span> [rest of text]</p>` — the landing page uses this inline bold-within-muted pattern.
- The three statements + dividers use `flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center sm:gap-8` on the wrapper, with `hidden sm:block text-muted/30 text-lg` for the `|` dividers (or use `aria-hidden` `<span>` dividers matching `app/app/page.tsx` lines ~320–340).

**Patterns to follow:**
- Social proof strip: `app/app/page.tsx` lines ~317–345 (the `border-y border-border bg-subtle` strip with three factual statements and `hidden sm:block` dividers).

**Test scenarios:**
- Happy path: Strip renders between hero and comparison table at all breakpoints.
- Happy path: At `sm` and above, three statements appear in a horizontal row with dividers between them.
- Happy path: At `xs`/mobile, statements stack vertically; dividers are hidden.
- Motion: `prefers-reduced-motion: reduce` — strip content renders immediately without fade.
- A11y: Strip content is readable text; no interactive elements within the strip; dividers are `aria-hidden`.

**Verification:**
- Strip is visually distinct from the hero and comparison table (different background tint).
- Three statements match Veld's factual product positioning — no invented features.
- Strip appears to "float in" on initial load, being the last hero-stagger element at 400ms.

---

- [ ] **Unit 4: Section heading typography overhaul**

**Goal:** Fix all L4 typography violations on `<h2>` section headings throughout the competitor page component.

**Requirements:** R1

**Dependencies:** None — isolated to heading elements; does not conflict with AnimatedSection wrapping (Unit 5) or structural changes (Unit 7).

**Files:**
- Modify: `app/components/marketing/competitor-alternative-page.tsx`

**Approach:**
Fix each of the four section headings:

**"Who this is for":**
- Remove `id="fit-for-heading"` heading's current class `text-center text-sm font-semibold uppercase tracking-wide text-muted`.
- Add accent-pill eyebrow above: label `"Who it's for"`, `justify-center` alignment.
- Change h2 to: `text-center text-2xl font-semibold text-foreground`.

**"Why investors choose Veld":**
- Remove h2 class `text-center text-sm font-semibold uppercase tracking-wide text-muted`.
- Add accent-pill eyebrow above: label `"Why Veld"`, `justify-center` alignment.
- Change h2 to: `text-center text-2xl font-semibold text-foreground`.

**"See your numbers before you sign up":**
- Remove h2 class `text-center text-sm font-semibold uppercase tracking-wide text-muted`.
- Add accent-pill eyebrow above: label `"Free tool"`, `justify-center` alignment.
- Change h2 to: `text-center text-2xl font-semibold text-foreground`.

**Differentiator card number badges** (`01`, `02`, `03`):
- Change from `text-xs font-semibold uppercase tracking-wide text-muted` → `text-xs font-medium text-accent`.
- Rationale: inside a card, these are decorative ordinal markers — the accent color treatment aligns them with the eyebrow pill language and removes the L4 violation.

**Note:** The comparison table column headers (`Capability`, `Veld Portfolio`, `[Competitor]`) use `uppercase tracking-wide` — these are table column headers and are **correct L4 usage**. Do not change.

**Patterns to follow:**
- Accent-pill eyebrow: `app/app/page.tsx` lines ~362–365, ~430–433, ~474–477
- L2 heading: `app/app/page.tsx` line ~522 (`text-2xl font-semibold text-foreground`)

**Test scenarios:**
- Audit: No `<h2>` in the marketing section of the component carries `uppercase` or `tracking-wide` in its className.
- Visual: Section headings are large, visually prominent, and preceded by a small accent-colored pill.
- A11y: Heading hierarchy is preserved — `<h1>` for page title, `<h2>` for section headings, `<h3>` for card titles within sections.

**Verification:**
- Running a code search for `uppercase tracking-wide` in `competitor-alternative-page.tsx` returns only the comparison table `<th>` elements.
- Sections visually read as named sections with clear hierarchy, not subdued label captions.

---

- [ ] **Unit 5: Below-fold `AnimatedSection` wrapping**

**Goal:** Wrap the content of every below-fold section in `<AnimatedSection>` so all sections animate into view on scroll.

**Requirements:** R3, R7

**Dependencies:** Unit 7 (final CTA structural change must be complete before wrapping its content in AnimatedSection, to avoid wrapping a section that will be moved). Implementers should complete Unit 7 first, then apply AnimatedSection wraps in a single pass.

**Files:**
- Modify: `app/components/marketing/competitor-alternative-page.tsx`

**Approach:**
- Import `AnimatedSection` from `@/components/marketing/animated-section`.
- Wrap the **inner content div** of each below-fold region — not the `<section>` element itself (section backgrounds must not animate):
  - Comparison table: wrap the `<div className="mt-12 overflow-x-auto ...">` (the table card container) and the pricing note `<p>` and the inline post-table CTA `<div>` in a single `<AnimatedSection>` — they're closely related and should reveal together.
  - "Who this is for" section: wrap the `<ul>` and its label wrapper inside `<AnimatedSection>`.
  - Differentiators section: wrap the `<div className="mt-6 grid ...">` card grid inside `<AnimatedSection>`.
  - Pricing transparency aside: wrap the entire `<aside>` content inside `<AnimatedSection>`.
  - Calculator section: wrap the inner `<div>` inside `<AnimatedSection>`.
  - FAQ section: wrap `<CalculatorFaqSection>` inside `<AnimatedSection>`.
- The social proof strip (Unit 3) uses `hero-animate` — do NOT wrap it in `AnimatedSection`.
- The hero (Unit 2) uses `hero-animate` — do NOT wrap it in `AnimatedSection`.
- The final CTA strip (Unit 7) wraps its own `<AnimatedSection>` as part of its canonical pattern.

**Patterns to follow:**
- `AnimatedSection` usage: `app/app/page.tsx` lines ~360–420 (calculator section), ~427–466 (value props), ~472–511 (how it works)

**Test scenarios:**
- Happy path: Scrolling down the page, each section content fades and slides up into view as it enters the viewport.
- Motion: `prefers-reduced-motion: reduce` — sections appear immediately without transition; layout is identical to the visible state.
- A11y: No interactive elements are obscured by the initial hidden state on reduced motion (elements are immediately visible).
- Edge: Sections near the top (below social proof strip) trigger quickly; deep sections trigger as the user scrolls to them.

**Verification:**
- In DevTools with `prefers-reduced-motion: no-preference`, inspecting a below-fold section shows `motion-safe:opacity-0 motion-safe:translate-y-3` before scroll, `motion-safe:opacity-100 motion-safe:translate-y-0` after.
- With `prefers-reduced-motion: reduce`, no `opacity-0` class is applied and sections are always visible.

---

- [ ] **Unit 6: Differentiators card lift + full `hover:*` transition audit**

**Goal:** Apply the marketing value prop card lift to differentiator cards, and audit all `hover:bg-*` / `hover:shadow-*` on interactive elements to ensure matching `transition-*` classes.

**Requirements:** R5, R6

**Dependencies:** None — class additions only.

**Files:**
- Modify: `app/components/marketing/competitor-alternative-page.tsx`

**Approach:**
- **Differentiator cards**: add `hover:-translate-y-0.5 hover:shadow-md transition-all duration-150` to each `<div className="rounded-lg border border-default bg-card p-6">` differentiator card.
- **Inline post-table CTA**: the `FunnelCtaLink` with `hover:bg-accent-hover` — add `transition-all duration-150` if not already present after Unit 2.
- **"View pricing" ghost CTAs** (post-table CTA section, hero section): `hover:bg-subtle` needs `transition-all duration-150`.
- **Pricing transparency aside link** (`hover:underline`): underline-only hover, no background — no transition class needed (underline transitions are not governed by the motion rule).
- **Competitor link cards on hub** (handled in Unit 1): verify covered.
- Do a pass over the full component to catch any remaining `hover:` classes without a sibling `transition-` class.

**Patterns to follow:**
- Marketing value prop card lift: `app/app/page.tsx` value props card grid (search `hover:-translate-y-0.5` in `app/app/page.tsx`)
- Motion rule: `veld-ui` SKILL.md §Motion Rules — every `hover:bg-*`, `hover:text-*`, `hover:shadow-*` must have `transition-*`.

**Test scenarios:**
- Visual: Hovering a differentiator card shows subtle upward shift + shadow; transitions are smooth at ~150ms.
- Motion: `prefers-reduced-motion: reduce` — cards show hover shadow/bg change instantly (no delay/transition visible).
- Audit: Linting / code search for `hover:bg-` in the component should find zero instances without an adjacent `transition-` class in the same element's className.

**Verification:**
- Differentiator cards animate on hover: visible `-translate-y-0.5` lift + `shadow-md`.
- No `hover:bg-*` in the component is missing a `transition-*` pair.

---

- [ ] **Unit 7: Final CTA section → canonical full-width bottom strip + FAQ reorder**

**Goal:** Convert the final CTA card (`rounded-lg bg-card`) to the canonical `border-y border-border bg-subtle py-16 sm:py-20` full-width strip; move it after the FAQ section; restructure JSX to pull it outside the `max-w-6xl` container.

**Requirements:** R4, R5, R9

**Dependencies:** Should run before Unit 5 (to establish final JSX hierarchy before AnimatedSection wrapping).

**Files:**
- Modify: `app/components/marketing/competitor-alternative-page.tsx`

**Approach:**

**JSX restructure:**
The current structure is:
```
<main>
  <div mx-auto max-w-6xl>
    ...all sections...
    {/* Final CTA — currently inside max-w-6xl */}
    <CalculatorFaqSection />
    {/* footer links */}
  </div>
</main>
```

Target structure:
```
<main>
  <div mx-auto max-w-6xl px-4>
    ...all sections...
    {/* FAQ now before final CTA */}
    <CalculatorFaqSection />
    {/* footer links */}
    <p mt-8 text-center text-sm text-muted> ... link row ... </p>
  </div>
  
  {/* Final CTA strip — outside max-w-6xl, full width */}
  {!userId && (
    <section border-y border-border bg-subtle px-4 py-16 sm:py-20 aria-labelledby="final-cta-heading">
      <AnimatedSection>
        <div mx-auto max-w-xl text-center>
          <h2 id="final-cta-heading" text-2xl font-semibold text-foreground>
            Ready to try it?
          </h2>
          <p mx-auto mt-3 max-w-md text-sm text-muted> ... </p>
          <div mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center>
            {/* Primary CTA — cta-accent-glow */}
            <FunnelCtaLink ... className="cta-accent-glow inline-flex ... transition-all duration-150 hover:bg-accent-hover">
              Create free account
            </FunnelCtaLink>
            {/* Ghost secondary */}
            <FunnelCtaLink ... className="inline-flex ... hover:bg-subtle transition-all duration-150">
              View pricing
            </FunnelCtaLink>
          </div>
        </div>
      </AnimatedSection>
    </section>
  )}
</main>
```

**Section guard (`!userId`):** The bottom CTA strip on the landing page is signed-out only. Apply the same guard here — authenticated users don't need a "Create free account" CTA. When `userId` is present, the final CTA strip is omitted entirely.

**FAQ reorder:** Move `<CalculatorFaqSection items={config.faqs} />` (and its `<CalculatorFaqJsonLd>` head injection) to appear before the footer link row, after the calculator section — before closing the `max-w-6xl` container. The final CTA strip closes the page after the main content is done.

**Remove the existing** `<section className="mt-14 rounded-lg border border-default bg-card ...">` final CTA card.

**Patterns to follow:**
- Bottom CTA strip: `app/app/page.tsx` lines ~677–721
- `AnimatedSection` inside canonical strip: same lines

**Test scenarios:**
- Happy path (signed-out): Bottom CTA strip renders full-width below FAQ section; primary CTA glows; secondary is ghost.
- Happy path (signed-in): Bottom CTA strip is absent; page ends after footer links; no visual orphan.
- Visual: Strip background (`bg-subtle`) spans full browser width regardless of content width.
- A11y: `aria-labelledby="final-cta-heading"` correctly labels the section; heading is `<h2>`.
- Transition: Primary CTA `hover:bg-accent-hover` has `transition-all duration-150`; secondary `hover:bg-subtle` also has `transition-all duration-150`.
- Motion: `prefers-reduced-motion: reduce` — strip content renders without animation; `cta-accent-glow` box-shadow is still visible (it is not gated by motion preference — glow is always-on CSS, not an animation).

**Verification:**
- Final CTA section breaks out of `max-w-6xl` — visible in DevTools as a full-width section.
- No `rounded-lg bg-card` wrapper on the final CTA.
- FAQ renders before the final CTA strip — objections answered before the close.
- Primary CTA carries `cta-accent-glow` in DOM class list.

---

## System-Wide Impact

- **Interaction graph:** `CompetitorAlternativePage` is shared by both `app/app/alternatives/[slug]/page.tsx` (3 slugs: stessa, rentastic, cozy) and `app/app/vs/[slug]/page.tsx` (if that route exists — check for COMPETITOR_VS usage). All competitor pages receive the same improvements.
- **Error propagation:** These are static/async server components. `AnimatedSection` is a client component (`"use client"`) — its import and rendering is already established in the codebase; no new hydration concerns.
- **State lifecycle risks:** `AnimatedSection` uses `useEffect` + `IntersectionObserver` — fires once, then disconnects. No subscription leak risk.
- **API surface parity:** The hub page metadata title is currently `"Alternatives"` — after revamp, consider whether a richer title like `"Veld Alternatives — Compare Rental Property Tools"` improves SEO. This is a copy change deferred to implementation agent's discretion (within the spirit of the "agent latitude" granted in the task).
- **Unchanged invariants:** `CalculatorFaqJsonLd` head injection, `FunnelCtaLink` analytics attributes, `generateStaticParams` in the slug route, and `COMPETITOR_ALTERNATIVES` data structure are not changed.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| JSX restructure in Unit 7 may cause hydration issues if `AnimatedSection` (client component) wraps an async server component tree incorrectly | `AnimatedSection` only wraps HTML elements and already-client components; server components have been rendered to HTML by the time `AnimatedSection` runs its `useEffect`. No risk. |
| Moving final CTA outside `max-w-6xl` may shift layout if `<main>` has `px-4 py-12` — the final CTA must zero out the inherited padding | The final CTA section applies its own `px-4 py-16 sm:py-20` — but its parent `<main>` currently has `px-4 py-12`. This means `px-4` will stack. Fix: move `px-4 py-12` off `<main>` and onto the inner content container div, OR set `mx-[-1rem]` negative margin to cancel. Recommend: the `<main>` currently has `className="flex-1 px-4 py-12"` — move those to the inner `max-w-6xl` div (`px-4 py-12`), leaving `<main className="flex-1">` bare. This matches the landing page structure where `<main>` has no padding. |
| Hub page bottom CTA strip same `<main>` padding issue | Same fix applies to `app/app/alternatives/page.tsx` — move `px-4 py-12` from `<main>` to inner `max-w-3xl` div. |
| `hero-animate` on social proof strip depends on `@starting-style` browser support | `@starting-style` is supported in Chrome 117+, Safari 17.5+, Firefox 129+. The `@media (prefers-reduced-motion: no-preference)` gate already handles unsupported cases gracefully (elements render at full opacity). No fallback needed beyond what already exists. |

## Documentation / Operational Notes

- No database, API, or environment variable changes.
- No Lighthouse accessibility regressions expected — all added animations are `motion-safe:` gated; new trust line and social proof content improve text accessibility.
- After implementation: do a visual pass at 1280px and 390px on at least two competitor pages (stessa, rentastic), the spreadsheets compare page (`/vs/spreadsheets`), and both hub pages (`/alternatives`, `/vs`), comparing to `/pricing` and `/` as the quality reference.
- Verify `prefers-reduced-motion: reduce` in Chrome DevTools → Rendering panel — all competitor page sections should appear static.

## Sources & References

- Governance: `.cursor/skills/veld-landing-cta/SKILL.md` — CTA hierarchy, section order, hero trust line, competitor page rules
- Governance: `.cursor/skills/veld-ui/SKILL.md` — L4 anti-pattern, typography levels, motion rules, card lift patterns
- Pattern reference: `app/app/page.tsx` — `hero-animate` stagger, social proof strip, `AnimatedSection` usage, bottom CTA strip
- Pattern reference: `app/components/marketing/animated-section.tsx` — component API
- Pattern reference: `app/app/globals.css` — `hero-animate`, `cta-accent-glow`, `reveal-up` definitions
- Context: `docs/plans/2026-04-04-product-gap-discovery.md` — competitive positioning and Veld's differentiators
- Context: `docs/archive/plans/2026-04-04-calculators-premium-cta-plan.md` — established quality bar for marketing surfaces
- Source files: `app/app/alternatives/page.tsx`, `app/app/alternatives/[slug]/page.tsx`, `app/app/vs/page.tsx`, `app/app/vs/[slug]/page.tsx`, `app/components/marketing/competitor-alternative-page.tsx`
