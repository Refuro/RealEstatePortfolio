"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

type DealItem = {
  id: string;
  nickname: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  zipCode: string;
  createdAt: string;
  metrics: {
    monthlyCashFlow: number;
    capRate: number | null;
    equity: number;
  };
};

export function DealsList({ deals }: { deals: DealItem[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this saved deal?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/deals/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {deals.map((d) => (
        <li
          key={d.id}
          className="rounded-lg border border-border bg-card p-4 transition hover:bg-subtle"
        >
          <Link href={`/analyze?deal=${d.id}`} className="block">
            <div className="font-medium text-foreground">
              {d.nickname || d.addressLine1}
            </div>
            <p className="mt-0.5 text-sm text-muted">
              {[d.addressLine1, d.city, d.state, d.zipCode].filter(Boolean).join(", ")}
            </p>
            <dl className="mt-4 grid grid-cols-3 gap-2 text-sm">
              <div>
                <dt className="font-medium text-muted">Cash flow</dt>
                <dd
                  className={`font-medium ${d.metrics.monthlyCashFlow >= 0 ? "text-positive" : "text-negative"}`}
                >
                  {formatCurrency(d.metrics.monthlyCashFlow)}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-muted">Cap rate</dt>
                <dd className="font-medium text-foreground">
                  {d.metrics.capRate != null
                    ? `${(d.metrics.capRate * 100).toFixed(2)}%`
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-muted">Equity</dt>
                <dd className="font-medium text-foreground">
                  {formatCurrency(d.metrics.equity)}
                </dd>
              </div>
            </dl>
            <p className="mt-2 text-xs text-muted">
              Saved {formatDate(d.createdAt)}
            </p>
          </Link>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={`/analyze?deal=${d.id}`}
              className="rounded-md border border-border bg-transparent px-3 py-1.5 text-sm font-medium hover:bg-subtle"
            >
              View
            </Link>
            <Link
              href={`/properties/new?from=${d.id}`}
              className="rounded-md border border-border bg-transparent px-3 py-1.5 text-sm font-medium hover:bg-subtle"
            >
              Add to portfolio
            </Link>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleDelete(d.id);
              }}
              disabled={deletingId === d.id}
              className="rounded-md border border-border bg-transparent px-3 py-1.5 text-sm font-medium text-negative hover:bg-subtle disabled:opacity-50"
            >
              {deletingId === d.id ? "Deleting…" : "Delete"}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
