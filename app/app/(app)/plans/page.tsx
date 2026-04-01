import type { Metadata } from "next";
import { getAppUser } from "@/lib/auth";
import { getDealLimit, getEffectiveTier, getPropertyLimit } from "@/lib/plans";
import { PricingCards } from "@/components/pricing-cards";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { BillingPortalButton } from "../settings/billing-portal-button";

export const metadata: Metadata = {
  title: "Plans & billing",
  description:
    "Veld Portfolio plans: property and saved-deal limits by tier (Free, Investor, Pro). Upgrade for more capacity.",
};

export default async function PlansPage() {
  const user = await getAppUser();
  const effectiveTier = user ? getEffectiveTier(user) : "free";

  const [propertyCount, dealCount, subscription] = user
    ? await Promise.all([
        prisma.property.count({ where: { userId: user.id } }),
        prisma.savedDeal.count({ where: { userId: user.id } }),
        prisma.subscription.findUnique({ where: { userId: user.id } }),
      ])
    : [0, 0, null];
  const propertyLimit = getPropertyLimit(effectiveTier);
  const dealLimit = getDealLimit(effectiveTier);
  const periodEndLabel = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Plans & billing</h1>
      <p className="mt-1 text-base text-muted">
        Each tier includes limits on{" "}
        <span className="font-medium text-foreground">tracked properties</span> and{" "}
        <span className="font-medium text-foreground">saved deals</span> from the Deal Analyzer.
        Pick the cap that fits your portfolio.
      </p>
      {user && (
        <div className="mt-4 rounded-xl border border-border/70 bg-card/95 p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Plan context
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm sm:flex sm:flex-wrap">
                <span className="rounded-md border border-border/70 bg-background/45 px-2.5 py-1 text-muted">
                  Plan: <span className="font-medium capitalize text-foreground">{effectiveTier}</span>
                </span>
                <span className="rounded-md border border-border/70 bg-background/45 px-2.5 py-1 text-muted">
                  Properties:{" "}
                  <span className="font-medium text-foreground">
                    {propertyCount}/{propertyLimit}
                  </span>
                </span>
                <span className="rounded-md border border-border/70 bg-background/45 px-2.5 py-1 text-muted">
                  Saved deals:{" "}
                  <span className="font-medium text-foreground">
                    {dealCount}/{dealLimit}
                  </span>
                </span>
                {subscription?.status && (
                  <span className="rounded-md border border-border/70 bg-background/45 px-2.5 py-1 text-muted">
                    Billing:{" "}
                    <span className="font-medium capitalize text-foreground">
                      {subscription.status.replaceAll("_", " ")}
                    </span>
                  </span>
                )}
                {periodEndLabel && (
                  <span className="col-span-2 rounded-md border border-border/70 bg-background/45 px-2.5 py-1 text-muted sm:col-span-1">
                    Renews:{" "}
                    <span className="font-medium text-foreground">{periodEndLabel}</span>
                  </span>
                )}
              </div>
            </div>
            <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center">
              <Link
                href="/settings"
                className="rounded-md border border-border bg-transparent px-3 py-1.5 text-center text-sm font-medium text-foreground hover:bg-subtle"
              >
                Open settings
              </Link>
              {user.stripeCustomerId && <BillingPortalButton />}
            </div>
          </div>
        </div>
      )}
      <PricingCards
        currentTier={effectiveTier}
        className="mt-8"
        showSignUp={false}
      />
    </div>
  );
}
