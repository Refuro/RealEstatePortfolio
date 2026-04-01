import Link from "next/link";
import type { Metadata } from "next";
import { getAppUser } from "@/lib/auth";
import { BillingSuccessClearIntent } from "@/components/growth/billing-success-clear-intent";
import { getDealLimit, getEffectiveTier, getPropertyLimit } from "@/lib/plans";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

function tierDisplayName(tier: string): string {
  const t = tier.toLowerCase();
  if (t === "investor") return "Investor";
  if (t === "pro") return "Pro";
  return "Free";
}

export default async function BillingSuccessPage() {
  const user = await getAppUser();
  if (!user) return null;

  const tier = getEffectiveTier(user);
  const propertyLimit = getPropertyLimit(tier);
  const dealLimit = getDealLimit(tier);

  return (
    <div className="py-8">
      <BillingSuccessClearIntent />
      <h1 className="text-3xl font-semibold text-foreground">
        Subscription active
      </h1>
      <p className="mt-4 text-base text-muted">
        Thank you for subscribing. You&apos;re on the{" "}
        <span className="font-medium text-foreground">{tierDisplayName(tier)}</span> plan — up to{" "}
        {propertyLimit} propert{propertyLimit === 1 ? "y" : "ies"} and {dealLimit} saved deals. Manage
        billing anytime in Settings.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/dashboard"
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
        >
          Go to dashboard
        </Link>
        <Link
          href="/settings"
          className="rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium text-foreground hover:bg-subtle"
        >
          Settings
        </Link>
      </div>
    </div>
  );
}
