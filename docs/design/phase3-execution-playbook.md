> ✅ **COMPLETED** — All Phase 3 sessions (A1–A4, B1–B6) have been executed. This document is a historical execution record. For the current design system, see [`docs/design/design-spec-2026.md`](./design-spec-2026.md).

# Phase 3 Execution Playbook

> **What this is:** A session-by-session checklist for running the Phase 3 design work.  
> **What to have open:** The relevant guide doc in one tab, this playbook in another.  
> **Rule:** Complete each session fully (including the build check) before starting the next one.

---

## Before You Start

- [ ] All Phase 1 changes applied (`implementation-guide-2026.md`)
- [ ] All Phase 2 changes applied (`implementation-guide-2026-phase2.md`)
- [ ] App runs locally (`npm run dev` works)

---

## Part A — Pattern Rollout
> **Guide:** `docs/design/implementation-guide-2026-phase3-rollout.md`  
> **Goal:** Close the consistency gap. ~30 files still use old patterns from before Phase 1.

---

### Session A1 — Projections tab content

**What it touches:** `app/app/(app)/properties/[id]/projections-tab-content.tsx`  
**Why it matters:** This file renders inside both the property detail page AND the Modeling workspace. The biggest visible inconsistency in the product right now.  
**Model: Composer 2** — pure find/replace, no new code

**Prompt to use:**
> Run Stage 1 of `docs/design/implementation-guide-2026-phase3-rollout.md`. The target file is `app/app/(app)/properties/[id]/projections-tab-content.tsx`. Read the file first, then apply all 14 changes in order. Use `replace_all: true` where the guide specifies it.

**After the session:**
- [ ] Build passes: `Set-Location "...\RealEstatePortfolio\app"; npx next build`
- [ ] Open a property → Projections tab: no ALL CAPS section labels
- [ ] Open Modeling workspace: controls panel and chart panel borders look the same

---

### Session A2 — Mortgage tab content

**What it touches:** `app/app/(app)/properties/[id]/mortgage-tab-content.tsx`  
**Model: Composer 2** — pure find/replace, no new code

**Prompt to use:**
> Run Stage 2 of `docs/design/implementation-guide-2026-phase3-rollout.md`. The target file is `app/app/(app)/properties/[id]/mortgage-tab-content.tsx`. Read the file first, then apply all 10 changes in order.

**After the session:**
- [ ] Build passes
- [ ] Open a property → Mortgage tab: no ALL CAPS labels
- [ ] Open Mortgage workspace: left/right panels look consistent

---

### Session A3 — Settings + Properties

**What it touches:** `settings/page.tsx`, `properties/page.tsx`, `overview-tab-content.tsx`  
**Model: Composer 2** — pure find/replace across 3 files

**Prompt to use:**
> Run Stages 3 and 4 of `docs/design/implementation-guide-2026-phase3-rollout.md`. Touch `app/app/(app)/settings/page.tsx`, `app/app/(app)/properties/page.tsx`, and `app/app/(app)/properties/[id]/overview-tab-content.tsx`. Read each file before editing it.

**After the session:**
- [ ] Build passes
- [ ] Settings page: section labels not ALL CAPS, mobile quick-view card border is clean
- [ ] Properties list: no ALL CAPS labels
- [ ] Property overview tab: "Overview" heading is dark text, not muted all-caps

---

### Session A4 — Everything else

**What it touches:** ~12 remaining files (amortization page, in-app calculators, export, onboarding, admin, property sub-components, wizard, filters)  
**Model: Composer 2** — all mechanical, many files but simple patterns

**Prompt to use:**
> Run Stage 5 of `docs/design/implementation-guide-2026-phase3-rollout.md`. This stage covers approximately 12 files. Work through each sub-section (5.1 through 5.13) in order. Read each file before editing. Apply `replace_all: true` where specified.

**After the session:**
- [ ] Build passes
- [ ] Amortization page: chevron icon back link instead of `← Property`
- [ ] In-app calculator pages: no ALL CAPS eyebrow labels
- [ ] Export page: no ALL CAPS section headers

---

## Part B — Ceiling-Breaker Work
> **Guide:** `docs/design/implementation-guide-2026-phase3.md`  
> **Goal:** Polish, depth, and conversion improvements. The difference between 7.5/10 and 10/10.

---

### Session B1 — Global CSS (focus rings + form transitions)

**What it touches:** `app/app/globals.css` only  
**Why first:** One file, covers hundreds of elements instantly. Highest leverage edit in the entire plan.  
**Model: Composer 2** — two small CSS blocks to insert, no logic

**Prompt to use:**
> Run Stage 1 of `docs/design/implementation-guide-2026-phase3.md`. The target file is `app/app/globals.css`. Apply both changes: the global focus ring block and the global input transition block.

**After the session:**
- [ ] Build passes
- [ ] Tab through the Add Property form: every input shows a 2px indigo ring when focused
- [ ] Click a button with mouse: no focus ring appears
- [ ] Works in dark mode

---

### Session B2 — Motion layer

**What it touches:** `metric-card.tsx`, `deals-list.tsx`, `property-detail-tabs.tsx`, `dashboard/page.tsx`, `landing-nav.tsx`  
**Model: Sonnet 4.6** — targeted edits across 5 files, needs to read context correctly

**Prompt to use:**
> Run Stage 2 of `docs/design/implementation-guide-2026-phase3.md`. Apply changes to all five files listed in that stage. Read each file before editing.

**After the session:**
- [ ] Build passes
- [ ] Dashboard metric cards have a subtle shadow lift on hover
- [ ] Property detail tabs switch with a smooth indicator transition
- [ ] Landing nav links transition smoothly

