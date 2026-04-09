-- Add ownership basis fields to PropertySnapshot for display-mode re-derivation (DI-0409-1)
-- ownershipPct: fraction at snapshot time (ownershipPercent / 100). NULL = legacy row → treat as 1.0
-- monthlyPayment: total monthly mortgage payment. Required to re-derive full-liability cash flow.
-- IF NOT EXISTS makes this idempotent: safe on dev (columns exist via db push) and on prod (columns missing).
ALTER TABLE "PropertySnapshot" ADD COLUMN IF NOT EXISTS "ownershipPct" DOUBLE PRECISION;
ALTER TABLE "PropertySnapshot" ADD COLUMN IF NOT EXISTS "monthlyPayment" DECIMAL(12,2);
