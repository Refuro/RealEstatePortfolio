# Epic F — Entry-point QA (property Overview tab)

Use this checklist after changes to **`overview-tab-content.tsx`**, **`property-hero.tsx`**, **`property-health-strip.tsx`**, or **`property-detail-tabs.tsx`**.

| # | Check | Expected |
|---|--------|----------|
| 1 | Open **`/properties/[id]`** (default tab) | **Overview** shows intro, primary **Edit property**, link **View full property data (Details tab)**. |
| 2 | **PropertyHero** | Title + address only—**no** duplicate KPI grid under the hero. |
| 3 | **Last updated / chips** | Same health strip as **Details** tab (stale/fresh, benchmark, mortgage warnings). |
| 4 | **Inputs at a glance** | Includes **monthly rent** with purchase/expenses; mortgage column unchanged; links to Details and Edit in intro copy. |
| 5 | **Performance at a glance** | Single **4-KPI** row (cash flow, DSCR, equity, LTV); **Show supporting metrics** still expands. |
| 6 | **Details tab** link | `?tab=details` opens read-only ledger; returning to Overview works. |
| 7 | **Modeling** / **Refresh benchmark** | Still present below health strip when applicable. |

*Last updated: Epic F (Overview facelift + shared health strip).*
