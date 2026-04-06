-- AlterTable
ALTER TABLE "SavedDeal" ADD COLUMN "bedrooms" INTEGER;
ALTER TABLE "SavedDeal" ADD COLUMN "bathrooms" DECIMAL(4,2);
ALTER TABLE "SavedDeal" ADD COLUMN "squareFeet" INTEGER;
ALTER TABLE "SavedDeal" ADD COLUMN "propertyType" TEXT;
ALTER TABLE "SavedDeal" ADD COLUMN "marketRent" DECIMAL(12,2);
ALTER TABLE "SavedDeal" ADD COLUMN "marketRentAsOf" DATE;
