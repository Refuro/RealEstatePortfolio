-- Add mortgagePaidOff flag for the four-state mortgage UX (active / paid off / never financed / unknown).
-- Per claudeCode/PropertyRedesign decision #4 — additive boolean alongside existing hasMortgage.
-- IF NOT EXISTS keeps this idempotent on dev DBs that may already carry the column from `db push`.
ALTER TABLE "Property"
  ADD COLUMN IF NOT EXISTS "mortgagePaidOff" BOOLEAN NOT NULL DEFAULT false;
