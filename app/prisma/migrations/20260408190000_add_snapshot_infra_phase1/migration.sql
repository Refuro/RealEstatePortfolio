ALTER TABLE "User"
ADD COLUMN "lastActiveAt" TIMESTAMP(3),
ADD COLUMN "digestEmailsSentAt" JSONB;

ALTER TABLE "Property"
ADD COLUMN "estimatedValueAsOf" DATE;

CREATE TABLE "PropertySnapshot" (
  "id" TEXT NOT NULL,
  "propertyId" TEXT NOT NULL,
  "snapshotMonth" DATE NOT NULL,
  "estimatedValue" DECIMAL(14,2) NOT NULL,
  "effectiveMortgageBalance" DECIMAL(14,2) NOT NULL,
  "equity" DECIMAL(14,2) NOT NULL,
  "marketRent" DECIMAL(12,2),
  "monthlyRent" DECIMAL(12,2) NOT NULL,
  "monthlyCashFlow" DECIMAL(12,2) NOT NULL,
  "capRate" DECIMAL(8,6),
  "ltv" DECIMAL(8,6),
  "avmValueRaw" DECIMAL(14,2),
  "avmRentRaw" DECIMAL(12,2),
  "avmValueApplied" BOOLEAN NOT NULL DEFAULT false,
  "avmRentApplied" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PropertySnapshot_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PropertySnapshot_propertyId_snapshotMonth_key" ON "PropertySnapshot"("propertyId", "snapshotMonth");
CREATE INDEX "PropertySnapshot_propertyId_idx" ON "PropertySnapshot"("propertyId");

ALTER TABLE "PropertySnapshot"
ADD CONSTRAINT "PropertySnapshot_propertyId_fkey"
FOREIGN KEY ("propertyId") REFERENCES "Property"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

UPDATE "User"
SET "lastActiveAt" = "updatedAt"
WHERE "lastActiveAt" IS NULL;
