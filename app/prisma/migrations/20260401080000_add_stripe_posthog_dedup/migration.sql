-- CreateTable
CREATE TABLE "StripePosthogDedup" (
    "eventId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StripePosthogDedup_pkey" PRIMARY KEY ("eventId")
);
