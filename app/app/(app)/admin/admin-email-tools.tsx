"use client";

import { useState } from "react";

type Status = { ok: boolean; message: string } | null;

async function postJson(url: string, body?: object): Promise<{ ok: boolean; message: string }> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.ok) return { ok: true, message: "Done" };
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    return { ok: false, message: data.error ?? `HTTP ${res.status}` };
  } catch {
    return { ok: false, message: "Network error" };
  }
}

export function AdminEmailTools({
  isOptedOut,
}: {
  isOptedOut: boolean;
}) {
  const [previewStatus, setPreviewStatus] = useState<Status>(null);
  const [previewBusy, setPreviewBusy] = useState<"day3" | "day7" | null>(null);
  const [resubStatus, setResubStatus] = useState<Status>(null);
  const [resubBusy, setResubBusy] = useState(false);
  const [optedOut, setOptedOut] = useState(isOptedOut);

  async function sendPreview(variant: "day3" | "day7") {
    if (previewBusy) return;
    setPreviewBusy(variant);
    setPreviewStatus(null);
    const result = await postJson("/api/admin/email-preview", { variant });
    setPreviewStatus(
      result.ok
        ? { ok: true, message: `${variant} email sent to SUPPORT_EMAIL` }
        : result
    );
    setPreviewBusy(null);
  }

  async function resubscribe() {
    if (resubBusy) return;
    setResubBusy(true);
    setResubStatus(null);
    const result = await postJson("/api/admin/resubscribe-self");
    if (result.ok) {
      setOptedOut(false);
      setResubStatus({ ok: true, message: "Re-subscribed — sent-at flags cleared" });
    } else {
      setResubStatus(result);
    }
    setResubBusy(false);
  }

  return (
    <section className="mt-8">
      <h2 className="mb-4 text-sm font-medium text-muted">Onboarding email tooling</h2>
      <div className="rounded-lg border border-border bg-card p-5 space-y-5">

        {/* Preview sender */}
        <div>
          <p className="text-sm font-medium text-foreground">Send preview to SUPPORT_EMAIL</p>
          <p className="mt-0.5 text-xs text-muted">
            Fires a real Resend email with a working unsubscribe link signed to your account.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void sendPreview("day3")}
              disabled={previewBusy !== null}
              className="rounded-md border border-border bg-transparent px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-subtle disabled:opacity-50"
            >
              {previewBusy === "day3" ? "Sending…" : "Send day-3 preview"}
            </button>
            <button
              type="button"
              onClick={() => void sendPreview("day7")}
              disabled={previewBusy !== null}
              className="rounded-md border border-border bg-transparent px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-subtle disabled:opacity-50"
            >
              {previewBusy === "day7" ? "Sending…" : "Send day-7 preview"}
            </button>
          </div>
          {previewStatus && (
            <p
              className={`mt-2 text-xs ${previewStatus.ok ? "text-positive" : "text-negative"}`}
              role="status"
            >
              {previewStatus.message}
            </p>
          )}
        </div>

        {/* Re-subscribe */}
        <div className="border-t border-border pt-5">
          <p className="text-sm font-medium text-foreground">Re-subscribe my account</p>
          <p className="mt-0.5 text-xs text-muted">
            Clears <code className="font-mono">onboardingEmailsOptedOutAt</code> and{" "}
            <code className="font-mono">onboardingEmailsSentAt</code> so the full cron path runs
            from scratch on your account.
          </p>
          <div className="mt-3">
            {optedOut ? (
              <button
                type="button"
                onClick={() => void resubscribe()}
                disabled={resubBusy}
                className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover disabled:opacity-50"
              >
                {resubBusy ? "Re-subscribing…" : "Re-subscribe me"}
              </button>
            ) : (
              <p className="text-xs text-muted italic">
                Your account is currently subscribed — click Unsubscribe in a preview email to opt
                out, then this button will appear.
              </p>
            )}
          </div>
          {resubStatus && (
            <p
              className={`mt-2 text-xs ${resubStatus.ok ? "text-positive" : "text-negative"}`}
              role="status"
            >
              {resubStatus.message}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
