ALTER TABLE "RentCastApiCall"
ADD COLUMN "userEmail" TEXT;

ALTER TABLE "RentCastApiCall"
ALTER COLUMN "userId" DROP NOT NULL;

ALTER TABLE "RentCastApiCall"
DROP CONSTRAINT "RentCastApiCall_userId_fkey";

ALTER TABLE "RentCastApiCall"
ADD CONSTRAINT "RentCastApiCall_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

UPDATE "RentCastApiCall"
SET "userEmail" = "User"."email"
FROM "User"
WHERE "RentCastApiCall"."userId" = "User"."id";
