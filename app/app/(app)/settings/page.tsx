import { getAppUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSubscriptionDetails } from "@/lib/billing/get-subscription-details";
import {
  getDealLimit,
  getPropertyLimit,
  getEffectiveTier,
  isOnTrial,
  trialDaysRemaining,
} from "@/lib/plans";
import Link from "next/link";
import { BillingPortalButton } from "./billing-portal-button";
import { SubscriptionBillingDisplay } from "@/app/(app)/settings/subscription-billing-display";
import { DeleteAccountSection } from "./delete-account-section";
import { DownloadCsvButton } from "./download-csv-button";
import { ImportCsvSection } from "./import-csv-section";
import { ThemeToggle } from "./theme-toggle";
import { CookiePreferencesSection } from "./cookie-preferences-section";

export default async function SettingsPage() {
  const user = await getAppUser();
  if (!user) return null;

  const [subscriptionDetails, propertyCount, dealCount] = await Promise.all([
    getSubscriptionDetails(user.id),
    prisma.property.count({ where: { userId: user.id } }),
    prisma.savedDeal.count({ where: { userId: user.id } }),
  ]);

  const effectiveTier = getEffectiveTier(user);
  const userOnTrial = isOnTrial(user);
  const daysRemaining = trialDaysRemaining(user);
  const hasOverride = !!(user as { subscriptionTierOverride?: string | null }).subscriptionTierOverride;
  const limit = getPropertyLimit(effectiveTier);
  const canAddMore = propertyCount < limit;
  const dealLimit = getDealLimit(effectiveTier);
  const canAddMoreDeals = dealCount < dealLimit;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
      <p className="mt-2 text-base text-muted">
        Account and billing settings.
      </p>

      <section className="mt-6 grid gap-3 md:hidden">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="text-sm font-medium text-muted">
            Account snapshot
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-border bg-subtle/40 px-3 py-2">
              <p className="text-[11px] font-medium text-muted">
                Plan
              </p>
              <p className="mt-1 text-sm font-medium capitalize text-foreground">
                {userOnTrial ? "Investor (trial)" : effectiveTier}
              </p>
              {userOnTrial && daysRemaining != null && (
                <p className="mt-0.5 text-[10px] font-medium text-muted">
                  {daysRemaining} {daysRemaining === 1 ? "day" : "days"} remaining
                </p>
              )}
            </div>
            <div className="rounded-xl border border-border bg-subtle/40 px-3 py-2">
              <p className="text-[11px] font-medium text-muted">
                Email
              </p>
              <p className="mt-1 truncate text-sm font-medium text-foreground">
                {user.email || "—"}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-subtle/40 px-3 py-2">
              <p className="text-[11px] font-medium text-muted">
                Properties
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {propertyCount} / {limit}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-subtle/40 px-3 py-2">
              <p className="text-[11px] font-medium text-muted">
                Saved deals
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {dealCount} / {dealLimit}
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href="/plans"
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-subtle"
            >
              Plans & billing
            </Link>
            <Link
              href="#export"
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-subtle"
            >
              Export data
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-6">
        <p className="mb-3 text-sm font-medium text-muted">Privacy</p>
        <CookiePreferencesSection />
      </section>

      <div className="mt-6 rounded-xl border border-border bg-card shadow-sm">
        <div className="px-4 py-4 md:px-6 md:py-5">
          <p className="mb-3 text-sm font-medium text-muted">Appearance</p>
          <ThemeToggle />
        </div>
        <div className="border-t border-border px-4 py-4 md:px-6 md:py-5">
          <p className="mb-3 text-sm font-medium text-muted">Profile</p>
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
      </div>

      <section className="mt-6">
        <p className="mb-3 text-sm font-medium text-muted">Plan & billing</p>
        <div className="rounded-xl border border-border bg-card px-4 py-4 shadow-sm md:px-6 md:py-5">
          <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2 sm:gap-y-3">
            <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-4">
              <dt className="text-sm font-medium text-muted">Current plan</dt>
              <dd className="text-base capitalize text-foreground">
                <span className="font-medium">
                  {userOnTrial && daysRemaining != null
                    ? `Investor (trial) · ${daysRemaining} ${daysRemaining === 1 ? "day" : "days"} remaining`
                    : effectiveTier}
                </span>
                {hasOverride && " (admin override)"}
                {subscriptionDetails.cancelAtPeriodEnd && (
                  <span className="ml-2 inline-flex rounded-full border border-warning/35 bg-warning/10 px-2 py-0.5 text-xs font-medium normal-case text-warning">
                    Cancels at period end
                  </span>
                )}
              </dd>
            </div>
            {hasOverride && (
              <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-4">
                <dt className="text-sm font-medium text-muted">Underlying plan</dt>
                <dd className="text-base font-medium capitalize text-foreground">
                  {(user.subscriptionTier ?? "free").toLowerCase()}
                </dd>
              </div>
            )}
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
                      <Link href="/plans" className="font-medium text-foreground hover:underline">
                        Upgrade
                      </Link>
                    </span>
                  )}
                </dd>
              </div>
            </div>
            {subscriptionDetails.currentPeriodEnd && (
              <SubscriptionBillingDisplay
                currentPeriodEnd={subscriptionDetails.currentPeriodEnd}
                cancelAtPeriodEnd={subscriptionDetails.cancelAtPeriodEnd}
              />
            )}
          </dl>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/plans"
              className="inline-flex min-h-[44px] items-center rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium hover:bg-subtle"
            >
              {effectiveTier === "free" ? "Upgrade plan" : "Change plan"}
            </Link>
            {user.stripeCustomerId && (
              <BillingPortalButton />
            )}
          </div>
        </div>
      </section>

      <section id="export" className="mt-6 scroll-mt-8">
        <p className="mb-3 text-sm font-medium text-muted">Your data</p>
        <div className="space-y-6 rounded-xl border border-border bg-card px-4 py-4 shadow-sm md:px-6 md:py-5">
          <p className="text-base text-muted">
            Download your properties and metrics as a CSV file.
          </p>
          <DownloadCsvButton />
          <div className="border-t border-border pt-6">
            <ImportCsvSection />
          </div>
        </div>
      </section>

      <section className="mt-6">
        <p className="mb-3 text-sm font-medium text-muted">Delete account</p>
        <div className="rounded-xl border border-negative/20 bg-card px-4 py-4 shadow-sm md:px-6 md:py-5">
          <DeleteAccountSection />
        </div>
      </section>
    </div>
  );
}
