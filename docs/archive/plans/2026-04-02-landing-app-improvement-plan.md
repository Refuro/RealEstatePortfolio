# Landing Page & App Improvement Plan
**Created:** 2026-04-02  
**Updated:** 2026-04-02 — added correct UI skill sequencing  
**Status:** Ready to execute  
**Skills available:** `veld-ui`, `veld-landing-cta`, `veld-mobile`, `page-cro`, `copywriting`, `signup-flow-cro`, `onboarding-cro`, `paywall-upgrade-cro`, `free-tool-strategy`, `competitor-alternatives`, `compound-engineering` plugin (`frontend-design` skill + `design-iterator` + `design-implementation-reviewer` subagents)

---

## Overview

This plan uses the full skill stack to systematically improve Veld's conversion funnel from top (landing page) to bottom (upgrade moment). Phases are ordered by expected ROI. Each phase specifies the correct skill sequencing — copy/strategy first, then UI design, then visual refinement loops.

> **Important:** For any phase involving visual UI work, the correct execution order is:
> 1. Strategy/copy skills determine *what* the page needs to say and do
> 2. `frontend-design` drives the visual rebuild with genuine design quality
> 3. `design-iterator` runs iterative screenshot cycles (3–5 rounds) until it looks right
> 4. `design-implementation-reviewer` locks in final fidelity
>
> Do not use `design-iterator` as a one-shot finishing move. It is a multi-cycle refinement engine.

---

## Phase 1 — Landing Page Overhaul
**Priority:** Highest  
**Files:** `app/app/page.tsx`  
**Skills:** `page-cro` → `copywriting` → `veld-landing-cta` → `frontend-design` → `design-iterator` (3–5 cycles) → `design-implementation-reviewer`  
**When:** Do this first. Highest funnel leverage.

### Philosophy — full reimagining, not a polish pass

**This phase has no structural constraints.** The AI should approach this as a blank-slate redesign question: "What is the best possible landing page for Veld?" — not "how do we improve what's there."

The current section order, visual treatment, copy, layout, and structure are all on the table. If the skills determine the page needs to be completely different — new sections, removed sections, reordered sections, a different hero format, a different visual style — that is the correct outcome. The goal is the best possible landing page, not an incrementally better version of the current one.

**One thing worth considering (not required):** An interactive demo — either an embedded Arcade.so walkthrough or a "Try without signing up" section — could be a strong addition to either this page or a dedicated `/demo` route. If the skills determine it belongs here, great. If it belongs on its own page, or nowhere on this page, that's equally valid. Don't force it.

**The only hard constraints (non-negotiable):**
- Veld design system tokens and rules (`veld-ui`) — no raw hex colors, correct surfaces, correct CTA hierarchy
- `FunnelCtaLink` for all primary marketing CTAs (analytics tracking)
- Trust line ("Free plan — no card required. First property in X seconds") must be present for signed-out visitors
- No anonymous unattributed social proof quotes
- Positioning must match `app/.agents/product-marketing-context.md` — do not invent features or claims

**Everything else is open.** Hero layout, section count, section order, visual style, copy angle, card design, motion, typography choices within the design system — all fair game.

### Known weaknesses in the current page (for context, not as a constraint)

These are starting observations. The AI may find bigger problems or determine these aren't actually problems:
- Value props read as features, not outcomes
- "Everything your portfolio needs" and "How it works" section headings are generic
- Social proof strip is factual but may not be compelling enough
- "60 seconds" (hero trust line) vs "2 minutes" (How it works step 1) inconsistency
- Visual design is functional but not memorable

### Trigger prompt sequence

**Step 1 — Strategy and copy (open-ended):**
```
You are reimagining the Veld Portfolio landing page from scratch.
Read app/.agents/product-marketing-context.md first for full product context.
Then run a full page-cro audit on app/app/page.tsx using the page-cro skill.
Use the copywriting skill to write the best possible copy for this page.
Use the veld-landing-cta skill for Veld-specific positioning and CTA rules.

This is not a polish pass. Question everything: the section order, the sections themselves,
the hero format, the copy angle, the value prop framing. If a completely different structure
would convert better for small passive landlords who hate spreadsheets and fragmented tools,
propose and implement it.

Hard constraints only:
- FunnelCtaLink for all primary CTAs
- Trust line for signed-out visitors
- No anonymous unattributed social proof
- All claims must match product-marketing-context.md

Everything else is on the table.
```

