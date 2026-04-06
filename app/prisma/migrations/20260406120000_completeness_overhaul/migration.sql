-- Add hasMortgage flag for completeness scoring
ALTER TABLE "Property" ADD COLUMN "hasMortgage" BOOLEAN;

-- Backfill: properties that already have mortgages are marked true
UPDATE "Property" SET "hasMortgage" = true
WHERE id IN (SELECT DISTINCT "propertyId" FROM "Mortgage");

-- Drop unitMix (display-only free-text, replaced by Notes)
ALTER TABLE "Property" DROP COLUMN IF EXISTS "unitMix";
