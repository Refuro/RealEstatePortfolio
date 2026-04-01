import Link from "next/link";
import type { Metadata } from "next";
import { getAppUser } from "@/lib/auth";
import { BillingSuccessClearIntent } from "@/components/growth/billing-success-clear-intent";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function BillingSuccessPage() {
  const user = await getAppUser();
  if (!user) return null;

  return (
    <div className="py-8">
      <BillingSuccessClearIntent />
      <h1 className="text-3xl font-semibold text-foreground">
        Subscription active
      </h1>
      <p className="mt-4 text-base text-muted">
        Thank you for subscribing. Your plan is now active and your property and saved-deal limits
        have been updated. Manage billing anytime in Settings.
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
