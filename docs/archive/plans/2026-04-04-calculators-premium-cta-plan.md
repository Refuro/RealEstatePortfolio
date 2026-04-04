# Calculators — Premium UI, CTA & Motion Plan

**Created:** 2026-04-04  
**Status:** Ready to execute  
**Primary goal:** Bring **public calculator surfaces** (ad and SEO landing pages) to the same quality bar as the **pricing** and **landing** revamps: clear conversion paths, premium layout, tasteful CSS-first motion—without breaking the free-tool value proposition.

**Related plans:** `docs/archive/plans/2026-04-03-pricing-page-premium-plan.md`, `docs/archive/plans/2026-04-02-landing-app-improvement-plan.md`, `docs/archive/plans/2026-04-03-landing-mobile-cta-plan.md`

---

## Governance (read before writing code)

Implementers **must** read and follow these in order:

1. `.cursor/skills/veld-landing-cta/SKILL.md` — especially **Calculator as CTA**, **CTA Rules**, **FunnelCtaLink**, **one loud action per screen**, primary copy (“Get started free” / “Create free account”).
2. `.cursor/skills/veld-ui/SKILL.md` — tokens, Panel/Inset, typography levels, motion durations, **no** `border-border/70` / `bg-card/95`, **no** L4 uppercase-on-marketing-headings mistake.
3. `.cursor/skills/veld-mobile/SKILL.md` — touch targets, mobile shells, collapsibles, safe areas where relevant.
4. `docs/design/design-spec-2026.md` — motion and surfaces sections (as referenced by `veld-ui`).

**Product context (claims and positioning):** `app/.agents/product-marketing-context.md` — do not invent features.

---

## Scope — files and routes

### Routes to verify in the browser (signed-out and signed-in)

| Route | Purpose |
|-------|---------|
| `/tools` | Hub; many ad/campaign links may land here |
| `/tools/brrr` | National BRRRR calculator |
| `/tools/str-vs-ltr` | STR vs LTR |
| `/tools/fix-and-flip` | Fix and flip |
| `/investment-property-calculator` | Canonical investment property calculator (legacy path) |
| `/tools/brrr/texas` (or any valid state) | Sample **location** page (200 programmatic URLs) |

### Code files in scope

**Pages (app router):**

- `app/app/tools/page.tsx` — calculators hub
- `app/app/tools/brrr/page.tsx`
- `app/app/tools/str-vs-ltr/page.tsx`
- `app/app/tools/fix-and-flip/page.tsx`
- `app/app/tools/[calculator]/[location]/page.tsx` — dynamic location pages (do not change `generateStaticParams` behavior without a product reason)
- `app/app/investment-property-calculator/page.tsx`

**Shared marketing components (expect most edits here):**

- `app/components/marketing/brrr-calculator.tsx`
- `app/components/marketing/str-ltr-calculator.tsx`
- `app/components/marketing/fix-and-flip-calculator.tsx`
- `app/components/marketing/public-calculator.tsx`
- `app/components/marketing/calculator-location-page.tsx`
- `app/components/marketing/calculator-faq.tsx`
- `app/components/marketing/funnel-cta-link.tsx` — **only** if fixing shared behavior; prefer consuming it, not rewriting it
- `app/components/calculators/calculators-hub-cards.tsx`

**Optional touch if needed for global animation utilities:**

- `app/app/globals.css` — only if adding shared `@keyframes` or utility classes used by multiple calculator surfaces; prefer Tailwind + existing patterns first

**Out of scope unless explicitly required:**

- Authenticated app calculators under `app/(app)/calculators/...` (different UX contract)
- Changing calculator **math** / `app/lib/*-calculator.ts` unless fixing a displayed bug
- New dependencies (Framer Motion, etc.) unless approved—prefer CSS + existing Tailwind

---

## Phase 0 — Pre-flight (mandatory)

Do these steps **in order** and record findings in the PR or a short note (bullet list is fine).

1. **Read** the governance files listed above (full read, not skim).
2. **Open** each route in the table in “Routes to verify” with:
   - a **signed-out** browser session, and
   - a **signed-in** session (or incognito vs logged-in window).
3. **Run** the project quality gate from repo root (adjust if your `package.json` uses a different script name):

   ```bash
   cd RealEstatePortfolio/app && npm run check
   ```

   If this fails before your changes, fix only what is required for the calculator work or document the pre-existing failure—do not hide new errors.

4. **Screenshot** (optional but recommended): hub at `sm` and `md`; one national tool page at `sm` and `lg`; one location page at `sm`—for before/after comparison.

---

## Phase 1 — CTA & funnel audit (explicit checklist)

Work **route by route**. For each, answer the questions and fix gaps before moving to heavy visual polish.

