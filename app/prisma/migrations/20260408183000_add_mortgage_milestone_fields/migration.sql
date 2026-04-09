ALTER TABLE "User"
ADD COLUMN "digestEmailsOptedOutAt" TIMESTAMP(3),
ADD COLUMN "mortgageMilestonesSentAt" JSONB;
