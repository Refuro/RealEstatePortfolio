-- CreateTable
CREATE TABLE "SavedDeal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nickname" TEXT,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "purchasePrice" DECIMAL(14,2),
    "currentEstimatedValue" DECIMAL(14,2),
    "currentMonthlyRent" DECIMAL(12,2) NOT NULL,
    "currentMonthlyExpenses" DECIMAL(12,2) NOT NULL,
    "totalMortgageBalance" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "totalMonthlyPayment" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "ownershipPercent" INTEGER NOT NULL DEFAULT 100,
    "vacancyPercent" INTEGER NOT NULL DEFAULT 5,
    "cashInvested" DECIMAL(14,2),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedDeal_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SavedDeal" ADD CONSTRAINT "SavedDeal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