**Step 2 — Visual rebuild (unrestricted):**
```
Using the frontend-design skill, rebuild the visual design of app/app/page.tsx.
Apply the veld-ui skill for design system rules (tokens, surfaces, typography, shadows, anti-patterns).

Approach this as a full visual redesign. The goal is a landing page that looks genuinely
world-class for a SaaS product — not generic, not safe, not "clean enough."
Do not preserve the current visual structure out of caution.

You may:
- Completely change the hero layout and visual treatment
- Change how sections are visually differentiated
- Introduce new visual patterns (within the design system tokens)
- Change spacing, rhythm, and section proportions dramatically
- Rethink how the product screenshot is presented

Detect and respect the Veld design system (indigo accent, token names, surface hierarchy).
Mobile-first. Light and dark mode both must work.
```

**Step 3 — Iterative refinement (multiple cycles):**
```
Use the design-iterator subagent.
Run 5 screenshot-analyze-improve cycles on the landing page at http://localhost:3000.
On each cycle: screenshot → identify the single weakest element → fix it → verify.
Prioritize: above-the-fold first impression, mobile at 390px, section transitions, pricing preview.
Do not stop after one cycle. Run all 5.
```

**Step 4 — Final verification:**
```
Use the design-implementation-reviewer subagent for a final fidelity check.
Verify: veld-ui rules followed, correct token usage, FunnelCtaLink on all primary CTAs,
trust line present for signed-out users, no anti-patterns from design-spec-2026.md.
```

### Success criteria
- The page would make someone unfamiliar with Veld immediately understand who it's for and why they should try it
- "60 seconds" / "2 minutes" copy inconsistency resolved throughout
- One primary CTA above the fold — no competing loud actions
- Social proof is specific, honest, and credible
- Visual design passes `design-iterator` — looks genuinely good, not AI-generated-generic
- All `veld-ui` rules followed (tokens, anti-patterns, CTAs)
- `FunnelCtaLink` used for all primary marketing CTAs

---

## Phase 2 — Onboarding & Signup Flow
**Priority:** High  
**Files:** `app/app/(app)/onboarding-panel.tsx`, post-signup redirect, Clerk handoff  
**Skills:** `signup-flow-cro` → `onboarding-cro` → `frontend-design` → `design-iterator`  
**When:** After Phase 1 is live.

### Why
Drop-off between "clicked sign up" and "added first property" is the most common early-stage SaaS conversion killer. The growth funnel audit flagged two concrete issues here: (1) the onboarding API failure is invisible to the user — if the PATCH fails, the user is stuck on a blocking welcome modal with no feedback or retry; (2) the accessibility gaps in the modal. Fix both in the same pass.

### What to address
- First screen after Clerk signup — is it clear what to do next?
- Steps to "first property added" — the landing promises 60 seconds. Is that real? Audit and reduce friction
- Onboarding modal currently lacks `role="dialog"`, `aria-modal`, focus trap, Escape handler (UX audit finding)
- Onboarding PATCH failure is silent — user gets stuck, no error, no retry (growth funnel audit finding)
- "60 seconds" vs "2 minutes" copy inconsistency — pick one and make it true
- Is there a win/success state when the first property is added? There should be

### Trigger prompt
```
Audit and improve the post-signup onboarding experience.
Use the onboarding-cro and signup-flow-cro skills.
Reference app/.agents/product-marketing-context.md for product context.
Start from the moment a new user completes Clerk signup through to their first property being added.

Specific issues to fix (from prior audits):
1. onboarding-panel.tsx: add role="dialog", aria-modal="true", focus trap, and Escape handler
2. onboarding-panel.tsx: surface an error state when the PATCH /api/onboarding returns non-OK (currently silent, user gets stuck)
3. Reconcile the "60 seconds" (landing hero) vs "2 minutes" (onboarding modal) copy — pick one and make it accurate
4. Review the first-run experience for friction: is there a clear win state when the first property is added?

Then use frontend-design to improve the visual design of the onboarding modal itself.
Run design-iterator for 2–3 cycles on the onboarding experience.
```

### Success criteria
- Onboarding modal has proper dialog semantics (accessible)
- API failure shows user-visible error with retry — no more silent stuck state
- Time-to-first-property is genuinely close to the promised number
- Copy is consistent across landing and onboarding
- Clear win state after first property added

