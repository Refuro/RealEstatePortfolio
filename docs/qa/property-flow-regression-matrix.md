# Property flow regression matrix

**When to use:** After meaningful changes to **add property**, **`/properties/[id]/edit`**, **property detail** (Overview / Details tabs), or **shared property APIs**. Also use for release smoke tests when those surfaces are in scope.

Mark rows **Pass / Fail / N/A** when you run the checklist.

**Related entry QA docs:** [`epic-c-entry-qa.md`](../archive/proposals/epic-c-entry-qa.md), [`epic-d-entry-qa.md`](../archive/proposals/epic-d-entry-qa.md), [`epic-e-entry-qa.md`](../archive/proposals/epic-e-entry-qa.md), [`epic-f-overview-qa.md`](../archive/proposals/epic-f-overview-qa.md).

---

## 1. Add property (`/properties/new`)

| # | Scenario | Expected |
|---|----------|----------|
| 1.1 | Sidebar / dashboard / list **Add property** | Opens wizard; sections + jump nav load. |
| 1.2 | **`?from=<dealId>`** | Deal banner; fields prefilled; save creates property. |
| 1.3 | **Mortgage** — “No, skip” | Property still creates; mortgage addable later on detail. |
| 1.4 | **Draft** — save mid-flow, return | Restore works; scroll to Review per C1. |
| 1.5 | **Validation** | Required sections block submit; errors visible. |
| 1.6 | **Plan limit** | `PLAN_LIMIT_REACHED` messaging + `/plans` path. |

---

## 2. Edit property (`/properties/[id]/edit`)

| # | Scenario | Expected |
|---|----------|----------|
| 2.1 | **Jump to** sections (edit mode) | Anchors scroll; sections match add flow order. |
| 2.2 | **Save** valid PATCH | Redirects to property; data persisted. |
| 2.3 | **Validation error** | API `details` surfaced in banner when present. |
| 2.4 | **unitMix / squareFeet** | Save and visible on detail / estimates as applicable. |
| 2.5 | Cancel | Returns to property detail without persisting unsaved server state. |

---

## 3. Property detail — Overview (default `?tab=overview`)

| # | Scenario | Expected |
|---|----------|----------|
| 3.1 | **Hero** | Identity only; KPIs only under Performance at a glance. |
| 3.2 | **Health strip** | Matches Details chips (stale/fresh, benchmark, mortgage warnings). |
| 3.3 | **Inputs at a glance** | Includes rent; links to Details / Edit coherent. |
| 3.4 | **View full property data** | `?tab=details` opens Details tab. |
| 3.5 | Modeling / benchmark CTA | Links work; benchmark refresh when shown. |

---

## 4. Property detail — Details (`?tab=details`)

| # | Scenario | Expected |
|---|----------|----------|
| 4.1 | **Read-only** | No inline PATCH editors for facts/financial/notes. |
| 4.2 | **Edit property** (accent) | Opens `/edit`. |
| 4.3 | **Mortgage** embedded | Add/edit/delete mortgage still functional. |
| 4.4 | Health strip | Same behavior as Overview. |

---

## 5. Cross-route & APIs

| # | Scenario | Expected |
|---|----------|----------|
| 5.1 | **`GET/PATCH /api/properties/[id]`** | Zod validation; ownership-scoped. |
| 5.2 | **Mortgage workspace** (`/mortgage?propertyId=`) | Loads property context. |
| 5.3 | **Modeling** (`/modeling?propertyId=`) | Loads property context. |
| 5.4 | **Tab query** | `tab=details` / `tab=overview` persist; legacy `tab=mortgage` redirects to mortgage workspace. |

---

## 6. Mobile / a11y (spot-check)

| # | Scenario | Expected |
|---|----------|----------|
| 6.1 | Narrow viewport | Tab bar scrolls; no broken layouts on Overview/Details. |
| 6.2 | Primary actions | Edit / section CTAs reachable without horizontal overflow. |

---

*Last updated: 2026-03 — canonical home: `docs/qa/property-flow-regression-matrix.md`.*
