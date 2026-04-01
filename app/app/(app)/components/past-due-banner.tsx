"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

const STORAGE_KEY = "past-due-banner-dismissed";

export function PastDueBanner({
  subscriptionStatus,
}: {
  subscriptionStatus: string | null;
}) {
  const [dismissed, setDismissed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = sessionStorage.getItem(STORAGE_KEY);
    const id = setTimeout(() => setDismissed(stored === "1"), 0);
    return () => clearTimeout(id);
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setDismissed(true);
  };

  async function handleUpdatePayment() {
    setPortalError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to open portal");
      if (data.url) window.location.href = data.url;
    } catch (e) {
      setPortalError(e instanceof Error ? e.message : "Could not open billing portal. Try again.");
      setLoading(false);
    }
  }

  const isPastDue = subscriptionStatus === "past_due";
  if (!isPastDue || dismissed) return null;

  return (
    <div
      role="alert"
      className="relative flex items-start gap-3 rounded-lg border border-negative/30 bg-negative/10 px-4 py-3 text-foreground"
    >
      <div className="flex-1 text-sm">
        <p>
          Payment issue — update your payment method to avoid losing access.{" "}
          <button
            type="button"
            onClick={handleUpdatePayment}
            disabled={loading}
            className="font-medium text-accent hover:underline disabled:opacity-50"
          >
            {loading ? "Opening…" : "Update payment"}
          </button>
        </p>
        {portalError ? (
          <p className="mt-2 text-xs text-negative" role="status">
            {portalError}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss"
        className="shrink-0 rounded p-1 text-muted hover:bg-subtle hover:text-foreground"
      >
        <X size={18} />
      </button>
    </div>
  );
}
