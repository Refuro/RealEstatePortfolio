# Phase 1 — CTA & funnel audit (complete)

**Date:** 2026-04-04  
**Plan:** `2026-04-04-calculators-premium-cta-plan.md`

## Audit table (post-fix)

| Route | Signed-out primary CTA location | FunnelCtaLink placements used | Issues found / resolved |
|-------|----------------------------------|-------------------------------|-------------------------|
| `/tools` | Hero: **Get started free** (`tools_hub_hero` / `get_started_free`); nav: existing `landing_nav` sign up | `tools_hub_hero`, `landing_nav` (nav unchanged) | **Fixed:** No hero primary before; hub cards used literal `→` and `bg-card/95`. |
| `/tools/brrr` | Inline results: BRRRR-specific copy; footer strip: **Get started free** | `brrr_inline`, `brrr_footer`; secondary `pricing` link is plain `Link` | **Fixed:** Footer was generic `calculator_footer`; placements renamed; copy aligned to **Get started free**; `landingVariant` on footer. |
| `/tools/str-vs-ltr` | Inline: **Create a free account** + text investor path; footer: **Get started free** | `str_ltr_inline` (free + investor intent rows), `str_ltr_footer` | **Fixed:** Same footer/placement/copy as BRRRR pattern; primary `ctaId` standardized to `get_started_free` for free tier. |
| `/tools/fix-and-flip` | Inline + footer same pattern as STR | `fix_flip_inline`, `fix_flip_footer` | **Fixed:** Same as above. |
| `/tools/[calculator]/[location]` | Per embedded calculator (`showCta`); investment-property branch uses `investment_property_location_inline` | `brrr_inline`, `str_ltr_inline`, `fix_flip_inline`, or `investment_property_location_inline` | **Fixed:** Location header eyebrow was L4-style uppercase; local-context label tightened to `text-xs font-medium` (inset title). No extra footer strip (by design—national tools carry footer; location pages rely on inline + nav). |
| `/investment-property-calculator` | Inline: **Create a free account**; footer strip: **Get started free** (parity with other national tools) | `investment_property_inline`, `investment_property_footer` | **Fixed:** Missing above-the-fold-style primary path vs other national pages; body `FunnelCtaLink` removed in favor of footer + calculator; eyebrow replaced with accent pill; `funnelPlacement` for SEO page. |

## Global rules verified

- Primary signup actions use **`FunnelCtaLink`** with distinct **`placement`** values per surface.
- Primary button copy uses **Get started free** (footers) or **Create a free account** (STR / fix-and-flip / public calculator inline—allowed alternatives per `veld-landing-cta`).
- **BRRRR** inline keeps product copy **Track this property in Veld after you close** with `ctaId` **`get_started_free`** for consistent free-tier tracking.
- **One loud `bg-accent` per logical block** preserved (nav vs hero vs calculator vs footer are separate sections).
- Hub card links use **`<ChevronRight />`**, not literal arrows.
- Calculator **math** unchanged.

## Files touched

- `app/app/tools/page.tsx`
- `app/app/tools/brrr/page.tsx`
- `app/app/tools/str-vs-ltr/page.tsx`
- `app/app/tools/fix-and-flip/page.tsx`
- `app/app/investment-property-calculator/page.tsx`
- `app/components/calculators/calculators-hub-cards.tsx`
- `app/components/marketing/brrr-calculator.tsx`
- `app/components/marketing/str-ltr-calculator.tsx`
- `app/components/marketing/fix-and-flip-calculator.tsx`
- `app/components/marketing/public-calculator.tsx`
- `app/components/marketing/calculator-location-page.tsx`

## Verification

`npm run check` (from `RealEstatePortfolio/app`) passed after changes.
