-- AlterTable
ALTER TABLE "User" ADD COLUMN     "onboardingChecklistDismissedAt" TIMESTAMP(3),
ADD COLUMN     "onboardingDismissedAt" TIMESTAMP(3),
ADD COLUMN     "onboardingRanScenarioAt" TIMESTAMP(3);
