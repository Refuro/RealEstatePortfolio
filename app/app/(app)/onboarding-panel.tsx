"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type OnboardingProgress = {
  welcomeSeenAt: string | null;
  dismissedAt: string | null;
};

async function patchOnboarding(
  action: "mark_welcome_seen" | "dismiss_modal"
): Promise<OnboardingProgress | null> {
  const res = await fetch("/api/onboarding", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action }),
  });
  if (!res.ok) return null;
  return (await res.json()) as OnboardingProgress;
}

export function OnboardingPanel({
  initialProgress,
}: {
  initialProgress: OnboardingProgress;
}) {
  const router = useRouter();
  const [progress, setProgress] = useState(initialProgress);
  const [busy, setBusy] = useState(false);

  const showWelcomeModal = !progress.welcomeSeenAt && !progress.dismissedAt;

  async function handleWelcome(startNow: boolean) {
    if (busy) return;
    setBusy(true);
    const next = await patchOnboarding("mark_welcome_seen");
    if (next) {
      if (!startNow) {
        const dismissed = await patchOnboarding("dismiss_modal");
        if (dismissed) {
          setProgress(dismissed);
        }
        router.refresh();
      } else {
        setProgress(next);
        router.push("/properties/new");
      }
    }
    setBusy(false);
  }

  return (
    <>
      {showWelcomeModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-background/75 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-border/70 bg-card/95 p-7 shadow-2xl">
            <div className="pointer-events-none absolute -top-24 right-[-12%] h-56 w-56 rounded-full bg-accent/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-28 left-[-14%] h-60 w-60 rounded-full bg-primary/15 blur-3xl" />
            <div className="relative">
              <p className="inline-flex rounded-full border border-border/80 bg-background/60 px-3 py-1 text-xs font-medium uppercase tracking-wide text-muted">
                Welcome
              </p>
              <h2 className="mt-4 text-2xl font-semibold leading-tight text-foreground">
                Build your real estate portfolio in minutes
              </h2>
              <p className="mt-2 max-w-lg text-sm text-muted">
                Add your first property to unlock live equity, cash flow, and performance insights.
              </p>

              <div className="mt-5 grid gap-2 sm:grid-cols-3">
                <ValueChip label="Track cash flow" />
                <ValueChip label="See equity growth" />
                <ValueChip label="Model upside" />
              </div>

              <p className="mt-4 text-xs text-muted">Typical setup time: about 2 minutes.</p>
            </div>

            <div className="relative mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={() => void handleWelcome(false)}
                disabled={busy}
                className="rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-subtle disabled:opacity-60"
              >
                Maybe later
              </button>
              <button
                type="button"
                onClick={() => void handleWelcome(true)}
                disabled={busy}
                className="rounded-md bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground shadow-lg shadow-accent/25 transition-all hover:-translate-y-px hover:bg-accent-hover disabled:opacity-60"
              >
                Add first property
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ValueChip({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md px-1 py-1 text-sm">
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-accent">
        ✓
      </span>
      <span className="font-medium text-foreground/90">{label}</span>
    </div>
  );
}
