import { getAppUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getPropertyLimit } from "@/lib/plans";
import Link from "next/link";
import { BillingPortalButton } from "./billing-portal-button";

export default async function SettingsPage() {
  const user = await getAppUser();
  if (!user) return null;

  const [subscription, propertyCount] = await Promise.all([
    prisma.subscription.findUnique({ where: { userId: user.id } }),
    prisma.property.count({ where: { userId: user.id } }),
  ]);

  const limit = getPropertyLimit(user.subscriptionTier);
  const canAddMore = propertyCount < limit;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Settings</h1>
      <p className="mt-2 text-zinc-600">
        Account and billing settings.
      </p>

      <section className="mt-8">
        <h2 className="text-lg font-medium text-zinc-900">Plan & billing</h2>
        <div className="mt-3 rounded-lg border border-zinc-200 bg-white p-4">
          <dl className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-zinc-500">Current plan</dt>
              <dd className="font-medium capitalize text-zinc-900">
                {user.subscriptionTier}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Properties</dt>
              <dd className="text-zinc-900">
                {propertyCount} / {limit}
                {!canAddMore && (
                  <span className="ml-1 text-amber-600">(limit reached)</span>
                )}
              </dd>
            </div>
            {subscription?.currentPeriodEnd && (
              <div className="flex justify-between">
                <dt className="text-zinc-500">Period end</dt>
                <dd className="text-zinc-900">
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </dd>
              </div>
            )}
          </dl>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/pricing"
              className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              {user.subscriptionTier === "free" ? "Upgrade plan" : "Change plan"}
            </Link>
            {user.stripeCustomerId && (
              <BillingPortalButton />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
