# Agent tasks

Tasks you want the **builder** agent to do. The PM adds tasks here when you ask; you can say "have the builder complete the tasks in tasks.md" and the PM will run the builder with these tasks.

**Product mantra (all tasks):** Thoughtful, robust, modern, frictionless. See `docs/architecture-and-build-practices.md`.

**Future features / roadmap:** See `docs/roadmap.md`. PM promotes items from there to here when ready to build.

---

## Completed (verified — smoke test passed 2025-03-15)

Pricing update ($15/$29), Website performance, App layout performance, Settings defer Stripe, Code audit follow-ups, Landing page overhaul, Dashboard enhancements, and all Builder tasks. **Full history:** `docs/tasks-archived.md`.

**Mortgage estimate & polish (2025-03-13):** Balance advancement (projected/stored, 6‑month staleness), escrow amount for P&I, amortization steep dropoff fix, import loan type, amortization chart tooltip (month/year + balance). All tasks below marked complete.

**Batch verified 2025-03-15:** Mortgage balance advancement, Escrow amount, Import template (original loan amount), Monthly rent display (single-unit), Import loan type, Amortization chart tooltip, Amortization steep dropoff fix, RentCast plan-based limits, RentCast rate limit messaging, Benchmarking (rent vs market), Estimate buttons (disable when matches last), Benchmarking surfacing (Option A & C), Dashboard Rent vs. market integration, Benchmark refresh inline button, Admin membership override, Settings override display, Sentry error tracking. **Archived:** `docs/tasks-archived.md` (section: Open tasks batch 2025-03-15).

**Code audit follow-ups (2026-03-17):** Benchmark refresh return 502 on RentCast failure; amortization chart tooltip shadow-sm; BenchmarkDisplay refactor to use lib/benchmark-utils.

**Date fields (2026-03-17):** Calendar button visibility — `accent-color` and `color-scheme` on `input[type="date"]` in globals.css.

---

## Roadmap priority (value vs effort — 2025-03-15)

| Order | Item | Effort | Value | Recommendation |
|-------|------|--------|-------|----------------|
| — | Mortgage balance advancement | ✓ Done | — | Balance advancement, escrow, amortization fix, loan type import, chart tooltip. |
| — | Admin membership override | ✓ Done | — | Tier override, admin UI, settings override display. |
| — | Benchmarking | ✓ Done | — | Rent vs market, surfacing on list/dashboard, inline refresh. |
| — | Error tracking (Sentry) | ✓ Done | — | Production error monitoring; set NEXT_PUBLIC_SENTRY_DSN in Vercel. |
| **1** | Refinance / payoff insights | Medium–High | High | Actionable; builds on amortization logic. |
| **2** | Simulation page | High | High | Full modeling; extends scenario concept. |
| **3** | Report section (PDF) | Medium | Medium | Professional output; share with partners/lenders. |
| **4** | Automated testing | High | High | Quality foundation; plan per Module M. |

**Defer:** Rent gap email (cost scales), Referral system (validate first).

---

## Open tasks remaining

**None.** Date fields calendar visibility (Option A) complete. Next: promote from roadmap.

---

*When the builder completes a task, they check it off here and report back. Add new tasks below.*
