# Schema evaluation: ownershipPercent / vacancyPercent (Int → Decimal)

**Date:** 2026-03-19  
**Context:** Data integrity audit; evaluate Prisma schema change for `ownershipPercent` and `vacancyPercent` from `Int` to `Decimal`.

## Current state

- **Property:** `ownershipPercent Int @default(100)`, `vacancyPercent Int @default(5)`
- **SavedDeal:** `ownershipPercent Int @default(100)`, `vacancyPercent Int @default(5)`
- Both are used as percentages (1–100 for ownership, 0–100 for vacancy) in formulas: `scale = ownershipPercent / 100`, `effectiveRent = rent * (1 - vacancyPercent / 100)`.

## Options

### A. Migrate to Decimal

**Pros:** Supports fractional ownership (e.g. 33.33%) and fractional vacancy (e.g. 4.5%). More precise for syndication and reporting.

**Cons:** Migration required; all read/write paths must handle Decimal; UI inputs may need to allow decimals; backward compatibility for existing Int values.

### B. Defer (keep Int)

**Pros:** No migration; current use cases (whole-number percentages) work; simpler codebase.

**Cons:** Cannot represent fractional ownership or vacancy without rounding.

## Decision: **Defer**

**Rationale:**

1. **Current usage:** All UI inputs and formulas use whole numbers. No user-facing need for fractional percentages yet.
2. **Effort vs. value:** Migration touches Property, SavedDeal, API routes, forms, and metrics. High effort for a hypothetical future need.
3. **Revisit when:** User research or product requirements call for fractional ownership (e.g. syndication) or finer vacancy inputs.

## If migrating later

1. Add Prisma migration: `ownershipPercent`, `vacancyPercent` → `Decimal(5, 2)` (supports 0.01–100.00).
2. Update API serialization (Decimal → string/number for JSON).
3. Update forms to accept decimal input; validate range.
4. Update `lib/metrics` and `lib/plans` to handle Decimal or parsed numbers.
5. Backfill: existing Int values migrate as-is (100 → 100.00).
