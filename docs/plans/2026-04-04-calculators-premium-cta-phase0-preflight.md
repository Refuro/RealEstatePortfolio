# Phase 0 — Pre-flight (calculators premium CTA plan)

**Date:** 2026-04-04  
**Plan:** `2026-04-04-calculators-premium-cta-plan.md`

## 1. Governance reads (completed)

Full read (not skim) of:

- `.cursor/skills/veld-landing-cta/SKILL.md` — CTA rules, `FunnelCtaLink`, one loud action, calculator as marketing asset, no `→` literals, primary copy (“Get started free” / “Create free account”).
- `.cursor/skills/veld-ui/SKILL.md` — tokens, Panel/Inset, L4 only for sidebar/table headers, motion durations, anti-patterns (`border-border/70`, `bg-card/95`).
- `.cursor/skills/veld-mobile/SKILL.md` — `md` breakpoint, `MobileToolShell`, 44px touch targets, safe area, SSR note for `useIsMobile`.
- `app/.agents/product-marketing-context.md` — positioning, tiers, funnel, no invented features.
- `docs/design/design-spec-2026.md` — pillars, motion table, reduced motion, surfaces.

## 2. Routes — automated check (dev server)

Against `http://localhost:3000` after `npm run dev`, unauthenticated `GET` returned **200** for:

| Route | Status |
|-------|--------|
| `/tools` | 200 |
| `/tools/brrr` | 200 |
| `/tools/str-vs-ltr` | 200 |
| `/tools/fix-and-flip` | 200 |
| `/investment-property-calculator` | 200 |
| `/tools/brrr/texas` | 200 |

## 3. Signed-out vs signed-in (browser)

- **Signed-out:** Covered for route availability and successful render via the checks above (public pages, no auth required for HTTP 200).
- **Signed-in:** Not automated here. **Manual:** open the same URLs in a logged-in window or second profile and confirm nav shows Dashboard (or equivalent) and calculator CTAs behave as expected (Phase 1 checklist).

## 4. Quality gate

From `RealEstatePortfolio/app`:

```bash
npm run check
```

**Result:** **Passed** (`prisma migrate deploy`, `next build`, `eslint` — exit code 0).

## 5. Screenshots (optional)

Not captured in this pre-flight. Recommended before Phase 2 visual work: hub at `sm` and `md`; one national tool at `sm` and `lg`; one location page at `sm`.

## 6. Ready for Phase 1

No blockers. Proceed to CTA and funnel audit (plan Phase 1).
