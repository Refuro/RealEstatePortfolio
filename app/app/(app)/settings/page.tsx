import { getAppUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getDealLimit, getPropertyLimit } from "@/lib/plans";
import { getStripe } from "@/lib/stripe-config";
import Link from "next/link";
import { BillingPortalButton } from "./billing-portal-button";
import { DeleteAccountSection } from "./delete-account-section";
import { DownloadCsvButton } from "./download-csv-button";
import { ImportCsvSection } from "./import-csv-section";
import { OwnershipDisplayToggle } from "./ownership-display-toggle";
import { ThemeToggle } from "./theme-toggle";

export default async function SettingsPage() {
  const user = await getAppUser();
  if (!user) return null;

  const [subscriptionInitial, propertyCount, dealCount] = await Promise.all([
    prisma.subscription.findUnique({ where: { userId: user.id } }),
    prisma.property.count({ where: { userId: user.id } }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Prisma client may need regenerate (npx prisma generate)
    (prisma as any).savedDeal.count({ where: { userId: user.id } }),
  ]);
  let subscription = subscriptionInitial as typeof subscriptionInitial & { cancelAtPeriodEnd?: boolean | null };

  // Refresh cancel_at_period_end from Stripe when viewing Settings (webhook can be delayed)
  if (subscription?.stripeSubscriptionId) {
    try {
      const stripe = getStripe();
      const stripeSub = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
      // Stripe sets cancel_at_period_end immediately when user cancels in portal
      const willCancel =
        stripeSub.cancel_at_period_end === true ||
        (typeof stripeSub.cancel_at === "number" && stripeSub.cancel_at * 1000 > Date.now());
      if (stripeSub.cancel_at_period_end !== undefined || stripeSub.cancel_at) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Prisma client may need regenerate (npx prisma generate)
        subscription = (await prisma.subscription.update({
          where: { userId: user.id },
          data: { cancelAtPeriodEnd: willCancel } as any,
        })) as typeof subscriptionInitial & { cancelAtPeriodEnd: boolean | null };
      }
    } catch {
      // Use DB value if Stripe fetch fails
    }
  }

  const limit = getPropertyLimit(user.subscriptionTier);
  const canAddMore = propertyCount < limit;
  const dealLimit = getDealLimit(user.subscriptionTier);
  const canAddMoreDeals = dealCount < dealLimit;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
      <p className="mt-2 text-base text-muted">
        Account and billing settings.
      </p>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted mb-4">Appearance</h2>
        <div className="rounded-lg border border-border bg-card p-6">
          <ThemeToggle />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted mb-4">Portfolio display</h2>
        <div className="rounded-lg border border-border bg-card p-6">
          <OwnershipDisplayToggle
            initialMode={((user as { ownershipDisplayMode?: string | null }).ownershipDisplayMode ?? "proportional") as "proportional" | "full_liability"}
          />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted mb-4">Profile</h2>
        <div className="rounded-lg border border-border bg-card p-6">
          <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2 sm:gap-y-3">
            {(user.firstName || user.lastName) && (
              <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-4">
                <dt className="text-sm font-medium text-muted">Name</dt>
                <dd className="text-base font-medium text-foreground">
                  {[user.firstName, user.lastName].filter(Boolean).join(" ")}
                </dd>
              </div>
            )}
            <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-4">
              <dt className="text-sm font-medium text-muted">Email</dt>
              <dd className="text-base font-medium text-foreground">{user.email || "—"}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted mb-4">Plan & billing</h2>
        <div className="rounded-lg border border-border bg-card p-6">
          <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2 sm:gap-y-3">
            <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-4">
              <dt className="text-sm font-medium text-muted">Current plan</dt>
              <dd className="text-base font-medium capitalize text-foreground">
                {user.subscriptionTier}
              </dd>
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-4 sm:col-span-2">
              <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-4">
                <dt className="text-sm font-medium text-muted">Properties</dt>
                <dd className="text-base text-foreground">
                  {propertyCount} / {limit}
                  {!canAddMore && (
                    <span className="ml-1 text-negative">(limit reached)</span>
                  )}
                </dd>
              </div>
              <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-4">
                <dt className="text-sm font-medium text-muted">Saved deals</dt>
                <dd className="text-base text-foreground">
                  {dealCount} / {dealLimit}
                  {!canAddMoreDeals && (
                    <span className="ml-1 text-negative">(limit reached)</span>
                  )}
                  {!canAddMoreDeals && (
                    <span className="ml-1">
                      <Link href="/pricing" className="font-medium text-foreground hover:underline">
                        Upgrade
                      </Link>
                    </span>
                  )}
                </dd>
              </div>
            </div>
            {subscription?.currentPeriodEnd && (
              <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-4">
                <dt className="text-sm font-medium text-muted">
                  {subscription.cancelAtPeriodEnd ? "Plan ends" : "Next billing"}
                </dt>
                <dd className="text-base text-foreground">
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  {subscription.cancelAtPeriodEnd && (
                    <span className="ml-1 text-muted">
                      — You will have full access up until the expiration date
                    </span>
                  )}
                </dd>
              </div>
            )}
          </dl>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/pricing"
              className="rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium hover:bg-subtle"
            >
              {user.subscriptionTier === "free" ? "Upgrade plan" : "Change plan"}
            </Link>
            {user.stripeCustomerId && (
              <BillingPortalButton />
            )}
          </div>
        </div>
      </section>

      <section id="export" className="mt-8 scroll-mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted mb-4">Export your data</h2>
        <div className="rounded-lg border border-border bg-card p-6 space-y-6">
          <p className="text-base text-muted">
            Download your properties and metrics as a CSV file.
          </p>
          <DownloadCsvButton />
          <div className="border-t border-border pt-6">
            <ImportCsvSection />
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted mb-4">Delete account</h2>
        <div className="rounded-lg border border-border bg-card p-6">
          <DeleteAccountSection />
        </div>
      </section>
    </div>
  );
}
