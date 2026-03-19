"use client";

import { useState } from "react";

export function BillingPortalButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function getPortalErrorMessage(raw: string): string {
    const msg = raw.toLowerCase();
    if (msg.includes("unauthorized")) {
      return "Please sign in again to manage billing.";
    }
    if (msg.includes("network") || msg.includes("fetch")) {
      return "Network issue while opening billing. Check your connection and retry.";
    }
    if (msg.includes("no portal url")) {
      return "Billing portal did not return a redirect URL. Please try again.";
    }
    return "Couldn’t open billing portal right now. Please retry in a moment.";
  }

  async function handleClick() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to open portal");
      if (data.url) window.location.href = data.url;
      else throw new Error("No portal URL returned");
    } catch (e) {
      setLoading(false);
      const raw = e instanceof Error ? e.message : "Something went wrong";
      setError(getPortalErrorMessage(raw));
    }
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-hover disabled:opacity-50"
      >
        {loading ? "Opening…" : "Manage billing"}
      </button>
      {error && <p className="text-xs text-negative">{error}</p>}
    </div>
  );
}
