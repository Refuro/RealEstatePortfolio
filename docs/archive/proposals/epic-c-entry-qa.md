# Epic C — Entry-point QA (add property)

Use this checklist after changes to **`/properties/new`**, drafts, or deal prefill (**C3**).

| # | Entry | Expected |
|---|--------|----------|
| 1 | **Sidebar** — Add property / Getting started | Opens `/properties/new`; form loads (sectioned layout, jump links). |
| 2 | **Dashboard** — empty state / “What’s next” add property | Same as above. |
| 3 | **Properties list** — add CTA | Same. |
| 4 | **Onboarding** — “Add first property” | Same; after first save, onboarding redirect still works. |
| 5 | **Deals** — “Add to portfolio” / `?from=<dealId>` | Banner shows; fields prefilled from deal; save creates property. |
| 6 | **Analyze deal** — add to portfolio | Same as (5). |
| 7 | **Draft** — leave mid-flow, “Save draft”, return to `/properties/new` | Restore modal; continuing loads draft and scrolls to **Review**. |
| 8 | **Cancel / navigate away** | Unsaved modal offers save draft / discard (draft context). |
| 9 | **Mortgage** — “No, skip” | Property still creates; mortgage can be added later on detail. |
|10 | **Create property** | Validates all sections; scrolls to first error section; success navigates to property or dashboard (first property). |

*Last updated: Epic C implementation (sectioned add flow).*
