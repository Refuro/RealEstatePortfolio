# Phase 4 — Verification (calculators premium CTA plan)

**Date:** 2026-04-04  
**Plan:** `2026-04-04-calculators-premium-cta-plan.md`

## Automated (completed)

| Command | Result |
|---------|--------|
| `npm run check` (from `RealEstatePortfolio/app`: `prisma migrate deploy`, `next build`, `eslint`) | **Passed** |
| `npm run test` (Vitest — matches `.github/workflows/ci.yml`) | **Passed** (42 files, 301 tests) |

**Note:** GitHub CI runs `npm run lint` + `npm run test` only; production build runs on Vercel per repo docs. Local `npm run check` is the stricter pre-merge gate for this plan.

## HTTP smoke (dev server)

Unauthenticated `GET` to `http://localhost:3000` returned **200** for:

`/tools`, `/tools/brrr`, `/tools/str-vs-ltr`, `/tools/fix-and-flip`, `/investment-property-calculator`, `/tools/brrr/texas`.

## Manual QA matrix (reviewer / human)

Complete before merge:

| Check | Signed-out | Signed-in |
|-------|------------|-----------|
| `/tools` primary CTA visible and usable | ☐ | N/A (or secondary path only) |
| Each national tool: no duplicate competing primaries in one section | ☐ | ☐ |
| Location page: mobile scroll through calculator + FAQ | ☐ | ☐ |
| Keyboard: Tab through primary CTA, links, FAQ | ☐ | ☐ |
| Reduced motion: OS “Reduce motion” on — no heavy or looping animation | ☐ | ☐ |

**Visual (optional but recommended):** Before/after screenshots at ~390px, ~768px, ~1024px for hub + one national tool page.

## Outcome

Automated gates and route smoke tests are green. Manual rows above require a browser (signed-in session, keyboard, and accessibility settings).
