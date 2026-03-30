"use client";

import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.captureException(error);
    }
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <main
          id="global-error-main"
          className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-12"
          role="alert"
        >
          <div className="max-w-md text-center">
            <p className="text-sm font-medium uppercase tracking-wide text-muted">
              Veld Portfolio
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-foreground">
              Something went wrong
            </h1>
            <p className="mt-3 text-sm text-muted">
              An unexpected error occurred. You can try again or return to the home page.
            </p>
            {error.digest != null && (
              <p className="mt-4 font-mono text-xs text-muted">
                Reference: {error.digest}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
              onClick={() => window.location.reload()}
            >
              Try again
            </button>
            <Link
              href="/"
              className="rounded-lg border border-border px-5 py-2.5 text-center text-sm font-medium text-foreground hover:bg-subtle"
            >
              Back to home
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
