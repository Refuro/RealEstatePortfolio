"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { X } from "lucide-react";

type ModalType = "deactivate" | "permanent" | null;

export function DeleteAccountSection() {
  const [modalOpen, setModalOpen] = useState<ModalType>(null);
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signOut } = useClerk();

  const closeModal = useCallback(() => {
    if (!loading) {
      setModalOpen(null);
      setPassword("");
      setConfirmText("");
      setError(null);
    }
  }, [loading]);

  async function handleDeactivate() {
    if (!password.trim()) {
      setError("Password is required");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Delete failed");
        setLoading(false);
        return;
      }
      closeModal();
      await signOut({ redirectUrl: "/?deleted=1" });
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  }

  async function handlePermanentDelete() {
    if (!password.trim()) {
      setError("Password is required");
      return;
    }
    if (confirmText !== "DELETE") {
      setError('Type "DELETE" to confirm');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/account/delete-permanent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, confirmText }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Delete failed");
        setLoading(false);
        return;
      }
      closeModal();
      await signOut({ redirectUrl: "/?deleted=permanent" });
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  }

  const canConfirmPermanent =
    password.trim().length > 0 && confirmText === "DELETE";

  const deactivateModalRef = useRef<HTMLDivElement>(null);
  const permanentModalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!modalOpen) return;
    const previousActive = document.activeElement;
    const ref = modalOpen === "deactivate" ? deactivateModalRef : permanentModalRef;
    const firstFocusable = ref.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    firstFocusable?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeModal();
        (previousActive as HTMLElement)?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      (previousActive as HTMLElement)?.focus();
    };
  }, [modalOpen, closeModal]);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted">
          Pause your account and hide your data. You can restore it later by
          signing in.
        </p>
        <button
          type="button"
          onClick={() => setModalOpen("deactivate")}
          className="w-fit rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium hover:bg-subtle"
        >
          Deactivate account
        </button>
      </div>
      <div className="flex flex-col gap-2 border-l border-border pl-4 sm:pl-6">
        <p className="text-sm text-muted">
          Permanently delete all your data. This cannot be undone.
        </p>
        <button
          type="button"
          onClick={() => setModalOpen("permanent")}
          className="w-fit rounded-md border border-negative bg-transparent px-4 py-2 text-sm font-medium text-negative hover:bg-negative/10"
        >
          Permanently delete account
        </button>
      </div>

      {modalOpen === "deactivate" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="deactivate-account-title"
        >
          <div
            className="absolute inset-0 bg-foreground/20"
            onClick={closeModal}
            aria-hidden="true"
          />
          <div
            ref={deactivateModalRef}
            className="relative w-full max-w-md rounded-lg border border-border bg-card p-6"
          >
            <div className="flex items-center justify-between gap-4">
              <h2
                id="deactivate-account-title"
                className="text-lg font-semibold text-foreground"
              >
                Deactivate account
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-md p-1 text-muted hover:bg-subtle hover:text-foreground"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <p className="mt-4 text-sm text-muted">
              This will deactivate your account. Your data will be preserved and
              you can restore your account later. Enter your password to
              confirm.
            </p>
            <div className="mt-4">
              <label
                htmlFor="deactivate-password"
                className="block text-sm font-medium text-muted"
              >
                Password
              </label>
              <input
                id="deactivate-password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                placeholder="Enter your password"
                disabled={loading}
                autoComplete="current-password"
              />
              {error && (
                <p className="mt-1 text-sm text-negative">{error}</p>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium hover:bg-subtle"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeactivate}
                disabled={loading}
                className="rounded-md border border-negative bg-negative px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Deactivating…" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalOpen === "permanent" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="permanent-delete-title"
        >
          <div
            className="absolute inset-0 bg-foreground/20"
            onClick={closeModal}
            aria-hidden="true"
          />
          <div
            ref={permanentModalRef}
            className="relative w-full max-w-md rounded-lg border border-border bg-card p-6"
          >
            <div className="flex items-center justify-between gap-4">
              <h2
                id="permanent-delete-title"
                className="text-lg font-semibold text-foreground"
              >
                Permanently delete account
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-md p-1 text-muted hover:bg-subtle hover:text-foreground"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <p className="mt-4 text-sm text-muted">
              This will permanently delete all your data including properties,
              mortgages, and subscription. This action cannot be undone.
            </p>
            <p className="mt-2 text-sm font-medium text-negative">
              Warning: You will not be able to recover your account or data.
            </p>
            <div className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="permanent-password"
                  className="block text-sm font-medium text-muted"
                >
                  Password
                </label>
                <input
                  id="permanent-password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  placeholder="Enter your password"
                  disabled={loading}
                  autoComplete="current-password"
                />
              </div>
              <div>
                <label
                  htmlFor="permanent-confirm"
                  className="block text-sm font-medium text-muted"
                >
                  Type DELETE to confirm
                </label>
                <input
                  id="permanent-confirm"
                  type="text"
                  value={confirmText}
                  onChange={(e) => {
                    setConfirmText(e.target.value);
                    setError(null);
                  }}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  placeholder="DELETE"
                  disabled={loading}
                  autoComplete="off"
                />
              </div>
              {error && (
                <p className="text-sm text-negative">{error}</p>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium hover:bg-subtle"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePermanentDelete}
                disabled={loading || !canConfirmPermanent}
                className="rounded-md border border-negative bg-negative px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Deleting…" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
