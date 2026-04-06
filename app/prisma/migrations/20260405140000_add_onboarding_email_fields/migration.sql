-- AlterTable
ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "onboardingEmailsSentAt" JSONB,
ADD COLUMN IF NOT EXISTS "onboardingEmailsOptedOutAt" TIMESTAMP(3);
