"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/format-currency";

type MortgageDisplay = {
  id: string;
  effectiveBalance: number;
  interestRate: string;
  termYears: number;
  monthlyPayment: string;
  lenderName: string | null;
  balanceSource?: "stored" | "stored_projected" | "projected";
  balanceAsOfDate?: string | null;
  payoffProjection?: { payoffDate: string | null; remainingAtTermEnd: number | null };
};

export type MortgageSectionProps = {
  propertyId: string;
  hasMortgage: boolean | null;
  mortgagePaidOff: boolean;
  mortgages: MortgageDisplay[];
  /** Opens the drawer at the mortgage section. */
  onEdit: () => void;
  /** Opens the drawer at the mortgage section in choose-mode (empty state). */
  onAddMortgage: () => void;
};

function Badge({
  label,
  tone,
}: {
  label: string;
  tone: "neutral" | "positive";
}) {
  const style =
    tone === "positive"
      ? "border-positive/30 bg-positive/10 text-positive"
      : "border-border bg-subtle/40 text-muted";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${style}`}
    >
      {label}
    </span>
  );
}

function SectionShell({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function formatPayoffDate(date: string | null): string | null {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

/**
 * Hits PATCH /api/properties/{id} to flip mortgage flags. Used by the
 * inline "Mark as paid off" / "No mortgage" actions on the card so the user
 * doesn't have to open the drawer just to flip a boolean.
 */
async function patchFlags(
  propertyId: string,
  payload: { hasMortgage: boolean; mortgagePaidOff: boolean }
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/properties/${propertyId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      return { ok: false, error: data.error ?? "Save failed" };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Network error" };
  }
}

export function MortgageSection({
  propertyId,
  hasMortgage,
  mortgagePaidOff,
  mortgages,
  onEdit,
  onAddMortgage,
}: MortgageSectionProps) {
  const router = useRouter();
  const [pending, setPending] = useState<null | "paid_off" | "none">(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmingPaidOff, setConfirmingPaidOff] = useState(false);

  // Display safeguard: if mortgages exist on the row, treat as active even
  // when the hasMortgage flag is null (data inconsistency from older imports).
  const effectiveHasMortgage =
    mortgages.length > 0 ? true : hasMortgage;
  const hasActiveMortgage = mortgages.length > 0;

  async function handleMarkPaidOff() {
    setError(null);
    setPending("paid_off");
    // When active mortgages exist, delete them first so cash flow / DSCR
    // calculations don't keep referencing them after the property is flagged
    // paid-off. Sequential is fine — the existing DELETE endpoint adjusts
    // hasMortgage based on remaining count, then we PATCH flags.
    try {
      for (const m of mortgages) {
        const r = await fetch(
          `/api/properties/${propertyId}/mortgage/${m.id}`,
          { method: "DELETE" }
        );
        if (!r.ok) {
          const data = (await r.json().catch(() => ({}))) as { error?: string };
          setPending(null);
          setError(data.error ?? "Could not clear loan details.");
          return;
        }
      }
    } catch {
      setPending(null);
      setError("Network error");
      return;
    }
    const res = await patchFlags(propertyId, {
      hasMortgage: false,
      mortgagePaidOff: true,
    });
    setPending(null);
    setConfirmingPaidOff(false);
    if (!res.ok) {
      setError(res.error ?? "Save failed");
      return;
    }
    router.refresh();
  }

  async function handleNoMortgage() {
    setError(null);
    setPending("none");
    const res = await patchFlags(propertyId, {
      hasMortgage: false,
      mortgagePaidOff: false,
    });
    setPending(null);
    if (!res.ok) {
      setError(res.error ?? "Save failed");
      return;
    }
    router.refresh();
  }

  // Variant 1: Empty (hasMortgage === null AND no mortgages on file)
  if (effectiveHasMortgage === null) {
    return (
      <SectionShell title="Mortgage">
        <p className="text-sm text-muted">
          No mortgage on file. Adding one unlocks LTV, DSCR, and refinance modeling — or
          mark the property as paid off if you own it outright.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onAddMortgage}
            className="inline-flex min-h-[36px] items-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
          >
            Add mortgage
          </button>
          <button
            type="button"
            onClick={handleMarkPaidOff}
            disabled={pending !== null}
            className="inline-flex min-h-[36px] items-center rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-subtle disabled:opacity-60"
          >
            {pending === "paid_off" ? "Saving…" : "Mark as paid off"}
          </button>
          <button
            type="button"
            onClick={handleNoMortgage}
            disabled={pending !== null}
            className="inline-flex min-h-[36px] items-center rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-subtle disabled:opacity-60"
          >
            {pending === "none" ? "Saving…" : "No mortgage"}
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-negative">{error}</p>}
      </SectionShell>
    );
  }

  // Variant 3: Paid off
  if (mortgagePaidOff) {
    return (
      <SectionShell
        title="Mortgage"
        action={
          <button
            type="button"
            onClick={onEdit}
            className="text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            Edit
          </button>
        }
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge label="Paid off" tone="positive" />
          <span className="text-sm text-muted">LTV 0% · DSCR N/A</span>
        </div>
      </SectionShell>
    );
  }

  // Variant 4: No mortgage (never financed)
  if (effectiveHasMortgage === false) {
    return (
      <SectionShell
        title="Mortgage"
        action={
          <button
            type="button"
            onClick={onEdit}
            className="text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            Edit
          </button>
        }
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge label="No mortgage" tone="neutral" />
          <span className="text-sm text-muted">LTV 0% · DSCR N/A</span>
        </div>
      </SectionShell>
    );
  }

  // Variant 2: Active mortgage (hasMortgage === true OR mortgages.length > 0)
  return (
    <SectionShell
      title="Mortgage"
      action={
        <button
          type="button"
          onClick={onEdit}
          className="text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          Edit
        </button>
      }
    >
      {!hasActiveMortgage ? (
        <p className="text-sm text-muted">
          Marked as financed but no loan details on file.{" "}
          <button
            type="button"
            onClick={onEdit}
            className="font-medium text-accent transition-colors hover:text-accent-hover"
          >
            Add loan details
          </button>{" "}
          to unlock LTV and DSCR.
        </p>
      ) : (
        <ul className="space-y-3">
          {mortgages.map((m) => {
            const balanceLabel =
              m.balanceSource === "stored" && m.balanceAsOfDate
                ? `Balance as of ${new Date(m.balanceAsOfDate).toLocaleDateString()}`
                : m.balanceSource === "stored_projected" && m.balanceAsOfDate
                ? `Stepped from ${new Date(m.balanceAsOfDate).toLocaleDateString()}`
                : "From amortization";
            const payoffDate = formatPayoffDate(m.payoffProjection?.payoffDate ?? null);
            return (
              <li key={m.id} className="rounded-lg bg-subtle/40 p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    {m.lenderName?.trim() || "Mortgage"}
                  </p>
                  <p className="tabular-nums text-sm font-semibold text-foreground">
                    {formatCurrency(m.effectiveBalance)}
                  </p>
                </div>
                <p className="mt-0.5 text-xs text-muted">{balanceLabel}</p>
                <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                  <div>
                    <dt className="text-xs text-muted">Rate</dt>
                    <dd className="tabular-nums font-medium text-foreground">
                      {(Number(m.interestRate) * 100).toFixed(2)}%
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Term</dt>
                    <dd className="tabular-nums font-medium text-foreground">
                      {m.termYears} yr
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Monthly P&amp;I</dt>
                    <dd className="tabular-nums font-medium text-foreground">
                      {formatCurrency(Number(m.monthlyPayment))}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Payoff</dt>
                    <dd className="font-medium text-foreground">{payoffDate ?? "—"}</dd>
                  </div>
                </dl>
              </li>
            );
          })}
        </ul>
      )}

      {hasActiveMortgage && (
        <div className="mt-4 border-t border-border-subtle pt-3">
          {!confirmingPaidOff ? (
            <button
              type="button"
              onClick={() => setConfirmingPaidOff(true)}
              className="text-sm font-medium text-muted transition-colors hover:text-foreground"
            >
              Mark as paid off
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-foreground">
                This clears your stored loan details. Continue?
              </span>
              <button
                type="button"
                onClick={handleMarkPaidOff}
                disabled={pending !== null}
                className="inline-flex min-h-[32px] items-center rounded-md bg-negative px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
              >
                {pending === "paid_off" ? "Saving…" : "Yes, mark paid off"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingPaidOff(false)}
                disabled={pending !== null}
                className="inline-flex min-h-[32px] items-center rounded-md border border-border bg-transparent px-3 py-1 text-xs font-medium text-foreground hover:bg-subtle disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          )}
          {error && <p className="mt-2 text-sm text-negative">{error}</p>}
        </div>
      )}
    </SectionShell>
  );
}
