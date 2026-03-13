"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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
        <p className="mt-4 text-sm text-zinc-500">No mortgage on file.</p>
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

    const payload = {
      originalLoanAmount: formData.get("originalLoanAmount") as string,
      currentBalance: formData.get("currentBalance") as string,
      interestRate: formData.get("interestRate") as string,
      termYears: Number(formData.get("termYears")),
      startDate: formData.get("startDate") as string,
      monthlyPayment: formData.get("monthlyPayment") as string,
      escrowIncluded: formData.get("escrowIncluded") === "on",
      lenderName: (formData.get("lenderName") as string) || null,
      loanType: (formData.get("loanType") as string) || null,
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
            className="mt-0.5 block w-full rounded border border-zinc-300 px-2 py-1.5 text-sm"
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
            className="mt-0.5 block w-full rounded border border-zinc-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-500">
            Interest rate (e.g. 0.065 for 6.5%)
          </label>
          <input
            name="interestRate"
            type="number"
            step="0.0001"
            min="0"
            max="1"
            required
            defaultValue={mortgage?.interestRate}
            className="mt-0.5 block w-full rounded border border-zinc-300 px-2 py-1.5 text-sm"
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
            className="mt-0.5 block w-full rounded border border-zinc-300 px-2 py-1.5 text-sm"
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
            className="mt-0.5 block w-full rounded border border-zinc-300 px-2 py-1.5 text-sm"
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
            className="mt-0.5 block w-full rounded border border-zinc-300 px-2 py-1.5 text-sm"
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
            className="mt-0.5 block w-full rounded border border-zinc-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-500">
            Loan type
          </label>
          <input
            name="loanType"
            type="text"
            placeholder="e.g. conventional, FHA"
            defaultValue={mortgage?.loanType ?? ""}
            className="mt-0.5 block w-full rounded border border-zinc-300 px-2 py-1.5 text-sm"
          />
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
