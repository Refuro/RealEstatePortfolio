"use client";

import Link from "next/link";
import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function SignUpError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.captureException(error);
    }
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4">
      <div className="max-w-sm text-center">
        <h2 className="text-xl font-semibold text-foreground">
          Unable to load sign-up
        </h2>
        <p className="mt-2 text-sm text-muted">
          Something went wrong loading the sign-up form. This is usually a
          temporary network issue — please try again.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
        >
          Try again
        </button>
        <Link
          href="/sign-up"
          className="rounded-lg border border-border px-5 py-2.5 text-center text-sm font-medium text-foreground hover:bg-subtle"
        >
          Reload page
        </Link>
      </div>
    </div>
  );
}
