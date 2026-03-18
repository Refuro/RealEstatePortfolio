"use client";

import * as Sentry from "@sentry/nextjs";

export default function SentryTestPage() {
  function triggerClientError() {
    Sentry.captureException(new Error("Sentry test — client-side error (local)"));
  }

  async function triggerServerError() {
    const res = await fetch("/api/sentry-test");
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? "Server error");
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h1 className="text-xl font-semibold text-foreground">Sentry test</h1>
      <p className="mt-2 text-sm text-muted">
        Click a button to send a test error to Sentry. Check your Sentry dashboard for the event.
      </p>
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={triggerClientError}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
        >
          Send client error
        </button>
        <button
          type="button"
          onClick={triggerServerError}
          className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-subtle"
        >
          Send server error
        </button>
      </div>
    </div>
  );
}
