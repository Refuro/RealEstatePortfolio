"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function PropertyActions({ propertyId }: { propertyId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/properties");
        router.refresh();
      }
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/properties/${propertyId}/edit`}
        className="rounded-md border border-border bg-transparent px-3 py-1.5 text-sm font-medium hover:bg-subtle"
      >
        Edit
      </Link>
      {!confirmOpen ? (
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="rounded-md border border-negative/30 px-3 py-1.5 text-sm font-medium text-negative hover:bg-negative/10"
        >
          Delete
        </button>
      ) : (
        <span className="flex items-center gap-2">
          <span className="text-sm text-muted">Delete?</span>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-md bg-negative px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Yes"}
          </button>
          <button
            type="button"
            onClick={() => setConfirmOpen(false)}
            disabled={deleting}
            className="rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-subtle"
          >
            No
          </button>
        </span>
      )}
    </div>
  );
}
