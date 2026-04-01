# Portfolio CSV export contract

**Last updated:** 2026-03-31

This document describes the `GET /api/export/portfolio` CSV so exports are interpretable and multi-mortgage behavior is explicit.

## Property type

The `property type` column uses **canonical Prisma values**: `single_family`, `condo`, `townhouse`, `manufactured`, `multi_family`, `apartment`. Imports accept friendly labels and map them to these values (see `lib/import/csv-parser.ts`).

## Rent columns

- **`rent`**: Total monthly rent (same basis as in-app `getPropertyTotalRent`).
- **`is rented`**: `yes` / `no` (round-trip with import).
- **`unit rents`**: Pipe-separated per-unit amounts when present (e.g. `1500|1600`), or empty for single total.

## Multi-mortgage semantics

- **`mortgage lien count`**: Number of mortgage rows on the property.
- **`mortgage stored balances (pipe)`**: Each lien’s **stored** `currentBalance` in creation order (`createdAt` ascending), separated by `|`.
- **`mortgage balance (effective)`**: Sum of **effective** balances (amortization-aware) across all liens — matches in-app metrics.
- **`mortgage balance (stored sum)`**: Sum of raw stored balances (same as summing the pipe column).
- **`mortgage rate (first lien)`**, **`mortgage term (first lien)`**, **`escrow amount (first lien)`**, **`lender (first lien)`**, **`balance as of (first lien)`**: Taken from the **first lien** only (by `createdAt`).
- **`monthly payment (all liens sum)`**: Sum of scheduled payments across **all** liens.

Rate/term/lender on additional liens are **not** duplicated as extra columns; use the in-app property detail or future exports if per-lien CSV columns are required.

## Import compatibility

`POST /api/import/portfolio` accepts both legacy column names (e.g. `mortgage rate`) and the new explicit names (e.g. `mortgage rate (first lien)`).

**Headers that match export (single-lien round-trip):** The importer recognizes the same labels the exporter writes for first-lien escrow and aggregate stored balance, including:

- `escrow amount (first lien)` (in addition to `escrow amount` / `escrowAmount`)
- `mortgage balance (stored sum)` (in addition to `mortgage balance`, `mortgage balance (effective)`, `mortgage balance (stored)`)

For a **single-mortgage** property, re-importing your exported row restores the first lien’s escrow and balance fields when those columns are present.

## Round-trip vs lossy matrix

| Scenario | Expected outcome |
|----------|------------------|
| Export → import, **one mortgage** on property | **Round-trip:** Property + first lien fields from CSV align with export (subject to validation rules). Use export column names above for best fidelity. |
| Export → import, **multiple mortgages** on property | **Lossy:** Importer creates **at most one** mortgage from the row; extra liens are not recreated from the CSV. Add additional liens in-app after import, or treat export as reporting-only. |
| `mortgage balance (effective)` vs `(stored sum)` on import | Importer maps both labels into the **single** imported mortgage balance field (first-lien / aggregate column semantics in `csv-parser.ts`). Prefer **`mortgage balance (stored sum)`** when re-importing an export that used that column. |

**Multi-lien round-trip:** Re-importing a CSV that was exported from a property with **multiple mortgages** may not recreate every lien in a single import pass, because the importer typically creates **at most one** mortgage row from the CSV. Use in-app property detail to add additional liens, or treat multi-lien export as **lossy** on re-import until product supports multi-mortgage import.
