"use client";

import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  void error; // Required by Next.js; not displayed to avoid leaking internal details
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center">
      <h2 className="text-lg font-semibold text-zinc-900">Something went wrong</h2>
      <p className="mt-2 text-sm text-zinc-600">
        We encountered an error. Please try again.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
