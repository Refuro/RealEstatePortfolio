# Growth Funnel & Activation Audit — 2026-03-20

## Executive summary

- **Overall:** Landing (`app/app/page.tsx`) and **pricing** include **product screenshots** (`ScreenDashboard.png`, etc.) — improves comprehension vs text-only. **Clerk** sign-up configured with **`signInUrl="/sign-in"`** and post-sign-up path toward dashboard (env fallbacks documented in tasks for OAuth).
- **Top risks:** **First-run activation** — users must still connect Clerk + DB to experience core value; reduce friction with clear setup docs (`run-and-smoke-test.md`). **SEO** — landing metadata and robots should stay aligned with launch strategy.
- **Recommendation:** Track activation funnel metrics (sign-up → first property) when analytics are live; A/B test hero copy after baseline traffic.

## Severity-ranked findings

### Critical

- *(none)*

### High

- *(none)*

### Medium

- **Activation dependency on env** — Full “aha” moment needs DB + Clerk; public preview may be shallow — document clearly in onboarding. — `docs/setup/run-and-smoke-test.md`

### Low

- **Image weight** — Marketing `<img>` for screenshots — optimize with `next/image` or compressed assets (ties to Performance audit).

## Evidence reviewed

- `app/app/page.tsx`, `app/app/pricing/page.tsx` — screenshots, CTAs
- `app/app/sign-up/[[...sign-up]]/page.tsx`
- `docs/setup/run-and-smoke-test.md` (reference)

## Risk & impact assessment

Growth bottlenecks are mostly **product + positioning**; technical blockers on sign-up path appear resolved for standard Clerk email/OAuth flows when env is correct.

## Recommendations (prioritized)

1. Add **analytics events** for “first property created” when instrumentation ready.
2. Keep **one** canonical “getting started” path linked from dashboard empty state.

## Task candidates (optional)

- [ ] Review **meta tags** / Open Graph for `/` and `/pricing` before public launch.
- [ ] Add lightweight **FAQ** or comparison strip if competitive landing tests warrant it.

## Re-test checklist

- [ ] Logged-out: landing CTA → sign-up → dashboard path (staging).
- [ ] Mobile viewport: landing + pricing readable, CTAs tappable.

## Next trigger and cadence

- **Trigger:** Major marketing push, pricing change, or onboarding redesign.
- **Next window:** Monthly.
