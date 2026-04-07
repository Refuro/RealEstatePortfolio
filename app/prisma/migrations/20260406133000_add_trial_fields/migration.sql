-- Add app-managed reverse trial fields to users.
ALTER TABLE "User"
ADD COLUMN "trialStartedAt" TIMESTAMP(3),
ADD COLUMN "trialEndsAt" TIMESTAMP(3),
ADD COLUMN "trialEmailsSentAt" JSONB;
