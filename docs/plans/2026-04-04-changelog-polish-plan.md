# Changelog Page — Light Polish Plan

**Created:** 2026-04-04  
**Status:** Ready to execute  
**Primary goal:** Make **`/changelog`** feel consistent with the rest of the marketing site: readable typography, calm hierarchy, subtle polish—**without** treating it like a conversion landing page.

**Not in scope:** New CTAs, funnel experiments, or restructuring nav. This is **visual and UX polish** only.

**Related:** `docs/launch/changelog-process.md` (how to edit `CHANGELOG_ENTRIES`—unchanged by this plan unless you fix copy bugs).

---

## Why this is lighter than calculators / pricing

The changelog is **trust and transparency**, not signup. Visitors expect a **scannable timeline** and clear links to help (Contact, Pricing). One primary marketing CTA in **`LandingNav`** is enough; the page body does not need `FunnelCtaLink` blocks unless you add a deliberate “Get started” strip (optional, not required here).

---

## Governance (read before editing)

1. **`.cursor/skills/veld-ui/SKILL.md`** — tokens, Panel/surfaces, typography levels, motion durations, anti-patterns (`border-border/70`, `bg-card/95`, L4 uppercase misuse).
2. **`.cursor/skills/veld-mobile/SKILL.md`** — comfortable reading width, tap targets on links at the bottom, no horizontal overflow on narrow viewports.
3. **`.cursor/skills/veld-landing-cta/SKILL.md`** — **only** if you touch link styling in the footer line or align with global marketing patterns; do **not** add hero CTAs by default.

---

## Scope — files

| File | Role |
|------|------|
| `app/app/changelog/page.tsx` | **Main target** — layout, timeline, intro copy wrapper |
| `app/lib/changelog-data.ts` | **Do not edit** for “polish” unless fixing a typo or date error; content follows `changelog-process.md` |
| `app/components/landing-nav.tsx` | Change **only** if the changelog route needs a `landingVariant` for analytics parity with other marketing pages (optional) |
| `app/components/footer.tsx` | Change **only** if shared footer styling is updated project-wide elsewhere |
| `app/app/globals.css` | **Optional** — only if adding a tiny shared utility (e.g. timeline animation) used here |

---

## Phase 1 — Quick audit (10–15 minutes)

Do this in the browser (signed-out is enough).

1. Open `/changelog` at **~390px**, **768px**, and **~1280px** width.
2. **Read hierarchy:** Can you scan dates → titles → bullets in one pass? Any cramped spacing?
3. **Design system:** Check the intro eyebrow line (“What’s new”) against `veld-ui` — **uppercase + tracking-wide on marketing content** is often the wrong pattern; prefer **accent-pill** or **`text-xs font-medium text-muted`** for section labels per skill.
4. **Links:** Contact and Pricing at the bottom — ensure hover/focus states are visible and not the only affordance (keyboard tab through).
5. **Timeline:** Dots + left border — any misalignment at mobile or odd clipping?

**Deliverable:** 3–6 bullet notes (“fix eyebrow”, “increase space-y on ol”, etc.). No spreadsheet required.

---

## Phase 2 — Layout & typography (explicit)

1. **Article container:** Keep `max-w-2xl` unless readability testing suggests `max-w-3xl` for long bullets—if you widen, re-check line length for body text.
2. **Intro block:** Align H1 and supporting paragraph with marketing L1/L2 patterns from `veld-ui` (the current page is close; tighten only if inconsistent with `/tools` or `/pricing` after their polish).
3. **Entry cards vs plain list:** Optional—wrap each `<li>` content in a **`rounded-xl border border-border bg-card shadow-sm`** panel if the timeline feels flat; **or** keep a minimal timeline with improved spacing only. Pick **one** coherent style.
4. **Date pill:** Already uses `border`, `bg-card`, `shadow-sm` — ensure nested radius rules if you add an outer panel (child radius smaller than parent per skill).

---

## Phase 3 — Motion (optional, minimal)

1. **Prefer CSS** — staggered fade-in on list items is acceptable if gated with **`motion-safe:`** and **`prefers-reduced-motion`** (match patterns used elsewhere in `app/`).
2. **No** scroll hijacking, no long loops.
3. **Hover:** If entries become interactive cards later, use `transition-shadow duration-150` per `veld-ui`.

---

## Phase 4 — Verify

```bash
cd RealEstatePortfolio/app && npm run check
```

**Manual:**

- [ ] No horizontal scroll on mobile for the changelog route
- [ ] Tab order: main content links, then footer
- [ ] With OS “Reduce motion” on, no distracting animation

---

## Copy-paste prompt (implementation agent)

```
Polish the Veld Portfolio changelog page per docs/plans/2026-04-04-changelog-polish-plan.md.

Read: .cursor/skills/veld-ui/SKILL.md and .cursor/skills/veld-mobile/SKILL.md.

Scope: primarily app/app/changelog/page.tsx. Do not change app/lib/changelog-data.ts except for obvious typos. Do not add signup CTAs to the page body unless the plan’s optional note explicitly requests it (default: no).

Goals: fix eyebrow/typography per veld-ui, improve timeline spacing/readability, optional subtle motion-safe CSS polish, no raw hex, no deprecated token patterns on touched lines.

Deliver: short summary, files touched, npm run check result.

Do not edit the plan markdown unless the user asks.
```

---

## Acceptance criteria (reviewer)

- [ ] Page feels **consistent** with other polished marketing pages (spacing, type, surfaces).
- [ ] **veld-ui** compliant on all changed lines.
- [ ] **Mobile** readable; links tappable; no layout breakage.
- [ ] **Changelog content** process unchanged (`changelog-data` edits only for typos if any).
- [ ] **Scope:** No unrelated refactors.

---

## Optional (only if you want parity with other marketing pages)

- Pass a **`landingVariant`** into `LandingNav` on the changelog route (e.g. `changelog_v1`) for analytics consistency—**only** if you use variants elsewhere and want clean event segmentation.

---

## Document history

| Date | Note |
|------|------|
| 2026-04-04 | Initial light polish plan |
