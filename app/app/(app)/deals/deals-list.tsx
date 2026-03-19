"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/format-currency";
import { Search } from "lucide-react";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

type SortKey = "newest" | "oldest";

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
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    let list = deals;
    if (q) {
      list = list.filter(
        (d) =>
          (d.nickname ?? "").toLowerCase().includes(q) ||
          d.addressLine1.toLowerCase().includes(q) ||
          d.city.toLowerCase().includes(q) ||
          d.state.toLowerCase().includes(q) ||
          d.zipCode.includes(q)
      );
    }
    return [...list].sort((a, b) =>
      sort === "newest"
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [deals, search, sort]);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/deals/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setDeletingId(null);
      setConfirmingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search deals…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm placeholder:text-muted focus:border-accent focus:outline-none"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">
          {search ? "No deals match your search." : "No deals to display."}
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((d) => (
            <li
              key={d.id}
              className="rounded-xl border border-border/70 bg-card p-4 shadow-sm transition hover:bg-subtle/40"
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
                  href={`/properties/new?from=${d.id}`}
                  className="rounded-md border border-border bg-transparent px-3 py-1.5 text-sm font-medium hover:bg-subtle"
                >
                  Add to portfolio
                </Link>
                {confirmingId === d.id ? (
                  <span className="flex items-center gap-1.5 text-sm">
                    <span className="text-muted">Delete?</span>
                    <button
                      type="button"
                      onClick={() => handleDelete(d.id)}
                      disabled={deletingId === d.id}
                      className="rounded-md bg-negative/10 px-2.5 py-1 text-sm font-medium text-negative hover:bg-negative/20 disabled:opacity-50"
                    >
                      {deletingId === d.id ? "Deleting…" : "Confirm"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmingId(null)}
                      className="rounded-md border border-border px-2.5 py-1 text-sm font-medium text-muted hover:bg-subtle"
                    >
                      Cancel
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setConfirmingId(d.id);
                    }}
                    className="rounded-md border border-border bg-transparent px-3 py-1.5 text-sm font-medium text-negative hover:bg-subtle"
                  >
                    Delete
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
