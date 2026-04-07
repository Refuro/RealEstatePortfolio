"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type TrialAction =
  | "start_14d"
  | "set_4d_left"
  | "set_1d_left"
  | "set_expired_1d"
  | "reset_email_flags"
  | "clear_trial";

const ACTIONS: { action: TrialAction; label: string }[] = [
  { action: "start_14d", label: "Start 14d" },
  { action: "set_4d_left", label: "4d left" },
  { action: "set_1d_left", label: "1d left" },
  { action: "set_expired_1d", label: "Expired 1d" },
  { action: "reset_email_flags", label: "Reset email flags" },
  { action: "clear_trial", label: "Clear trial" },
];

export function AdminUserTrialControls({ userId }: { userId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<TrialAction | "send_email" | "sync_billing" | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  async function runAction(action: TrialAction) {
    if (loading) return;
    setLoading(action);
    setStatus(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}/trial`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
      };
      if (!res.ok) {
        setStatus(data.error ?? "Update failed");
        return;
      }
      setStatus(data.message ?? "Updated");
      router.refresh();
    } catch {
      setStatus("Network error");
    } finally {
      setLoading(null);
    }
  }

  async function sendTrialEmailNow() {
    if (loading) return;
    setLoading("send_email");
    setStatus(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}/trial-email`, {
        method: "POST",
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
      };
      if (!res.ok) {
        setStatus(data.error ?? "Email send failed");
        return;
      }
      setStatus(data.message ?? "Email check complete");
      router.refresh();
    } catch {
      setStatus("Network error");
    } finally {
      setLoading(null);
    }
  }

  async function syncBillingNow() {
    if (loading) return;
    setLoading("sync_billing");
    setStatus(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}/billing-sync`, {
        method: "POST",
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
        debug?: Record<string, unknown>;
      };
      if (!res.ok) {
        setStatus(data.error ?? "Billing sync failed");
        return;
      }
      const debugStr = data.debug
        ? ` | ${Object.entries(data.debug).map(([k, v]) => `${k}=${String(v)}`).join(", ")}`
        : "";
      setStatus((data.message ?? "Billing synced") + debugStr);
      router.refresh();
    } catch {
      setStatus("Network error");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {ACTIONS.map(({ action, label }) => (
          <button
            key={action}
            type="button"
            onClick={() => void runAction(action)}
            disabled={loading !== null}
            className="inline-flex min-h-[44px] items-center rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-foreground transition-colors duration-150 hover:bg-subtle disabled:opacity-50"
          >
            {loading === action ? "Updating..." : label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => void sendTrialEmailNow()}
          disabled={loading !== null}
          className="inline-flex min-h-[44px] items-center rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-foreground transition-colors duration-150 hover:bg-subtle disabled:opacity-50"
        >
          {loading === "send_email" ? "Sending..." : "Send trial email now"}
        </button>
        <button
          type="button"
          onClick={() => void syncBillingNow()}
          disabled={loading !== null}
          className="inline-flex min-h-[44px] items-center rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-foreground transition-colors duration-150 hover:bg-subtle disabled:opacity-50"
        >
          {loading === "sync_billing" ? "Syncing..." : "Sync billing now"}
        </button>
      </div>
      {status && (
        <p className="text-xs text-muted" role="status">
          {status}
        </p>
      )}
    </div>
  );
}