---

### Session B3 — Empty states

**What it touches:** `deals-list.tsx`, `deals/page.tsx`, `properties/page.tsx`  
**Model: GPT 5.3 Codex** — generates new JSX blocks, needs to understand component structure

**Prompt to use:**
> Run Stage 3 of `docs/design/implementation-guide-2026-phase3.md`. Implement the empty state system for the deals list (no deals + no search results) and the properties list (no properties + no filter results). Read each file before editing.

**After the session:**
- [ ] Build passes
- [ ] Deals page with no saved deals: icon + "No saved deals" + "Analyze a deal" button
- [ ] Deals page with a search that matches nothing: icon + "No matching deals" + "Clear search" button
- [ ] "Clear search" actually clears the search field
- [ ] Properties page with no properties: icon + "No properties yet" + "Add your first property" button

---

### Session B4 — Sticky tab bar + pricing page

**What it touches:** `property-detail-tabs.tsx`, `pricing/page.tsx` (or wherever pricing lives)  
**Model: Sonnet 4.6** — structural additions to two files, pricing table is non-trivial JSX

**Prompt to use:**
> Run Stage 4 of `docs/design/implementation-guide-2026-phase3.md` (sticky property detail tab bar). Then run Stage 7 (pricing page comparison table and FAQ). Read each file before editing.

**After the session:**
- [ ] Build passes
- [ ] Open a property, scroll down through tab content: tab bar stays pinned below the app nav
- [ ] Tab bar background is opaque (no content bleed through)
- [ ] Pricing page: comparison table visible on desktop
- [ ] Pricing page: "Compare all features" accordion on mobile
- [ ] Pricing page: 4 FAQ items expand correctly

---

### Session B5 — Landing page

**What it touches:** `app/app/page.tsx`  
**Model: GPT 5.3 Codex** — marketing copy + structural changes, worth the extra quality  
**Do this one focused, on its own.**

**Prompt to use:**
> Run Stage 6 of `docs/design/implementation-guide-2026-phase3.md`. Make all five changes to `app/app/page.tsx`: replace the trust pills with a single trust line, update the social proof strip, add the accent-pill eyebrow to the value props section, add the accent-pill eyebrow to the how-it-works section. Verify the section order (calculator should already be before value props — confirm, don't move unless needed). Read the file first.

**After the session:**
- [ ] Build passes
- [ ] Hero: single "Free plan — no card required." sentence below the CTA buttons (signed-out view)
- [ ] Social proof strip: factual statements, not generic anonymous quotes
- [ ] Value props section: small indigo pill above the heading
- [ ] How it works section: small indigo pill above the heading
- [ ] Check on mobile viewport (390px): trust line wraps neatly

---

### Session B6 — Brand mark check (5 min, no code)

**What it touches:** `app/favicon.svg` — review only, no code change  
**Model: Composer 2** — read-only confirmation, no editing  
**Note:** The brand mark slot in the landing nav already exists. Stage 9 is a confirmation task only.

**Prompt to use:**
> Run Stage 9 of `docs/design/implementation-guide-2026-phase3.md`. Read `app/components/landing-nav.tsx` and confirm the logo slot matches what the guide describes — no code change should be needed.

**After the session:**
- [ ] Confirm landing nav already has `flex items-center gap-2` + `<Image src="/favicon.svg">` structure
- [ ] Note the path to `favicon.svg` for when a real brand mark is designed

---

### Session B7 — Mobile bottom navigation (optional, full session)

> **Skip this unless mobile is a known priority.** This is the most complex change in the plan.  
> **Model: GPT 5.3 Codex** — new component + event wiring across 3 files, highest risk of subtle bugs

**Prompt to use:**
> Run Stage 8 of `docs/design/implementation-guide-2026-phase3.md`. Create the `MobileBottomNav` component, add it to the authenticated layout, wire up the custom event in `AppNav`, and add the bottom padding to the main content area. Read all affected files before editing.

**After the session:**
- [ ] Build passes
- [ ] Mobile (390px viewport): 4-item bottom nav visible
- [ ] Desktop: bottom nav hidden
- [ ] "More" button opens the existing mobile drawer
- [ ] Content not hidden behind the nav at the bottom of any page
- [ ] Test on actual mobile device if possible

---

## Done

When all sessions are complete, do one final pass:

- [ ] Full build: `npx next build`
- [ ] Walk through: Dashboard → Properties → one property → all tabs → Settings
- [ ] Walk through on mobile: same flow at 390px
- [ ] Landing page signed-out view
- [ ] Pricing page
- [ ] No ALL CAPS section labels anywhere in the app

---

## Quick Reference

| Session | Guide | Stage | Model | Time est. |
|---|---|---|---|---|
| A1 | Rollout | Stage 1 | Composer 2 | 20 min |
| A2 | Rollout | Stage 2 | Composer 2 | 15 min |
| A3 | Rollout | Stages 3–4 | Composer 2 | 15 min |
| A4 | Rollout | Stage 5 | Composer 2 | 20 min |
| B1 | Phase 3 | Stage 1 | Composer 2 | 10 min |
| B2 | Phase 3 | Stage 2 | Sonnet 4.6 | 15 min |
| B3 | Phase 3 | Stage 3 | GPT 5.3 Codex | 20 min |
| B4 | Phase 3 | Stages 4+7 | Sonnet 4.6 | 20 min |
| B5 | Phase 3 | Stage 6 | GPT 5.3 Codex | 20 min |
| B6 | Phase 3 | Stage 9 | Composer 2 | 10 min |
| B7 | Phase 3 | Stage 8 | GPT 5.3 Codex | 60–90 min |
