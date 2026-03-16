import { getAppUser, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getPropertyLimit, getDealLimit } from "@/lib/plans";
import { AppLayoutClient } from "./app-layout-client";
import { RestoreAccountScreen } from "./restore-account-screen";

export const dynamic = "force-dynamic";

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

  if (user) {
    [propertyCount, dealCount] = await Promise.all([
      prisma.property.count({ where: { userId: user.id } }),
      prisma.savedDeal.count({ where: { userId: user.id } }),
    ]);
    propertyLimit = getPropertyLimit(user.subscriptionTier ?? "free");
    dealLimit = getDealLimit(user.subscriptionTier ?? "free");
    overLimit = propertyCount > propertyLimit || dealCount > dealLimit;

    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });
    subscriptionStatus = subscription?.status ?? null;
  }

  const supportEmail = process.env.SUPPORT_EMAIL ?? null;

  return (
    <AppLayoutClient
      user={user}
      showAdmin={user ? isAdmin(user) : false}
      supportEmail={supportEmail}
      bannerProps={{
        propertyCount,
        dealCount,
        propertyLimit,
        dealLimit,
        overLimit,
        subscriptionStatus,
        stripeCustomerId: user?.stripeCustomerId ?? null,
        subscriptionTier: user?.subscriptionTier ?? "free",
      }}
    >
      {children}
    </AppLayoutClient>
  );
}
