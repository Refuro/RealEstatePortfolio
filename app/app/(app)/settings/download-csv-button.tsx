"use client";

import { useState } from "react";

export function DownloadCsvButton() {
  const [loading, setLoading] = useState(false);
  const [truncationNotice, setTruncationNotice] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  async function handleDownload() {
    setTruncationNotice(null);
    setDownloadError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/export/portfolio");
      const truncated =
        res.headers.get("X-Veld-Property-Slice-Truncated") === "true";
      const total = res.headers.get("X-Veld-Property-Count-Total");
      const included = res.headers.get("X-Veld-Property-Count-Included");
      const limit = res.headers.get("X-Veld-Property-Limit");

      if (!res.ok) {
        if (res.status === 401) {
          setDownloadError("Sign in to export your portfolio.");
        } else if (res.status === 429) {
          setDownloadError("Too many export attempts. Try again later.");
        } else {
          setDownloadError("Export failed. Please try again.");
        }
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "portfolio-export.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      if (truncated && total != null && included != null && limit != null) {
        setTruncationNotice(
          `This download includes ${included} of ${total} properties (plan limit ${limit}). Upgrade for a full export.`
        );
      }
    } catch {
      setDownloadError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleDownload}
        disabled={loading}
        className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-hover disabled:opacity-50"
      >
        {loading ? "Downloading…" : "Download CSV"}
      </button>
      {downloadError ? (
        <p className="text-sm text-negative" role="alert">
          {downloadError}
        </p>
      ) : null}
      {truncationNotice ? (
        <p className="text-sm text-muted" role="status" aria-live="polite">
          {truncationNotice}
        </p>
      ) : null}
    </div>
  );
}
