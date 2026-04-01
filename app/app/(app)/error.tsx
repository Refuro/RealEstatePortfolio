"use client";

import * as Sentry from "@sentry/nextjs";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.captureException(error);
  }
  void error; // Required by Next.js; not displayed to avoid leaking internal details
  return (
    <div className="rounded-lg border border-border bg-card p-8 text-center">
      <h2 className="text-lg font-semibold text-foreground">Something went wrong</h2>
      <p className="mt-2 text-sm text-muted">
        We encountered an error. Please try again.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium hover:bg-subtle"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
