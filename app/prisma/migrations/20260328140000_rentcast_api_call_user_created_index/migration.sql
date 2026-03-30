-- Improve hourly quota counts: WHERE userId = ? AND createdAt >= ?
CREATE INDEX "RentCastApiCall_userId_createdAt_idx" ON "RentCastApiCall"("userId", "createdAt");
