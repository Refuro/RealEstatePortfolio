import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { getAppUser, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  getPropertyLimit,
  getDealLimit,
  getEffectiveTier,
  hasTrialExpired,
  isOnTrial,
  trialDaysRemaining,
} from "@/lib/plans";
import { buildOnboardingProgress } from "@/lib/onboarding";
import { AppLayoutClient } from "./app-layout-client";
import { RestoreAccountScreen } from "./restore-account-screen";

/** Authenticated app shell: do not index app routes (supplements robots.txt + auth). */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/** Required for user-specific banner data (property/deal counts, subscription status) and getAppUser(). Child pages need request-time data. */
export const dynamic = "force-dynamic";

/** Revalidate layout counts/subscription every 30 seconds. Banners may be stale within this window. */
const LAYOUT_CACHE_REVALIDATE = 30;

async function getLayoutBannerData(userId: string) {
  return unstable_cache(
    async () => {
      const [propertyCount, dealCount, subscription] = await Promise.all([
        prisma.property.count({ where: { userId } }),
        prisma.savedDeal.count({ where: { userId } }),
        prisma.subscription.findUnique({ where: { userId } }),
      ]);
      return {
        propertyCount,
        dealCount,
        subscriptionStatus: subscription?.status ?? null,
      };
    },
    ["layout-banner", userId],
    { revalidate: LAYOUT_CACHE_REVALIDATE }
  )();
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAppUser();
  if (user?.deletedAt) {
    return <RestoreAccountScreen />;
  }

  let propertyCount = 0;
  let dealCount = 0;
  let propertyLimit = 1;
  let dealLimit = 5;
  let subscriptionStatus: string | null = null;
  let overLimit = false;
  let trialActive = false;
  let trialExpired = false;
  let trialDaysLeft: number | null = null;
  let onboardingProps:
    | {
        welcomeSeenAt: string | null;
        dismissedAt: string | null;
      }
    | undefined;

  if (user) {
    const { propertyCount: pc, dealCount: dc, subscriptionStatus: ss } =
      await getLayoutBannerData(user.id);
    propertyCount = pc;
    dealCount = dc;
    subscriptionStatus = ss;
    propertyLimit = getPropertyLimit(getEffectiveTier(user));
    dealLimit = getDealLimit(getEffectiveTier(user));
    overLimit = propertyCount > propertyLimit || dealCount > dealLimit;
    trialActive = isOnTrial(user);
    trialExpired = hasTrialExpired(user);
    trialDaysLeft = trialDaysRemaining(user);
    onboardingProps = buildOnboardingProgress(user);
  }

  const supportEmail = process.env.SUPPORT_EMAIL ?? null;

  return (
    <AppLayoutClient
      user={user}
      showAdmin={user ? isAdmin(user) : false}
      supportEmail={supportEmail}
      onboardingProps={onboardingProps}
      bannerProps={{
        propertyCount,
        dealCount,
        propertyLimit,
        dealLimit,
        overLimit,
        subscriptionStatus,
        stripeCustomerId: user?.stripeCustomerId ?? null,
        subscriptionTier: user ? getEffectiveTier(user) : "free",
        isOnTrial: trialActive,
        hasTrialExpired: trialExpired,
        trialDaysRemaining: trialDaysLeft,
      }}
    >
      {children}
    </AppLayoutClient>
  );
}
