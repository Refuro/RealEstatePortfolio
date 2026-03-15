-- CreateTable
CREATE TABLE "RentCastApiCall" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "propertyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RentCastApiCall_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RentCastApiCall" ADD CONSTRAINT "RentCastApiCall_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
