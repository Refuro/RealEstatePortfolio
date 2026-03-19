# Epic E — Entry-point QA (property Details tab)

Use this checklist after changes to **`details-tab-content.tsx`**, **`mortgage-section.tsx`**, or property **`/edit`**.

| # | Check | Expected |
|---|--------|----------|
| 1 | Property → **Details** tab | **Data & settings** shows read-only summary; **Edit property** button opens `/properties/[id]/edit`. |
| 2 | **Property facts / Financial / Notes** | No **Edit** / **Save** / **Cancel** on each card; values match server data. |
| 3 | **Nickname** (if set) | Shown under Property facts. |
| 4 | **Mortgage terms** | Single card with **Mortgage terms** header + workspace link; **Add mortgage** aligns with section pattern; list rows use compact typography. |
| 5 | **Add / edit / delete mortgage** on Details | Still works; delete still uses browser confirm *(mortgage-specific; not the old triple inline discard)*. |
| 6 | Edit page → save | Returning to Details shows updated values. |

*Last updated: Epic E (read-only Details + mortgage styling parity).*