### Global rules (non-negotiable)

- **Primary signup actions** must use **`FunnelCtaLink`**, not raw `next/link` with `bg-accent`, so analytics/funnel attributes stay consistent.
- **Primary CTA copy** must align with `veld-landing-cta` (e.g. “Get started free”, “Create free account”—not “Try now” or payment-implying language).
- **One loud `bg-accent` primary per logical section** (hero block, sticky CTA strip, etc.). Secondary actions: muted, ghost, or text link—per skill.
- **Do not** gate the free calculator behind signup.
- **Do not** use literal `→` in UI—use `<ChevronRight>` from `lucide-react` per skill.

### 1.1 Hub — `/tools` (`app/app/tools/page.tsx`)

1. **Signed-out:** Confirm there is a **clear primary** path to `/sign-up` (or equivalent) **above the fold** or immediately after the short hero—**visible without scrolling** on a typical laptop viewport. If missing, add a **single** `FunnelCtaLink` primary in the header area; align `placement` and `ctaId` with a new consistent naming scheme (e.g. `placement="tools_hub_hero"`, `ctaId="get_started_free"`).
2. **Signed-in:** Confirm “Continue in app” (or equivalent) is visible and does not compete with a second accent button in the same block.
3. **Footer:** Ensure footer and nav links remain unchanged except for styling tweaks.

### 1.2 National tool pages — `/tools/brrr`, `/tools/str-vs-ltr`, `/tools/fix-and-flip`

For **each** of the three pages:

1. **Signed-out:** Identify **every** `FunnelCtaLink` / `bg-accent` block from the page file **and** from the embedded calculator (`showCta` sections).
2. **Consistency:** If one page has a **post-calculator footer strip** (e.g. BRRRR’s “Ready to track this property?”) and another does not, either **align** all three to the same pattern **or** document why one calculator differs (product decision in PR description).
3. **Placement IDs:** Ensure `placement` / `ctaId` on each calculator variant are **distinct enough** for analytics (e.g. include calculator name: `brrr_inline`, `brrr_footer`).

### 1.3 Location pages — `/tools/[calculator]/[location]` (`calculator-location-page.tsx`)

1. Confirm calculators render with **`showCta`** (already true in code—verify in browser).
2. Confirm **breadcrumb** and **sibling calculator links** do not use a second primary accent in the same viewport as an inline signup CTA—adjust hierarchy if two loud buttons appear stacked on mobile.
3. Confirm **FAQ** section has no competing primary CTA unless the design intentionally adds a bottom strip; if added, follow **one primary per section**.

### 1.4 Investment property — `/investment-property-calculator`

1. Match **CTA parity** with other national tools (same funnel behavior, same copy tone).
2. Confirm canonical/meta behavior is **unchanged** unless fixing a clear bug.

### 1.5 Deliverable for Phase 1

A short **audit table** (markdown in PR description is fine):

| Route | Signed-out primary CTA location | FunnelCtaLink placements used | Issues found |
|-------|----------------------------------|-------------------------------|--------------|
| … | … | … | … |

---

## Phase 2 — Premium layout & design system (explicit)

### 2.1 Typography and section labels

1. **Audit** all calculator-related headers for **misuse** of `uppercase tracking-wide text-muted` on **marketing H2 / page titles**. Per `veld-ui`, that pattern is for **sidebar groups and table headers only**. For marketing eyebrows, use the **accent-pill** pattern from `veld-landing-cta` / `veld-ui` where appropriate.
2. **H1:** One per page; use marketing L1/L2 levels per skill for public pages.

### 2.2 Surfaces

1. **Hub header** (`tools/page.tsx`): Evaluate whether the current `rounded-xl border ... bg-accent/5` block matches **Panel** rules; adjust to `rounded-xl border border-border bg-card shadow-sm` or documented marketing exception—**no raw hex**.
2. **Calculator panels:** Ensure data-bearing cards use at least **`shadow-sm`** where the spec expects layered depth (`veld-ui` “Layered Depth”).
3. **Local context** block on location pages: align border/bg with **Inset** or **Panel** rules; remove deprecated token opacity shortcuts if touched.

### 2.3 Spacing and width

1. Align **max-width** and **vertical rhythm** between hub, national pages, and location template so the funnel feels **one product family** (not three different templates).
2. **Mobile:** After layout changes, re-check `CalculatorFaqSection`, `MobileCollapsible`, and any calculator footers for **overflow** and **tap targets** (min 44px where `veld-mobile` requires).

---

## Phase 3 — Motion & animation (explicit technical rules)

