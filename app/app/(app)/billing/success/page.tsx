import Link from "next/link";
import { getAppUser } from "@/lib/auth";

export default async function BillingSuccessPage() {
  const user = await getAppUser();
  if (!user) return null;

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-semibold text-zinc-900">
        Subscription active
      </h1>
      <p className="mt-2 text-zinc-600">
        Thank you for subscribing. Your plan is now active and property limits
        have been updated.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/settings"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Go to Settings
        </Link>
        <Link
          href="/dashboard"
          className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}