---

## Phase 3 — Paywall & Plans Page
**Priority:** Medium-High  
**Files:** `app/app/(app)/plans/page.tsx`, property-limit-hit states, deals at-limit state  
**Skills:** `paywall-upgrade-cro` → `frontend-design` → `design-iterator`  
**When:** After Phase 2 is live.

### Why
Free users who hit a limit are the most purchase-ready segment. The growth funnel audit found that the deals "at limit" upgrade uses a plain `<Link>` instead of `UpgradePlanLink`, so `plan_limit_upgrade_cta_clicked` doesn't fire — these high-intent clicks are invisible in analytics. Fix the instrumentation and the UX in one pass.

### What to address
- What happens when a free user tries to add a second property? Is the upgrade prompt clear, compelling, and low-friction?
- Deals list: at-limit "Upgrade to save more" uses plain `<Link>` — switch to `UpgradePlanLink` so analytics fires
- Plans page: does it clearly show the value delta between Free → Investor?
- Recommended tier visual treatment — should use `border-accent/50 ring-2 ring-accent/25 bg-accent/5` per design spec
- Pricing figures must use `tabular-nums`

### Trigger prompt
```
Audit and improve the upgrade/paywall experience using the paywall-upgrade-cro skill.
Reference app/.agents/product-marketing-context.md for product context.
Focus on:
1. What happens when a free user hits the 1-property limit — is the upgrade prompt clear and friction-low?
2. app/app/(app)/deals/page.tsx: replace the at-limit plain Link to /plans with UpgradePlanLink
   so plan_limit_upgrade_cta_clicked fires (currently missing, per growth funnel audit)
3. app/app/(app)/plans/page.tsx: does it clearly show the value delta between tiers?
Then use frontend-design to improve the visual design of the plans page.
Run design-iterator for 2 cycles.
```

### Success criteria
- Property limit hit state has a compelling, friction-low upgrade prompt
- `plan_limit_upgrade_cta_clicked` fires for all at-limit and over-limit states
- Plans page shows obvious value delta between tiers
- Recommended tier visually highlighted per design spec
- Pricing figures use `tabular-nums`

---

## Phase 4 — Competitor / Alternatives Pages
**Priority:** Medium  
**Files:** `app/components/marketing/competitor-alternative-page.tsx`, `app/lib/marketing/competitor-data.ts`  
**Skills:** `competitor-alternatives` → `copywriting` → `frontend-design` → `design-iterator`  
**When:** After Phase 3 or in parallel with Phase 3.

### Why
Competitor pages are high-intent traffic — these visitors already know they want something and are evaluating options. The growth funnel audit found that primary signup CTAs on competitor pages omit `planIntent` and secondary "View pricing" links are plain `<Link>` with no tracking. Fix attribution and improve the persuasion in one pass.

Competitors with pages: Stessa, Rentastic, Cozy, Spreadsheets, Excel.

