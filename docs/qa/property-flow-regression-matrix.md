# Property flow regression matrix

**When to use:** After meaningful changes to **add property**, **property detail** (`/properties/[id]` — scroll layout + **edit drawer**), **modeling / mortgage / refinance** workspaces, or **shared property APIs**. Also use for release smoke tests when those surfaces are in scope.

Mark rows **Pass / Fail / N/A** when you run the checklist.

**Related entry QA docs:** `epic-c-entry-qa.md` (internal doc, not in public repo), `epic-d-entry-qa.md` (internal doc, not in public repo), `epic-e-entry-qa.md` (internal doc, not in public repo), `epic-f-overview-qa.md` (internal doc, not in public repo).

---

## 1. Add property (`/properties/new`)

| # | Scenario | Expected |
|---|----------|----------|
| 1.1 | List / dashboard **Add property** (and related entry points) | Opens wizard; sections + jump nav load. |
| 1.2 | **`?from=<dealId>`** | Deal banner; fields prefilled; save creates property. |
| 1.3 | **Mortgage** — “No, skip” | Property still creates; mortgage addable later on detail. |
| 1.4 | **Draft** — save mid-flow, return | Restore works; scroll to Review per C1. |
| 1.5 | **Validation** | Required sections block submit; errors visible. |
| 1.6 | **Plan limit** | `PLAN_LIMIT_REACHED` messaging + `/plans` path. |

---

## 2. Property detail — edit drawer (`/properties/[id]` + `?edit=`)

Edits use the **side drawer** (query `edit` + optional `wizard`), not a separate `/edit` route.

| # | Scenario | Expected |
|---|----------|----------|
| 2.1 | **Open sections** | “Edit” on Property facts / Financial inputs / Mortgage opens drawer with correct section; URL reflects `?edit=` (and `wizard=1` when applicable). |
| 2.2 | **Save** valid PATCH from drawer | Drawer closes or stays consistent; detail cards reflect persisted data after refresh/navigation. |
| 2.3 | **Validation error** | API `details` surfaced in UI when present. |
| 2.4 | **unitMix / squareFeet** (and home profile fields) | Save and visible on detail / metrics as applicable. |
| 2.5 | **Cancel / dismiss drawer** | No partial server state without explicit save (client state may discard). |

---

## 3. Property detail — scroll layout (default view)

| # | Scenario | Expected |
|---|----------|----------|
| 3.1 | **Hero** | Address / identity, status, ownership; actions differ desktop vs mobile (overflow menu on narrow). |
| 3.2 | **KPI strip** | Cash flow, equity, value (desktop), cap rate, DSCR — readable; mobile hides non-essential KPIs per design. |
| 3.3 | **Completion card** (if score &lt; 100) | Sections and “Continue” flow match completeness model. |
| 3.4 | **Property facts / Financial inputs / Mortgage** cards | Read-only presentation on page; edit affordances open drawer. |
| 3.5 | **Performance + Data freshness** | Benchmark / rent vs market / refresh controls behave; aligns with policies for labels. |
| 3.6 | **Open in Modeling / Refinance** | Links include `propertyId`; destinations load context. |

---

## 4. Property detail — mortgage & quick paths

| # | Scenario | Expected |
|---|----------|----------|
| 4.1 | **Mortgage section** on detail | Summary + link to full workspace; add/edit via drawer as designed. |
| 4.2 | **`/properties/[id]/mortgage/quick`** (if in scope) | Quick flow still coherent with main property. |

---

## 5. Cross-route & APIs

| # | Scenario | Expected |
|---|----------|----------|
| 5.1 | **`GET/PATCH /api/properties/[id]`** | Zod validation; ownership-scoped. |
| 5.2 | **Mortgage workspace** (`/mortgage?propertyId=`) | Loads property context. |
| 5.3 | **Modeling** (`/modeling?propertyId=`) | Loads property context. |
| 5.4 | **Refinance** (`/refinance?propertyId=`) | Loads property context. |
| 5.5 | **Legacy query params** | Old `?tab=overview` / `?tab=details` URLs (bookmarks) do not break the page; detail is a **single scroll** — no tab UI required. |

---

## 6. Mobile / a11y (spot-check)

| # | Scenario | Expected |
|---|----------|----------|
| 6.1 | Narrow viewport | **Mobile bottom nav:** Dashboard, Properties, Analyze, **More** (opens full menu) — `md:hidden`; property detail scrolls without broken two-column overflow. |
| 6.2 | Primary actions | Drawer triggers, overflow menu (modeling/refinance/delete), and CTAs reachable without horizontal overflow. |

---

*Last updated: 2026-04-30 — aligned with `app/app/(app)/` shell + property detail drawer. Canonical home: `docs/qa/property-flow-regression-matrix.md`.*
