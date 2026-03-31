# Portfolio CSV export contract

**Last updated:** 2026-03-28

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

**Multi-lien round-trip:** Re-importing a CSV that was exported from a property with **multiple mortgages** may not recreate every lien in a single import pass, because the importer typically creates **at most one** mortgage row from the CSV. Use in-app property detail to add additional liens, or treat multi-lien export as **lossy** on re-import until product supports multi-mortgage import.