1. **Prefer CSS** (`@keyframes`, Tailwind `animate-*`, `transition-*`) over new JS animation libraries.
2. **Duration:** Use `duration-150` / `duration-200` for hovers and micro-interactions per `veld-ui`; avoid long decorative loops.
3. **Reduced motion:** Gate decorative motion with `motion-safe:` and/or a shared utility that respects `prefers-reduced-motion` (follow patterns already used on the landing page if present—search for `motion-safe` or `reduce` in `app/`).
4. **No scroll-jacking:** No full-page scroll hijacking; parallax only if subtle and skippable under reduced motion.
5. **CLS:** Do not introduce layout shift on load (no delayed height injection without reserved space).
6. **One accent CTA rule still applies** decorative gradients must not visually compete with the primary button.

**Suggested places to add motion (pick what fits— not all required):**

- Hub: stagger or soft fade-in for hero + `CalculatorsHubCards` (reduced-motion safe).
- National/location: light entrance on page header + first calculator panel.
- Hub cards: `hover:shadow-md transition-shadow duration-150` if cards are interactive links (already partially aligned with `veld-ui` property card pattern).

---

## Phase 4 — Verification (mandatory before merge)

### Automated

1. From `RealEstatePortfolio/app`:

   ```bash
   npm run check
   ```

2. If the repo has lint/typecheck split, run whatever CI runs—**must be green**.

### Manual QA matrix

| Check | Signed-out | Signed-in |
|-------|------------|-----------|
| `/tools` primary CTA visible and usable | ☐ | N/A (or secondary path only) |
| Each national tool: no duplicate competing primaries in one section | ☐ | ☐ |
| Location page: mobile scroll through calculator + FAQ | ☐ | ☐ |
| Keyboard: Tab through primary CTA, links, FAQ | ☐ | ☐ |
| Reduced motion: OS “Reduce motion” on—no nauseating animation | ☐ | ☐ |

### Visual

1. Compare **before/after** screenshots at `sm` (~390px), `md` (~768px), `lg` (~1024px) for hub + one tool page.

---

## Master copy-paste prompt (implementation agent)

Use as the **user message** to the implementing AI (adjust paths if your clone differs).

```
You are executing docs/archive/plans/2026-04-04-calculators-premium-cta-plan.md for Veld Portfolio.

Follow the plan phases in order: Phase 0 → Phase 1 (CTA audit) → Phase 2 (layout/system) → Phase 3 (motion) → Phase 4 (verification).

Read first:
- .cursor/skills/veld-landing-cta/SKILL.md
- .cursor/skills/veld-ui/SKILL.md
- .cursor/skills/veld-mobile/SKILL.md
- app/.agents/product-marketing-context.md

Constraints:
- FunnelCtaLink for primary marketing CTAs; one bg-accent primary per section.
- Design tokens only; fix veld-ui anti-patterns on touched lines.
- prefers-reduced-motion respected; CSS-first motion; no new deps unless unavoidable.
- Do not change calculator math libs unless fixing a real bug.
- Do not edit docs/archive/plans/2026-04-04-calculators-premium-cta-plan.md unless the user asks.

Deliver:
1) Phase 1 audit table (routes × CTAs × issues).
2) Summary of user-facing changes.
3) Files touched.
4) Confirmation npm run check passed.
```

---

## Outcome-based acceptance criteria (reviewer checklist)

- [ ] **CTA:** Signed-out users see a **clear primary** signup path on `/tools` and consistent funnel behavior on all national + sample location + investment-property routes.
- [ ] **Analytics:** New or moved `FunnelCtaLink` instances use **distinct** `placement` / `ctaId` values suitable for ad landing analysis.
- [ ] **Design system:** No raw hex; typography and surfaces match `veld-ui`; no new L4-pattern misuse on marketing headings.
- [ ] **Mobile:** Touch targets and collapsibles work; no overlapping sticky CTAs on small screens.
- [ ] **Motion:** Decorative motion respects `prefers-reduced-motion`; interactions use skill durations.
- [ ] **Stability:** No obvious CLS on calculator load.
- [ ] **Scope:** Changes limited to calculator funnel and shared marketing components—no unrelated refactors.

---

## Recommended AI / workflow

| Role | Recommendation |
|------|------------------|
| Implementation | Strong visual model (e.g. Opus) for layout + motion coherence across many files |
| Orchestration | Cursor Composer for multi-file edits and `npm run check` |
| Follow-up nits | Faster model after main pass |

---

## Optional follow-up (human)

- [ ] Compare one calculator URL to **pricing** and **home** side-by-side at `lg` for family resemblance.
- [ ] If running paid ads, map **UTM or campaign** landing URLs to the new `placement` values in your analytics tool.

---

## Document history

| Date | Note |
|------|------|
| 2026-04-04 | Initial plan: explicit phases, file list, checklists, master prompt |
