-- AlterTable
ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "onboardingWelcomeSeenAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "onboardingDismissedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "onboardingModeledAt" TIMESTAMP(3);
