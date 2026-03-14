"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LOAN_TYPE_OPTIONS } from "@/lib/validations/mortgage";

type Mortgage = {
  id: string;
  originalLoanAmount: string;
  currentBalance: string;
  interestRate: string;
  termYears: number;
  startDate: string;
  monthlyPayment: string;
  escrowIncluded: boolean;
  lenderName: string | null;
  loanType: string | null;
};

export function MortgageSection({
  propertyId,
  mortgages: initialMortgages,
}: {
  propertyId: string;
  mortgages: Mortgage[];
}) {
  const router = useRouter();
  const [mortgages, setMortgages] = useState<Mortgage[]>(initialMortgages);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function refreshMortgages() {
    fetch(`/api/properties/${propertyId}/mortgage`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setMortgages(data);
      })
      .catch(() => {});
    router.refresh();
  }

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Mortgage
        </h2>
        {!showForm && editingId === null && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="text-sm font-medium text-zinc-900 hover:underline"
          >
            Add mortgage
          </button>
        )}
      </div>

      {error && (
        <div className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      {showForm && (
        <MortgageForm
          propertyId={propertyId}
          onSuccess={() => {
            setShowForm(false);
            setError(null);
            refreshMortgages();
          }}
          onCancel={() => {
            setShowForm(false);
            setError(null);
          }}
          setError={setError}
          submitting={submitting}
          setSubmitting={setSubmitting}
        />
      )}

      {editingId && (
        <MortgageForm
          propertyId={propertyId}
          mortgageId={editingId}
          mortgage={mortgages.find((m) => m.id === editingId) ?? undefined}
          onSuccess={() => {
            setEditingId(null);
            setError(null);
            refreshMortgages();
          }}
          onCancel={() => {
            setEditingId(null);
            setError(null);
          }}
          setError={setError}
          submitting={submitting}
          setSubmitting={setSubmitting}
        />
      )}

      {!showForm && !editingId && mortgages.length === 0 && (
        <div className="mt-4 rounded-md border border-dashed border-zinc-200 bg-zinc-50/50 p-6 text-center">
          <p className="text-sm text-zinc-600">No mortgage on file.</p>
          <p className="mt-1 text-xs text-zinc-500">
            Add a mortgage to see equity, LTV, and amortization.
          </p>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="mt-4 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Add mortgage
          </button>
        </div>
      )}

      {!showForm && !editingId && mortgages.length > 0 && (
        <ul className="mt-4 space-y-4">
          {mortgages.map((m) => (
            <li
              key={m.id}
              className="rounded-md border border-zinc-100 bg-zinc-50/50 p-4"
            >
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <dt className="text-zinc-500">Balance</dt>
                  <dd className="font-medium text-zinc-900">
                    ${Number(m.currentBalance).toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-zinc-500">Rate</dt>
                  <dd className="font-medium text-zinc-900">
                    {(Number(m.interestRate) * 100).toFixed(2)}%
                  </dd>
                </div>
                <div>
                  <dt className="text-zinc-500">Term</dt>
                  <dd className="font-medium text-zinc-900">{m.termYears} years</dd>
                </div>
                <div>
                  <dt className="text-zinc-500">Monthly payment</dt>
                  <dd className="font-medium text-zinc-900">
                    ${Number(m.monthlyPayment).toLocaleString()}
                  </dd>
                </div>
                {m.lenderName && (
                  <div className="col-span-2">
                    <dt className="text-zinc-500">Lender</dt>
                    <dd className="font-medium text-zinc-900">{m.lenderName}</dd>
                  </div>
                )}
              </dl>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingId(m.id)}
                  className="text-sm font-medium text-zinc-700 hover:underline"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!confirm("Delete this mortgage?")) return;
                    const res = await fetch(
                      `/api/properties/${propertyId}/mortgage/${m.id}`,
                      { method: "DELETE" }
                    );
                    if (res.ok) refreshMortgages();
                  }}
                  className="text-sm font-medium text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

type MortgageFormProps = {
  propertyId: string;
  mortgageId?: string;
  mortgage?: Mortgage;
  onSuccess: () => void;
  onCancel: () => void;
  setError: (e: string | null) => void;
  submitting: boolean;
  setSubmitting: (v: boolean) => void;
};

function MortgageForm({
  propertyId,
  mortgageId,
  mortgage,
  onSuccess,
  onCancel,
  setError,
  submitting,
  setSubmitting,
}: MortgageFormProps) {
  const isEdit = !!mortgageId && !!mortgage;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const interestPercent = formData.get("interestRate") as string;
    const interestDecimal = (Number(interestPercent) / 100).toString();
    const payload = {
      originalLoanAmount: formData.get("originalLoanAmount") as string,
      currentBalance: formData.get("currentBalance") as string,
      interestRate: interestDecimal,
      termYears: Number(formData.get("termYears")),
      startDate: formData.get("startDate") as string,
      monthlyPayment: formData.get("monthlyPayment") as string,
      escrowIncluded: formData.get("escrowIncluded") === "on",
      lenderName: (formData.get("lenderName") as string) || null,
      loanType: (formData.get("loanType") as string).trim() || null,
    };

    try {
      if (isEdit) {
        const res = await fetch(
          `/api/properties/${propertyId}/mortgage/${mortgageId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error || "Update failed");
          setSubmitting(false);
          return;
        }
      } else {
        const res = await fetch(`/api/properties/${propertyId}/mortgage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error || "Create failed");
          setSubmitting(false);
          return;
        }
      }
      onSuccess();
    } catch {
      setError("Network error");
    }
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3 rounded-md border border-zinc-200 bg-white p-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-zinc-500">
            Original loan amount
          </label>
          <input
            name="originalLoanAmount"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={mortgage?.originalLoanAmount}
            className="mt-0.5 block w-full rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-500">
            Current balance
          </label>
          <input
            name="currentBalance"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={mortgage?.currentBalance}
            className="mt-0.5 block w-full rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-500">
            Interest rate (%)
          </label>
          <input
            name="interestRate"
            type="number"
            step="0.01"
            min="0"
            max="30"
            required
            placeholder="e.g. 6.25"
            defaultValue={mortgage ? (Number(mortgage.interestRate) * 100).toString() : undefined}
            className="mt-0.5 block w-full rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-500">
            Term (years)
          </label>
          <input
            name="termYears"
            type="number"
            min="1"
            max="50"
            required
            defaultValue={mortgage?.termYears}
            className="mt-0.5 block w-full rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-500">
            Start date
          </label>
          <input
            name="startDate"
            type="date"
            required
            defaultValue={mortgage?.startDate}
            className="mt-0.5 block w-full rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-500">
            Monthly payment
          </label>
          <input
            name="monthlyPayment"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={mortgage?.monthlyPayment}
            className="mt-0.5 block w-full rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-500">
            Lender name
          </label>
          <input
            name="lenderName"
            type="text"
            defaultValue={mortgage?.lenderName ?? ""}
            className="mt-0.5 block w-full rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-500">
            Loan type
          </label>
          <select
            name="loanType"
            defaultValue={
              mortgage?.loanType && LOAN_TYPE_OPTIONS.includes(mortgage.loanType as (typeof LOAN_TYPE_OPTIONS)[number])
                ? mortgage.loanType
                : ""
            }
            className="mt-0.5 block w-full rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          >
            <option value="">—</option>
            {LOAN_TYPE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt === "FHA" || opt === "VA" || opt === "USDA" ? opt : opt.charAt(0).toUpperCase() + opt.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-zinc-700">
          <input
            name="escrowIncluded"
            type="checkbox"
            defaultChecked={mortgage?.escrowIncluded}
            className="rounded border-zinc-300"
          />
          Escrow included in payment
        </label>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {submitting ? "Saving…" : isEdit ? "Save" : "Add mortgage"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
