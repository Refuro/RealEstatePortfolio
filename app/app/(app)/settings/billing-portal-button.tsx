"use client";

import { useState } from "react";

export function BillingPortalButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to open portal");
      if (data.url) window.location.href = data.url;
      else throw new Error("No portal URL returned");
    } catch (e) {
      setLoading(false);
      alert(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
    >
      {loading ? "Opening…" : "Manage billing"}
    </button>
  );
}