### What to address
- Comparison tables: honest, complete, cover what small landlords actually care about?
- CTA messaging: primary CTA should be "Create free account" — not "Switch to Veld" (visitor may not have a competitor account)
- Attribution: add `planIntent="free"` and `?intent=free` to primary `FunnelCtaLink`s on competitor pages
- Secondary "View pricing" links: replace plain `<Link>` with `FunnelCtaLink` with distinct `placement` IDs
- FAQ coverage: are the top real objections addressed? (price, switching effort, data re-entry, what Veld doesn't do)

### Trigger prompt
```
Audit and improve Veld's competitor alternative pages using the competitor-alternatives and copywriting skills.
Reference app/.agents/product-marketing-context.md for product context.
Files: app/components/marketing/competitor-alternative-page.tsx and app/lib/marketing/competitor-data.ts.

Specific issues to fix (from growth funnel audit):
1. Add planIntent="free" and href="/sign-up?intent=free" to primary FunnelCtaLink CTAs on competitor pages
2. Replace plain <Link href="/pricing"> secondary links with FunnelCtaLink with distinct placement IDs
3. Improve comparison table completeness and objection handling in FAQs

Then use frontend-design to improve the visual design of the competitor page template.
Run design-iterator for 2 cycles.
```

### Success criteria
- All primary CTAs use `FunnelCtaLink` with `planIntent="free"`
- Secondary pricing links tracked with `FunnelCtaLink`
- FAQs address switching effort, data re-entry, and what Veld explicitly doesn't do
- Visual design is clean and credible

---

## Phase 5 — Free Tool Strategy
**Priority:** Medium  
**Files:** `app/components/marketing/public-calculator.tsx`, individual calculator components, `app/app/investment-property-calculator/page.tsx`  
**Skills:** `free-tool-strategy` → `page-cro` → `frontend-design`  
**When:** After Phases 1–3 or alongside Phase 4.

### Why
Free calculators (BRRRR, Fix & Flip, STR vs LTR, Deal Analyzer) attract people actively evaluating deals — exactly Veld's target user. The growth funnel audit found that the inline "create a free account" link on the investment property calculator page is a plain `<Link>` with no `FunnelCtaLink` — these high-intent clicks are invisible in analytics.

### What to address
- `investment-property-calculator/page.tsx`: replace inline "create a free account" plain `<Link>` with `FunnelCtaLink` (with `placement="public_calc_body"`)
- Does each calculator have a visible, contextual CTA to the full in-app version after the user sees a result?
- Is the sign-up prompt shown at the right moment (after value delivery, not as a gate)?
- Could any calculator be expanded into its own dedicated SEO landing page?

### Trigger prompt
```
Audit the free public calculators as marketing assets using the free-tool-strategy and page-cro skills.
Reference app/.agents/product-marketing-context.md for product context.
Files: app/app/investment-property-calculator/page.tsx and app/components/marketing/public-calculator.tsx.

Specific fix: replace the plain <Link href="/sign-up?intent=free"> inline CTA in investment-property-calculator/page.tsx
with a FunnelCtaLink with placement="public_calc_body" and planIntent="free".

Then audit: does each calculator have a conversion path from result → signup?
Is the CTA positioned after value delivery?
What are the SEO expansion opportunities?
```

### Success criteria
- All calculator inline CTAs use `FunnelCtaLink` with proper placement IDs
- CTAs positioned after value delivery, not as gates
- At least one calculator identified as a candidate for its own SEO landing page

---

## Skill Stack Reference

| Skill | Trigger phrases | Phase |
|---|---|---|
| `veld-ui` | Any UI work, design system questions, new components | All |
| `veld-landing-cta` | Landing page, marketing pages, CTAs, positioning | 1, 4, 5 |
| `veld-mobile` | Mobile layout, MobileToolShell, touch targets, responsive | All |
| `page-cro` | "optimize this page", "improve conversions", landing page | 1, 5 |
| `copywriting` | "rewrite copy", "improve headline", marketing copy | 1, 4 |
| `signup-flow-cro` | Signup, registration, account creation flow | 2 |
| `onboarding-cro` | First-run experience, activation, time-to-value | 2 |
| `paywall-upgrade-cro` | Upgrade prompts, plans page, limit hit states | 3 |
| `free-tool-strategy` | Calculator pages, free tools as marketing assets | 5 |
| `competitor-alternatives` | Competitor comparison pages | 4 |
| `frontend-design` (compound-engineering) | Any greenfield or visual rework — drives the design | All |
| `design-iterator` (compound-engineering) | Iterative screenshot cycles after implementation — 3–5 rounds | All |
| `design-implementation-reviewer` (compound-engineering) | Final fidelity check after design-iterator | 1 |

### Correct skill sequencing for any visual phase:
1. Strategy/copy skills → determine what the page says and does
2. `frontend-design` → build/rebuild with genuine design quality
3. `design-iterator` → iterate via screenshots (multiple cycles, not one)
4. `design-implementation-reviewer` → final fidelity verification

---

## Notes

- **Always pair `veld-ui` with any visual work** — it enforces Veld-specific tokens and anti-patterns that generic skills won't know
- **Always pair `veld-landing-cta` with marketing page work** — it encodes Veld's positioning and CTA hierarchy
- **`design-iterator` is not a one-shot step** — run it for 3–5 cycles on Phase 1, 2 cycles on later phases
- **`product-marketing-context.md` must be filled in** at `app/.agents/product-marketing-context.md` before starting Phase 1 — all marketing skills read it first and produce significantly better output with it
- **Analytics fixes are bundled into each phase** — don't do them as a separate pass; fix them alongside the UX and copy work where the code is already being touched
