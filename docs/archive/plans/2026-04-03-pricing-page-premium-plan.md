# Pricing Page — Premium Polish & Motion (Open-Ended Plan)

**Created:** 2026-04-03  
**Status:** Planning / handoff  
**Primary scope:** `app/app/pricing/page.tsx` and any components it composes (e.g. `components/pricing-cards.tsx`, `components/footer.tsx`, `components/landing-nav.tsx`, shared marketing utilities).  
**Governance:** Read and follow `.cursor/skills/veld-ui/SKILL.md`, `.cursor/skills/veld-mobile/SKILL.md`, and `docs/design/design-spec-2026.md` (sections on motion, surfaces, typography). For CTA copy and funnel behavior, align with `.cursor/skills/veld-landing-cta/SKILL.md` where it applies to marketing surfaces.

---

## Intent

Elevate the **pricing** experience so it feels as intentional and polished as the landing page: confident typography, clear hierarchy, subtle motion that rewards attention without distraction, and a sense of **premium product quality**—without prescribing exactly which lines of code change.

This plan is **open-ended by design**: the implementing AI should **audit the live page and related components**, decide what deserves improvement, and implement a coherent set of changes that fit Veld’s design system and audience (small passive landlords).

---

## What this plan does *not* do

- It does **not** list mandatory edits (e.g. “add X animation on Y element”).
- It does **not** replace product or legal copy unless the AI finds a clear inconsistency with skills or spec.
- It does **not** mandate a specific library (Framer Motion, CSS-only, etc.)—choose what fits the repo and bundle budget.

---

## Dimensions to explore (AI decides specifics)

The AI should treat these as **lenses**, not a checklist. Skip or combine areas as needed for a unified result.

### A. Motion & animation (value-add, not noise)

Examples of *categories* the AI might consider—**only where they improve clarity or delight**:

- **Entrance:** Staggered or sequenced reveals for hero headline, trust chips, and pricing cards (respecting `prefers-reduced-motion`).
- **Scroll:** Light section affordances (e.g. comparison table or FAQ) that feel “alive” without hijacking scroll.
- **Interaction:** Micro-feedback on plan selection, billing toggle, or focusable rows—aligned with `veld-ui` motion durations (`duration-150` / `duration-200` patterns).
- **Decorative:** Very subtle gradients, mesh, or accent glows that reinforce brand—**one loud accent CTA per screen** rule still applies.

### B. Premium feel (non-animation)

Examples of *directions*—pick what the page actually needs:

- **Spatial rhythm:** Vertical spacing, max-width alignment, and breakpoint behavior so the page breathes like a flagship marketing URL.
- **Surface hierarchy:** Cards, table, FAQ, and footer blocks should read as a clear stack (Panel vs inset per skill).
- **Trust & clarity:** Chips, comparison table, and legal footnote should feel integrated, not bolted on.
- **Signed-in vs signed-out:** The AI should tune empty states, messaging, and CTAs so both modes feel considered.

### C. Technical quality

- No layout shift on load; mockup frames and dynamic content should remain stable.
- Accessibility: focus states, headings, table semantics, `aria` where appropriate.
- Performance: prefer CSS and existing patterns over heavy JS unless justified.

---

## Recommended AI for execution

| Option | When to use |
|--------|-------------|
| **Opus 4.6** | **Default recommendation** for this task: taste-heavy layout/motion decisions, multi-file coherence, and strict adherence to design tokens. Best when you want one pass that feels “designed,” not just “implemented.” |
| **Sonnet 4.6** | Faster iteration when you already have a short list of concrete edits; slightly higher risk of approximating token-perfect details. |
| **GPT 5.3 Codex** | Strong for refactors across many files or long agentic runs; pair with a design review pass if visual fidelity is paramount. |
| **Grok 4.20** | Large context is less important here than visual judgment; optional for research-heavy passes, not first choice for UI polish. |
| **Composer 2 (Cursor)** | Use as the **orchestrator** (multi-file edits, terminal, preview)—model choice inside Composer should still follow the table above (prefer **Opus 4.6** for the actual implementation pass). |

**Suggested workflow:** Run the prompt below in **Composer 2** with **Opus 4.6** (or your strongest visual model) for the implementation; use a faster model only for follow-up nits if needed.

---

## Copy-paste prompt for the implementing AI

Use everything below as the user message (adjust dates/paths if your workspace differs).

```
You are improving the Veld Portfolio pricing page to feel premium and next-level in quality.

Context:
- App route: RealEstatePortfolio/app/app/pricing/page.tsx
- Related components may include pricing-cards, landing-nav, footer, mockups, globals.css
- Read and follow: .cursor/skills/veld-ui/SKILL.md, .cursor/skills/veld-mobile/SKILL.md, docs/design/design-spec-2026.md (motion + surfaces). For marketing CTAs and funnel patterns, align with .cursor/skills/veld-landing-cta/SKILL.md where applicable.

Goals (open-ended — YOU decide what to change):
1) Audit the pricing page (signed-in and signed-out states) and any components it uses. Identify where layout, hierarchy, motion, or interaction fall short of a flagship SaaS pricing experience.
2) Propose and implement a coherent set of improvements: subtle, tasteful animations and/or micro-interactions where they add clarity or delight; premium-feeling spacing, surfaces, typography, and trust presentation where they matter more than motion.
3) Respect prefers-reduced-motion. No gratuitous animation. No new loud CTAs beyond what skills allow (one primary accent CTA per screen where applicable).
4) Stay within design tokens — no raw hex. Fix deprecated patterns called out in veld-ui (e.g. border-border/70, bg-card/95) if you touch those lines.
5) Preserve existing behavior: auth flows, links to terms, PricingCards billing behavior, and analytics/plan intent wiring.

Deliver:
- Brief summary of what you changed and why (user-facing impact).
- List of files touched.
- Note anything you intentionally did NOT change and why.

Do not edit this plan markdown file unless the user asks. Mark todos if the environment provides them.
```

---

## Outcome-based acceptance criteria (for the human reviewer)

After implementation, the page should satisfy:

- [ ] **Motion:** Any new motion is gated for `prefers-reduced-motion` and feels intentional, not busy.
- [ ] **Design system:** Changes align with `veld-ui` tokens and typography levels; no new anti-patterns introduced.
- [ ] **Mobile:** Layout is solid at common breakpoints; touch targets remain adequate per `veld-mobile`.
- [ ] **Conversion & trust:** Plan comparison, FAQ, and legal footnote remain clear; CTAs remain trackable and skill-compliant.
- [ ] **Stability:** No obvious CLS or hydration flash on pricing or mockup sections.
- [ ] **Scope discipline:** Edits are proportional to the goal—no unrelated refactors.

---

## Optional follow-up (human)

- Side-by-side screenshot pass at `md` and `lg` widths.
- Quick keyboard pass: tab through plans, FAQ, and footer links.

---

## Document history

| Date | Note |
|------|------|
| 2026-04-03 | Initial open-ended plan + AI prompt + model guidance |
