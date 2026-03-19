# Epic D — Entry-point QA (edit property)

Use this checklist after changes to **`/properties/[id]/edit`**, `property-form.tsx`, or property PATCH validation.

| # | Entry | Expected |
|---|--------|----------|
| 1 | Property detail → **Edit** | Opens edit page; sectioned layout; sticky **Jump to** links scroll to anchors (`#section-location`, etc.). |
| 2 | **Jump to** — each link | Smooth scroll to correct section; headings visible (`scroll-mt-28`). |
| 3 | **Location** — unit mix | Saves and appears on property detail; clearing field clears stored value (PATCH `null`). |
| 4 | **Purchase & value** — order | Matches add flow: purchase/date → value/cash → **ownership** (after cash). |
| 5 | **Save** — valid payload | Returns to property detail; changes persisted. |
| 6 | **Save** — validation error (e.g. bad state) | Banner shows Zod field messages from API `details`, not generic error only. |
| 7 | **Plan limit** (if testable) | `PLAN_LIMIT_REACHED` shows upgrade messaging + link to `/plans`. |
| 8 | **Cancel** | Returns to property detail without save. |

*Last updated: Epic D implementation (sectioned edit + PATCH parity).*
