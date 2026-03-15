-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "bathrooms" DECIMAL(4,2),
ADD COLUMN     "bedrooms" INTEGER,
ADD COLUMN     "unitMix" TEXT,
ADD COLUMN     "unitRents" JSONB;
