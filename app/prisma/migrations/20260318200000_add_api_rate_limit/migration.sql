-- CreateTable
CREATE TABLE "ApiRateLimitEntry" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiRateLimitEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ApiRateLimitEntry_identifier_action_createdAt_idx" ON "ApiRateLimitEntry"("identifier", "action", "createdAt");
